<?php

namespace App\Http\Controllers;

use App\Models\DetailResepObat;
use App\Models\Medicine;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LaporanObatController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $dari   = $request->dari ?? now()->startOfMonth()->toDateString();
        $sampai = $request->sampai ?? now()->toDateString();

        $obats = Medicine::query()
            ->when($request->search, fn ($q, $v) =>
                $q->where('nama_obat', 'like', "%{$v}%")
                  ->orWhere('kode_obat', 'like', "%{$v}%")
            )
            ->orderBy('nama_obat')
            ->paginate(20)
            ->withQueryString();

        $totalTerjual = DetailResepObat::query()
            ->whereHas('resep', fn ($q) =>
                $q->whereDate('tanggal_resep', '>=', $dari)
                  ->whereDate('tanggal_resep', '<=', $sampai)
                  ->where('status', 'selesai')
            )
            ->sum('jumlah');

        return Inertia::render('laporan/obat', [
            'obats'        => $obats,
            'total_terjual'=> $totalTerjual,
            'filters'      => $request->only(['search', 'dari', 'sampai']),
        ]);
    }
}