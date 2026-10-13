<?php

namespace App\Http\Requests\ClinicRate;

use Illuminate\Foundation\Http\FormRequest;

class UpdateClinicRateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasPermission('master-data.clinic-rates.update') ?? false;
    }

    public function rules(): array
    {
        $rateId = $this->route('clinic_rate')?->id ?? $this->route('clinic_rate');

        return [
            'kode_tarif'  => ['required', 'string', 'max:20', 'unique:clinic_rates,kode_tarif,' . $rateId],
            'nama_tarif'  => ['required', 'string', 'max:150'],
            'kategori'    => ['required', 'in:Konsultasi,Administrasi,Rawat Inap,Tindakan Medis,Tindakan Bedah Minor,Laboratorium,Radiologi,Lainnya'],
            'harga'       => ['required', 'numeric', 'min:0'],
            'is_taxable'  => ['required', 'boolean'],
            'tax_percent' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'deskripsi'   => ['nullable', 'string'],
            'status'      => ['required', 'in:aktif,nonaktif'],
        ];
    }

    public function messages(): array
    {
        return [
            'kode_tarif.required' => 'Kode tarif wajib diisi.',
            'kode_tarif.unique'   => 'Kode tarif sudah digunakan.',
            'nama_tarif.required' => 'Nama tarif wajib diisi.',
            'kategori.required'   => 'Kategori wajib dipilih.',
            'harga.required'      => 'Harga wajib diisi.',
            'tax_percent.max'     => 'Persentase pajak maksimal 100%.',
        ];
    }
}
