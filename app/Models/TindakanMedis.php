<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TindakanMedis extends Model
{
    use HasFactory;

    protected $table = 'tindakan_medis';

    protected $fillable = [
        'rekam_medis_id',
        'tarif_id',
        'nama_tindakan',
        'keterangan',
        'biaya',
        'jumlah',
    ];

    protected $appends = ['subtotal_formatted'];

    protected function casts(): array
    {
        return ['biaya' => 'decimal:2'];
    }

    public function rekamMedis(): BelongsTo
    {
        return $this->belongsTo(RekamMedis::class, 'rekam_medis_id');
    }

    public function tarif(): BelongsTo
    {
        return $this->belongsTo(ClinicRate::class, 'tarif_id');
    }

    public function getSubtotalAttribute(): float
    {
        return (float) $this->biaya * $this->jumlah;
    }

    public function getSubtotalFormattedAttribute(): string
    {
        return 'Rp ' . number_format($this->getSubtotalAttribute(), 0, ',', '.');
    }
}