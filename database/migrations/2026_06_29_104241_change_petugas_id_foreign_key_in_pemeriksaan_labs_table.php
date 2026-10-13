<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pemeriksaan_labs', function (Blueprint $table) {
            $table->dropForeign(['petugas_id']);
            $table->foreign('petugas_id')
                ->references('id')->on('system_users')
                ->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('pemeriksaan_labs', function (Blueprint $table) {
            $table->dropForeign(['petugas_id']);
            $table->foreign('petugas_id')
                ->references('id')->on('users')
                ->onDelete('set null');
        });
    }
};