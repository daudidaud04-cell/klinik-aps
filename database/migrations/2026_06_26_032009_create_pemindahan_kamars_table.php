<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pemindahan_kamars', function (Blueprint $table) {
            $table->id();

            $table->foreignId('rawat_inap_id')
                  ->constrained('rawat_inaps')
                  ->cascadeOnDelete();

            $table->foreignId('kamar_asal_id')
                  ->constrained('rooms')
                  ->restrictOnDelete();

            $table->foreignId('kamar_tujuan_id')
                  ->constrained('rooms')
                  ->restrictOnDelete();

            $table->date('tanggal_pindah');
            $table->text('alasan')->nullable();

            $table->foreignId('disetujui_oleh')
                  ->nullable()
                  ->constrained('users')
                  ->nullOnDelete();

            $table->timestamps();

            $table->index('rawat_inap_id');
            $table->index('tanggal_pindah');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pemindahan_kamars');
    }
};