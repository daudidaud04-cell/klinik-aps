<?php

namespace App\Http\Controllers;

use App\Models\PatientHistory;
use App\Models\Patient;
use App\Models\SystemUser;
use App\Models\Poli;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class PatientHistoryController extends Controller
{
    public function index(Request $request): Response
    {
        $histories = PatientHistory::query()
            ->with(['patient', 'doctor', 'poli'])
            ->when($request->search, function ($query, $search) {
                $query->whereHas('patient', function ($q) use ($search) {
                    $q->where('full_name', 'like', "%{$search}%")
                      ->orWhere('medical_record_number', 'like', "%{$search}%");
                });
            })
            ->when($request->type, fn($q, $v) => $q->where('type', $v))
            ->when($request->status_bayar, fn($q, $v) => $q->where('status_bayar', $v))
            ->orderByDesc('visit_date')
            ->paginate($request->integer('per_page', 15))
            ->withQueryString();

        return Inertia::render('patient-histories/index', [
            'histories' => $histories,
            'filters'   => $request->only(['search', 'type', 'status_bayar', 'per_page']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('patient-histories/create', [
            'patients' => Patient::orderBy('full_name')->get(['id', 'full_name', 'medical_record_number']),
            'doctors'  => SystemUser::where('role', 'dokter')->orderBy('name')->get(['id', 'name', 'specialization']),
            'polis'    => Poli::orderBy('nama_poli')->get(['id', 'nama_poli']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'patient_id'        => 'required|exists:patients,id',
            'type'              => ['required', Rule::in(['rawat_jalan', 'rawat_inap', 'laboratorium', 'resep', 'tindakan'])],
            'doctor_id'         => 'nullable|exists:system_users,id',
            'poli_id'           => 'nullable|exists:polis,id',
            'visit_date'        => 'required|date',
            'chief_complaint'   => 'nullable|string',
            'diagnosis_summary' => 'nullable|string',
            'total_biaya'       => 'nullable|numeric|min:0',
            'status_bayar'      => ['required', Rule::in(['lunas', 'belum_bayar', 'cicilan'])],
        ]);

        PatientHistory::create($validated);

        return redirect()->route('patient-histories.index')
            ->with('success', 'Riwayat pasien berhasil ditambahkan.');
    }

    public function show(PatientHistory $patient_history): Response
    {
        $patient_history->load(['patient', 'doctor', 'poli']);

        return Inertia::render('patient-histories/show', [
            'history' => $patient_history,
        ]);
    }

    public function edit(PatientHistory $patient_history): Response
    {
        $patient_history->load(['patient', 'doctor', 'poli']);

        return Inertia::render('patient-histories/edit', [
            'history'  => $patient_history,
            'patients' => Patient::orderBy('full_name')->get(['id', 'full_name', 'medical_record_number']),
            'doctors'  => SystemUser::where('role', 'dokter')->orderBy('name')->get(['id', 'name', 'specialization']),
            'polis'    => Poli::orderBy('nama_poli')->get(['id', 'nama_poli']),
        ]);
    }

    public function update(Request $request, PatientHistory $patient_history): RedirectResponse
    {
        $validated = $request->validate([
            'patient_id'        => 'required|exists:patients,id',
            'type'              => ['required', Rule::in(['rawat_jalan', 'rawat_inap', 'laboratorium', 'resep', 'tindakan'])],
            'doctor_id'         => 'nullable|exists:system_users,id',
            'poli_id'           => 'nullable|exists:polis,id',
            'visit_date'        => 'required|date',
            'chief_complaint'   => 'nullable|string',
            'diagnosis_summary' => 'nullable|string',
            'total_biaya'       => 'nullable|numeric|min:0',
            'status_bayar'      => ['required', Rule::in(['lunas', 'belum_bayar', 'cicilan'])],
        ]);

        $patient_history->update($validated);

        return redirect()->route('patient-histories.index')
            ->with('success', 'Riwayat pasien berhasil diperbarui.');
    }

    public function destroy(PatientHistory $patient_history): RedirectResponse
    {
        $patient_history->delete();

        return redirect()->route('patient-histories.index')
            ->with('success', 'Riwayat pasien berhasil dihapus.');
    }
}