<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rekam_medis', function (Blueprint $table) {
            $table->id();
            $table->string('nomor_rekam_medis', 20)->unique()
                  ->comment('Format: RM-20260619-0001');

            $table->foreignId('kunjungan_id')
                  ->constrained('kunjungan_rawat_jalans')
                  ->restrictOnDelete();

            $table->foreignId('tarif_id')
                  ->nullable()
                  ->constrained('clinic_rates')
                  ->nullOnDelete();

            // Pemeriksaan fisik
            $table->string('tekanan_darah', 20)->nullable();
            $table->decimal('suhu_tubuh', 4, 1)->nullable();
            $table->unsignedSmallInteger('nadi')->nullable()->comment('per menit');
            $table->unsignedSmallInteger('pernapasan')->nullable()->comment('per menit');
            $table->decimal('berat_badan', 5, 2)->nullable()->comment('kg');
            $table->decimal('tinggi_badan', 5, 2)->nullable()->comment('cm');

            $table->text('anamnesis')->nullable()->comment('Riwayat penyakit');
            $table->text('pemeriksaan_fisik')->nullable();
            $table->text('rencana_terapi')->nullable();
            $table->text('catatan_dokter')->nullable();

            $table->decimal('total_biaya', 14, 2)->default(0);
            $table->enum('status_bayar', ['belum_bayar', 'lunas', 'cicilan'])->default('belum_bayar');

            $table->timestamps();

            $table->index('kunjungan_id');
            $table->index('status_bayar');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rekam_medis');
    }
};