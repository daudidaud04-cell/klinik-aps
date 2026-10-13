<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Room extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'rooms';

    protected $fillable = [
        'kode_kamar',
        'nama_kamar',
        'kelas',
        'kapasitas',
        'terisi',
        'tarif_harian',
        'fasilitas',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'tarif_harian' => 'decimal:2',
            'kapasitas'    => 'integer',
            'terisi'       => 'integer',
        ];
    }

    // ─── Scopes ─────────────────────────────────────────────────────────────────

    public function scopeAvailable(Builder $query): Builder
    {
        return $query->where('status', 'tersedia');
    }

    public function scopeByKelas(Builder $query, string $kelas): Builder
    {
        return $query->where('kelas', $kelas);
    }

    public function scopeSearch(Builder $query, ?string $search): Builder
    {
        if (!$search) return $query;

        return $query->where(function (Builder $q) use ($search) {
            $q->where('nama_kamar', 'like', "%{$search}%")
              ->orWhere('kode_kamar', 'like', "%{$search}%")
              ->orWhere('kelas', 'like', "%{$search}%");
        });
    }

    // ─── Accessors ──────────────────────────────────────────────────────────────

    public function getSisaKapasitasAttribute(): int
    {
        return $this->kapasitas - $this->terisi;
    }

    public function getIsFullAttribute(): bool
    {
        return $this->terisi >= $this->kapasitas;
    }

    public function getStatusLabelAttribute(): string
    {
        return match ($this->status) {
            'tersedia'    => 'Tersedia',
            'penuh'       => 'Penuh',
            'maintenance' => 'Maintenance',
            default       => $this->status,
        };
    }

    public function getTarifHarianFormattedAttribute(): string
    {
        return 'Rp ' . number_format((float) $this->tarif_harian, 0, ',', '.');
    }
}