<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('resep_obats', function (Blueprint $table) {
            $table->dropForeign(['dokter_id']);
            $table->dropForeign(['created_by']);

            $table->foreign('dokter_id')
                ->references('id')->on('system_users')
                ->onDelete('restrict');

            $table->foreign('created_by')
                ->references('id')->on('system_users')
                ->onDelete('restrict');
        });
    }

    public function down(): void
    {
        Schema::table('resep_obats', function (Blueprint $table) {
            $table->dropForeign(['dokter_id']);
            $table->dropForeign(['created_by']);

            $table->foreign('dokter_id')
                ->references('id')->on('users')
                ->onDelete('restrict');

            $table->foreign('created_by')
                ->references('id')->on('users')
                ->onDelete('restrict');
        });
    }
};