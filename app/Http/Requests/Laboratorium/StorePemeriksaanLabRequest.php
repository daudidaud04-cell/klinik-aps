<?php

namespace App\Http\Requests\Laboratorium;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePemeriksaanLabRequest extends FormRequest
{
    public function authorize(): bool { return $this->user()?->hasPermission('laboratorium.create') ?? false; }

    public function rules(): array
    {
        return [
            'pasien_id'           => ['required', 'exists:patients,id'],
            'jenis_id'            => ['required', 'exists:lab_examinations,id'],
            'rekam_medis_id'      => ['nullable', 'exists:rekam_medis,id'],
            'petugas_id'          => ['nullable', 'exists:system_users,id'],
            'tanggal_pemeriksaan' => ['required', 'date'],
            'status'              => ['required', Rule::in(['menunggu', 'proses', 'selesai', 'batal'])],
            'catatan'             => ['nullable', 'string'],
            'harga'               => ['required', 'numeric', 'min:0'],

            // Hasil lab (opsional, bisa diisi setelah pemeriksaan)
            'hasil'                         => ['nullable', 'array'],
            'hasil.*.parameter'             => ['required_with:hasil', 'string', 'max:100'],
            'hasil.*.nilai'                 => ['required_with:hasil', 'string', 'max:50'],
            'hasil.*.satuan'                => ['nullable', 'string', 'max:30'],
            'hasil.*.nilai_normal'          => ['nullable', 'string', 'max:100'],
            'hasil.*.keterangan'            => ['nullable', Rule::in(['normal', 'rendah', 'tinggi', '-'])],
        ];
    }
}
