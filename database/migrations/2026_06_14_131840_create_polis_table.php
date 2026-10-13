<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('polis', function (Blueprint $table) {
            $table->id();
            $table->string('kode_poli', 10)->unique();
            $table->string('nama_poli', 100);
            $table->text('deskripsi')->nullable();
            $table->foreignId('doctor_id')->nullable()->constrained('system_users')->nullOnDelete();
            $table->string('jadwal')->nullable();
            $table->enum('status', ['aktif', 'nonaktif'])->default('aktif');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('polis');
    }
};