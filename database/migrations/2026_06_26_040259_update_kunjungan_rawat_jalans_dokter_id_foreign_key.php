<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('kunjungan_rawat_jalans', function (Blueprint $table) {
            $table->dropForeign(['dokter_id']);

            $table->foreign('dokter_id')
                  ->references('id')
                  ->on('system_users')
                  ->onDelete('restrict');
        });
    }

    public function down(): void
    {
        Schema::table('kunjungan_rawat_jalans', function (Blueprint $table) {
            $table->dropForeign(['dokter_id']);

            $table->foreign('dokter_id')
                  ->references('id')
                  ->on('users')
                  ->onDelete('restrict');
        });
    }
};