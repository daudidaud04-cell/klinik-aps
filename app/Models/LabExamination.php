<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class LabExamination extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'lab_examinations';

    protected $fillable = [
        'kode_pemeriksaan',
        'nama_pemeriksaan',
        'kategori',
        'harga',
        'satuan_hasil',
        'nilai_normal_min',
        'nilai_normal_max',
        'deskripsi',
        'estimasi_durasi_menit',
        'status',
    ];

    protected $appends = [
        'harga_formatted',
        'nilai_normal_range',
        'status_label',
    ];

    protected function casts(): array
    {
        return [
            'harga'                 => 'decimal:2',
            'estimasi_durasi_menit' => 'integer',
        ];
    }

    // ─── Scopes ────────────────────────────────────────────────────────────

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', 'aktif');
    }

    public function scopeByKategori(Builder $query, string $kategori): Builder
    {
        return $query->where('kategori', $kategori);
    }

    public function scopeSearch(Builder $query, ?string $search): Builder
    {
        if (! $search) return $query;

        return $query->where(function (Builder $q) use ($search) {
            $q->where('nama_pemeriksaan', 'like', "%{$search}%")
              ->orWhere('kode_pemeriksaan', 'like', "%{$search}%")
              ->orWhere('kategori', 'like', "%{$search}%");
        });
    }

    // ─── Accessors ─────────────────────────────────────────────────────────

    public function getHargaFormattedAttribute(): string
    {
        return 'Rp ' . number_format((float) $this->harga, 0, ',', '.');
    }

    public function getNilaiNormalRangeAttribute(): ?string
    {
        if (! $this->nilai_normal_min && ! $this->nilai_normal_max) return null;

        $unit = $this->satuan_hasil ?? '';

        return trim("{$this->nilai_normal_min} - {$this->nilai_normal_max} {$unit}");
    }

    public function getStatusLabelAttribute(): string
    {
        return match ($this->status) {
            'aktif'    => 'Aktif',
            'nonaktif' => 'Nonaktif',
            default    => $this->status ?? '-',
        };
    }
}