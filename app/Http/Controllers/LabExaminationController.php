<?php

namespace App\Http\Controllers;

use App\Http\Requests\LabExamination\StoreLabExaminationRequest;
use App\Http\Requests\LabExamination\UpdateLabExaminationRequest;
use App\Models\LabExamination;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LabExaminationController extends Controller
{
    public function index(Request $request): Response
    {
        $labExaminations = LabExamination::query()
            ->search($request->string('search')->trim()->value())
            ->when($request->kategori, fn($q, $v) => $q->where('kategori', $v))
            ->when($request->status, fn($q, $v) => $q->where('status', $v))
            ->orderBy(
                $request->string('sort_by', 'nama_pemeriksaan')->value(),
                $request->string('sort_dir', 'asc')->value()
            )
            ->paginate($request->integer('per_page', 15))
            ->withQueryString();

        return Inertia::render('lab-examinations/index', [
            'labExaminations' => $labExaminations,
            'filters'         => $request->only(['search', 'kategori', 'status', 'sort_by', 'sort_dir', 'per_page']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('lab-examinations/create');
    }

    public function store(StoreLabExaminationRequest $request): RedirectResponse
    {
        LabExamination::create($request->validated());

        return redirect()
            ->route('lab-examinations.index')
            ->with('success', 'Data pemeriksaan laboratorium berhasil ditambahkan.');
    }

    public function show(LabExamination $labExamination): Response
    {
        return Inertia::render('lab-examinations/show', [
            'labExamination' => $labExamination,
        ]);
    }

    public function edit(LabExamination $labExamination): Response
    {
        return Inertia::render('lab-examinations/edit', [
            'labExamination' => $labExamination,
        ]);
    }

    public function update(UpdateLabExaminationRequest $request, LabExamination $labExamination): RedirectResponse
    {
        $labExamination->update($request->validated());

        return redirect()
            ->route('lab-examinations.index')
            ->with('success', 'Data pemeriksaan laboratorium berhasil diperbarui.');
    }

    public function destroy(LabExamination $labExamination): RedirectResponse
    {
        $labExamination->delete();

        return redirect()
            ->route('lab-examinations.index')
            ->with('success', 'Data pemeriksaan laboratorium berhasil dihapus.');
    }
}