<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PengaturanKlinik extends Model
{
    protected $table = 'pengaturan_kliniks';

    protected $fillable = [
        'nama_klinik',
        'tagline',
        'logo',
        'alamat',
        'kota',
        'provinsi',
        'kode_pos',
        'telepon',
        'email',
        'website',
        'npwp',
        'no_izin_praktik',
        'nama_pimpinan',
        'no_str_pimpinan',
        'jam_buka',
        'jam_tutup',
        'hari_operasional',
        'footer_invoice',
        'warna_tema',
    ];

    /**
     * Ambil pengaturan klinik (selalu hanya 1 record).
     */
    public static function getPengaturan(): self
    {
        return static::firstOrCreate(
            ['id' => 1],
            ['nama_klinik' => 'Klinik APS']
        );
    }

    public function getLogoUrlAttribute(): ?string
    {
        return $this->logo
            ? asset('storage/' . $this->logo)
            : null;
    }
}