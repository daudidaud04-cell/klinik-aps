<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('patients', function (Blueprint $table) {
            $table->id();
            $table->string('medical_record_number', 20)->unique();
            $table->string('nik', 16)->nullable()->unique();
            $table->string('full_name', 100);
            $table->enum('gender', ['laki_laki', 'perempuan']);
            $table->string('birth_place', 50);
            $table->date('birth_date');
            $table->tinyInteger('age')->nullable();
            $table->enum('blood_type', ['A', 'B', 'AB', 'O'])->nullable();
            $table->string('phone', 20);
            $table->string('email', 100)->nullable();
            $table->text('address');
            $table->string('occupation', 100)->nullable();
            $table->enum('marital_status', [
                'belum_menikah', 'menikah', 'cerai_hidup', 'cerai_mati',
            ])->nullable();
            $table->enum('religion', [
                'islam', 'kristen', 'katolik', 'hindu', 'buddha', 'konghucu', 'lainnya',
            ])->nullable();
            $table->enum('insurance_type', ['BPJS', 'Umum', 'Asuransi'])->nullable();
            $table->string('insurance_number', 50)->nullable();
            $table->string('emergency_contact_name', 100)->nullable();
            $table->string('emergency_contact_phone', 20)->nullable();
            $table->enum('patient_status', ['aktif', 'nonaktif'])->default('aktif');
            $table->foreignId('created_by')->constrained('system_users');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('patients');
    }
};