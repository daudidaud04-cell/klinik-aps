<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class PemeriksaanLab extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'pemeriksaan_labs';

    protected $fillable = [
        'nomor_pemeriksaan', 'pasien_id', 'jenis_id', 'rekam_medis_id',
        'petugas_id', 'tanggal_pemeriksaan', 'status', 'catatan',
        'harga', 'created_by',
    ];

    protected $appends = ['status_label', 'harga_formatted'];

    protected function casts(): array
    {
        return [
            'tanggal_pemeriksaan' => 'date',
            'harga' => 'decimal:2',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (PemeriksaanLab $lab) {
            if (empty($lab->nomor_pemeriksaan)) {
                $lab->nomor_pemeriksaan = self::generateNomor();
            }
        });
    }

    public static function generateNomor(): string
    {
        $tanggal = now()->format('Ymd');
        $prefix  = "LAB-{$tanggal}-";
        $latest  = self::withTrashed()
            ->where('nomor_pemeriksaan', 'like', "{$prefix}%")
            ->orderByDesc('id')->value('nomor_pemeriksaan');
        $next = $latest ? (int) substr($latest, -4) + 1 : 1;
        return $prefix . str_pad($next, 4, '0', STR_PAD_LEFT);
    }

    public function pasien(): BelongsTo
    {
        return $this->belongsTo(Patient::class, 'pasien_id');
    }

    public function jenis(): BelongsTo
    {
        return $this->belongsTo(LabExamination::class, 'jenis_id');
    }

    public function rekamMedis(): BelongsTo
    {
        return $this->belongsTo(RekamMedis::class, 'rekam_medis_id');
    }

    public function petugas(): BelongsTo
    {
        return $this->belongsTo(SystemUser::class, 'petugas_id');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(SystemUser::class, 'created_by');
    }

    public function hasilLabs(): HasMany
    {
        return $this->hasMany(HasilLab::class, 'pemeriksaan_id');
    }

    public function scopeSearch(Builder $query, ?string $search): Builder
    {
        if (! $search) return $query;
        return $query->where(function (Builder $q) use ($search) {
            $q->where('nomor_pemeriksaan', 'like', "%{$search}%")
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

    public function getStatusLabelAttribute(): string
    {
        return match ($this->status) {
            'menunggu' => 'Menunggu',
            'proses'   => 'Diproses',
            'selesai'  => 'Selesai',
            'batal'    => 'Batal',
            default    => $this->status,
        };
    }

    public function getHargaFormattedAttribute(): string
    {
        return 'Rp ' . number_format((float) $this->harga, 0, ',', '.');
    }
}