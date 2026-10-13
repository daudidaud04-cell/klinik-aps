<?php

namespace App\Http\Requests\SystemUser;

use Illuminate\Foundation\Http\FormRequest;

class StoreSystemUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasPermission('master-data.users.create') ?? false;
    }

    public function rules(): array
    {
        return [
            'name'            => ['required', 'string', 'max:100'],
            'email'           => ['required', 'email', 'unique:system_users,email'],
            'password'        => ['required', 'string', 'min:8', 'confirmed'],
            'role'            => ['required', 'in:super_admin,admin_kasir,dokter,apoteker,laboran'],
            'phone'           => ['nullable', 'string', 'max:20'],
            'gender'          => ['nullable', 'in:laki_laki,perempuan'],
            'address'         => ['nullable', 'string'],
            'specialization'  => ['nullable', 'string', 'max:100'],
            'employee_status' => ['required', 'in:aktif,cuti,nonaktif'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required'     => 'Nama wajib diisi.',
            'email.required'    => 'Email wajib diisi.',
            'email.unique'      => 'Email sudah terdaftar.',
            'password.min'      => 'Password minimal 8 karakter.',
            'password.confirmed'=> 'Konfirmasi password tidak cocok.',
            'role.required'     => 'Role wajib dipilih.',
        ];
    }
}
