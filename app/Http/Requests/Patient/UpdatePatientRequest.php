<?php

namespace App\Http\Requests\Patient;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePatientRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasPermission('patients.update') ?? false;
    }

    public function rules(): array
    {
        $patientId = $this->route('patient')?->id ?? $this->route('patient');

        return [
            'nik'                     => ['nullable', 'string', 'size:16', 'unique:patients,nik,' . $patientId],
            'full_name'               => ['required', 'string', 'max:100'],
            'gender'                  => ['required', 'in:laki_laki,perempuan'],
            'birth_place'             => ['required', 'string', 'max:50'],
            'birth_date'              => ['required', 'date', 'before:today'],
            'blood_type'              => ['nullable', 'in:A,B,AB,O'],
            'phone'                   => ['required', 'string', 'max:20'],
            'email'                   => ['nullable', 'email', 'max:100'],
            'address'                 => ['required', 'string'],
            'occupation'              => ['nullable', 'string', 'max:100'],
            'marital_status'          => ['nullable', 'in:belum_menikah,menikah,cerai_hidup,cerai_mati'],
            'religion'                => ['nullable', 'in:islam,kristen,katolik,hindu,buddha,konghucu,lainnya'],
            'insurance_type'          => ['nullable', 'in:BPJS,Umum,Asuransi'],
            'insurance_number'        => ['nullable', 'string', 'max:50'],
            'emergency_contact_name'  => ['nullable', 'string', 'max:100'],
            'emergency_contact_phone' => ['nullable', 'string', 'max:20'],
            'patient_status'          => ['required', 'in:aktif,nonaktif'],
        ];
    }

    public function messages(): array
    {
        return [
            'nik.size'           => 'NIK harus 16 digit.',
            'nik.unique'         => 'NIK sudah terdaftar.',
            'full_name.required' => 'Nama lengkap wajib diisi.',
            'gender.required'    => 'Jenis kelamin wajib dipilih.',
            'birth_date.before'  => 'Tanggal lahir tidak valid.',
            'phone.required'     => 'Nomor telepon wajib diisi.',
            'address.required'   => 'Alamat wajib diisi.',
        ];
    }
}
