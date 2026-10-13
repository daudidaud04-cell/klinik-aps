<?php

namespace App\Http\Controllers;

use App\Models\RekamMedis;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LaporanRekamMedisController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $rekamMedis = RekamMedis::query()
            ->join('kunjungan_rawat_jalans', 'kunjungan_rawat_jalans.id', '=', 'rekam_medis.kunjungan_id')
            ->with([
                'kunjungan:id,pasien_id,dokter_id,tanggal_kunjungan,keluhan_utama',
                'kunjungan.pasien:id,full_name,medical_record_number',
                'kunjungan.dokter:id,name',
            ])
            ->select('rekam_medis.*')
            ->when($request->dari, fn ($q, $v) =>
                $q->whereDate('kunjungan_rawat_jalans.tanggal_kunjungan', '>=', $v)
            )
            ->when($request->sampai, fn ($q, $v) =>
                $q->whereDate('kunjungan_rawat_jalans.tanggal_kunjungan', '<=', $v)
            )
            ->when($request->search, fn ($q, $v) =>
                $q->whereHas('kunjungan.pasien', fn ($q) =>
                    $q->where('full_name', 'like', "%{$v}%")
                      ->orWhere('medical_record_number', 'like', "%{$v}%")
                )
            )
            ->orderByDesc('kunjungan_rawat_jalans.tanggal_kunjungan')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('laporan/rekam-medis', [
            'rekamMedis' => $rekamMedis,
            'filters'    => $request->only(['search', 'dari', 'sampai']),
        ]);
    }
}