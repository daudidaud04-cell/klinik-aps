<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PemindahanKamar extends Model
{
    use HasFactory;

    protected $table = 'pemindahan_kamars';

    protected $fillable = [
        'rawat_inap_id',
        'kamar_asal_id',
        'kamar_tujuan_id',
        'tanggal_pindah',
        'alasan',
        'disetujui_oleh',
    ];

    protected function casts(): array
    {
        return ['tanggal_pindah' => 'date'];
    }

    public function rawatInap(): BelongsTo
    {
        return $this->belongsTo(RawatInap::class, 'rawat_inap_id');
    }

    public function kamarAsal(): BelongsTo
    {
        return $this->belongsTo(Room::class, 'kamar_asal_id');
    }

    public function kamarTujuan(): BelongsTo
    {
        return $this->belongsTo(Room::class, 'kamar_tujuan_id');
    }

    public function disetujuiOleh(): BelongsTo
    {
        return $this->belongsTo(User::class, 'disetujui_oleh');
    }
}