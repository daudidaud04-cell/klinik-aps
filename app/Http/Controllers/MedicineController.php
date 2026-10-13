<?php

namespace App\Http\Controllers;

use App\Http\Requests\Medicine\StoreMedicineRequest;
use App\Http\Requests\Medicine\UpdateMedicineRequest;
use App\Models\Medicine;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MedicineController extends Controller
{
    /**
     * 🔧 FIX: whitelist kolom yang boleh dipakai untuk sorting.
     * Mencegah orderBy() menerima nama kolom sembarangan dari query string.
     */
    private const SORTABLE_COLUMNS = [
        'nama_obat', 'kode_obat', 'kategori', 'stok',
        'minimal_stok', 'harga_beli', 'harga_jual', 'expired_date', 'status',
    ];

    public function index(Request $request): Response
    {
        // 🔧 FIX: default urutan sekarang berdasarkan STOK (kecil -> besar),
        // supaya obat yang stoknya menipis/hampir habis otomatis tampil
        // paling atas, dan stok yang masih banyak di bagian bawah.
        // User tetap bisa override lewat query string ?sort_by=nama_obat dst.
        $sortBy = $request->string('sort_by', 'stok')->value();
        $sortDir = $request->string('sort_dir', 'asc')->value();

        // 🔧 FIX: fallback ke default kalau kolom/arah sort tidak valid
        if (! in_array($sortBy, self::SORTABLE_COLUMNS, true)) {
            $sortBy = 'stok';
        }
        if (! in_array(strtolower($sortDir), ['asc', 'desc'], true)) {
            $sortDir = 'asc';
        }

        // 🔧 FIX: batasi per_page supaya tidak bisa diminta tak terbatas
        $perPage = min($request->integer('per_page', 15), 100);

        $medicines = Medicine::query()
            ->search($request->string('search')->trim()->value())
            ->when($request->kategori, fn ($q, $v) => $q->where('kategori', $v))
            ->when($request->status, fn ($q, $v) => $q->where('status', $v))
            ->orderBy($sortBy, $sortDir)
            ->paginate($perPage)
            ->withQueryString();

        // 🔧 FIX: field turunan (stok_status, is_low_stock, harga_jual_formatted,
        // margin, dst) tidak lagi otomatis muncul sejak $appends di model
        // dikosongkan. Karena di sini semua kolom sudah ter-load (tidak ada
        // select() terbatas), aman untuk di-append eksplisit.
        $medicines->getCollection()->each->append(Medicine::DERIVED_ATTRIBUTES);

        return Inertia::render('medicines/index', [
            'medicines' => $medicines,
            'filters'   => $request->only(['search', 'kategori', 'status', 'sort_by', 'sort_dir', 'per_page']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('medicines/create');
    }

    public function store(StoreMedicineRequest $request): RedirectResponse
    {
        Medicine::create($request->validated());

        return redirect()
            ->route('medicines.index')
            ->with('success', 'Data obat berhasil ditambahkan.');
    }

    public function show(Medicine $medicine): Response
    {
        // 🔧 FIX: sama seperti index, append manual supaya badge/label turunan
        // (stok menipis, kedaluwarsa, margin, dll) tetap muncul di halaman detail.
        $medicine->append(Medicine::DERIVED_ATTRIBUTES);

        return Inertia::render('medicines/show', [
            'medicine' => $medicine,
        ]);
    }

    public function edit(Medicine $medicine): Response
    {
        // 🔧 FIX: expired_date di-cast sebagai 'date' (Carbon) di Model, yang
        // saat diserialize ke JSON otomatis menjadi ISO datetime penuh
        // (mis. "2026-08-15T00:00:00.000000Z"). Format ini TIDAK valid untuk
        // <input type="date"> di frontend (yang hanya menerima "YYYY-MM-DD"),
        // sehingga field tampak kosong di form edit meski datanya ada.
        //
        // Format eksplisit ke Y-m-d di sini supaya form edit terisi dengan
        // benar dan tidak berisiko menimpa tanggal yang sudah ada dengan
        // nilai kosong saat form di-submit ulang.
        return Inertia::render('medicines/edit', [
            'medicine' => [
                ...$medicine->toArray(),
                'expired_date' => $medicine->expired_date?->format('Y-m-d'),
            ],
        ]);
    }

    public function update(UpdateMedicineRequest $request, Medicine $medicine): RedirectResponse
    {
        $medicine->update($request->validated());

        return redirect()
            ->route('medicines.index')
            ->with('success', 'Data obat berhasil diperbarui.');
    }

    public function destroy(Medicine $medicine): RedirectResponse
    {
        $medicine->delete();

        return redirect()
            ->route('medicines.index')
            ->with('success', 'Data obat berhasil dihapus.');
    }
}