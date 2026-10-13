<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HasilLab extends Model
{
    use HasFactory;

    protected $table = 'hasil_labs';

    protected $fillable = [
        'pemeriksaan_id', 'parameter', 'nilai',
        'satuan', 'nilai_normal', 'keterangan', 'catatan',
    ];

    public function pemeriksaan(): BelongsTo
    {
        return $this->belongsTo(PemeriksaanLab::class, 'pemeriksaan_id');
    }

    public function getKeteranganLabelAttribute(): string
    {
        return match ($this->keterangan) {
            'normal' => 'Normal',
            'rendah' => 'Rendah ↓',
            'tinggi' => 'Tinggi ↑',
            default  => '-',
        };
    }
}