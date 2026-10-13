<?php

namespace App\Http\Requests\Medicine;

use Illuminate\Foundation\Http\FormRequest;

class UpdateMedicineRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasPermission('master-data.medicines.update') ?? false;
    }

    public function rules(): array
    {
        $medicineId = $this->route('medicine')?->id ?? $this->route('medicine');

        return [
            'kode_obat'    => ['required', 'string', 'max:20', 'unique:medicines,kode_obat,' . $medicineId],
            'nama_obat'    => ['required', 'string', 'max:150'],
            'kategori'     => ['required', 'in:Obat Keras,Obat Bebas,Obat Bebas Terbatas,Narkotika,Psikotropika,Suplemen,Alat Kesehatan'],
            'satuan'       => ['required', 'string', 'max:30'],
            'stok'         => ['required', 'integer', 'min:0'],
            'minimal_stok' => ['required', 'integer', 'min:0'],
            'harga_beli'   => ['required', 'numeric', 'min:0'],
            'harga_jual'   => ['required', 'numeric', 'min:0'],
            'expired_date' => ['nullable', 'date'],
            'manufacturer' => ['nullable', 'string', 'max:100'],
            'deskripsi'    => ['nullable', 'string'],
            'status'       => ['required', 'in:aktif,nonaktif'],
        ];
    }

    public function messages(): array
    {
        return [
            'kode_obat.required' => 'Kode obat wajib diisi.',
            'kode_obat.unique'   => 'Kode obat sudah digunakan.',
            'nama_obat.required' => 'Nama obat wajib diisi.',
            'kategori.required'  => 'Kategori wajib dipilih.',
            'satuan.required'    => 'Satuan wajib diisi.',
        ];
    }
}
