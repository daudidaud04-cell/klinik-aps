<?php

namespace App\Http\Controllers;

use App\Http\Requests\RekamMedis\StoreRekamMedisRequest;
use App\Models\ClinicRate;
use App\Models\Diagnosa;
use App\Models\DetailResepObat;
use App\Models\KunjunganRawatJalan;
use App\Models\Medicine;
use App\Models\RekamMedis;
use App\Models\ResepObat;
use App\Models\TindakanMedis;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class RekamMedisController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $rekamMedis = RekamMedis::query()
            ->with([
                'kunjungan.pasien:id,full_name,medical_record_number',
                'kunjungan.dokter:id,name',
                'kunjungan.poli:id,nama_poli',
            ])
            // 🔧 SECURITY FIX: dokter hanya lihat rekam medis pasien yang
            // dia tangani sendiri. Relasinya tidak langsung (lewat kunjungan),
            // jadi pakai whereHas.
            ->when(
                $user?->role === 'dokter',
                fn ($q) => $q->whereHas('kunjungan', fn ($qq) => $qq->where('dokter_id', $user->id))
            )
            ->when($request->status_bayar, fn ($q, $v) => $q->where('status_bayar', $v))
            ->orderByDesc('created_at')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('pelayanan/rekam-medis/index', [
            'rekamMedis' => $rekamMedis,
            'filters'    => $request->only(['status_bayar']),
        ]);
    }

    public function create(Request $request): Response
    {
        $user = $request->user();

        // Bisa diakses dari show kunjungan dengan query ?kunjungan_id=X
        $kunjungan = null;
        if ($request->kunjungan_id) {
            $kunjungan = KunjunganRawatJalan::with([
                'pasien:id,full_name,medical_record_number',
                'poli:id,nama_poli',
                'dokter:id,name',
            ])->find($request->kunjungan_id);

            // 🔧 SECURITY FIX: cegah dokter buat rekam medis untuk kunjungan
            // dokter lain lewat query param manual.
            if ($user?->role === 'dokter' && $kunjungan && $kunjungan->dokter_id !== $user->id) {
                abort(403, 'Anda tidak memiliki akses ke kunjungan pasien dokter lain.');
            }
        }

        return Inertia::render('pelayanan/rekam-medis/create', [
            'kunjungan'  => $kunjungan,
            'kunjungans' => KunjunganRawatJalan::with('pasien:id,full_name,medical_record_number')
                ->whereIn('status', ['dalam_pemeriksaan', 'menunggu'])
                // 🔧 SECURITY FIX: dropdown pilihan kunjungan juga di-scope
                ->when($user?->role === 'dokter', fn ($q) => $q->where('dokter_id', $user->id))
                ->select('id', 'nomor_kunjungan', 'pasien_id', 'tanggal_kunjungan')
                ->orderByDesc('tanggal_kunjungan')
                ->get(),
            'tarifs' => ClinicRate::active()->select('id', 'nama_tarif', 'harga')->get(),
            'obats'  => Medicine::where('status', 'aktif')
                ->where('stok', '>', 0)
                ->select('id', 'kode_obat', 'nama_obat', 'satuan', 'harga_jual', 'stok')
                ->orderBy('nama_obat')->get(),
        ]);
    }

    public function store(StoreRekamMedisRequest $request): RedirectResponse
    {
        // 🔧 SECURITY FIX: validasi ulang di server, jangan percaya dropdown
        // frontend sudah pasti benar — bisa saja request dikirim manual
        // (Postman/devtools) dengan kunjungan_id milik dokter lain.
        $user = $request->user();
        if ($user?->role === 'dokter') {
            $kunjunganDokterId = KunjunganRawatJalan::where('id', $request->kunjungan_id)->value('dokter_id');
            if ($kunjunganDokterId !== $user->id) {
                abort(403, 'Anda tidak memiliki akses ke kunjungan pasien dokter lain.');
            }
        }

        DB::transaction(function () use ($request) {

            // ─── Cegah kunjungan yang sama dipakai 2x rekam medis ───────
            $sudahAdaRekamMedis = RekamMedis::where('kunjungan_id', $request->kunjungan_id)->exists();
            if ($sudahAdaRekamMedis) {
                throw ValidationException::withMessages([
                    'kunjungan_id' => 'Kunjungan ini sudah memiliki rekam medis.',
                ]);
            }

            // ─── Hitung ulang total tindakan di server (jangan percaya client) ───
            $totalTindakan = collect($request->tindakan ?? [])->sum(
                fn ($t) => (float) $t['biaya'] * (int) $t['jumlah']
            );

            // ─── Validasi stok obat & hitung total resep di server ──────
            $totalResep = 0;

            if ($request->resep && count($request->resep) > 0) {
                $obatIds = collect($request->resep)->pluck('obat_id')->unique();
                $obatMap = Medicine::whereIn('id', $obatIds)->get()->keyBy('id');

                foreach ($request->resep as $r) {
                    $obat = $obatMap->get($r['obat_id']);

                    if (! $obat) {
                        throw ValidationException::withMessages([
                            'resep' => "Obat dengan ID {$r['obat_id']} tidak ditemukan.",
                        ]);
                    }

                    if ((int) $r['jumlah'] > $obat->stok) {
                        throw ValidationException::withMessages([
                            'resep' => "Stok {$obat->nama_obat} tidak cukup. Sisa stok: {$obat->stok}.",
                        ]);
                    }

                    $totalResep += (float) $obat->harga_jual * (int) $r['jumlah'];
                }
            }

            // Total biaya final dihitung di server, input client diabaikan
            $totalBiayaServer = $totalTindakan + $totalResep;

            $rekamMedis = RekamMedis::create([
                'kunjungan_id'      => $request->kunjungan_id,
                'tarif_id'          => $request->tarif_id ?: null,
                'tekanan_darah'     => $request->tekanan_darah,
                'suhu_tubuh'        => $request->suhu_tubuh,
                'nadi'              => $request->nadi,
                'pernapasan'        => $request->pernapasan,
                'berat_badan'       => $request->berat_badan,
                'tinggi_badan'      => $request->tinggi_badan,
                'anamnesis'         => $request->anamnesis,
                'pemeriksaan_fisik' => $request->pemeriksaan_fisik,
                'rencana_terapi'    => $request->rencana_terapi,
                'catatan_dokter'    => $request->catatan_dokter,
                'total_biaya'       => $totalBiayaServer,
                'status_bayar'      => $request->status_bayar,
            ]);

            // ─── Simpan diagnosa ───────────────────────────────────────
            if ($request->diagnosas) {
                foreach ($request->diagnosas as $d) {
                    Diagnosa::create([
                        'rekam_medis_id' => $rekamMedis->id,
                        'kode_icd'       => $d['kode_icd'] ?? null,
                        'nama_diagnosa'  => $d['nama_diagnosa'],
                        'jenis'          => $d['jenis'],
                        'keterangan'     => $d['keterangan'] ?? null,
                    ]);
                }
            }

            // ─── Simpan tindakan medis ─────────────────────────────────
            if ($request->tindakan) {
                foreach ($request->tindakan as $t) {
                    if (! empty($t['tarif_id']) && ! ClinicRate::active()->where('id', $t['tarif_id'])->exists()) {
                        throw ValidationException::withMessages([
                            'tindakan' => "Tarif dengan ID {$t['tarif_id']} tidak valid atau tidak aktif.",
                        ]);
                    }

                    TindakanMedis::create([
                        'rekam_medis_id' => $rekamMedis->id,
                        'tarif_id'       => $t['tarif_id'] ?: null,
                        'nama_tindakan'  => $t['nama_tindakan'],
                        'keterangan'     => $t['keterangan'] ?? null,
                        'biaya'          => $t['biaya'],
                        'jumlah'         => $t['jumlah'],
                    ]);
                }
            }

            // ─── Simpan resep obat (opsional) ───────────────────────────
            if ($request->resep && count($request->resep) > 0) {
                $resepObat = ResepObat::create([
                    'pasien_id'      => $rekamMedis->kunjungan?->pasien_id,
                    'rekam_medis_id' => $rekamMedis->id,
                    'dokter_id'      => $rekamMedis->kunjungan?->dokter_id,
                    'tanggal_resep'  => now(),
                    'status'         => 'menunggu',
                    'catatan'        => $request->catatan_resep,
                    'total_harga'    => $totalResep,
                    'created_by'     => $request->user()->id,
                ]);

                foreach ($request->resep as $r) {
                    $obat = Medicine::find($r['obat_id']);
                    $hargaSatuan = (float) $obat->harga_jual;
                    $jumlah = (int) $r['jumlah'];

                    DetailResepObat::create([
                        'resep_id'     => $resepObat->id,
                        'obat_id'      => $r['obat_id'],
                        'jumlah'       => $jumlah,
                        'aturan_pakai' => $r['aturan_pakai'],
                        'keterangan'   => $r['keterangan'] ?? null,
                        'harga_satuan' => $hargaSatuan,
                        'subtotal'     => $hargaSatuan * $jumlah,
                    ]);
                }
            }

            // ─── Update status kunjungan jadi selesai ───────────────────
            $rekamMedis->kunjungan?->update(['status' => 'selesai']);
        });

        return redirect()
            ->route('pelayanan.rekam-medis.index')
            ->with('success', 'Rekam medis berhasil disimpan.');
    }

    public function show(Request $request, RekamMedis $rekamMedis): Response
    {
        $user = $request->user();

        // 🔧 SECURITY FIX: cek lewat relasi kunjungan, karena dokter_id
        // tidak ada langsung di tabel rekam_medis.
        $rekamMedis->loadMissing('kunjungan');
        if ($user?->role === 'dokter' && $rekamMedis->kunjungan?->dokter_id !== $user->id) {
            abort(403, 'Anda tidak memiliki akses ke rekam medis pasien dokter lain.');
        }

        $rekamMedis->load([
            'kunjungan.pasien:id,full_name,medical_record_number,nik,gender,birth_date',
            'kunjungan.poli:id,nama_poli',
            'kunjungan.dokter:id,name,specialization',
            'diagnosas',
            'tindakanMedis',
            'tarif:id,nama_tarif',
            'resepObat.details.obat:id,kode_obat,nama_obat,satuan',
        ]);

        return Inertia::render('pelayanan/rekam-medis/show', [
            'rekamMedis' => $rekamMedis,
        ]);
    }
}