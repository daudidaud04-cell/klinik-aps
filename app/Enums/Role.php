<?php

namespace App\Enums;

enum Role: string
{
    case SuperAdmin = 'super_admin';
    case AdminKasir = 'admin_kasir';
    case Dokter = 'dokter';
    case Apoteker = 'apoteker';
    case Laboran = 'laboran';

    public function label(): string
    {
        return match ($this) {
            self::SuperAdmin => 'Super Admin',
            self::AdminKasir => 'Admin / Kasir',
            self::Dokter => 'Dokter',
            self::Apoteker => 'Apoteker',
            self::Laboran => 'Laboran',
        };
    }
}