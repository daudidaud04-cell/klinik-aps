<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pembayarans', function (Blueprint $table) {
            $table->id();
            $table->string('nomor_pembayaran', 25)->unique()
                  ->comment('Format: PAY-20260626-0001');

            $table->foreignId('pasien_id')->constrained('patients')->restrictOnDelete();

            $table->foreignId('tarif_id')
                  ->nullable()
                  ->constrained('clinic_rates')
                  ->nullOnDelete();

            $table->enum('jenis_layanan', [
                'rawat_jalan',
                'rawat_inap',
                'laboratorium',
                'resep',
                'tindakan',
                'lainnya',
            ]);

            // Polymorphic ke sumber pembayaran (opsional)
            $table->string('payable_type')->nullable();
            $table->unsignedBigInteger('payable_id')->nullable();

            $table->decimal('subtotal', 14, 2)->default(0);
            $table->decimal('diskon', 14, 2)->default(0);
            $table->decimal('pajak', 14, 2)->default(0);
            $table->decimal('total', 14, 2)->default(0);
            $table->decimal('dibayar', 14, 2)->default(0);
            $table->decimal('kembalian', 14, 2)->default(0);

            $table->enum('metode_bayar', [
                'tunai', 'transfer', 'bpjs', 'asuransi', 'kartu_debit', 'kartu_kredit',
            ])->default('tunai');

            $table->enum('status', ['menunggu', 'lunas', 'gagal', 'refund'])->default('menunggu');

            $table->text('catatan')->nullable();
            $table->timestamp('tanggal_bayar')->nullable();

            $table->foreignId('kasir_id')
                  ->nullable()
                  ->constrained('users')
                  ->nullOnDelete();

            $table->timestamps();
            $table->softDeletes();

            $table->index(['payable_type', 'payable_id']);
            $table->index('pasien_id');
            $table->index('status');
            $table->index('tanggal_bayar');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pembayarans');
    }
};