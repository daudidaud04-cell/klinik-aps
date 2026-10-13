<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rooms', function (Blueprint $table) {
            $table->id();
            $table->string('kode_kamar', 10)->unique()->comment('Contoh: VIP-01, KLS1-01');
            $table->string('nama_kamar', 100);
            $table->enum('kelas', ['VIP', 'Kelas 1', 'Kelas 2', 'Kelas 3', 'Isolasi']);
            $table->unsignedTinyInteger('kapasitas')->default(1);
            $table->unsignedTinyInteger('terisi')->default(0);
            $table->decimal('tarif_harian', 12, 2)->default(0);
            $table->text('fasilitas')->nullable();
            $table->enum('status', ['tersedia', 'penuh', 'maintenance'])->default('tersedia');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rooms');
    }
};