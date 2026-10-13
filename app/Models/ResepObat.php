<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class ResepObat extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'resep_obats';

    protected $fillable = [
        'nomor_resep',
        'pasien_id',
        'rekam_medis_id',
        'dokter_id',
        'tanggal_resep',
        'status',
        'catatan',
        'total_harga',
        'created_by',
    ];

    protected $appends = [
        'status_label',
        'total_harga_formatted',
    ];

    protected function casts(): array
    {
        return [
            // 🔧 FIX: tambahkan format eksplisit "Y-m-d" supaya saat
            // di-serialize ke JSON (dikirim ke frontend via Inertia),
            // Carbon menghasilkan string tanggal murni "2026-07-11",
            // BUKAN datetime ISO UTC "2026-07-10T17:00:00.000000Z".
            // Tanpa format eksplisit, cast 'date' tetap memicu konversi
            // timezone saat toJSON(), menyebabkan tanggal mundur 1 hari
            // untuk timezone WIB (UTC+7).
            'tanggal_resep' => 'date:Y-m-d',
            'total_harga'   => 'decimal:2',
        ];
    }

    // ─── Boot ────────────────────────────────────────────────────────────────

    protected static function booted(): void
    {
        static::creating(function (ResepObat $resep) {
            if (empty($resep->nomor_resep)) {
                $resep->nomor_resep = self::generateNomor();
            }
        });
    }

    public static function generateNomor(): string
    {
        $tanggal = now()->format('Ymd');
        $prefix  = "RES-{$tanggal}-";

        $latest = self::withTrashed()
            ->where('nomor_resep', 'like', "{$prefix}%")
            ->orderByDesc('id')
            ->value('nomor_resep');

        $next = $latest ? (int) substr($latest, -4) + 1 : 1;

        return $prefix . str_pad($next, 4, '0', STR_PAD_LEFT);
    }

    // ─── Relationships ────────────────────────────────────────────────────────

    public function pasien(): BelongsTo
    {
        return $this->belongsTo(Patient::class, 'pasien_id');
    }

    public function rekamMedis(): BelongsTo
    {
        // Koordinasi A1 — read only, nullable
        return $this->belongsTo(RekamMedis::class, 'rekam_medis_id');
    }

    public function dokter(): BelongsTo
    {
        return $this->belongsTo(SystemUser::class, 'dokter_id');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(SystemUser::class, 'created_by');
    }

    public function details(): HasMany
    {
        return $this->hasMany(DetailResepObat::class, 'resep_id');
    }

    // ─── Scopes ──────────────────────────────────────────────────────────────

    public function scopeSearch(Builder $query, ?string $search): Builder
    {
        if (! $search) return $query;

        return $query->where(function (Builder $q) use ($search) {
            $q->where('nomor_resep', 'like', "%{$search}%")
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

    // ─── Accessors ───────────────────────────────────────────────────────────

    public function getStatusLabelAttribute(): string
    {
        return match ($this->status) {
            'menunggu'  => 'Menunggu',
            'diproses'  => 'Diproses',
            'selesai'   => 'Selesai',
            'batal'     => 'Batal',
            default     => $this->status,
        };
    }

    public function getTotalHargaFormattedAttribute(): string
    {
        return 'Rp ' . number_format((float) $this->total_harga, 0, ',', '.');
    }
}