<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ClinicRate extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'clinic_rates';

    protected $fillable = [
        'kode_tarif',
        'nama_tarif',
        'kategori',
        'harga',
        'is_taxable',
        'tax_percent',
        'deskripsi',
        'status',
    ];

    protected $appends = [
        'harga_formatted',
        'harga_after_tax',
        'harga_after_tax_formatted',
        'status_label',
    ];

    protected function casts(): array
    {
        return [
            'harga'       => 'decimal:2',
            'is_taxable'  => 'boolean',
            'tax_percent' => 'decimal:2',
        ];
    }

    // ─── Scopes ──────────────────────────────────────────────────────────────

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
            $q->where('nama_tarif', 'like', "%{$search}%")
              ->orWhere('kode_tarif', 'like', "%{$search}%")
              ->orWhere('kategori', 'like', "%{$search}%");
        });
    }

    // ─── Accessors ───────────────────────────────────────────────────────────

    public function getHargaFormattedAttribute(): string
    {
        return 'Rp ' . number_format((float) $this->harga, 0, ',', '.');
    }

    public function getHargaAfterTaxAttribute(): float
    {
        if (! $this->is_taxable) return (float) $this->harga;
        return $this->harga * (1 + ($this->tax_percent / 100));
    }

    public function getHargaAfterTaxFormattedAttribute(): string
    {
        return 'Rp ' . number_format($this->getHargaAfterTaxAttribute(), 0, ',', '.');
    }

    public function getStatusLabelAttribute(): string
{
    return match ($this->status) {
        'aktif'    => 'Aktif',
        'nonaktif' => 'Nonaktif',
        default    => 'Aktif',   // ← tambahkan default agar tidak null
    };
}
}