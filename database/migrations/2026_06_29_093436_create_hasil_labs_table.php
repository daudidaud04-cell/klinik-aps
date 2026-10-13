<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('hasil_labs', function (Blueprint $table) {
            $table->id();

            $table->foreignId('pemeriksaan_id')
                  ->constrained('pemeriksaan_labs')
                  ->cascadeOnDelete();

            $table->string('parameter', 100)->comment('Contoh: Hemoglobin, Leukosit');
            $table->string('nilai', 50);
            $table->string('satuan', 30)->nullable();
            $table->string('nilai_normal', 100)->nullable();
            $table->enum('keterangan', ['normal', 'rendah', 'tinggi', '-'])->default('-');
            $table->text('catatan')->nullable();

            $table->timestamps();

            $table->index('pemeriksaan_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('hasil_labs');
    }
};