<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class PatientHistory extends Model
{
    use HasFactory;

    protected $table = 'patient_histories';

    protected $fillable = [
        'patient_id',
        'type',
        'referenceable_type',
        'referenceable_id',
        'doctor_id',
        'poli_id',
        'visit_date',
        'chief_complaint',
        'diagnosis_summary',
        'total_biaya',
        'status_bayar',
    ];

    protected $appends = [
        'type_label',
        'status_bayar_label',
        'total_biaya_formatted',
    ];

    protected function casts(): array
    {
        return [
            'visit_date'  => 'date',
            'total_biaya' => 'decimal:2',
        ];
    }

    // ─── Relationships ────────────────────────────────────────────────────

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function doctor(): BelongsTo
    {
        return $this->belongsTo(SystemUser::class, 'doctor_id'); // ← SystemUser, bukan User
    }

    public function poli(): BelongsTo
    {
        return $this->belongsTo(Poli::class, 'poli_id'); // ← Poli, bukan Polis
    }

    public function referenceable(): MorphTo
    {
        return $this->morphTo();
    }

    // ─── Scopes ──────────────────────────────────────────────────────────

    public function scopeByPatient(Builder $query, int $patientId): Builder
    {
        return $query->where('patient_id', $patientId);
    }

    public function scopeByType(Builder $query, string $type): Builder
    {
        return $query->where('type', $type);
    }

    public function scopeSearch(Builder $query, ?string $search): Builder
    {
        if (! $search) return $query;

        return $query->whereHas('patient', function (Builder $q) use ($search) {
            $q->where('full_name', 'like', "%{$search}%")
              ->orWhere('medical_record_number', 'like', "%{$search}%");
        });
    }

    // ─── Accessors ───────────────────────────────────────────────────────

    public function getTypeLabelAttribute(): string
    {
        return match ($this->type) {
            'rawat_jalan'  => 'Rawat Jalan',
            'rawat_inap'   => 'Rawat Inap',
            'laboratorium' => 'Laboratorium',
            'resep'        => 'Resep Obat',
            'tindakan'     => 'Tindakan Medis',
            default        => ucfirst($this->type),
        };
    }

    public function getStatusBayarLabelAttribute(): string
    {
        return match ($this->status_bayar) {
            'lunas'       => 'Lunas',
            'belum_bayar' => 'Belum Bayar',
            'cicilan'     => 'Cicilan',
            default       => $this->status_bayar,
        };
    }

    public function getTotalBiayaFormattedAttribute(): string
    {
        return 'Rp ' . number_format((float) $this->total_biaya, 0, ',', '.');
    }
}