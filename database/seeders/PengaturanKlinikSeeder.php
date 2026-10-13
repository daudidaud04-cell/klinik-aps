<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PengaturanKlinikSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('pengaturan_kliniks')->insertOrIgnore([
            'nama_klinik'      => 'Klinik APS',
            'tagline'          => 'Kesehatan Anda, Prioritas Kami',
            'alamat'           => 'Jl. Contoh No. 1',
            'kota'             => 'Bandung',
            'provinsi'         => 'Jawa Barat',
            'telepon'          => '022-0000000',
            'email'            => 'klinik@example.com',
            'jam_buka'         => '08:00',
            'jam_tutup'        => '17:00',
            'hari_operasional' => 'Senin - Sabtu',
            'footer_invoice'   => 'Terima kasih telah mempercayakan kesehatan Anda kepada kami.',
            'created_at'       => now(),
            'updated_at'       => now(),
        ]);
    }
}