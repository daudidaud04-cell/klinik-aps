<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pemeriksaan_labs', function (Blueprint $table) {
            $table->dropForeign(['jenis_id']);
            $table->foreign('jenis_id')
                ->references('id')->on('lab_examinations')
                ->onDelete('restrict');
        });
    }

    public function down(): void
    {
        Schema::table('pemeriksaan_labs', function (Blueprint $table) {
            $table->dropForeign(['jenis_id']);
            $table->foreign('jenis_id')
                ->references('id')->on('jenis_pemeriksaan_labs')
                ->onDelete('restrict');
        });
    }
};