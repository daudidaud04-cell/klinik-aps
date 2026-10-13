<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tindakan_medis', function (Blueprint $table) {
            $table->id();

            $table->foreignId('rekam_medis_id')
                  ->constrained('rekam_medis')
                  ->cascadeOnDelete();

            $table->foreignId('tarif_id')
                  ->nullable()
                  ->constrained('clinic_rates')
                  ->nullOnDelete();

            $table->string('nama_tindakan', 150);
            $table->text('keterangan')->nullable();
            $table->decimal('biaya', 12, 2)->default(0);
            $table->unsignedTinyInteger('jumlah')->default(1);

            $table->timestamps();

            $table->index('rekam_medis_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tindakan_medis');
    }
};