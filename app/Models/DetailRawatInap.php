<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DetailRawatInap extends Model
{
    use HasFactory;

    protected $table = 'detail_rawat_inaps';

    protected $fillable = [
        'rawat_inap_id',
        'tanggal',
        'tekanan_darah',
        'suhu_tubuh',
        'nadi',
        'pernapasan',
        'perkembangan',
        'tindakan_harian',
        'instruksi_dokter',
        'biaya_harian',
        'dicatat_oleh',
    ];

    protected $appends = ['biaya_harian_formatted'];

    protected function casts(): array
    {
        return [
            'tanggal'      => 'date',
            'biaya_harian' => 'decimal:2',
        ];
    }

    public function rawatInap(): BelongsTo
    {
        return $this->belongsTo(RawatInap::class, 'rawat_inap_id');
    }

    public function dicatatOleh(): BelongsTo
    {
        return $this->belongsTo(User::class, 'dicatat_oleh');
    }

    public function getBiayaHarianFormattedAttribute(): string
    {
        return 'Rp ' . number_format((float) $this->biaya_harian, 0, ',', '.');
    }
}