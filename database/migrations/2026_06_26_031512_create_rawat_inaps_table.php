<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rawat_inaps', function (Blueprint $table) {
            $table->id();
            $table->string('nomor_rawat_inap', 25)->unique()
                  ->comment('Format: RI-20260620-0001');

            $table->foreignId('pasien_id')->constrained('patients')->restrictOnDelete();
            $table->foreignId('kamar_id')->constrained('rooms')->restrictOnDelete();
            $table->foreignId('dokter_id')->constrained('users')->restrictOnDelete();

            // Koordinasi A1 — nullable karena rekam_medis bisa diisi setelah rawat inap
            $table->unsignedBigInteger('rekam_medis_id')->nullable()
                  ->comment('FK ke rekam_medis (koordinasi A1) — nullable');
            $table->foreign('rekam_medis_id')
                  ->references('id')
                  ->on('rekam_medis')
                  ->nullOnDelete();

            $table->date('tanggal_masuk');
            $table->date('tanggal_keluar')->nullable();
            $table->unsignedSmallInteger('lama_inap')->nullable()
                  ->comment('Dihitung otomatis dari tanggal_masuk & tanggal_keluar (hari)');

            $table->enum('status', [
                'aktif',
                'pindah_kamar',
                'pulang',
                'meninggal',
                'pulang_paksa',
            ])->default('aktif');

            $table->enum('jenis_pembayaran', ['umum', 'bpjs', 'asuransi'])->default('umum');
            $table->string('nomor_bpjs', 20)->nullable();

            $table->text('diagnosa_masuk')->nullable()
                  ->comment('Diagnosa saat pertama masuk');
            $table->text('catatan')->nullable();

            $table->decimal('total_biaya', 14, 2)->default(0);
            $table->enum('status_bayar', ['belum_bayar', 'lunas', 'cicilan'])->default('belum_bayar');

            $table->foreignId('created_by')->constrained('users')->restrictOnDelete();

            $table->timestamps();
            $table->softDeletes();

            $table->index('pasien_id');
            $table->index('kamar_id');
            $table->index('dokter_id');
            $table->index('status');
            $table->index('tanggal_masuk');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rawat_inaps');
    }
};