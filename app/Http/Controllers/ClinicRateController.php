<?php

namespace App\Http\Controllers;

use App\Http\Requests\ClinicRate\StoreClinicRateRequest;
use App\Http\Requests\ClinicRate\UpdateClinicRateRequest;
use App\Models\ClinicRate;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ClinicRateController extends Controller
{
    public function index(Request $request): Response
    {
        $clinicRates = ClinicRate::query()
            ->search($request->string('search')->trim()->value())
            ->when($request->kategori, fn($q, $v) => $q->where('kategori', $v))
            ->when($request->status, fn($q, $v) => $q->where('status', $v))
            ->orderBy(
                $request->string('sort_by', 'nama_tarif')->value(),
                $request->string('sort_dir', 'asc')->value()
            )
            ->paginate($request->integer('per_page', 15))
            ->withQueryString();

        return Inertia::render('clinic-rates/index', [
            'clinicRates' => $clinicRates,
            'filters'     => $request->only(['search', 'kategori', 'status', 'sort_by', 'sort_dir', 'per_page']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('clinic-rates/create');
    }

    public function store(StoreClinicRateRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        if (empty($validated['is_taxable'])) {
            $validated['is_taxable']  = false;
            $validated['tax_percent'] = 0;
        }

        ClinicRate::create($validated);

        return redirect()
            ->route('clinic-rates.index')
            ->with('success', 'Data tarif klinik berhasil ditambahkan.');
    }

    public function show(ClinicRate $clinicRate): Response
    {
        return Inertia::render('clinic-rates/show', [
            'clinicRate' => $clinicRate,
        ]);
    }

    public function edit(ClinicRate $clinicRate): Response
    {
        return Inertia::render('clinic-rates/edit', [
            'clinicRate' => $clinicRate,
        ]);
    }

    public function update(UpdateClinicRateRequest $request, ClinicRate $clinicRate): RedirectResponse
    {
        $validated = $request->validated();

        if (empty($validated['is_taxable'])) {
            $validated['is_taxable']  = false;
            $validated['tax_percent'] = 0;
        }

        $clinicRate->update($validated);

        return redirect()
            ->route('clinic-rates.index')
            ->with('success', 'Data tarif klinik berhasil diperbarui.');
    }

    public function destroy(ClinicRate $clinicRate): RedirectResponse
    {
        $clinicRate->delete();

        return redirect()
            ->route('clinic-rates.index')
            ->with('success', 'Data tarif klinik berhasil dihapus.');
    }
}