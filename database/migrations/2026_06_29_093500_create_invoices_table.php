<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            $table->string('nomor_invoice', 25)->unique()
                  ->comment('Format: INV-20260626-0001');

            $table->foreignId('pembayaran_id')
                  ->constrained('pembayarans')
                  ->restrictOnDelete();

            $table->foreignId('pasien_id')->constrained('patients')->restrictOnDelete();

            $table->json('items')->comment('Snapshot detail item pembayaran saat invoice dibuat');

            $table->decimal('subtotal', 14, 2)->default(0);
            $table->decimal('diskon', 14, 2)->default(0);
            $table->decimal('pajak', 14, 2)->default(0);
            $table->decimal('total', 14, 2)->default(0);

            $table->enum('status', ['draft', 'terbit', 'dibayar', 'batal'])->default('draft');

            $table->timestamp('tanggal_invoice');
            $table->timestamp('jatuh_tempo')->nullable();

            $table->text('catatan')->nullable();

            $table->foreignId('dibuat_oleh')
                  ->nullable()
                  ->constrained('users')
                  ->nullOnDelete();

            $table->timestamps();

            $table->index('pembayaran_id');
            $table->index('pasien_id');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('invoices');
    }
};