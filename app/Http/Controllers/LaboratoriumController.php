<?php

namespace App\Http\Controllers;

use App\Http\Requests\Laboratorium\StorePemeriksaanLabRequest;
use App\Models\HasilLab;
use App\Models\LabExamination;
use App\Models\Patient;
use App\Models\PemeriksaanLab;
use App\Models\SystemUser;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class LaboratoriumController extends Controller
{
    public function index(Request $request): Response
    {
        $pemeriksaans = PemeriksaanLab::query()
            ->with([
                'pasien:id,full_name,medical_record_number',
                'jenis:id,nama_pemeriksaan,kategori',
                'petugas:id,name',
            ])
            ->search($request->string('search')->value())
            ->byStatus($request->status)
            ->orderByDesc('tanggal_pemeriksaan')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('pelayanan/laboratorium/index', [
            'pemeriksaans' => $pemeriksaans,
            'filters'      => $request->only(['search', 'status']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('pelayanan/laboratorium/create', [
            'pasiens'  => Patient::where('patient_status', 'aktif')
                ->select('id', 'full_name', 'medical_record_number')
                ->orderBy('full_name')->get(),
            'jenis'    => LabExamination::active()
                ->select('id', 'kode_pemeriksaan', 'nama_pemeriksaan', 'kategori', 'harga', 'satuan_hasil', 'nilai_normal_min', 'nilai_normal_max', 'status')
                ->orderBy('nama_pemeriksaan')->get(),
            'petugas'  => SystemUser::active()->byRole('laboran')->select('id', 'name')->get(),
        ]);
    }

    public function store(StorePemeriksaanLabRequest $request): RedirectResponse
    {
        DB::transaction(function () use ($request) {
            $pemeriksaan = PemeriksaanLab::create([
                'pasien_id'           => $request->pasien_id,
                'jenis_id'            => $request->jenis_id,
                'rekam_medis_id'      => $request->rekam_medis_id,
                'petugas_id'          => $request->petugas_id,
                'tanggal_pemeriksaan' => $request->tanggal_pemeriksaan,
                'status'              => $request->status,
                'catatan'             => $request->catatan,
                'harga'               => $request->harga,
                'created_by'          => $request->user()->id,
            ]);

            if ($request->hasil) {
                foreach ($request->hasil as $h) {
                    HasilLab::create([
                        'pemeriksaan_id' => $pemeriksaan->id,
                        'parameter'      => $h['parameter'],
                        'nilai'          => $h['nilai'],
                        'satuan'         => $h['satuan'] ?? null,
                        'nilai_normal'   => $h['nilai_normal'] ?? null,
                        'keterangan'     => $h['keterangan'] ?? '-',
                        'catatan'        => $h['catatan'] ?? null,
                    ]);
                }
            }
        });

        return redirect()->route('pelayanan.laboratorium.index')
            ->with('success', 'Pemeriksaan laboratorium berhasil didaftarkan.');
    }

    public function show(PemeriksaanLab $laboratorium): Response
    {
        $laboratorium->load([
            'pasien:id,full_name,medical_record_number,nik',
            'jenis:id,nama_pemeriksaan,kategori,satuan_hasil',
            'petugas:id,name',
            'hasilLabs',
        ]);

        return Inertia::render('pelayanan/laboratorium/show', [
            'pemeriksaan' => $laboratorium,
        ]);
    }

    public function edit(PemeriksaanLab $laboratorium): Response
    {
        $laboratorium->load(['pasien', 'jenis', 'hasilLabs']);

        return Inertia::render('pelayanan/laboratorium/edit', [
            'pemeriksaan' => $laboratorium,
            'pasiens'     => Patient::where('patient_status', 'aktif')
                ->select('id', 'full_name', 'medical_record_number')
                ->orderBy('full_name')->get(),
            'jenis'       => LabExamination::active()
                ->select('id', 'kode_pemeriksaan', 'nama_pemeriksaan', 'kategori', 'harga', 'satuan_hasil', 'nilai_normal_min', 'nilai_normal_max', 'status')
                ->orderBy('nama_pemeriksaan')->get(),
            'petugas'     => SystemUser::active()->byRole('laboran')->select('id', 'name')->get(),
        ]);
    }

    public function update(StorePemeriksaanLabRequest $request, PemeriksaanLab $laboratorium): RedirectResponse
    {
        DB::transaction(function () use ($request, $laboratorium) {
            $laboratorium->update([
                'pasien_id'           => $request->pasien_id,
                'jenis_id'            => $request->jenis_id,
                'rekam_medis_id'      => $request->rekam_medis_id,
                'petugas_id'          => $request->petugas_id,
                'tanggal_pemeriksaan' => $request->tanggal_pemeriksaan,
                'status'              => $request->status,
                'catatan'             => $request->catatan,
                'harga'               => $request->harga,
            ]);

            if ($request->hasil !== null) {
                $laboratorium->hasilLabs()->delete();
                foreach ($request->hasil as $h) {
                    HasilLab::create([
                        'pemeriksaan_id' => $laboratorium->id,
                        'parameter'      => $h['parameter'],
                        'nilai'          => $h['nilai'],
                        'satuan'         => $h['satuan'] ?? null,
                        'nilai_normal'   => $h['nilai_normal'] ?? null,
                        'keterangan'     => $h['keterangan'] ?? '-',
                        'catatan'        => $h['catatan'] ?? null,
                    ]);
                }
            }
        });

        return redirect()->route('pelayanan.laboratorium.show', $laboratorium)
            ->with('success', 'Data pemeriksaan berhasil diperbarui.');
    }

    public function destroy(PemeriksaanLab $laboratorium): RedirectResponse
    {
        $laboratorium->delete();

        return redirect()->route('pelayanan.laboratorium.index')
            ->with('success', 'Data pemeriksaan berhasil dihapus.');
    }
}