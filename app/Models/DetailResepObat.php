<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DetailResepObat extends Model
{
    use HasFactory;

    protected $table = 'detail_resep_obats';

    protected $fillable = [
        'resep_id', 'obat_id', 'jumlah',
        'aturan_pakai', 'keterangan', 'harga_satuan', 'subtotal',
    ];

    protected $appends = ['subtotal_formatted'];

    protected function casts(): array
    {
        return [
            'harga_satuan' => 'decimal:2',
            'subtotal'     => 'decimal:2',
        ];
    }

    public function resep(): BelongsTo
    {
        return $this->belongsTo(ResepObat::class, 'resep_id');
    }

    public function obat(): BelongsTo
    {
        return $this->belongsTo(Medicine::class, 'obat_id');
    }

    public function getSubtotalFormattedAttribute(): string
    {
        return 'Rp ' . number_format((float) $this->subtotal, 0, ',', '.');
    }
}