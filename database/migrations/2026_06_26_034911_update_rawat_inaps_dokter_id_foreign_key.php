<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('rawat_inaps', function (Blueprint $table) {
            // Drop foreign key lama yang references users
            $table->dropForeign(['dokter_id']);

            // Tambah foreign key baru yang references system_users
            $table->foreign('dokter_id')
                  ->references('id')
                  ->on('system_users')
                  ->onDelete('restrict');
        });
    }

    public function down(): void
    {
        Schema::table('rawat_inaps', function (Blueprint $table) {
            $table->dropForeign(['dokter_id']);

            $table->foreign('dokter_id')
                  ->references('id')
                  ->on('users')
                  ->onDelete('restrict');
        });
    }
};