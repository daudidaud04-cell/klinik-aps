<?php

namespace App\Http\Requests\KunjunganRawatJalan;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreKunjunganRequest extends FormRequest
{
    public function authorize(): bool { return $this->user()?->hasPermission('rawat-jalan.create') ?? false; }

    public function rules(): array
    {
        return [
            'pasien_id'         => ['required', 'exists:patients,id'],
            'poli_id'           => ['required', 'exists:polis,id'],
            'dokter_id'         => ['required', 'exists:system_users,id'],
            'tanggal_kunjungan' => ['required', 'date'],
            'jam_masuk'         => ['nullable', 'date_format:H:i'],
            'status'            => ['required', Rule::in(['menunggu', 'dalam_pemeriksaan', 'selesai', 'batal'])],
            'jenis_pembayaran'  => ['required', Rule::in(['umum', 'bpjs', 'asuransi'])],
            'nomor_bpjs'        => ['nullable', 'string', 'max:20', 'required_if:jenis_pembayaran,bpjs'],
            'keluhan_utama'     => ['nullable', 'string'],
            'catatan'           => ['nullable', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'pasien_id.required'         => 'Pasien wajib dipilih.',
            'poli_id.required'           => 'Poli wajib dipilih.',
            'dokter_id.required'         => 'Dokter wajib dipilih.',
            'tanggal_kunjungan.required' => 'Tanggal kunjungan wajib diisi.',
            'nomor_bpjs.required_if'     => 'Nomor BPJS wajib diisi jika pembayaran BPJS.',
        ];
    }
}
