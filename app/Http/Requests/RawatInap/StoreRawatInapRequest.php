<?php

namespace App\Http\Requests\RawatInap;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreRawatInapRequest extends FormRequest
{
    public function authorize(): bool { return $this->user()?->hasPermission('rawat-inap.create') ?? false; }

    public function rules(): array
    {
        return [
            'pasien_id'        => ['required', 'exists:patients,id'],
            'kamar_id'         => ['required', 'exists:rooms,id'],
            'dokter_id'        => ['required', 'exists:system_users,id'],
            'rekam_medis_id'   => ['nullable', 'exists:rekam_medis,id'],
            'tanggal_masuk'    => ['required', 'date'],
            'status'           => ['required', Rule::in(['aktif'])],
            // 🔧 FIX: klinik hanya menerima pasien umum. Kolom database tetap
            // enum('umum','bpjs','asuransi') supaya tidak perlu migration
            // ulang kalau suatu saat dibuka lagi, tapi di level aplikasi
            // dikunci hanya 'umum' yang diterima.
            'jenis_pembayaran' => ['required', Rule::in(['umum'])],
            'diagnosa_masuk'   => ['nullable', 'string'],
            'catatan'          => ['nullable', 'string'],
            'total_biaya'      => ['required', 'numeric', 'min:0'],
            'status_bayar'     => ['required', Rule::in(['belum_bayar', 'lunas', 'cicilan'])],
        ];
    }

    public function messages(): array
    {
        return [
            'pasien_id.required'        => 'Pasien wajib dipilih.',
            'kamar_id.required'         => 'Kamar wajib dipilih.',
            'dokter_id.required'        => 'Dokter wajib dipilih.',
            'tanggal_masuk.required'    => 'Tanggal masuk wajib diisi.',
            'status.in'                 => 'Status pendaftaran baru harus "aktif".',
            'jenis_pembayaran.in'       => 'Klinik ini hanya menerima pasien umum.',
        ];
    }
}