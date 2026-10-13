<?php

namespace App\Http\Controllers;

use App\Models\Pembayaran;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LaporanKeuanganController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $dari    = $request->dari ?? now()->startOfMonth()->toDateString();
        $sampai  = $request->sampai ?? now()->toDateString();

        $pembayarans = Pembayaran::query()
            ->with('pasien:id,full_name,medical_record_number')
            ->when($request->status, fn ($q, $v) => $q->where('status', $v))
            ->whereDate('tanggal_bayar', '>=', $dari)
            ->whereDate('tanggal_bayar', '<=', $sampai)
            ->orderByDesc('tanggal_bayar')
            ->paginate(20)
            ->withQueryString();

        $totalPendapatan = Pembayaran::where('status', 'lunas')
            ->whereDate('tanggal_bayar', '>=', $dari)
            ->whereDate('tanggal_bayar', '<=', $sampai)
            ->sum('total');

        return Inertia::render('laporan/keuangan', [
            'pembayarans'      => $pembayarans,
            'total_pendapatan' => $totalPendapatan,
            'filters'          => $request->only(['dari', 'sampai', 'status']),
        ]);
    }
}