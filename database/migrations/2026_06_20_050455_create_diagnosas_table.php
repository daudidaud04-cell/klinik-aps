<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('diagnosas', function (Blueprint $table) {
            $table->id();

            $table->foreignId('rekam_medis_id')
                  ->constrained('rekam_medis')
                  ->cascadeOnDelete();

            $table->string('kode_icd', 10)->nullable()->comment('Kode ICD-10');
            $table->string('nama_diagnosa', 255);
            $table->enum('jenis', ['utama', 'sekunder'])->default('utama');
            $table->text('keterangan')->nullable();

            $table->timestamps();

            $table->index('rekam_medis_id');
            $table->index('kode_icd');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('diagnosas');
    }
};