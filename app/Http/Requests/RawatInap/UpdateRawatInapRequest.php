<?php

namespace App\Http\Requests\RawatInap;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateRawatInapRequest extends FormRequest
{
    public function authorize(): bool { return $this->user()?->hasPermission('rawat-inap.update') ?? false; }

    public function rules(): array
    {
        return [
            'pasien_id'        => ['required', 'exists:patients,id'],
            'kamar_id'         => ['required', 'exists:rooms,id'],
            'dokter_id'        => ['required', 'exists:system_users,id'],
            'rekam_medis_id'   => ['nullable', 'exists:rekam_medis,id'],
            'tanggal_masuk'    => ['required', 'date'],
            'tanggal_keluar'   => [
                'nullable',
                'date',
                'after_or_equal:tanggal_masuk',
                Rule::requiredIf(fn () => in_array(
                    $this->input('status'),
                    ['pulang', 'meninggal', 'pulang_paksa'],
                    true,
                )),
            ],
            'status'           => ['required', Rule::in(['aktif', 'pindah_kamar', 'pulang', 'meninggal', 'pulang_paksa'])],
            // 🔧 FIX: sama seperti Store — klinik hanya menerima umum.
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
            'pasien_id.required'            => 'Pasien wajib dipilih.',
            'kamar_id.required'             => 'Kamar wajib dipilih.',
            'dokter_id.required'            => 'Dokter wajib dipilih.',
            'tanggal_masuk.required'        => 'Tanggal masuk wajib diisi.',
            'tanggal_keluar.required'       => 'Tanggal keluar wajib diisi saat status diubah menjadi Pulang/Meninggal/Pulang Paksa.',
            'tanggal_keluar.after_or_equal' => 'Tanggal keluar tidak boleh sebelum tanggal masuk.',
            'jenis_pembayaran.in'           => 'Klinik ini hanya menerima pasien umum.',
        ];
    }
}