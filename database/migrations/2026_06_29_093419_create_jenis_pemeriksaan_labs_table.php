<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('jenis_pemeriksaan_labs', function (Blueprint $table) {
            $table->id();
            $table->string('kode', 20)->unique();
            $table->string('nama', 150);
            $table->enum('kategori', [
                'Hematologi', 'Kimia Darah', 'Urinalisis',
                'Mikrobiologi', 'Serologi', 'Parasitologi', 'Lainnya',
            ]);
            $table->decimal('harga', 12, 2)->default(0);
            $table->string('satuan_hasil', 50)->nullable();
            $table->string('nilai_normal', 100)->nullable();
            $table->unsignedTinyInteger('estimasi_durasi_menit')->default(30);
            $table->enum('status', ['aktif', 'nonaktif'])->default('aktif');
            $table->timestamps();
            $table->softDeletes();

            $table->index('kategori');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('jenis_pemeriksaan_labs');
    }
};