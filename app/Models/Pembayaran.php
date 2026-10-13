<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Pembayaran extends Model
{
    use HasFactory, SoftDeletes, LogsActivity;

    protected $table = 'pembayarans';

    protected $fillable = [
        'nomor_pembayaran', 'pasien_id', 'tarif_id',
        'jenis_layanan', 'payable_type', 'payable_id',
        'subtotal', 'diskon', 'pajak', 'total',
        'dibayar', 'kembalian', 'metode_bayar', 'status',
        'catatan', 'tanggal_bayar', 'kasir_id',
    ];

    protected $appends = ['status_label', 'total_formatted', 'metode_bayar_label', 'tanggal_bayar_formatted', 'jam_bayar'];

    protected function casts(): array
    {
        return [
            'subtotal'     => 'decimal:2',
            'diskon'       => 'decimal:2',
            'pajak'        => 'decimal:2',
            'total'        => 'decimal:2',
            'dibayar'      => 'decimal:2',
            'kembalian'    => 'decimal:2',
            'tanggal_bayar'=> 'datetime',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (Pembayaran $p) {
            if (empty($p->nomor_pembayaran)) {
                $p->nomor_pembayaran = self::generateNomor();
            }
        });
    }

    public static function generateNomor(): string
    {
        $tanggal = now()->format('Ymd');
        $prefix  = "PAY-{$tanggal}-";
        $latest  = self::withTrashed()
            ->where('nomor_pembayaran', 'like', "{$prefix}%")
            ->orderByDesc('id')->value('nomor_pembayaran');
        $next = $latest ? (int) substr($latest, -4) + 1 : 1;
        return $prefix . str_pad($next, 4, '0', STR_PAD_LEFT);
    }

    public function pasien(): BelongsTo
    {
        return $this->belongsTo(Patient::class, 'pasien_id');
    }

    public function tarif(): BelongsTo
    {
        return $this->belongsTo(ClinicRate::class, 'tarif_id');
    }

    public function kasir(): BelongsTo
    {
        return $this->belongsTo(User::class, 'kasir_id');
    }

    public function payable(): MorphTo
    {
        return $this->morphTo();
    }

    public function invoice(): HasOne
    {
        return $this->hasOne(Invoice::class, 'pembayaran_id');
    }

    public function scopeSearch(Builder $query, ?string $search): Builder
    {
        if (! $search) return $query;
        return $query->where(function (Builder $q) use ($search) {
            $q->where('nomor_pembayaran', 'like', "%{$search}%")
              ->orWhereHas('pasien', fn ($q) =>
                  $q->where('full_name', 'like', "%{$search}%")
              );
        });
    }

    public function scopeByStatus(Builder $query, ?string $status): Builder
    {
        if (! $status) return $query;
        return $query->where('status', $status);
    }

    public function getStatusLabelAttribute(): string
    {
        return match ($this->status) {
            'menunggu' => 'Menunggu',
            'lunas'    => 'Lunas',
            'gagal'    => 'Gagal',
            'refund'   => 'Refund',
            default    => $this->status,
        };
    }

    public function getTotalFormattedAttribute(): string
    {
        return 'Rp ' . number_format((float) $this->total, 0, ',', '.');
    }

    public function getMetodeBayarLabelAttribute(): string
    {
        return match ($this->metode_bayar) {
            'tunai'        => 'Tunai',
            'transfer'     => 'Transfer Bank',
            'bpjs'         => 'BPJS',
            'asuransi'     => 'Asuransi',
            'kartu_debit'  => 'Kartu Debit',
            'kartu_kredit' => 'Kartu Kredit',
            default        => $this->metode_bayar,
        };
    }

    // 🔧 FIX: convert ke Asia/Jakarta secara eksplisit sebelum diformat,
    // supaya benar walau untuk data lama yang tersimpan dalam UTC
    // (sebelum config timezone diubah).
    public function getTanggalBayarFormattedAttribute(): ?string
    {
        if (! $this->tanggal_bayar) {
            return null;
        }

        return $this->tanggal_bayar->setTimezone('Asia/Jakarta')->translatedFormat('d F Y');
    }

    public function getJamBayarAttribute(): ?string
    {
        if (! $this->tanggal_bayar) {
            return null;
        }

        return $this->tanggal_bayar->setTimezone('Asia/Jakarta')->format('H:i');
    }

    // ─── Activity Log ────────────────────────────────────────────────────

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly([
                'nomor_pembayaran',
                'total',
                'dibayar',
                'metode_bayar',
                'status',
            ])
            ->logOnlyDirty()
            ->useLogName('pembayaran');
    }
}