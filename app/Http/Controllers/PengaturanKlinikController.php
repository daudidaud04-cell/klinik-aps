<?php

namespace App\Http\Controllers;

use App\Models\PengaturanKlinik;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class PengaturanKlinikController extends Controller
{
    public function edit(): Response
    {
        return Inertia::render('sistem/pengaturan', [
            'pengaturan' => PengaturanKlinik::getPengaturan(),
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'nama_klinik'      => ['required', 'string', 'max:100'],
            'tagline'          => ['nullable', 'string', 'max:200'],
            'alamat'           => ['nullable', 'string'],
            'kota'             => ['nullable', 'string', 'max:100'],
            'provinsi'         => ['nullable', 'string', 'max:100'],
            'kode_pos'         => ['nullable', 'string', 'max:10'],
            'telepon'          => ['nullable', 'string', 'max:20'],
            'email'            => ['nullable', 'email', 'max:100'],
            'website'          => ['nullable', 'url', 'max:200'],
            'npwp'             => ['nullable', 'string', 'max:30'],
            'no_izin_praktik'  => ['nullable', 'string', 'max:100'],
            'nama_pimpinan'    => ['nullable', 'string', 'max:100'],
            'no_str_pimpinan'  => ['nullable', 'string', 'max:100'],
            'jam_buka'         => ['nullable', 'string', 'max:10'],
            'jam_tutup'        => ['nullable', 'string', 'max:10'],
            'hari_operasional' => ['nullable', 'string', 'max:100'],
            'footer_invoice'   => ['nullable', 'string'],
            'warna_tema'       => ['nullable', 'string', 'max:7'],
            'logo'             => ['nullable', 'image', 'max:2048'],
        ]);

        $pengaturan = PengaturanKlinik::getPengaturan();

        if ($request->hasFile('logo')) {
            if ($pengaturan->logo) {
                Storage::disk('public')->delete($pengaturan->logo);
            }
            $validated['logo'] = $request->file('logo')->store('logo', 'public');
        }

        $pengaturan->update($validated);

        activity()
            ->causedBy(auth()->user())
            ->log('Memperbarui pengaturan klinik');

        return back()->with('success', 'Pengaturan klinik berhasil disimpan.');
    }
}