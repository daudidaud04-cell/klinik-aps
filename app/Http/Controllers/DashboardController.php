<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Models\Patient;
use App\Models\Medicine;
use App\Models\PemeriksaanLab;
use App\Models\Pembayaran;
use App\Models\RawatInap;
use App\Models\ResepObat;
use App\Models\Room;
use App\Models\KunjunganRawatJalan;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $user = $request->user();
        $isSuperAdmin = $user?->role === 'super_admin';
        $isDokter = $user?->role === 'dokter';
        $bulanIni = now()->startOfMonth();
        $today = now()->startOfDay();

        $can = fn (string $permission): bool => $user?->hasPermission($permission) ?? false;

        // ─────────────────────────────────────────────────────────────
        // STATS DASAR
        // ─────────────────────────────────────────────────────────────
        $stats = [
            'total_pasien'      => Patient::count(),
            'pasien_baru'       => Patient::where('created_at', '>=', $bulanIni)->count(),
            'rawat_jalan_bulan' => KunjunganRawatJalan::where('created_at', '>=', $bulanIni)->count(),
            'rawat_inap_aktif'  => RawatInap::where('status', 'aktif')->count(),
            'pendapatan_bulan'  => (float) Pembayaran::where('status', 'lunas')
                ->where('created_at', '>=', $bulanIni)
                ->sum('total'),
            'resep_bulan'       => ResepObat::where('created_at', '>=', $bulanIni)->count(),
            'lab_bulan'         => PemeriksaanLab::where('created_at', '>=', $bulanIni)->count(),
        ];

        // ─────────────────────────────────────────────────────────────
        // FINANSIAL & PENDAPATAN — HANYA SUPER ADMIN
        // ─────────────────────────────────────────────────────────────
        $finansial = null;

        if ($isSuperAdmin && $can('pembayaran.view')) {
            $yesterday = $today->copy()->subDay();

            $pendapatanHariIni = Pembayaran::where('status', 'lunas')
                ->whereDate('tanggal_bayar', $today)
                ->sum('total');

            $pendapatanKemarin = Pembayaran::where('status', 'lunas')
                ->whereDate('tanggal_bayar', $yesterday)
                ->sum('total');

            $trenPersen = $pendapatanKemarin > 0
                ? round((($pendapatanHariIni - $pendapatanKemarin) / $pendapatanKemarin) * 100, 1)
                : ($pendapatanHariIni > 0 ? 100.0 : 0.0);

            $breakdown = Pembayaran::where('status', 'lunas')
                ->whereDate('tanggal_bayar', $today)
                ->selectRaw('metode_bayar, SUM(total) as total, COUNT(*) as jumlah')
                ->groupBy('metode_bayar')
                ->get()
                ->map(fn ($row) => [
                    'metode' => $row->metode_bayar,
                    'label'  => match ($row->metode_bayar) {
                        'tunai'        => 'Tunai',
                        'transfer'     => 'Transfer Bank',
                        'bpjs'         => 'BPJS',
                        'asuransi'     => 'Asuransi',
                        'kartu_debit'  => 'Kartu Debit',
                        'kartu_kredit' => 'Kartu Kredit',
                        default        => $row->metode_bayar ?? '-',
                    },
                    'total'  => (float) $row->total,
                    'jumlah' => $row->jumlah,
                ]);

            $tren7Hari = collect(range(6, 0))->map(function ($i) use ($today) {
                $tanggal = $today->copy()->subDays($i);
                $total = Pembayaran::where('status', 'lunas')
                    ->whereDate('tanggal_bayar', $tanggal)
                    ->sum('total');

                return [
                    'tanggal'       => $tanggal->format('Y-m-d'),
                    'label_singkat' => $tanggal->translatedFormat('d/m'),
                    'total'         => (float) $total,
                ];
            });

            $finansial = [
                'pendapatan_hari_ini'    => (float) $pendapatanHariIni,
                'pendapatan_kemarin'     => (float) $pendapatanKemarin,
                'pendapatan_bulan_ini'   => (float) $stats['pendapatan_bulan'],
                'tren_persen'            => $trenPersen,
                'breakdown_metode_bayar' => $breakdown,
                'tren_7_hari'            => $tren7Hari,
            ];
        }

        // ─────────────────────────────────────────────────────────────
        // BED INFO — diselipkan ke deskripsi StatCard Rawat Inap, bukan
        // section terpisah.
        // ─────────────────────────────────────────────────────────────
        $bedInfo = null;
        if ($can('rawat-inap.view')) {
            $totalKapasitas = (int) Room::sum('kapasitas');
            $totalTerisi = (int) Room::sum('terisi');

            $bedInfo = [
                'total_kapasitas' => $totalKapasitas,
                'terisi'          => $totalTerisi,
                'tersedia'        => max(0, $totalKapasitas - $totalTerisi),
            ];
        }

        // ─────────────────────────────────────────────────────────────
        // ANTREAN & TUGAS HARI INI (gabungan) — di ATAS, langsung
        // setelah Peringatan & Stok Obat.
        // 🔧 SECURITY FIX: role dokter di-scope ke miliknya sendiri untuk
        // Antrian Rawat Jalan, Resep, dan Lab. Apoteker/Laboran/Admin/
        // Super Admin TIDAK di-scope karena mereka mengeksekusi lintas
        // dokter (sesuai RBAC di config/rbac.php).
        // ─────────────────────────────────────────────────────────────
        $antrean = [];

        if ($can('patients.view')) {
            $antrean[] = [
                'key' => 'pasien_baru',
                'variant' => 'simple',
                'title' => 'Pasien Baru Hari Ini',
                'value' => Patient::whereDate('created_at', $today)->count(),
                'description' => 'Pendaftaran pasien yang masuk hari ini',
                'href' => route('patients.index'),
                'tone' => 'blue',
                'icon' => 'users',
            ];
        }

        if ($can('rawat-jalan.view')) {
            $queueQuery = KunjunganRawatJalan::whereDate('tanggal_kunjungan', $today)
                ->whereIn('status', ['menunggu', 'dalam_pemeriksaan'])
                ->when($isDokter, fn ($q) => $q->where('dokter_id', $user->id));

            $queueCount = $queueQuery->count();

            $antrean[] = [
                'key' => 'antrian_rawat_jalan',
                'variant' => 'simple',
                'title' => 'Antrian Rawat Jalan (Hari Ini)',
                'value' => $queueCount,
                'description' => $isDokter
                    ? 'Pasien Anda yang belum diperiksa hari ini'
                    : 'Pasien belum diperiksa dokter hari ini',
                'href' => route('pelayanan.rawat-jalan.index'),
                'tone' => $queueCount > 0 ? 'yellow' : 'green',
                'icon' => 'activity',
            ];
        }

        if ($can('pembayaran.view')) {
            $paymentPending = Pembayaran::where('status', 'menunggu')->count();

            $antrean[] = [
                'key' => 'pembayaran_menunggu',
                'variant' => 'simple',
                'title' => 'Pembayaran Menunggu',
                'value' => $paymentPending,
                'description' => 'Transaksi belum diselesaikan kasir',
                'href' => route('transaksi.pembayaran.index'),
                'tone' => $paymentPending > 0 ? 'red' : 'green',
                'icon' => 'credit-card',
            ];
        }

        if ($can('resep-obat.view')) {
            $resepQuery = ResepObat::with(['pasien:id,full_name', 'dokter:id,name'])
                ->whereIn('status', ['menunggu', 'diproses'])
                // 🔧 SECURITY FIX: dokter hanya lihat resep yang dia tulis
                // sendiri. Apoteker/admin TIDAK di-scope (mereka eksekusi
                // lintas dokter).
                ->when($isDokter, fn ($q) => $q->where('dokter_id', $user->id));

            $resepList = (clone $resepQuery)
                ->orderBy('created_at')
                ->limit(8)
                ->get()
                ->map(fn (ResepObat $r) => [
                    'id' => $r->id,
                    'pasien' => $r->pasien?->full_name ?? '-',
                    'dokter' => $r->dokter?->name ?? '-',
                    'status' => $r->status_label,
                    // 🔧 Sesuaikan nama route ini kalau berbeda di routes/web.php
                    'action_href' => route('pelayanan.resep-obat.show', $r->id),
                ]);

            $resepPending = (clone $resepQuery)->count();

            $antrean[] = [
                'key' => 'resep',
                'variant' => 'resep',
                'title' => 'Resep Menunggu Diproses',
                'value' => $resepPending,
                'description' => $isDokter
                    ? 'Resep yang Anda tulis, belum diserahkan ke pasien'
                    : 'Resep belum diserahkan ke pasien',
                'href' => route('pelayanan.resep-obat.index'),
                'tone' => $resepPending > 0 ? 'yellow' : 'green',
                'icon' => 'pill',
                'items' => $resepList,
            ];
        }

        if ($can('laboratorium.view')) {
            $labQuery = PemeriksaanLab::with(['pasien:id,full_name', 'jenis'])
                ->whereIn('status', ['menunggu', 'proses'])
                // 🔧 SECURITY FIX: dokter hanya lihat pemeriksaan pasiennya
                // sendiri. PemeriksaanLab tidak punya dokter_id langsung,
                // di-scope lewat relasi rekamMedis.kunjungan.dokter_id.
                ->when(
                    $isDokter,
                    fn ($q) => $q->whereHas('rekamMedis.kunjungan', fn ($qq) => $qq->where('dokter_id', $user->id))
                );

            $labList = (clone $labQuery)
                ->orderBy('created_at')
                ->limit(8)
                ->get()
                ->map(fn (PemeriksaanLab $l) => [
                    'id' => $l->id,
                    'pasien' => $l->pasien?->full_name ?? '-',
                    // 🔧 Sesuaikan 'nama_pemeriksaan' kalau kolomnya beda
                    'jenis' => $l->jenis?->nama_pemeriksaan ?? '-',
                    'status' => $l->status_label,
                    'menunggu_sejak' => $l->created_at->diffForHumans(),
                ]);

            $labPending = (clone $labQuery)->count();

            $antrean[] = [
                'key' => 'lab',
                'variant' => 'lab',
                'title' => 'Lab Menunggu Diproses',
                'value' => $labPending,
                'description' => $isDokter
                    ? 'Hasil lab pasien Anda belum selesai diinput'
                    : 'Hasil lab belum selesai diinput',
                'href' => route('pelayanan.laboratorium.index'),
                'tone' => $labPending > 0 ? 'red' : 'green',
                'icon' => 'flask',
                'items' => $labList,
            ];
        }

        if ($can('invoice.view')) {
            $invoiceList = Invoice::with('pasien:id,full_name')
                ->whereIn('status', ['draft', 'terbit'])
                ->orderByDesc('created_at')
                ->limit(8)
                ->get()
                ->map(fn (Invoice $inv) => [
                    'id' => $inv->id,
                    'pasien' => $inv->pasien?->full_name ?? '-',
                    'status' => $inv->status_label,
                    'total' => $inv->total_formatted,
                    'jatuh_tempo' => optional($inv->jatuh_tempo)->translatedFormat('d F Y'),
                    'items' => collect($inv->items ?? [])->map(fn ($item) => [
                        'nama' => $item['nama'] ?? ($item['name'] ?? 'Item'),
                        'jumlah' => $item['jumlah'] ?? ($item['qty'] ?? 1),
                    ])->values(),
                ]);

            $invoicePending = Invoice::whereIn('status', ['draft', 'terbit'])->count();

            $antrean[] = [
                'key' => 'invoice',
                'variant' => 'invoice',
                'title' => 'Invoice Aktif',
                'value' => $invoicePending,
                'description' => 'Invoice yang belum lunas',
                'href' => route('transaksi.invoice.index'),
                'tone' => $invoicePending > 0 ? 'yellow' : 'green',
                'icon' => 'file-text',
                'items' => $invoiceList,
            ];
        }

        // ─────────────────────────────────────────────────────────────
        // OBAT ALERTS (tidak berubah)
        // ─────────────────────────────────────────────────────────────
        $obatAlerts = null;

        if ($can('master-data.medicines.view')) {
            $kolomObat = ['id', 'kode_obat', 'nama_obat', 'kategori', 'satuan', 'stok', 'minimal_stok', 'expired_date', 'status'];

            $obatMenipis = Medicine::active()->lowStock()->select($kolomObat)->orderBy('stok')->limit(10)->get()->append(['stok_status']);
            $obatMendekatiKadaluarsa = Medicine::active()->nearExpiry()->select($kolomObat)->orderBy('expired_date')->limit(10)->get();
            $obatSudahKedaluwarsa = Medicine::active()
                ->whereNotNull('expired_date')
                ->where('expired_date', '<', now()->startOfDay())
                ->select($kolomObat)
                ->orderByDesc('expired_date')
                ->limit(10)
                ->get();

            $obatAlerts = [
                'total_obat_aktif'       => Medicine::active()->count(),
                'total_stok_menipis'     => Medicine::active()->lowStock()->count(),
                'total_near_expiry'      => Medicine::active()->nearExpiry()->count(),
                'total_sudah_kedaluwarsa' => Medicine::active()
                    ->whereNotNull('expired_date')
                    ->where('expired_date', '<', now()->startOfDay())
                    ->count(),
                'stok_menipis' => $obatMenipis->map(fn (Medicine $m) => [
                    'id' => $m->id, 'kode_obat' => $m->kode_obat, 'nama_obat' => $m->nama_obat,
                    'kategori' => $m->kategori, 'satuan' => $m->satuan, 'stok' => $m->stok,
                    'minimal_stok' => $m->minimal_stok, 'stok_status' => $m->stok_status,
                ]),
                'mendekati_kadaluarsa' => $obatMendekatiKadaluarsa->map(fn (Medicine $m) => [
                    'id' => $m->id, 'kode_obat' => $m->kode_obat, 'nama_obat' => $m->nama_obat,
                    'kategori' => $m->kategori, 'stok' => $m->stok,
                    'expired_date' => $m->expired_date?->translatedFormat('d F Y'),
                    'sisa_hari' => $m->expired_date ? now()->startOfDay()->diffInDays($m->expired_date, false) : null,
                ]),
                'sudah_kedaluwarsa' => $obatSudahKedaluwarsa->map(fn (Medicine $m) => [
                    'id' => $m->id, 'kode_obat' => $m->kode_obat, 'nama_obat' => $m->nama_obat,
                    'kategori' => $m->kategori, 'stok' => $m->stok,
                    'expired_date' => $m->expired_date?->translatedFormat('d F Y'),
                    'terlambat_hari' => $m->expired_date ? $m->expired_date->diffInDays(now()->startOfDay()) : null,
                ]),
            ];
        }

        $alerts = [];

        return Inertia::render('dashboard', [
            'stats' => $stats,
            'obatAlerts' => $obatAlerts,
            'finansial' => $finansial,
            'bedInfo' => $bedInfo,
            'antrean' => $antrean,
            'monitoring' => [
                'role_label' => match ($user?->role) {
                    'super_admin' => 'Super Admin',
                    'admin_kasir' => 'Admin / Kasir',
                    'dokter' => 'Dokter',
                    'apoteker' => 'Apoteker',
                    'laboran' => 'Laboran',
                    default => 'Pengguna',
                },
                'updated_at' => now()->translatedFormat('d F Y, H:i'),
                'alerts' => $alerts,
            ],
        ]);
    }
}