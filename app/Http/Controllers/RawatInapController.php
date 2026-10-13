<?php

namespace App\Http\Controllers;

use App\Http\Requests\RawatInap\StoreRawatInapRequest;
use App\Http\Requests\RawatInap\UpdateRawatInapRequest;
use App\Models\Patient;
use App\Models\RawatInap;
use App\Models\Room;
use App\Models\SystemUser;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class RawatInapController extends Controller
{
    public function index(Request $request): Response
    {
        $rawatInaps = RawatInap::query()
            ->with([
                'pasien:id,full_name,medical_record_number',
                'kamar:id,kode_kamar,nama_kamar,kelas',
                'dokter:id,name',
            ])
            ->search($request->string('search')->value())
            ->byStatus($request->status)
            ->orderByDesc('tanggal_masuk')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('pelayanan/rawat-inap/index', [
            'rawatInaps' => $rawatInaps,
            'filters'    => $request->only(['search', 'status']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('pelayanan/rawat-inap/create', [
            'pasiens' => Patient::where('patient_status', 'aktif')
                ->select('id', 'full_name', 'medical_record_number')
                ->orderBy('full_name')
                ->get(),
            'kamars' => Room::where('status', 'tersedia')
                ->select('id', 'kode_kamar', 'nama_kamar', 'kelas', 'kapasitas', 'terisi', 'tarif_harian')
                ->get(),
            'dokters' => SystemUser::active()->dokter()->select('id', 'name')->get(),
        ]);
    }

    public function store(StoreRawatInapRequest $request): RedirectResponse
    {
        // 🔧 FIX: bungkus cek kapasitas + create dalam transaction dengan
        // row lock (lockForUpdate). Tanpa ini, dua request bersamaan bisa
        // sama-sama lolos cek "kamar belum penuh" sebelum salah satu
        // selesai menyimpan → overbooking kamar.
        //
        // CATATAN: increment terisi kamar TIDAK dilakukan manual di sini —
        // itu sudah otomatis ditangani oleh RawatInap::booted() event
        // 'created' lewat syncKamarStatus(). Menambah increment manual di
        // sini akan membuat terisi ke-hitung DUA KALI.
        try {
            $rawatInap = DB::transaction(function () use ($request) {
                $kamar = Room::where('id', $request->kamar_id)
                    ->lockForUpdate()
                    ->firstOrFail();

                if ($kamar->terisi >= $kamar->kapasitas) {
                    throw new \RuntimeException('KAMAR_PENUH');
                }

                return RawatInap::create([
                    ...$request->validated(),
                    'created_by' => $request->user()->id,
                ]);
            });
        } catch (\RuntimeException $e) {
            if ($e->getMessage() === 'KAMAR_PENUH') {
                return back()->withErrors(['kamar_id' => 'Kamar sudah penuh.'])->withInput();
            }
            throw $e;
        }

        return redirect()
            ->route('pelayanan.rawat-inap.show', $rawatInap)
            ->with('success', 'Pasien berhasil didaftarkan rawat inap.');
    }

   public function show(RawatInap $rawatInap): Response
{
    $rawatInap->load([
        'pasien:id,full_name,medical_record_number,nik,phone,gender,birth_date',
        'kamar:id,kode_kamar,nama_kamar,kelas,tarif_harian',
        'dokter:id,name,specialization',
        'details.dicatatOleh:id,name',
        'pemindahanKamars.kamarAsal:id,kode_kamar,nama_kamar',
        'pemindahanKamars.kamarTujuan:id,kode_kamar,nama_kamar',
    ]);

    // 🆕 Daftar kamar dikirim ke halaman detail supaya dialog "Pindah Kamar"
    // punya pilihan kamar tujuan tanpa perlu request/query terpisah.
    return Inertia::render('pelayanan/rawat-inap/show', [
        'rawatInap' => $rawatInap,
        'kamars'    => Room::select('id', 'kode_kamar', 'nama_kamar', 'kelas', 'kapasitas', 'terisi', 'tarif_harian', 'status')->get(),
    ]);
}
    public function edit(RawatInap $rawatInap): Response
    {
        return Inertia::render('pelayanan/rawat-inap/edit', [
            'rawatInap' => $rawatInap->load([
                'pasien:id,full_name,medical_record_number',
                'kamar:id,kode_kamar,nama_kamar,kelas',
                'dokter:id,name',
            ]),
            'pasiens' => Patient::where('patient_status', 'aktif')
                ->select('id', 'full_name', 'medical_record_number')
                ->orderBy('full_name')
                ->get(),
            'kamars' => Room::select('id', 'kode_kamar', 'nama_kamar', 'kelas', 'kapasitas', 'terisi', 'tarif_harian', 'status')->get(),
            'dokters' => SystemUser::active()->dokter()->select('id', 'name')->get(),
        ]);
    }

    public function update(UpdateRawatInapRequest $request, RawatInap $rawatInap): RedirectResponse
    {
        // 🔧 FIX: kamar_id sengaja TIDAK boleh diubah lewat update() biasa.
        // Model hanya sinkronisasi kamar saat kolom 'status' berubah ke/dari
        // status keluar (lihat RawatInap::booted()) — perubahan kamar_id di
        // luar itu tidak akan pernah mengosongkan kamar lama atau mengisi
        // kamar baru. Gunakan endpoint pindahKamar() di bawah untuk itu.
        $data = $request->validated();
        unset($data['kamar_id']);

        $rawatInap->update($data);

        return redirect()
            ->route('pelayanan.rawat-inap.show', $rawatInap)
            ->with('success', 'Data rawat inap berhasil diperbarui.');
    }

    /**
     * 🆕 Pindah kamar — endpoint khusus karena model TIDAK otomatis
     * mensinkronkan kamar saat kolom kamar_id berubah lewat update() biasa
     * (model hanya bereaksi terhadap perubahan kolom status).
     */
    public function pindahKamar(Request $request, RawatInap $rawatInap): RedirectResponse
    {
        $request->validate([
            'kamar_tujuan_id' => ['required', 'exists:rooms,id', 'different:kamar_id'],
            'alasan'          => ['nullable', 'string', 'max:255'],
        ]);

        if (in_array($rawatInap->status, ['pulang', 'meninggal', 'pulang_paksa'], true)) {
            return back()->withErrors(['status' => 'Pasien ini sudah keluar, tidak bisa dipindah kamar.']);
        }

        try {
            DB::transaction(function () use ($request, $rawatInap) {
                $kamarAsal = Room::where('id', $rawatInap->kamar_id)->lockForUpdate()->firstOrFail();
                $kamarTujuan = Room::where('id', $request->kamar_tujuan_id)->lockForUpdate()->firstOrFail();

                if ($kamarTujuan->terisi >= $kamarTujuan->kapasitas) {
                    throw new \RuntimeException('KAMAR_TUJUAN_PENUH');
                }

                // Catat riwayat pemindahan
                $rawatInap->pemindahanKamars()->create([
                    'kamar_asal_id'   => $kamarAsal->id,
                    'kamar_tujuan_id' => $kamarTujuan->id,
                    'alasan'          => $request->alasan,
                    'tanggal_pindah'  => now(),
                ]);

                // Kosongkan kamar asal
                $kamarAsal->decrement('terisi');
                $kamarAsal->refresh();
                if ($kamarAsal->status !== 'maintenance') {
                    $kamarAsal->update(['status' => 'tersedia']);
                }

                // Isi kamar tujuan
                $kamarTujuan->increment('terisi');
                $kamarTujuan->refresh();
                if ($kamarTujuan->terisi >= $kamarTujuan->kapasitas) {
                    $kamarTujuan->update(['status' => 'penuh']);
                }

                // Update kamar_id & status di rawat inap
                $rawatInap->update([
                    'kamar_id' => $kamarTujuan->id,
                    'status'   => 'pindah_kamar',
                ]);
            });
        } catch (\RuntimeException $e) {
            if ($e->getMessage() === 'KAMAR_TUJUAN_PENUH') {
                return back()->withErrors(['kamar_tujuan_id' => 'Kamar tujuan sudah penuh.']);
            }
            throw $e;
        }

        return back()->with('success', 'Pasien berhasil dipindahkan kamar.');
    }

    public function destroy(RawatInap $rawatInap): RedirectResponse
    {
        // Tidak perlu logic tambahan di sini — RawatInap::booted() event
        // 'deleted' sudah otomatis mengosongkan kamar kalau status masih
        // aktif/pindah_kamar (belum resmi keluar).
        $rawatInap->delete();

        return redirect()
            ->route('pelayanan.rawat-inap.index')
            ->with('success', 'Data rawat inap berhasil dihapus.');
    }
}