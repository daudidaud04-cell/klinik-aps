<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('kunjungan_rawat_jalans', function (Blueprint $table) {
            $table->id();
            $table->string('nomor_kunjungan', 20)->unique()
                  ->comment('Format: KRJ-20260619-0001');

            $table->foreignId('pasien_id')->constrained('patients')->restrictOnDelete();
            $table->foreignId('poli_id')->constrained('polis')->restrictOnDelete();
            $table->foreignId('dokter_id')->constrained('users')->restrictOnDelete();

            $table->date('tanggal_kunjungan');
            $table->time('jam_masuk')->nullable();
            $table->time('jam_keluar')->nullable();

            $table->enum('status', [
                'menunggu',
                'dalam_pemeriksaan',
                'selesai',
                'batal',
            ])->default('menunggu');

            $table->enum('jenis_pembayaran', [
                'umum',
                'bpjs',
                'asuransi',
            ])->default('umum');

            $table->string('nomor_bpjs', 20)->nullable();
            $table->text('keluhan_utama')->nullable();
            $table->text('catatan')->nullable();

            $table->foreignId('created_by')->constrained('users')->restrictOnDelete();

            $table->timestamps();
            $table->softDeletes();

            $table->index('tanggal_kunjungan');
            $table->index('status');
            $table->index('pasien_id');
            $table->index('dokter_id');
            $table->index('poli_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('kunjungan_rawat_jalans');
    }
};