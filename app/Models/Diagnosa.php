<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Diagnosa extends Model
{
    use HasFactory;

    protected $table = 'diagnosas';

    protected $fillable = [
        'rekam_medis_id',
        'kode_icd',
        'nama_diagnosa',
        'jenis',
        'keterangan',
    ];

    public function rekamMedis(): BelongsTo
    {
        return $this->belongsTo(RekamMedis::class, 'rekam_medis_id');
    }
}