<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('resep_obats', function (Blueprint $table) {
            $table->id();
            $table->string('nomor_resep', 25)->unique()
                  ->comment('Format: RES-20260626-0001');

            $table->foreignId('pasien_id')->constrained('patients')->restrictOnDelete();

            // Koordinasi A1 — nullable
            $table->unsignedBigInteger('rekam_medis_id')->nullable();
            $table->foreign('rekam_medis_id')->references('id')->on('rekam_medis')->nullOnDelete();

            $table->foreignId('dokter_id')->constrained('users')->restrictOnDelete();

            $table->date('tanggal_resep');
            $table->enum('status', ['menunggu', 'diproses', 'selesai', 'batal'])->default('menunggu');
            $table->text('catatan')->nullable();
            $table->decimal('total_harga', 14, 2)->default(0);

            $table->foreignId('created_by')->constrained('users')->restrictOnDelete();

            $table->timestamps();
            $table->softDeletes();

            $table->index('pasien_id');
            $table->index('status');
            $table->index('tanggal_resep');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('resep_obats');
    }
};