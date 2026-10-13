<?php

namespace App\Http\Requests\RekamMedis;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreRekamMedisRequest extends FormRequest
{
    public function authorize(): bool { return $this->user()?->hasPermission('rekam-medis.create') ?? false; }

    public function rules(): array
    {
        return [
            'kunjungan_id'      => ['required', 'exists:kunjungan_rawat_jalans,id'],
            'tarif_id'          => ['nullable', 'exists:clinic_rates,id'],
            'tekanan_darah'     => ['nullable', 'string', 'max:20'],
            'suhu_tubuh'        => ['nullable', 'numeric', 'min:30', 'max:45'],
            'nadi'              => ['nullable', 'integer', 'min:0', 'max:300'],
            'pernapasan'        => ['nullable', 'integer', 'min:0', 'max:100'],
            'berat_badan'       => ['nullable', 'numeric', 'min:0', 'max:500'],
            'tinggi_badan'      => ['nullable', 'numeric', 'min:0', 'max:300'],
            'anamnesis'         => ['nullable', 'string'],
            'pemeriksaan_fisik' => ['nullable', 'string'],
            'rencana_terapi'    => ['nullable', 'string'],
            'catatan_dokter'    => ['nullable', 'string'],

            // 🔧 FIX: total_biaya sekarang dihitung ulang di server (controller),
            // jadi nilai dari client cuma dipakai sebagai preview/optional,
            // bukan sumber kebenaran. Diubah ke nullable supaya tidak menyesatkan.
            'total_biaya'       => ['nullable', 'numeric', 'min:0'],
            'status_bayar'      => ['required', Rule::in(['belum_bayar', 'lunas', 'cicilan'])],

            // Diagnosa (array)
            'diagnosas'                  => ['nullable', 'array'],
            'diagnosas.*.nama_diagnosa'  => ['required_with:diagnosas', 'string', 'max:255'],
            'diagnosas.*.kode_icd'       => ['nullable', 'string', 'max:10'],
            'diagnosas.*.jenis'          => ['required_with:diagnosas', Rule::in(['utama', 'sekunder'])],
            'diagnosas.*.keterangan'     => ['nullable', 'string'],

            // Tindakan (array)
            'tindakan'                   => ['nullable', 'array'],
            'tindakan.*.nama_tindakan'   => ['required_with:tindakan', 'string', 'max:150'],
            'tindakan.*.tarif_id'        => ['nullable', 'exists:clinic_rates,id'],
            'tindakan.*.biaya'           => ['required_with:tindakan', 'numeric', 'min:0'],
            'tindakan.*.jumlah'          => ['required_with:tindakan', 'integer', 'min:1'],
            'tindakan.*.keterangan'      => ['nullable', 'string'],

            // 🔧 FIX: rules untuk resep obat ditambahkan — sebelumnya tidak ada
            // sama sekali padahal controller mengakses field-field ini penuh.
            'resep'                      => ['nullable', 'array'],
            'resep.*.obat_id'            => ['required_with:resep', 'exists:medicines,id'],
            'resep.*.jumlah'             => ['required_with:resep', 'integer', 'min:1'],
            'resep.*.aturan_pakai'       => ['required_with:resep', 'string', 'max:255'],
            'resep.*.keterangan'         => ['nullable', 'string', 'max:255'],

            // 🔧 FIX: catatan_resep diberi batas panjang eksplisit
            'catatan_resep'              => ['nullable', 'string', 'max:255'],
        ];
    }

    /**
     * 🔧 Tambahan: pesan error berbahasa Indonesia yang lebih jelas untuk
     * field array, supaya frontend (arrayError helper) menampilkan pesan
     * yang enak dibaca user, bukan default Laravel bahasa Inggris.
     */
    public function messages(): array
    {
        return [
            'resep.*.obat_id.required_with'      => 'Obat wajib dipilih.',
            'resep.*.obat_id.exists'             => 'Obat yang dipilih tidak ditemukan.',
            'resep.*.jumlah.required_with'        => 'Jumlah obat wajib diisi.',
            'resep.*.jumlah.min'                  => 'Jumlah obat minimal 1.',
            'resep.*.aturan_pakai.required_with'  => 'Aturan pakai wajib diisi.',
            'diagnosas.*.nama_diagnosa.required_with' => 'Nama diagnosa wajib diisi.',
            'tindakan.*.nama_tindakan.required_with'  => 'Nama tindakan wajib diisi.',
            'tindakan.*.biaya.required_with'          => 'Biaya tindakan wajib diisi.',
        ];
    }
}
