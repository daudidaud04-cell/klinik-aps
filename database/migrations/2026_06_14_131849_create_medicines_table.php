<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('medicines', function (Blueprint $table) {
            $table->id();
            $table->string('kode_obat', 20)->unique();
            $table->string('nama_obat', 150);
            $table->enum('kategori', [
                'Obat Keras', 'Obat Bebas', 'Obat Bebas Terbatas',
                'Narkotika', 'Psikotropika', 'Suplemen', 'Alat Kesehatan',
            ]);
            $table->string('satuan', 30)->comment('Contoh: Tablet, Kapsul, Botol');
            $table->unsignedInteger('stok')->default(0);
            $table->unsignedInteger('minimal_stok')->default(10);
            $table->decimal('harga_beli', 12, 2)->default(0);
            $table->decimal('harga_jual', 12, 2)->default(0);
            $table->date('expired_date')->nullable();
            $table->string('manufacturer', 100)->nullable();
            $table->text('deskripsi')->nullable();
            $table->enum('status', ['aktif', 'nonaktif'])->default('aktif');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('medicines');
    }
};