<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('patient_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained('patients')->cascadeOnDelete();
            $table->enum('type', [
                'rawat_jalan', 'rawat_inap', 'laboratorium', 'resep', 'tindakan',
            ]);
            $table->nullableMorphs('referenceable');
            $table->foreignId('doctor_id')->nullable()->constrained('system_users')->nullOnDelete();
            $table->foreignId('poli_id')->nullable()->constrained('polis')->nullOnDelete();
            $table->date('visit_date');
            $table->text('chief_complaint')->nullable();
            $table->string('diagnosis_summary')->nullable();
            $table->decimal('total_biaya', 14, 2)->default(0);
            $table->enum('status_bayar', ['lunas', 'belum_bayar', 'cicilan'])->default('belum_bayar');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('patient_histories');
    }
};