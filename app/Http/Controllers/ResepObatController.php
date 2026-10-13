<?php

namespace App\Http\Controllers;

use App\Http\Requests\ResepObat\StoreResepObatRequest;
use App\Models\DetailResepObat;
use App\Models\Medicine;
use App\Models\Patient;
use App\Models\ResepObat;
use App\Models\SystemUser;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class ResepObatController extends Controller
{
    // 🔧 Status yang dianggap "sudah menyerahkan obat ke pasien".
    // Sesuaikan string ini kalau nilai status di project kamu berbeda.
    private const STATUS_SELESAI = 'selesai';

    public function index(Request $request): Response
    {
        $user = $request->user();

        $reseps = ResepObat::query()
            ->with([
                'pasien:id,full_name,medical_record_number',
                'dokter:id,name',
            ])
            // 🔧 SECURITY FIX: dokter hanya lihat resep yang dia tulis sendiri.
            // Apoteker/admin/super_admin TIDAK di-scope karena mereka yang
            // mengeksekusi resep lintas dokter.
            ->when($user?->role === 'dokter', fn ($q) => $q->where('dokter_id', $user->id))
            ->search($request->string('search')->value())
            ->byStatus($request->status)
            // 🔧 FIX: urutkan status "menunggu" & "diproses" di atas,
            // supaya resep yang belum selesai lebih mudah terlihat.
            ->orderByRaw("
                CASE status
                    WHEN 'menunggu' THEN 0
                    WHEN 'diproses' THEN 1
                    WHEN 'selesai' THEN 2
                    WHEN 'batal' THEN 3
                    ELSE 4
                END
            ")
            ->orderByDesc('tanggal_resep')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('pelayanan/resep-obat/index', [
            'reseps'  => $reseps,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('pelayanan/resep-obat/create', [
            'pasiens' => Patient::where('patient_status', 'aktif')
                ->select('id', 'full_name', 'medical_record_number')
                ->orderBy('full_name')->get(),
            'dokters' => SystemUser::active()->dokter()->select('id', 'name')->get(),
            'obats'   => Medicine::where('status', 'aktif')
                ->where('stok', '>', 0)
                ->select('id', 'kode_obat', 'nama_obat', 'satuan', 'harga_jual', 'stok', 'status')
                ->orderBy('nama_obat')->get(),
        ]);
    }

    public function store(StoreResepObatRequest $request): RedirectResponse
    {
        DB::transaction(function () use ($request) {
            $totalHarga = collect($request->details)->sum(function ($d) {
                $obat = Medicine::find($d['obat_id']);
                return $obat ? (float) $obat->harga_jual * $d['jumlah'] : 0;
            });

            $resep = ResepObat::create([
                'pasien_id'      => $request->pasien_id,
                'rekam_medis_id' => $request->rekam_medis_id,
                'dokter_id'      => $request->dokter_id,
                'tanggal_resep'  => $request->tanggal_resep,
                'status'         => $request->status,
                'catatan'        => $request->catatan,
                'total_harga'    => $totalHarga,
                'created_by'     => $request->user()->id,
            ]);

            foreach ($request->details as $d) {
                $obat = Medicine::find($d['obat_id']);
                $hargaSatuan = $obat ? (float) $obat->harga_jual : 0;
                DetailResepObat::create([
                    'resep_id'    => $resep->id,
                    'obat_id'     => $d['obat_id'],
                    'jumlah'      => $d['jumlah'],
                    'aturan_pakai'=> $d['aturan_pakai'],
                    'keterangan'  => $d['keterangan'] ?? null,
                    'harga_satuan'=> $hargaSatuan,
                    'subtotal'    => $hargaSatuan * $d['jumlah'],
                ]);
            }

            // 🔧 FIX: kalau resep langsung dibuat dengan status "selesai"
            // (jarang terjadi, tapi bisa saja apoteker input manual & langsung
            // tandai selesai), stok langsung dikurangi saat itu juga.
            if ($resep->status === self::STATUS_SELESAI) {
                $this->kurangiStok($resep);
            }
        });

        return redirect()->route('pelayanan.resep-obat.index')
            ->with('success', 'Resep obat berhasil dibuat.');
    }

    public function show(Request $request, ResepObat $resepObat): Response
    {
        // 🔧 SECURITY FIX: dokter cuma boleh buka resep miliknya sendiri
        // lewat URL langsung. Apoteker/admin/super_admin tidak dibatasi.
        $user = $request->user();
        if ($user?->role === 'dokter' && $resepObat->dokter_id !== $user->id) {
            abort(403, 'Anda tidak memiliki akses ke resep dokter lain.');
        }

        $resepObat->load([
            'pasien:id,full_name,medical_record_number',
            'dokter:id,name',
            'details.obat:id,kode_obat,nama_obat,satuan,status',
        ]);

        return Inertia::render('pelayanan/resep-obat/show', [
            'resep' => $resepObat,
        ]);
    }

    public function edit(Request $request, ResepObat $resepObat): Response
    {
        $user = $request->user();
        if ($user?->role === 'dokter' && $resepObat->dokter_id !== $user->id) {
            abort(403, 'Anda tidak memiliki akses ke resep dokter lain.');
        }

        $resepObat->load(['pasien', 'dokter', 'details.obat']);

        return Inertia::render('pelayanan/resep-obat/edit', [
            'resep'   => $resepObat,
            'pasiens' => Patient::where('patient_status', 'aktif')
                ->select('id', 'full_name', 'medical_record_number')
                ->orderBy('full_name')->get(),
            'dokters' => SystemUser::active()->dokter()->select('id', 'name')->get(),
            'obats'   => Medicine::where('status', 'aktif')
                ->select('id', 'kode_obat', 'nama_obat', 'satuan', 'harga_jual', 'stok', 'status')
                ->orderBy('nama_obat')->get(),
        ]);
    }

    public function update(StoreResepObatRequest $request, ResepObat $resepObat): RedirectResponse
    {
        // 🔧 SECURITY FIX: cegah dokter A ubah resep dokter B lewat POST manual.
        $user = $request->user();
        if ($user?->role === 'dokter' && $resepObat->dokter_id !== $user->id) {
            abort(403, 'Anda tidak memiliki akses ke resep dokter lain.');
        }

        DB::transaction(function () use ($request, $resepObat) {
            // 🔧 FIX: simpan status LAMA sebelum di-update, dipakai untuk
            // mendeteksi transisi status (misal: menunggu -> selesai).
            $statusLama = $resepObat->status;
            $statusBaru = $request->status;

            $totalHarga = collect($request->details)->sum(function ($d) {
                $obat = Medicine::find($d['obat_id']);
                return $obat ? (float) $obat->harga_jual * $d['jumlah'] : 0;
            });

            $resepObat->update([
                'pasien_id'      => $request->pasien_id,
                'rekam_medis_id' => $request->rekam_medis_id,
                'dokter_id'      => $request->dokter_id,
                'tanggal_resep'  => $request->tanggal_resep,
                'status'         => $statusBaru,
                'catatan'        => $request->catatan,
                'total_harga'    => $totalHarga,
            ]);

            $resepObat->details()->delete();
            foreach ($request->details as $d) {
                $obat = Medicine::find($d['obat_id']);
                $hargaSatuan = $obat ? (float) $obat->harga_jual : 0;
                DetailResepObat::create([
                    'resep_id'    => $resepObat->id,
                    'obat_id'     => $d['obat_id'],
                    'jumlah'      => $d['jumlah'],
                    'aturan_pakai'=> $d['aturan_pakai'],
                    'keterangan'  => $d['keterangan'] ?? null,
                    'harga_satuan'=> $hargaSatuan,
                    'subtotal'    => $hargaSatuan * $d['jumlah'],
                ]);
            }

            // 🔧 FIX UTAMA: pengurangan / pengembalian stok berdasarkan
            // transisi status, bukan lagi otomatis saat rekam medis dibuat.
            //
            // Kasus 1: status BARU jadi "selesai", sebelumnya BUKAN "selesai"
            //          → obat baru saja diserahkan ke pasien → kurangi stok.
            //
            // Kasus 2: status LAMA "selesai", tapi diubah jadi status lain
            //          (misalnya dibatalkan / dikoreksi apoteker)
            //          → obat batal diserahkan → kembalikan stok.
            //
            // Kasus 3: status tetap "selesai" ke "selesai" (mis. cuma edit
            //          catatan) → tidak ada perubahan stok tambahan.
            $resepObat->refresh()->load('details');

            if ($statusBaru === self::STATUS_SELESAI && $statusLama !== self::STATUS_SELESAI) {
                $this->kurangiStok($resepObat);
            } elseif ($statusLama === self::STATUS_SELESAI && $statusBaru !== self::STATUS_SELESAI) {
                $this->kembalikanStok($resepObat);
            }
        });

        return redirect()->route('pelayanan.resep-obat.show', $resepObat)
            ->with('success', 'Resep obat berhasil diperbarui.');
    }

    public function destroy(Request $request, ResepObat $resepObat): RedirectResponse
    {
        $user = $request->user();
        if ($user?->role === 'dokter' && $resepObat->dokter_id !== $user->id) {
            abort(403, 'Anda tidak memiliki akses ke resep dokter lain.');
        }

        DB::transaction(function () use ($resepObat) {
            // 🔧 FIX: kalau resep yang dihapus statusnya sudah "selesai"
            // (artinya stok sudah pernah dikurangi), kembalikan dulu stoknya
            // sebelum record-nya dihapus — supaya stok tidak "hilang".
            if ($resepObat->status === self::STATUS_SELESAI) {
                $resepObat->load('details');
                $this->kembalikanStok($resepObat);
            }

            $resepObat->delete();
        });

        return redirect()->route('pelayanan.resep-obat.index')
            ->with('success', 'Resep obat berhasil dihapus.');
    }

    /**
     * Kurangi stok obat untuk setiap detail resep ini.
     * Dipanggil saat status resep berpindah MENJADI "selesai".
     */
    private function kurangiStok(ResepObat $resepObat): void
    {
        $details = $resepObat->relationLoaded('details')
            ? $resepObat->details
            : $resepObat->details()->get();

        $obatIds = $details->pluck('obat_id')->unique();

        // lockForUpdate supaya aman dari race condition kalau ada proses
        // lain yang barengan mengubah stok obat yang sama
        $obatMap = Medicine::whereIn('id', $obatIds)->lockForUpdate()->get()->keyBy('id');

        foreach ($details as $detail) {
            $obat = $obatMap->get($detail->obat_id);

            if (! $obat) {
                throw ValidationException::withMessages([
                    'resep' => "Obat dengan ID {$detail->obat_id} tidak ditemukan saat memproses stok.",
                ]);
            }

            if ($detail->jumlah > $obat->stok) {
                throw ValidationException::withMessages([
                    'resep' => "Stok {$obat->nama_obat} tidak cukup untuk menyelesaikan resep ini. Sisa stok: {$obat->stok}.",
                ]);
            }

            $obat->decrement('stok', $detail->jumlah);
        }
    }

    /**
     * Kembalikan stok obat untuk setiap detail resep ini.
     * Dipanggil saat resep yang SUDAH "selesai" dibatalkan / diedit
     * jadi status lain, atau dihapus.
     */
    private function kembalikanStok(ResepObat $resepObat): void
    {
        $details = $resepObat->relationLoaded('details')
            ? $resepObat->details
            : $resepObat->details()->get();

        $obatIds = $details->pluck('obat_id')->unique();
        $obatMap = Medicine::whereIn('id', $obatIds)->lockForUpdate()->get()->keyBy('id');

        foreach ($details as $detail) {
            $obat = $obatMap->get($detail->obat_id);
            if ($obat) {
                $obat->increment('stok', $detail->jumlah);
            }
        }
    }
}