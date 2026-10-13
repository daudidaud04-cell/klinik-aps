<?php

namespace App\Http\Requests\Room;

use Illuminate\Foundation\Http\FormRequest;

class StoreRoomRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasPermission('master-data.rooms.create') ?? false;
    }

    public function rules(): array
    {
        return [
            'kode_kamar'   => ['required', 'string', 'max:10', 'unique:rooms,kode_kamar'],
            'nama_kamar'   => ['required', 'string', 'max:100'],
            'kelas'        => ['required', 'in:VIP,Kelas 1,Kelas 2,Kelas 3,Isolasi'],
            'kapasitas'    => ['required', 'integer', 'min:1'],
            'tarif_harian' => ['required', 'numeric', 'min:0'],
            'fasilitas'    => ['nullable', 'string'],
            'status'       => ['required', 'in:tersedia,penuh,maintenance'],
        ];
    }

    public function messages(): array
    {
        return [
            'kode_kamar.required' => 'Kode kamar wajib diisi.',
            'kode_kamar.unique'   => 'Kode kamar sudah digunakan.',
            'nama_kamar.required' => 'Nama kamar wajib diisi.',
            'kelas.required'      => 'Kelas wajib dipilih.',
            'kapasitas.min'       => 'Kapasitas minimal 1.',
            'tarif_harian.min'    => 'Tarif tidak boleh negatif.',
        ];
    }
}
