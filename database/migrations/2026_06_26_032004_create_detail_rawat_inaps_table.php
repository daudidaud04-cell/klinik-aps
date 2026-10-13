<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('detail_rawat_inaps', function (Blueprint $table) {
            $table->id();

            $table->foreignId('rawat_inap_id')
                  ->constrained('rawat_inaps')
                  ->cascadeOnDelete();

            $table->date('tanggal');
            $table->string('tekanan_darah', 20)->nullable();
            $table->decimal('suhu_tubuh', 4, 1)->nullable();
            $table->unsignedSmallInteger('nadi')->nullable();
            $table->unsignedSmallInteger('pernapasan')->nullable();

            $table->text('perkembangan')->nullable()
                  ->comment('Catatan perkembangan kondisi pasien harian');
            $table->text('tindakan_harian')->nullable();
            $table->text('instruksi_dokter')->nullable();

            $table->decimal('biaya_harian', 12, 2)->default(0)
                  ->comment('Tarif kamar + tindakan hari ini');

            $table->foreignId('dicatat_oleh')
                  ->nullable()
                  ->constrained('users')
                  ->nullOnDelete();

            $table->timestamps();

            $table->index('rawat_inap_id');
            $table->index('tanggal');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('detail_rawat_inaps');
    }
};