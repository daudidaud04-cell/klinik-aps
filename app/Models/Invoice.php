<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Invoice extends Model
{
    use HasFactory;

    protected $table = 'invoices';

    protected $fillable = [
        'nomor_invoice', 'pembayaran_id', 'pasien_id',
        'items', 'subtotal', 'diskon', 'pajak', 'total',
        'status', 'tanggal_invoice', 'jatuh_tempo',
        'catatan', 'dibuat_oleh',
    ];

    protected $appends = ['status_label', 'total_formatted'];

    protected function casts(): array
    {
        return [
            'items'          => 'array',
            'subtotal'       => 'decimal:2',
            'diskon'         => 'decimal:2',
            'pajak'          => 'decimal:2',
            'total'          => 'decimal:2',
            'tanggal_invoice'=> 'datetime',
            'jatuh_tempo'    => 'datetime',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (Invoice $inv) {
            if (empty($inv->nomor_invoice)) {
                $inv->nomor_invoice = self::generateNomor();
            }
        });
    }

    public static function generateNomor(): string
    {
        $tanggal = now()->format('Ymd');
        $prefix  = "INV-{$tanggal}-";
        $latest  = self::where('nomor_invoice', 'like', "{$prefix}%")
            ->orderByDesc('id')->value('nomor_invoice');
        $next = $latest ? (int) substr($latest, -4) + 1 : 1;
        return $prefix . str_pad($next, 4, '0', STR_PAD_LEFT);
    }

    public function pembayaran(): BelongsTo
    {
        return $this->belongsTo(Pembayaran::class, 'pembayaran_id');
    }

    public function pasien(): BelongsTo
    {
        return $this->belongsTo(Patient::class, 'pasien_id');
    }

    public function dibuatOleh(): BelongsTo
    {
        return $this->belongsTo(User::class, 'dibuat_oleh');
    }

    public function getStatusLabelAttribute(): string
    {
        return match ($this->status) {
            'draft'   => 'Draft',
            'terbit'  => 'Terbit',
            'dibayar' => 'Dibayar',
            'batal'   => 'Batal',
            default   => $this->status,
        };
    }

    public function getTotalFormattedAttribute(): string
    {
        return 'Rp ' . number_format((float) $this->total, 0, ',', '.');
    }
}