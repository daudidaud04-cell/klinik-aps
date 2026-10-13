<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Medicine extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'medicines';

    protected $fillable = [
        'kode_obat',
        'nama_obat',
        'kategori',
        'satuan',
        'stok',
        'minimal_stok',
        'harga_beli',
        'harga_jual',
        'expired_date',
        'manufacturer',
        'deskripsi',
        'status',
    ];

    // 🔧 FIX #1: $appends global dihapus. Accessor turunan (margin, is_low_stock,
    // dst) butuh kolom seperti minimal_stok/harga_beli/expired_date yang sering
    // TIDAK ikut di-select() di query ringan (mis. dropdown obat di form rekam
    // medis). Kalau di-append otomatis, hasilnya diam-diam salah tanpa error.
    //
    // Sekarang, di tempat yang memang butuh field turunan ini, panggil eksplisit:
    //   Medicine::all()->each->append(['margin', 'is_low_stock', ...]);
    // atau kalau query builder:
    //   Medicine::query()->get()->append([
    //       'harga_jual_formatted', 'harga_beli_formatted', 'stok_status',
    //       'status_label', 'is_low_stock', 'is_expired', 'is_near_expiry', 'margin',
    //   ]);
    //
    // Ini memaksa developer sadar bahwa kolom lengkap (minimal_stok, harga_beli,
    // expired_date) harus ikut ter-load supaya hasilnya benar.
    protected $appends = [];

    /**
     * Daftar semua accessor turunan yang tersedia di model ini, supaya gampang
     * dipanggil bareng dari controller: Medicine::query()->get()->append(Medicine::DERIVED_ATTRIBUTES)
     */
    public const DERIVED_ATTRIBUTES = [
        'harga_jual_formatted',
        'harga_beli_formatted',
        'stok_status',
        'status_label',
        'is_low_stock',
        'is_expired',
        'is_near_expiry',
        'margin',
    ];

    protected function casts(): array
    {
        return [
            'harga_beli'   => 'decimal:2',
            'harga_jual'   => 'decimal:2',
            'stok'         => 'integer',
            'minimal_stok' => 'integer',
            'expired_date' => 'date',
        ];
    }

    // ─── Scopes ──────────────────────────────────────────────────────────────

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', 'aktif');
    }

    public function scopeLowStock(Builder $query): Builder
    {
        return $query->whereColumn('stok', '<=', 'minimal_stok');
    }

    /**
     * 🔧 FIX #2: sebelumnya obat yang SUDAH kedaluwarsa ikut kehitung "near expiry"
     * karena kondisinya cuma `expired_date <= now()+$days` tanpa batas bawah.
     * Sekarang pakai whereBetween supaya hanya obat yang BELUM expired tapi akan
     * expired dalam $days ke depan yang masuk.
     */
    public function scopeNearExpiry(Builder $query, int $days = 30): Builder
    {
        return $query->whereNotNull('expired_date')
                     ->whereBetween('expired_date', [now()->startOfDay(), now()->addDays($days)->endOfDay()]);
    }

    public function scopeByKategori(Builder $query, string $kategori): Builder
    {
        return $query->where('kategori', $kategori);
    }

    public function scopeSearch(Builder $query, ?string $search): Builder
    {
        if (! $search) return $query;

        return $query->where(function (Builder $q) use ($search) {
            $q->where('nama_obat', 'like', "%{$search}%")
              ->orWhere('kode_obat', 'like', "%{$search}%")
              ->orWhere('manufacturer', 'like', "%{$search}%");
        });
    }

    // ─── Accessors ───────────────────────────────────────────────────────────
    // 🔧 FIX #3: setiap accessor sekarang defensif — cek dulu apakah kolom yang
    // dibutuhkan benar-benar ter-load di model. Kalau tidak (misal karena query
    // pakai select() terbatas), accessor mengembalikan null/nilai netral alih-alih
    // angka yang keliru secara diam-diam (mis. margin = 0 padahal aslinya besar).

    public function getStokStatusAttribute(): ?string
    {
        if (! array_key_exists('stok', $this->attributes) || ! array_key_exists('minimal_stok', $this->attributes)) {
            return null;
        }

        return match (true) {
            $this->stok <= 0                   => 'habis',
            $this->stok <= $this->minimal_stok => 'menipis',
            default                            => 'aman',
        };
    }

    public function getStatusLabelAttribute(): string
    {
        return match ($this->status) {
            'aktif'    => 'Aktif',
            'nonaktif' => 'Nonaktif',
            default    => (string) $this->status,
        };
    }

    public function getIsLowStockAttribute(): ?bool
    {
        if (! array_key_exists('stok', $this->attributes) || ! array_key_exists('minimal_stok', $this->attributes)) {
            return null;
        }

        return $this->stok <= $this->minimal_stok;
    }

    public function getIsExpiredAttribute(): ?bool
    {
        if (! array_key_exists('expired_date', $this->attributes)) {
            return null;
        }

        return $this->expired_date && $this->expired_date->isPast();
    }

    public function getIsNearExpiryAttribute(): ?bool
    {
        if (! array_key_exists('expired_date', $this->attributes)) {
            return null;
        }

        if (! $this->expired_date) {
            return false;
        }

        // Sudah expired tidak dihitung "near expiry" — beda kategori
        if ($this->expired_date->isPast()) {
            return false;
        }

        return $this->expired_date->lessThanOrEqualTo(now()->addDays(30));
    }

    public function getHargaJualFormattedAttribute(): ?string
    {
        if (! array_key_exists('harga_jual', $this->attributes)) {
            return null;
        }

        return 'Rp ' . number_format((float) $this->harga_jual, 0, ',', '.');
    }

    public function getHargaBeliFormattedAttribute(): ?string
    {
        if (! array_key_exists('harga_beli', $this->attributes)) {
            return null;
        }

        return 'Rp ' . number_format((float) $this->harga_beli, 0, ',', '.');
    }

    public function getMarginAttribute(): ?float
    {
        if (! array_key_exists('harga_beli', $this->attributes) || ! array_key_exists('harga_jual', $this->attributes)) {
            return null;
        }

        if ((float) $this->harga_beli == 0.0) {
            return 0;
        }

        return (((float) $this->harga_jual - (float) $this->harga_beli) / (float) $this->harga_beli) * 100;
    }

    // ─── Relasi ──────────────────────────────────────────────────────────────
    // 🔧 Tambahan: relasi ke detail resep, supaya query terkait obat tidak
    // harus selalu manual Medicine::find()/whereIn() dari controller lain.

    public function detailResep()
    {
        return $this->hasMany(DetailResepObat::class, 'obat_id');
    }
}