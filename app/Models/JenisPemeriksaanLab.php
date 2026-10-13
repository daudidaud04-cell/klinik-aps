<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class JenisPemeriksaanLab extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'jenis_pemeriksaan_labs';

    protected $fillable = [
        'kode', 'nama', 'kategori', 'harga',
        'satuan_hasil', 'nilai_normal', 'estimasi_durasi_menit', 'status',
    ];

    protected $appends = ['harga_formatted', 'status_label'];

    protected function casts(): array
    {
        return ['harga' => 'decimal:2'];
    }

    public function pemeriksaanLabs(): HasMany
    {
        return $this->hasMany(PemeriksaanLab::class, 'jenis_id');
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', 'aktif');
    }

    public function scopeSearch(Builder $query, ?string $search): Builder
    {
        if (! $search) return $query;
        return $query->where(function (Builder $q) use ($search) {
            $q->where('nama', 'like', "%{$search}%")
              ->orWhere('kode', 'like', "%{$search}%");
        });
    }

    public function getHargaFormattedAttribute(): string
    {
        return 'Rp ' . number_format((float) $this->harga, 0, ',', '.');
    }

    public function getStatusLabelAttribute(): string
    {
        return $this->status === 'aktif' ? 'Aktif' : 'Nonaktif';
    }
}