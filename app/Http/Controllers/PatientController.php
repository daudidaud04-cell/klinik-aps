<?php

namespace App\Http\Controllers;

use App\Http\Requests\Patient\StorePatientRequest;
use App\Http\Requests\Patient\UpdatePatientRequest;
use App\Models\Patient;
use App\Models\SystemUser;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PatientController extends Controller
{
    public function index(Request $request): Response
    {
        $patients = Patient::query()
            ->search($request->string('search')->trim()->value())
            ->filterGender($request->string('gender')->value())
            ->filterStatus($request->string('status')->value())
            ->filterInsuranceType($request->string('insurance_type')->value())
            ->sorted(
                $request->string('sort_by', 'created_at')->value(),
                $request->string('sort_dir', 'desc')->value()
            )
            ->paginate($request->integer('per_page', 10))
            ->withQueryString();

        return Inertia::render('patients/index', [
            'patients' => $patients,
            'filters'  => $request->only(['search', 'gender', 'status', 'insurance_type', 'sort_by', 'sort_dir', 'per_page']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('patients/create');
    }

    public function store(StorePatientRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        $systemUser = SystemUser::where('email', $request->user()->email)->first();
        $validated['created_by'] = $systemUser?->id ?? 1;

        Patient::create($validated);

        return redirect()
            ->route('patients.index')
            ->with('success', 'Pasien berhasil ditambahkan.');
    }

    public function show(Patient $patient): Response
    {
        return Inertia::render('patients/show', [
            'patient' => $patient->load('creator'),
        ]);
    }

    public function edit(Patient $patient): Response
    {
        return Inertia::render('patients/edit', [
            'patient' => $patient,
        ]);
    }

    public function update(UpdatePatientRequest $request, Patient $patient): RedirectResponse
    {
        $patient->update($request->validated());

        return redirect()
            ->route('patients.index')
            ->with('success', 'Data pasien berhasil diperbarui.');
    }

    public function destroy(Patient $patient): RedirectResponse
    {
        $patient->delete();

        return redirect()
            ->route('patients.index')
            ->with('success', "Pasien {$patient->full_name} berhasil dihapus.");
    }
}