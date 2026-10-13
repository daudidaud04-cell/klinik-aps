<?php

namespace App\Http\Controllers;

use App\Http\Requests\KunjunganRawatJalan\StoreKunjunganRequest;
use App\Http\Requests\KunjunganRawatJalan\UpdateKunjunganRequest;
use App\Models\KunjunganRawatJalan;
use App\Models\Patient;
use App\Models\Poli;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class KunjunganRawatJalanController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $kunjungans = KunjunganRawatJalan::query()
            ->with([
                'pasien:id,full_name,medical_record_number',
                'poli:id,nama_poli',
                'dokter:id,name',
            ])
            // 🔧 SECURITY FIX: dokter hanya lihat kunjungan pasiennya sendiri.
            // Role lain (admin, kasir, super_admin, dst) tetap lihat semua
            // untuk keperluan operasional/koordinasi.
            ->when($user?->role === 'dokter', fn ($q) => $q->where('dokter_id', $user->id))
            ->search($request->string('search')->value())
            ->byStatus($request->status)
            ->byTanggal($request->tanggal)
            ->orderByDesc('tanggal_kunjungan')
            ->orderByDesc('id')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('pelayanan/rawat-jalan/index', [
            'kunjungans' => $kunjungans,
            'filters'    => $request->only(['search', 'status', 'tanggal']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('pelayanan/rawat-jalan/create', [
            'pasiens' => Patient::where('patient_status', 'aktif')
                ->select('id', 'full_name', 'medical_record_number')
                ->orderBy('full_name')
                ->get(),
            'polis' => Poli::active()
                ->with('doctors:id,name,specialization')
                ->select('id', 'nama_poli')
                ->orderBy('nama_poli')
                ->get(),
        ]);
    }

    public function store(StoreKunjunganRequest $request): RedirectResponse
    {
        $kunjungan = KunjunganRawatJalan::create([
            ...$request->validated(),
            'created_by' => $request->user()->id,
        ]);

        return redirect()
            ->route('pelayanan.rawat-jalan.show', $kunjungan)
            ->with('success', 'Kunjungan rawat jalan berhasil didaftarkan.');
    }

    public function show(Request $request, KunjunganRawatJalan $rawatJalan): Response
    {
        // 🔧 SECURITY FIX: cegah dokter buka kunjungan dokter lain lewat
        // URL langsung (mis. ketik /pelayanan/rawat-jalan/7 manual), bukan
        // cuma disembunyikan dari listing.
        $user = $request->user();
        if ($user?->role === 'dokter' && $rawatJalan->dokter_id !== $user->id) {
            abort(403, 'Anda tidak memiliki akses ke kunjungan pasien dokter lain.');
        }

        $rawatJalan->load([
            'pasien:id,full_name,medical_record_number,nik,phone,gender,birth_date',
            'poli:id,nama_poli',
            'dokter:id,name,specialization',
            'rekamMedis.diagnosas',
            'rekamMedis.tindakanMedis',
            'rekamMedis.tarif:id,nama_tarif',
        ]);

        return Inertia::render('pelayanan/rawat-jalan/show', [
            'kunjungan' => $rawatJalan,
        ]);
    }

    public function edit(Request $request, KunjunganRawatJalan $rawatJalan): Response
    {
        $user = $request->user();
        if ($user?->role === 'dokter' && $rawatJalan->dokter_id !== $user->id) {
            abort(403, 'Anda tidak memiliki akses ke kunjungan pasien dokter lain.');
        }

        return Inertia::render('pelayanan/rawat-jalan/edit', [
            'kunjungan' => $rawatJalan->load([
                'pasien:id,full_name,medical_record_number',
                'poli:id,nama_poli',
                'dokter:id,name',
            ]),
            'pasiens' => Patient::where('patient_status', 'aktif')
                ->select('id', 'full_name', 'medical_record_number')
                ->orderBy('full_name')
                ->get(),
            'polis' => Poli::active()
                ->with('doctors:id,name,specialization')
                ->select('id', 'nama_poli')
                ->orderBy('nama_poli')
                ->get(),
        ]);
    }

    public function update(UpdateKunjunganRequest $request, KunjunganRawatJalan $rawatJalan): RedirectResponse
    {
        // 🔧 SECURITY FIX: cegah dokter A mengubah data kunjungan dokter B
        // lewat POST manual (bukan cuma lewat halaman edit yang sudah di-guard).
        $user = $request->user();
        if ($user?->role === 'dokter' && $rawatJalan->dokter_id !== $user->id) {
            abort(403, 'Anda tidak memiliki akses ke kunjungan pasien dokter lain.');
        }

        $rawatJalan->update($request->validated());

        return redirect()
            ->route('pelayanan.rawat-jalan.show', $rawatJalan)
            ->with('success', 'Data kunjungan berhasil diperbarui.');
    }

    public function destroy(Request $request, KunjunganRawatJalan $rawatJalan): RedirectResponse
    {
        $user = $request->user();
        if ($user?->role === 'dokter' && $rawatJalan->dokter_id !== $user->id) {
            abort(403, 'Anda tidak memiliki akses ke kunjungan pasien dokter lain.');
        }

        $rawatJalan->delete();

        return redirect()
            ->route('pelayanan.rawat-jalan.index')
            ->with('success', 'Data kunjungan berhasil dihapus.');
    }
}