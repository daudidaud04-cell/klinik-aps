<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('system_users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->string('role')->default('admin_kasir')->comment('super_admin, admin_kasir, dokter, apoteker, laboran');
            $table->string('phone', 20)->nullable();
            $table->enum('gender', ['laki_laki', 'perempuan'])->nullable();
            $table->text('address')->nullable();
            $table->string('photo')->nullable();
            $table->string('specialization', 100)->nullable();
            $table->enum('employee_status', ['aktif', 'cuti', 'nonaktif'])->default('aktif');
            $table->timestamp('last_login_at')->nullable();
            $table->rememberToken();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('system_users');
    }
};