<?php

namespace App\Http\Requests\ResepObat;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreResepObatRequest extends FormRequest
{
    public function authorize(): bool { return $this->user()?->hasPermission('resep-obat.create') ?? false; }

    public function rules(): array
    {
        return [
            'pasien_id'      => ['required', 'exists:patients,id'],
            'rekam_medis_id' => ['nullable', 'exists:rekam_medis,id'],
            'dokter_id'      => ['required', 'exists:system_users,id'],
            'tanggal_resep'  => ['required', 'date'],
            'status'         => ['required', Rule::in(['menunggu', 'diproses', 'selesai', 'batal'])],
            'catatan'        => ['nullable', 'string'],

            'details'                   => ['required', 'array', 'min:1'],
            'details.*.obat_id'         => ['required', 'exists:medicines,id'],
            'details.*.jumlah'          => ['required', 'integer', 'min:1'],
            'details.*.aturan_pakai'    => ['required', 'string', 'max:100'],
            'details.*.keterangan'      => ['nullable', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'details.required' => 'Minimal 1 obat harus ditambahkan.',
            'details.min'      => 'Minimal 1 obat harus ditambahkan.',
        ];
    }
}
