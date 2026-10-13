<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class KunjunganRawatJalan extends Model
{
    use HasFactory, SoftDeletes, LogsActivity;

    protected $table = 'kunjungan_rawat_jalans';

    protected $fillable = [
        'nomor_kunjungan',
        'pasien_id',
        'poli_id',
        'dokter_id',
        'tanggal_kunjungan',
        'jam_masuk',
        'jam_keluar',
        'status',
        'jenis_pembayaran',
        'nomor_bpjs',
        'keluhan_utama',
        'catatan',
        'created_by',
    ];

    protected $appends = [
        'status_label',
        'jenis_pembayaran_label',
    ];

    protected function casts(): array
    {
        return [
            'tanggal_kunjungan' => 'date',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (KunjunganRawatJalan $kunjungan) {
            if (empty($kunjungan->nomor_kunjungan)) {
                $kunjungan->nomor_kunjungan = self::generateNomor();
            }
        });
    }

    public static function generateNomor(): string
    {
        $tanggal = now()->format('Ymd');
        $prefix  = "KRJ-{$tanggal}-";

        $latest = self::withTrashed()
            ->where('nomor_kunjungan', 'like', "{$prefix}%")
            ->orderByDesc('id')
            ->value('nomor_kunjungan');

        $next = $latest ? (int) substr($latest, -4) + 1 : 1;

        return $prefix . str_pad($next, 4, '0', STR_PAD_LEFT);
    }

    // ─── Relationships ────────────────────────────────────────────────────

    public function pasien(): BelongsTo
    {
        return $this->belongsTo(Patient::class, 'pasien_id');
    }

    public function poli(): BelongsTo
    {
        return $this->belongsTo(Poli::class, 'poli_id');
    }

    public function dokter(): BelongsTo
    {
        return $this->belongsTo(SystemUser::class, 'dokter_id');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(SystemUser::class, 'created_by');
    }

    public function rekamMedis(): HasOne
    {
        return $this->hasOne(RekamMedis::class, 'kunjungan_id');
    }

    // ─── Scopes ──────────────────────────────────────────────────────────

    public function scopeSearch(Builder $query, ?string $search): Builder
    {
        if (! $search) return $query;

        return $query->where(function (Builder $q) use ($search) {
            $q->where('nomor_kunjungan', 'like', "%{$search}%")
              ->orWhereHas('pasien', fn ($q) =>
                  $q->where('full_name', 'like', "%{$search}%")
                    ->orWhere('medical_record_number', 'like', "%{$search}%")
              );
        });
    }

    public function scopeByStatus(Builder $query, ?string $status): Builder
    {
        if (! $status) return $query;
        return $query->where('status', $status);
    }

    public function scopeByTanggal(Builder $query, ?string $tanggal): Builder
    {
        if (! $tanggal) return $query;
        return $query->whereDate('tanggal_kunjungan', $tanggal);
    }

    // ─── Accessors ───────────────────────────────────────────────────────

    public function getStatusLabelAttribute(): string
    {
        return match ($this->status) {
            'menunggu'          => 'Menunggu',
            'dalam_pemeriksaan' => 'Dalam Pemeriksaan',
            'selesai'           => 'Selesai',
            'batal'             => 'Batal',
            default             => $this->status ?? '-',
        };
    }

    public function getJenisPembayaranLabelAttribute(): string
    {
        return match ($this->jenis_pembayaran) {
            'umum'      => 'Umum',
            'bpjs'      => 'BPJS',
            'asuransi'  => 'Asuransi',
            default     => $this->jenis_pembayaran ?? '-',
        };
    }

    // ─── Activity Log ────────────────────────────────────────────────────

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly([
                'nomor_kunjungan',
                'status',
                'jenis_pembayaran',
                'keluhan_utama',
            ])
            ->logOnlyDirty()
            ->useLogName('kunjungan_rawat_jalan');
    }
}