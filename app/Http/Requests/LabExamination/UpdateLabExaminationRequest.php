<?php

namespace App\Http\Requests\LabExamination;

use Illuminate\Foundation\Http\FormRequest;

class UpdateLabExaminationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasPermission('master-data.lab-examinations.update') ?? false;
    }

    public function rules(): array
    {
        $labId = $this->route('lab_examination')?->id ?? $this->route('lab_examination');

        return [
            'kode_pemeriksaan'      => ['required', 'string', 'max:20', 'unique:lab_examinations,kode_pemeriksaan,' . $labId],
            'nama_pemeriksaan'      => ['required', 'string', 'max:150'],
            'kategori'              => ['required', 'in:Hematologi,Kimia Darah,Urinalisis,Mikrobiologi,Serologi,Parasitologi,Lainnya'],
            'harga'                 => ['required', 'numeric', 'min:0'],
            'satuan_hasil'          => ['nullable', 'string', 'max:50'],
            'nilai_normal_min'      => ['nullable', 'string'],
            'nilai_normal_max'      => ['nullable', 'string'],
            'deskripsi'             => ['nullable', 'string'],
            'estimasi_durasi_menit' => ['required', 'integer', 'min:1'],
            'status'                => ['required', 'in:aktif,nonaktif'],
        ];
    }

    public function messages(): array
    {
        return [
            'kode_pemeriksaan.required' => 'Kode pemeriksaan wajib diisi.',
            'kode_pemeriksaan.unique'   => 'Kode pemeriksaan sudah digunakan.',
            'nama_pemeriksaan.required' => 'Nama pemeriksaan wajib diisi.',
            'kategori.required'         => 'Kategori wajib dipilih.',
            'harga.required'            => 'Harga wajib diisi.',
        ];
    }
}
