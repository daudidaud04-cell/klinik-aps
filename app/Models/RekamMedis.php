<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\MorphOne;
use Illuminate\Support\Carbon;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class RekamMedis extends Model
{
    use HasFactory, LogsActivity;

    protected $table = 'rekam_medis';

    protected $fillable = [
        'nomor_rekam_medis',
        'kunjungan_id',
        'tarif_id',
        'tekanan_darah',
        'suhu_tubuh',
        'nadi',
        'pernapasan',
        'berat_badan',
        'tinggi_badan',
        'anamnesis',
        'pemeriksaan_fisik',
        'rencana_terapi',
        'catatan_dokter',
        'total_biaya',
        'status_bayar',
    ];

    protected $appends = [
        'total_biaya_formatted',
        'status_bayar_label',
        'imt',
    ];

    protected function casts(): array
    {
        return [
            'total_biaya'   => 'decimal:2',
            'suhu_tubuh'    => 'decimal:1',
            'berat_badan'   => 'decimal:2',
            'tinggi_badan'  => 'decimal:2',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (RekamMedis $rm) {
            if (empty($rm->nomor_rekam_medis)) {
                $rm->nomor_rekam_medis = self::generateNomor();
            }
        });

        static::created(function (RekamMedis $rm) {
            $rm->loadMissing('kunjungan');

            // Auto-generate Pembayaran
            Pembayaran::create([
                'pasien_id'     => $rm->kunjungan?->pasien_id,
                'tarif_id'      => $rm->tarif_id,
                'jenis_layanan' => 'rawat_jalan',
                'payable_type'  => RekamMedis::class,
                'payable_id'    => $rm->id,
                'subtotal'      => $rm->total_biaya,
                'diskon'        => 0,
                'pajak'         => 0,
                'total'         => $rm->total_biaya,
                'dibayar'       => 0,
                'kembalian'     => 0,
                'status'        => 'menunggu',
            ]);

            // Auto-generate PatientHistory
            if ($rm->kunjungan) {
                PatientHistory::create([
                    'patient_id'         => $rm->kunjungan->pasien_id,
                    'type'               => 'rawat_jalan',
                    'referenceable_type' => RekamMedis::class,
                    'referenceable_id'   => $rm->id,
                    'doctor_id'          => $rm->kunjungan->dokter_id,
                    'poli_id'            => $rm->kunjungan->poli_id,
                    'visit_date'         => $rm->kunjungan->tanggal_kunjungan,
                    'chief_complaint'    => $rm->kunjungan->keluhan_utama,
                    'diagnosis_summary'  => $rm->anamnesis,
                    'total_biaya'        => $rm->total_biaya,
                    'status_bayar'       => $rm->status_bayar ?? 'belum_bayar',
                ]);
            }
        });
    }

    public static function generateNomor(): string
    {
        $tanggal = now()->format('Ymd');
        $prefix  = "RM-{$tanggal}-";

        $latest = self::where('nomor_rekam_medis', 'like', "{$prefix}%")
            ->orderByDesc('id')
            ->value('nomor_rekam_medis');

        $next = $latest ? (int) substr($latest, -4) + 1 : 1;

        return $prefix . str_pad($next, 4, '0', STR_PAD_LEFT);
    }

    // ─── Relationships ────────────────────────────────────────────────────

    public function kunjungan(): BelongsTo
    {
        return $this->belongsTo(KunjunganRawatJalan::class, 'kunjungan_id');
    }

    public function tarif(): BelongsTo
    {
        return $this->belongsTo(ClinicRate::class, 'tarif_id');
    }

    public function diagnosas(): HasMany
    {
        return $this->hasMany(Diagnosa::class, 'rekam_medis_id');
    }

    public function tindakanMedis(): HasMany
    {
        return $this->hasMany(TindakanMedis::class, 'rekam_medis_id');
    }

    // 🔧 FIX: relasi resepObat ditambahkan — sebelumnya tidak ada sama sekali
    // padahal dipanggil di RekamMedisController@show lewat eager load
    // 'resepObat.details.obat'. Satu rekam medis hanya menghasilkan satu
    // resep obat (yang di dalamnya berisi banyak item lewat relasi details).
    public function resepObat(): HasOne
    {
        return $this->hasOne(ResepObat::class, 'rekam_medis_id');
    }

    public function pembayaran(): MorphOne
    {
        return $this->morphOne(Pembayaran::class, 'payable');
    }

    public function patientHistory(): MorphOne
    {
        return $this->morphOne(PatientHistory::class, 'referenceable');
    }

    // ─── Accessors ───────────────────────────────────────────────────────

    public function getTotalBiayaFormattedAttribute(): string
    {
        return 'Rp ' . number_format((float) $this->total_biaya, 0, ',', '.');
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

    public function getImtAttribute(): ?float
    {
        if (! $this->berat_badan || ! $this->tinggi_badan) return null;
        $tinggiM = $this->tinggi_badan / 100;
        return round($this->berat_badan / ($tinggiM * $tinggiM), 1);
    }

    // ─── Activity Log ────────────────────────────────────────────────────

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly([
                'nomor_rekam_medis',
                'total_biaya',
                'status_bayar',
                'anamnesis',
                'rencana_terapi',
            ])
            ->logOnlyDirty()
            ->useLogName('rekam_medis');
    }
}