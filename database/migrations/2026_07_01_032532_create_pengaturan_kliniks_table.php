<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pengaturan_kliniks', function (Blueprint $table) {
            $table->id();

            // Identitas
            $table->string('nama_klinik');
            $table->string('tagline')->nullable();
            $table->string('logo')->nullable();

            // Kontak & Lokasi
            $table->text('alamat')->nullable();
            $table->string('kota')->nullable();
            $table->string('provinsi')->nullable();
            $table->string('kode_pos', 10)->nullable();
            $table->string('telepon', 20)->nullable();
            $table->string('email')->nullable();
            $table->string('website')->nullable();

            // Legal
            $table->string('npwp', 30)->nullable();
            $table->string('no_izin_praktik')->nullable();
            $table->string('nama_pimpinan')->nullable();
            $table->string('no_str_pimpinan')->nullable();

            // Operasional
            $table->string('jam_buka', 10)->nullable();
            $table->string('jam_tutup', 10)->nullable();
            $table->string('hari_operasional')->nullable();

            // Invoice & Tampilan
            $table->text('footer_invoice')->nullable();
            $table->string('warna_tema', 7)->nullable()->default('#000000');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pengaturan_kliniks');
    }
};