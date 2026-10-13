<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pemeriksaan_labs', function (Blueprint $table) {
            $table->id();
            $table->string('nomor_pemeriksaan', 25)->unique()
                  ->comment('Format: LAB-20260626-0001');

            $table->foreignId('pasien_id')->constrained('patients')->restrictOnDelete();
            $table->foreignId('jenis_id')->constrained('jenis_pemeriksaan_labs')->restrictOnDelete();

            // Koordinasi A1 — nullable
            $table->unsignedBigInteger('rekam_medis_id')->nullable();
            $table->foreign('rekam_medis_id')->references('id')->on('rekam_medis')->nullOnDelete();

            $table->foreignId('petugas_id')->nullable()->constrained('users')->nullOnDelete()
                  ->comment('Laboran yang melakukan pemeriksaan');

            $table->date('tanggal_pemeriksaan');
            $table->enum('status', ['menunggu', 'proses', 'selesai', 'batal'])->default('menunggu');
            $table->text('catatan')->nullable();
            $table->decimal('harga', 12, 2)->default(0);

            $table->foreignId('created_by')->constrained('users')->restrictOnDelete();

            $table->timestamps();
            $table->softDeletes();

            $table->index('pasien_id');
            $table->index('jenis_id');
            $table->index('status');
            $table->index('tanggal_pemeriksaan');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pemeriksaan_labs');
    }
};