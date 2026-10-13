<?php

namespace App\Http\Requests\KunjunganRawatJalan;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateKunjunganRequest extends FormRequest
{
    public function authorize(): bool { return $this->user()?->hasPermission('rawat-jalan.update') ?? false; }

    public function rules(): array
    {
        return [
            'pasien_id'         => ['required', 'exists:patients,id'],
            'poli_id'           => ['required', 'exists:polis,id'],
            'dokter_id'         => ['required', 'exists:system_users,id'],
            'tanggal_kunjungan' => ['required', 'date'],
            'jam_masuk'         => ['nullable', 'date_format:H:i'],
            'jam_keluar'        => ['nullable', 'date_format:H:i'],
            'status'            => ['required', Rule::in(['menunggu', 'dalam_pemeriksaan', 'selesai', 'batal'])],
            'jenis_pembayaran'  => ['required', Rule::in(['umum', 'bpjs', 'asuransi'])],
            'nomor_bpjs'        => ['nullable', 'string', 'max:20', 'required_if:jenis_pembayaran,bpjs'],
            'keluhan_utama'     => ['nullable', 'string'],
            'catatan'           => ['nullable', 'string'],
        ];
    }
}
