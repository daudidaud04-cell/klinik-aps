<?php

namespace App\Http\Controllers;

use App\Models\RawatInap;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LaporanRawatInapController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $rawatInaps = RawatInap::query()
            ->with([
                'pasien:id,full_name,medical_record_number',
                'kamar:id,nama_kamar,kelas',
            ])
            ->when($request->status, fn ($q, $v) => $q->where('status', $v))
            ->when($request->dari, fn ($q, $v) => $q->whereDate('tanggal_masuk', '>=', $v))
            ->when($request->sampai, fn ($q, $v) => $q->whereDate('tanggal_masuk', '<=', $v))
            ->orderByDesc('tanggal_masuk')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('laporan/rawat-inap', [
            'rawatInaps' => $rawatInaps,
            'filters'    => $request->only(['status', 'dari', 'sampai']),
            'summary'    => [
                'aktif'  => RawatInap::where('status', 'aktif')->count(),
                'keluar' => RawatInap::whereIn('status', ['pulang', 'meninggal', 'pulang_paksa'])->count(),
            ],
        ]);
    }
}