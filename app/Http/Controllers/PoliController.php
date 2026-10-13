<?php

namespace App\Http\Controllers;

use App\Http\Requests\Poli\StorePoliRequest;
use App\Http\Requests\Poli\UpdatePoliRequest;
use App\Models\Poli;
use App\Models\SystemUser;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PoliController extends Controller
{
    public function index(Request $request): Response
    {
        // 🔧 FIX: eager load doctors (plural) bukan doctor (singular)
        $polis = Poli::with('doctors:id,name,specialization')
            ->search($request->string('search')->trim()->value())
            ->when($request->status, fn($q, $v) => $q->where('status', $v))
            ->orderBy('nama_poli')
            ->paginate($request->integer('per_page', 15))
            ->withQueryString();

        return Inertia::render('polis/index', [
            'polis'   => $polis,
            'filters' => $request->only(['search', 'status', 'per_page']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('polis/create', [
            'doctors' => SystemUser::active()->dokter()->select('id', 'name', 'specialization')->get(),
        ]);
    }

    public function store(StorePoliRequest $request): RedirectResponse
    {
        // 🔧 FIX: doctor_ids dipisah dulu sebelum create, karena bukan
        // kolom asli tabel polis (itu untuk tabel pivot).
        $validated = $request->validated();
        $doctorIds = $validated['doctor_ids'] ?? [];
        unset($validated['doctor_ids']);

        $poli = Poli::create($validated);
        $poli->doctors()->sync($doctorIds);

        return redirect()
            ->route('master-data.polis.index')
            ->with('success', 'Data poli berhasil ditambahkan.');
    }

    public function show(Poli $poli): Response
    {
        return Inertia::render('polis/show', [
            'poli' => $poli->load('doctors:id,name,specialization'),
        ]);
    }

    public function edit(Poli $poli): Response
    {
        return Inertia::render('polis/edit', [
            // 🔧 FIX: load relasi doctors supaya form edit tahu dokter
            // mana saja yang sudah terpilih untuk poli ini
            'poli'    => $poli->load('doctors:id,name,specialization'),
            'doctors' => SystemUser::active()->dokter()->select('id', 'name', 'specialization')->get(),
        ]);
    }

    public function update(UpdatePoliRequest $request, Poli $poli): RedirectResponse
    {
        $validated = $request->validated();
        $doctorIds = $validated['doctor_ids'] ?? [];
        unset($validated['doctor_ids']);

        $poli->update($validated);
        // sync() otomatis menambah dokter baru, menghapus yang tidak
        // dipilih lagi, dan mempertahankan yang masih dipilih.
        $poli->doctors()->sync($doctorIds);

        return redirect()
            ->route('master-data.polis.index')
            ->with('success', 'Data poli berhasil diperbarui.');
    }

    public function destroy(Poli $poli): RedirectResponse
    {
        $poli->delete();

        return redirect()
            ->route('master-data.polis.index')
            ->with('success', 'Data poli berhasil dihapus.');
    }
}