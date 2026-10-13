<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lab_examinations', function (Blueprint $table) {
            $table->id();
            $table->string('kode_pemeriksaan', 20)->unique()->comment('Contoh: LAB-DL, LAB-GD');
            $table->string('nama_pemeriksaan', 150);
            $table->enum('kategori', [
                'Hematologi', 'Kimia Darah', 'Urinalisis',
                'Mikrobiologi', 'Serologi', 'Parasitologi', 'Lainnya',
            ]);
            $table->decimal('harga', 12, 2)->default(0);
            $table->string('satuan_hasil', 50)->nullable()->comment('Contoh: mg/dL, g/dL');
            $table->string('nilai_normal_min')->nullable();
            $table->string('nilai_normal_max')->nullable();
            $table->text('deskripsi')->nullable();
            $table->unsignedTinyInteger('estimasi_durasi_menit')->default(30);
            $table->enum('status', ['aktif', 'nonaktif'])->default('aktif');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lab_examinations');
    }
};