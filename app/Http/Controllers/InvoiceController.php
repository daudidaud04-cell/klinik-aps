<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class InvoiceController extends Controller
{
    public function index(Request $request): Response
    {
        $invoices = Invoice::query()
            ->with([
                'pasien:id,full_name,medical_record_number',
                'pembayaran:id,nomor_pembayaran,total,metode_bayar,status',
                'dibuatOleh:id,name',
            ])
            ->when($request->status, fn ($q, $v) => $q->where('status', $v))
            ->orderByDesc('tanggal_invoice')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('transaksi/invoice/index', [
            'invoices' => $invoices,
            'filters'  => $request->only(['status']),
        ]);
    }

    public function show(Invoice $invoice): Response
    {
        $invoice->load([
            'pasien:id,full_name,medical_record_number,nik,phone,address',
            'pembayaran',
            'dibuatOleh:id,name',
        ]);

        return Inertia::render('transaksi/invoice/show', [
            'invoice' => $invoice,
        ]);
    }
}