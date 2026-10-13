<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('poli_dokter', function (Blueprint $table) {
            $table->id();
            $table->foreignId('poli_id')->constrained('polis')->cascadeOnDelete();
            $table->foreignId('doctor_id')->constrained('system_users')->cascadeOnDelete();
            $table->timestamps();

            // Cegah kombinasi poli+dokter yang sama tercatat dobel
            $table->unique(['poli_id', 'doctor_id']);
        });

        // 🔧 Migrasi data lama: setiap poli yang sudah punya doctor_id
        // (relasi lama, satu dokter) dipindahkan jadi satu baris pivot,
        // supaya data yang sudah ada tidak hilang.
        DB::table('polis')
            ->whereNotNull('doctor_id')
            ->select('id', 'doctor_id')
            ->orderBy('id')
            ->chunk(100, function ($polis) {
                foreach ($polis as $poli) {
                    DB::table('poli_dokter')->insertOrIgnore([
                        'poli_id'    => $poli->id,
                        'doctor_id'  => $poli->doctor_id,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            });

        // Catatan: kolom `doctor_id` di tabel `polis` SENGAJA belum dihapus
        // di migration ini, supaya perubahan aman & bisa di-rollback dengan
        // mudah kalau ada masalah. Setelah fitur multi-dokter ini terbukti
        // jalan lancar, kolom itu bisa dihapus lewat migration terpisah.
    }

    public function down(): void
    {
        Schema::dropIfExists('poli_dokter');
    }
};