<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('detail_resep_obats', function (Blueprint $table) {
            $table->id();

            $table->foreignId('resep_id')
                  ->constrained('resep_obats')
                  ->cascadeOnDelete();

            // Koordinasi Ketua — pakai medicines (obats)
            $table->foreignId('obat_id')
                  ->constrained('medicines')
                  ->restrictOnDelete();

            $table->unsignedSmallInteger('jumlah');
            $table->string('aturan_pakai', 100)
                  ->comment('Contoh: 3x1 sesudah makan');
            $table->text('keterangan')->nullable();
            $table->decimal('harga_satuan', 12, 2)->default(0);
            $table->decimal('subtotal', 12, 2)->default(0);

            $table->timestamps();

            $table->index('resep_id');
            $table->index('obat_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('detail_resep_obats');
    }
};