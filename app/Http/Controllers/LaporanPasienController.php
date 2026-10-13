<?php

namespace App\Http\Controllers;

use App\Models\Patient;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LaporanPasienController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $pasiens = Patient::query()
            ->when($request->search, fn ($q, $v) =>
                $q->where('full_name', 'like', "%{$v}%")
                  ->orWhere('medical_record_number', 'like', "%{$v}%")
            )
            ->when($request->status, fn ($q, $v) =>
                $q->where('patient_status', $v)
            )
            ->when($request->dari, fn ($q, $v) =>
                $q->whereDate('created_at', '>=', $v)
            )
            ->when($request->sampai, fn ($q, $v) =>
                $q->whereDate('created_at', '<=', $v)
            )
            ->orderByDesc('created_at')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('laporan/pasien', [
            'pasiens'  => $pasiens,
            'filters'  => $request->only(['search', 'status', 'dari', 'sampai']),
            'summary'  => [
                'total'  => Patient::count(),
                'aktif'  => Patient::where('patient_status', 'aktif')->count(),
                'nonaktif' => Patient::where('patient_status', 'nonaktif')->count(),
            ],
        ]);
    }
}