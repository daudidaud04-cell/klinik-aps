<?php

namespace App\Http\Requests\Pembayaran;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePembayaranRequest extends FormRequest
{
    public function authorize(): bool { return $this->user()?->hasPermission('pembayaran.create') ?? false; }

    public function rules(): array
    {
        return [
            'pasien_id'     => ['required', 'exists:patients,id'],
            'tarif_id'      => ['nullable', 'exists:clinic_rates,id'],
            'jenis_layanan' => ['required', Rule::in([
                'rawat_jalan', 'rawat_inap', 'laboratorium',
                'resep', 'tindakan', 'lainnya',
            ])],
            'subtotal'      => ['required', 'numeric', 'min:0'],
            'diskon'        => ['nullable', 'numeric', 'min:0'],
            'pajak'         => ['nullable', 'numeric', 'min:0'],
            'total'         => ['required', 'numeric', 'min:0'],
            'dibayar'       => ['required', 'numeric', 'min:0'],
            'metode_bayar'  => ['required', Rule::in([
                'tunai', 'transfer', 'bpjs', 'asuransi', 'kartu_debit', 'kartu_kredit',
            ])],
            'status'        => ['required', Rule::in(['menunggu', 'lunas', 'gagal', 'refund'])],
            'catatan'       => ['nullable', 'string'],
            'tanggal_bayar' => ['nullable', 'date'],
        ];
    }
}
