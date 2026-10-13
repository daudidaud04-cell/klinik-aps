<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class RawatInap extends Model
{
    use HasFactory, SoftDeletes, LogsActivity;

    protected $table = 'rawat_inaps';

    /** Status yang berarti pasien sudah keluar (tidak lagi menempati kamar) */
    protected const DISCHARGE_STATUSES = ['pulang', 'meninggal', 'pulang_paksa'];

    protected $fillable = [
        'nomor_rawat_inap',
        'pasien_id',
        'kamar_id',
        'dokter_id',
        'rekam_medis_id',
        'tanggal_masuk',
        'tanggal_keluar',
        'lama_inap',
        'status',
        'jenis_pembayaran',
        'nomor_bpjs',
        'diagnosa_masuk',
        'catatan',
        'total_biaya',
        'status_bayar',
        'created_by',
    ];

    protected $appends = [
        'status_label',
        'jenis_pembayaran_label',
        'status_bayar_label',
        'total_biaya_formatted',
    ];

    protected function casts(): array
    {
        return [
            'tanggal_masuk'  => 'date',
            'tanggal_keluar' => 'date',
            'total_biaya'    => 'decimal:2',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (RawatInap $ri) {
            if (empty($ri->nomor_rawat_inap)) {
                $ri->nomor_rawat_inap = self::generateNomor();
            }
        });

        static::updating(function (RawatInap $ri) {
            if ($ri->isDirty('tanggal_keluar') && $ri->tanggal_keluar) {
                $ri->lama_inap = max(1, $ri->tanggal_masuk->diffInDays($ri->tanggal_keluar));
            }

            // Saat status berubah jadi status "keluar" (pulang/meninggal/pulang paksa)
            $justDischarged = $ri->isDirty('status')
                && in_array($ri->status, self::DISCHARGE_STATUSES)
                && ! in_array($ri->getOriginal('status'), self::DISCHARGE_STATUSES);

            if ($justDischarged) {
                $lamaInap    = $ri->lama_inap ?: 1;
                $tarifHarian = (float) ($ri->kamar?->tarif_harian ?? 0);
                $ri->total_biaya = $lamaInap * $tarifHarian;
            }
        });

        static::created(function (RawatInap $ri) {
            $ri->syncKamarStatus(increment: true);
        });

        static::updated(function (RawatInap $ri) {
            if (! $ri->wasChanged('status')) return;

            $before = $ri->getOriginal('status');
            $after  = $ri->status;

            $wasOccupying = ! in_array($before, self::DISCHARGE_STATUSES);
            $isOccupying  = ! in_array($after, self::DISCHARGE_STATUSES);

            if ($wasOccupying && ! $isOccupying) {
                // Pasien baru saja keluar → kosongkan kamar & buat tagihan
                $ri->syncKamarStatus(increment: false);
                $ri->generateTagihan();
            }
        });

        static::deleted(function (RawatInap $ri) {
            // Kalau dihapus saat masih aktif (belum resmi keluar), kembalikan kamar
            if (! in_array($ri->status, self::DISCHARGE_STATUSES)) {
                $ri->syncKamarStatus(increment: false);
            }
        });
    }

    public static function generateNomor(): string
    {
        $tanggal = now()->format('Ymd');
        $prefix  = "RI-{$tanggal}-";

        $latest = self::withTrashed()
            ->where('nomor_rawat_inap', 'like', "{$prefix}%")
            ->orderByDesc('id')
            ->value('nomor_rawat_inap');

        $next = $latest ? (int) substr($latest, -4) + 1 : 1;

        return $prefix . str_pad($next, 4, '0', STR_PAD_LEFT);
    }

    /** Sinkronkan angka terisi & status kamar (tersedia/penuh) */
    protected function syncKamarStatus(bool $increment): void
    {
        $kamar = Room::find($this->kamar_id);
        if (! $kamar) return;

        $increment ? $kamar->increment('terisi') : $kamar->decrement('terisi');
        $kamar->refresh();

        if ($kamar->status !== 'maintenance') {
            $kamar->status = $kamar->terisi >= $kamar->kapasitas ? 'penuh' : 'tersedia';
            $kamar->save();
        }
    }

    /** Auto-generate Pembayaran & PatientHistory saat pasien resmi keluar */
    protected function generateTagihan(): void
    {
        if ($this->pembayaran) return; // cegah duplikat kalau update status dipanggil 2x

        Pembayaran::create([
            'pasien_id'     => $this->pasien_id,
            'jenis_layanan' => 'rawat_inap',
            'payable_type'  => self::class,
            'payable_id'    => $this->id,
            'subtotal'      => $this->total_biaya,
            'diskon'        => 0,
            'pajak'         => 0,
            'total'         => $this->total_biaya,
            'dibayar'       => 0,
            'kembalian'     => 0,
            'status'        => 'menunggu',
        ]);

        PatientHistory::create([
            'patient_id'         => $this->pasien_id,
            'type'               => 'rawat_inap',
            'referenceable_type' => self::class,
            'referenceable_id'   => $this->id,
            'doctor_id'          => $this->dokter_id,
            'poli_id'            => null,
            'visit_date'         => $this->tanggal_masuk,
            'chief_complaint'    => $this->diagnosa_masuk,
            'diagnosis_summary'  => $this->diagnosa_masuk,
            'total_biaya'        => $this->total_biaya,
            'status_bayar'       => 'belum_bayar',
        ]);
    }

    // ─── Relationships ────────────────────────────────────────────────────

    public function pasien(): BelongsTo
    {
        return $this->belongsTo(Patient::class, 'pasien_id');
    }

    public function kamar(): BelongsTo
    {
        return $this->belongsTo(Room::class, 'kamar_id');
    }

    public function dokter(): BelongsTo
    {
        return $this->belongsTo(SystemUser::class, 'dokter_id');
    }

    public function rekamMedis(): BelongsTo
    {
        return $this->belongsTo(RekamMedis::class, 'rekam_medis_id');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(SystemUser::class, 'created_by');
    }

    public function details(): HasMany
    {
        return $this->hasMany(DetailRawatInap::class, 'rawat_inap_id');
    }

    public function pemindahanKamars(): HasMany
    {
        return $this->hasMany(PemindahanKamar::class, 'rawat_inap_id');
    }

    public function pembayaran(): MorphOne
    {
        return $this->morphOne(Pembayaran::class, 'payable');
    }

    // ─── Scopes ──────────────────────────────────────────────────────────

    public function scopeSearch(Builder $query, ?string $search): Builder
    {
        if (! $search) return $query;

        return $query->where(function (Builder $q) use ($search) {
            $q->where('nomor_rawat_inap', 'like', "%{$search}%")
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

    public function scopeAktif(Builder $query): Builder
    {
        return $query->where('status', 'aktif');
    }

    // ─── Accessors ───────────────────────────────────────────────────────

    public function getStatusLabelAttribute(): string
    {
        return match ($this->status) {
            'aktif'        => 'Aktif',
            'pindah_kamar' => 'Pindah Kamar',
            'pulang'       => 'Pulang',
            'meninggal'    => 'Meninggal',
            'pulang_paksa' => 'Pulang Paksa',
            default        => $this->status,
        };
    }

    public function getJenisPembayaranLabelAttribute(): string
    {
        return match ($this->jenis_pembayaran) {
            'umum'     => 'Umum',
            'bpjs'     => 'BPJS',
            'asuransi' => 'Asuransi',
            default    => $this->jenis_pembayaran,
        };
    }

    public function getStatusBayarLabelAttribute(): string
    {
        return match ($this->status_bayar) {
            'belum_bayar' => 'Belum Bayar',
            'lunas'       => 'Lunas',
            'cicilan'     => 'Cicilan',
            default       => $this->status_bayar,
        };
    }

    public function getTotalBiayaFormattedAttribute(): string
    {
        return 'Rp ' . number_format((float) $this->total_biaya, 0, ',', '.');
    }

    // ─── Activity Log ────────────────────────────────────────────────────

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly([
                'nomor_rawat_inap',
                'status',
                'total_biaya',
                'status_bayar',
            ])
            ->logOnlyDirty()
            ->useLogName('rawat_inap');
    }
}