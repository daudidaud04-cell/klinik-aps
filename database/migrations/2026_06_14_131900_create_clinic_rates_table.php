<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('clinic_rates', function (Blueprint $table) {
            $table->id();
            $table->string('kode_tarif', 20)->unique()->comment('Contoh: TRF-KONSUL, TRF-ADM');
            $table->string('nama_tarif', 150);
            $table->enum('kategori', [
                'Konsultasi', 'Administrasi', 'Rawat Inap',
                'Tindakan Medis', 'Tindakan Bedah Minor',
                'Laboratorium', 'Radiologi', 'Lainnya',
            ]);
            $table->decimal('harga', 12, 2)->default(0);
            $table->boolean('is_taxable')->default(false);
            $table->decimal('tax_percent', 5, 2)->default(0);
            $table->text('deskripsi')->nullable();
            $table->enum('status', ['aktif', 'nonaktif'])->default('aktif');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('clinic_rates');
    }
};