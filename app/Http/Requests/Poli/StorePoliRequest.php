<?php

namespace App\Http\Requests\Poli;

use Illuminate\Foundation\Http\FormRequest;

class StorePoliRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasPermission('master-data.polis.create') ?? false;
    }

    public function rules(): array
    {
        return [
            'kode_poli' => ['required', 'string', 'max:10', 'unique:polis,kode_poli'],
            'nama_poli' => ['required', 'string', 'max:100'],
            'deskripsi' => ['nullable', 'string'],

            // 🔧 FIX: doctor_id (single) diganti jadi doctor_ids (array)
            // supaya satu poli bisa diisi banyak dokter sekaligus.
            'doctor_ids'   => ['nullable', 'array'],
            'doctor_ids.*' => ['integer', 'exists:system_users,id'],

            'jadwal'    => ['nullable', 'string'],
            'status'    => ['required', 'in:aktif,nonaktif'],
        ];
    }

    public function messages(): array
    {
        return [
            'kode_poli.required'   => 'Kode poli wajib diisi.',
            'kode_poli.unique'     => 'Kode poli sudah digunakan.',
            'nama_poli.required'   => 'Nama poli wajib diisi.',
            'doctor_ids.*.exists'  => 'Salah satu dokter yang dipilih tidak ditemukan.',
        ];
    }
}