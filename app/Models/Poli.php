<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Poli extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'polis';

    protected $fillable = [
        'kode_poli',
        'nama_poli',
        'deskripsi',
        'jadwal',
        'status',
    ];

    // ─── Relationships ──────────────────────────────────────────────────

    public function doctors(): BelongsToMany
    {
        return $this->belongsToMany(SystemUser::class, 'poli_dokter', 'poli_id', 'doctor_id')
            ->withTimestamps();
    }

    public function patientHistories(): HasMany
    {
        return $this->hasMany(PatientHistory::class, 'poli_id');
    }

    // ─── Scopes ─────────────────────────────────────────────────────────

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', 'aktif');
    }

    public function scopeSearch(Builder $query, ?string $search): Builder
    {
        if (!$search) return $query;

        return $query->where(function (Builder $q) use ($search) {
            $q->where('nama_poli', 'like', "%{$search}%")
              ->orWhere('kode_poli', 'like', "%{$search}%");
        });
    }

    // ─── Accessors ──────────────────────────────────────────────────────

    public function getStatusLabelAttribute(): string
    {
        return match ($this->status) {
            'aktif'    => 'Aktif',
            'nonaktif' => 'Nonaktif',
            default    => $this->status,
        };
    }
}