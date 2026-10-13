<?php

namespace App\Http\Controllers;

use App\Http\Requests\Pembayaran\StorePembayaranRequest;
use App\Models\ClinicRate;
use App\Models\Invoice;
use App\Models\Patient;
use App\Models\Pembayaran;
use App\Models\RawatInap;
use App\Models\RekamMedis;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class PembayaranController extends Controller
{
    public function index(Request $request): Response
    {
        $pembayarans = Pembayaran::query()
            ->with([
                'pasien:id,full_name,medical_record_number',
                'kasir:id,name',
                'invoice:id,pembayaran_id,nomor_invoice,status',
            ])
            ->search($request->string('search')->value())
            ->byStatus($request->status)
            ->orderByDesc('created_at')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('transaksi/pembayaran/index', [
            'pembayarans' => $pembayarans,
            'filters'     => $request->only(['search', 'status']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('transaksi/pembayaran/create', [
            'pasiens' => Patient::where('patient_status', 'aktif')
                ->select('id', 'full_name', 'medical_record_number')
                ->orderBy('full_name')->get(),
            'tarifs'  => ClinicRate::active()
                ->select('id', 'nama_tarif', 'harga', 'kategori')
                ->get(),
        ]);
    }

    public function store(StorePembayaranRequest $request): RedirectResponse
    {
        DB::transaction(function () use ($request) {
            $kembalian = max(0, (float) $request->dibayar - (float) $request->total);

            $pembayaran = Pembayaran::create([
                ...$request->validated(),
                'kembalian'     => $kembalian,
                'tanggal_bayar' => $request->status === 'lunas' ? now() : null,
                'kasir_id'      => $request->user()->id,
            ]);

            // Auto-generate invoice saat status lunas
            if ($request->status === 'lunas') {
                Invoice::create([
                    'pembayaran_id'   => $pembayaran->id,
                    'pasien_id'       => $pembayaran->pasien_id,
                    'items'           => [],
                    'subtotal'        => $pembayaran->subtotal,
                    'diskon'          => $pembayaran->diskon,
                    'pajak'           => $pembayaran->pajak,
                    'total'           => $pembayaran->total,
                    'status'          => 'dibayar',
                    'tanggal_invoice' => now(),
                    'dibuat_oleh'     => $request->user()->id,
                ]);
            }
        });

        return redirect()->route('transaksi.pembayaran.index')
            ->with('success', 'Pembayaran berhasil diproses.');
    }

    public function show(Pembayaran $pembayaran): Response
    {
        $pembayaran->load([
            'pasien:id,full_name,medical_record_number',
            'tarif:id,nama_tarif',
            'kasir:id,name',
            'invoice',
        ]);

        return Inertia::render('transaksi/pembayaran/show', [
            'pembayaran' => $pembayaran,
        ]);
    }

    public function update(Request $request, Pembayaran $pembayaran): RedirectResponse
    {
        // 🔧 FIX: tambahkan validasi untuk dibayar & metode_bayar,
        // dan hapus 'gagal' dari opsi status yang valid.
        $validated = $request->validate([
            'status'       => 'required|in:menunggu,lunas,refund',
            'catatan'      => 'nullable|string',
            'dibayar'      => 'nullable|numeric|min:0',
            'metode_bayar' => 'nullable|string|in:tunai,transfer',
        ]);

        DB::transaction(function () use ($validated, $pembayaran, $request) {
            $updateData = [
                'status'        => $validated['status'],
                'catatan'       => $validated['catatan'] ?? $pembayaran->catatan,
                'tanggal_bayar' => $validated['status'] === 'lunas'
                    ? ($pembayaran->tanggal_bayar ?? now())
                    : $pembayaran->tanggal_bayar,
                'kasir_id' => $pembayaran->kasir_id ?? $request->user()->id,
            ];

            // 🔧 FIX UTAMA: hitung & simpan dibayar + kembalian + metode_bayar
            // saat status berubah jadi 'lunas'. Ini yang sebelumnya hilang,
            // sehingga dibayar/kembalian selalu tersimpan 0.
            if ($validated['status'] === 'lunas') {
                $dibayar   = (float) ($validated['dibayar'] ?? $pembayaran->total);
                $kembalian = max(0, $dibayar - (float) $pembayaran->total);

                $updateData['dibayar']      = $dibayar;
                $updateData['kembalian']    = $kembalian;
                $updateData['metode_bayar'] = $validated['metode_bayar'] ?? $pembayaran->metode_bayar ?? 'tunai';
            }

            $pembayaran->update($updateData);

            if ($validated['status'] === 'lunas' && ! $pembayaran->invoice) {
                Invoice::create([
                    'pembayaran_id'   => $pembayaran->id,
                    'pasien_id'       => $pembayaran->pasien_id,
                    'items'           => [],
                    'subtotal'        => $pembayaran->subtotal,
                    'diskon'          => $pembayaran->diskon,
                    'pajak'           => $pembayaran->pajak,
                    'total'           => $pembayaran->total,
                    'status'          => 'dibayar',
                    'tanggal_invoice' => now(),
                    'dibuat_oleh'     => $request->user()->id,
                ]);
            }

            // Sinkronkan status ke sumber tagihan (rekam medis / rawat inap) & patient history
            if ($pembayaran->payable && method_exists($pembayaran->payable, 'patientHistory')) {
                $statusBayar = $validated['status'] === 'lunas' ? 'lunas' : 'belum_bayar';

                $pembayaran->payable->update(['status_bayar' => $statusBayar]);

                $pembayaran->payable->patientHistory?->update(['status_bayar' => $statusBayar]);
            }
        });

        return redirect()->route('transaksi.pembayaran.show', $pembayaran)
            ->with('success', 'Status pembayaran berhasil diperbarui.');
    }
}