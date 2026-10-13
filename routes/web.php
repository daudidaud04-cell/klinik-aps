<?php

use App\Http\Controllers\ActivityLogController;
use App\Http\Controllers\ClinicRateController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\InvoiceController;
use App\Http\Controllers\LabExaminationController;
use App\Http\Controllers\LaboratoriumController;
use App\Http\Controllers\LaporanKeuanganController;
use App\Http\Controllers\LaporanObatController;
use App\Http\Controllers\LaporanPasienController;
use App\Http\Controllers\LaporanRawatInapController;
use App\Http\Controllers\LaporanRekamMedisController;
use App\Http\Controllers\KunjunganRawatJalanController;
use App\Http\Controllers\MedicineController;
use App\Http\Controllers\PatientController;
use App\Http\Controllers\PatientHistoryController;
use App\Http\Controllers\PembayaranController;
use App\Http\Controllers\PengaturanKlinikController;
use App\Http\Controllers\PoliController;
use App\Http\Controllers\RawatInapController;
use App\Http\Controllers\RekamMedisController;
use App\Http\Controllers\ResepObatController;
use App\Http\Controllers\RoomController;
use App\Http\Controllers\SystemUserController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return redirect()->route('login');
})->name('home');

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', DashboardController::class)
        ->middleware('can:dashboard.view')
        ->name('dashboard');

    Route::prefix('master-data')->name('master-data.')->group(function () {
        Route::resource('users', SystemUserController::class)
            ->names([
                'index'   => 'users.index',
                'create'  => 'users.create',
                'store'   => 'users.store',
                'show'    => 'users.show',
                'edit'    => 'users.edit',
                'update'  => 'users.update',
                'destroy' => 'users.destroy',
            ])
            ->middlewareFor(['index', 'show'], 'can:master-data.users.view')
            ->middlewareFor(['create', 'store'], 'can:master-data.users.create')
            ->middlewareFor(['edit', 'update'], 'can:master-data.users.update')
            ->middlewareFor('destroy', 'can:master-data.users.delete');

        Route::resource('polis', PoliController::class)
            ->names([
                'index'   => 'polis.index',
                'create'  => 'polis.create',
                'store'   => 'polis.store',
                'show'    => 'polis.show',
                'edit'    => 'polis.edit',
                'update'  => 'polis.update',
                'destroy' => 'polis.destroy',
            ])
            ->middlewareFor(['index', 'show'], 'can:master-data.polis.view')
            ->middlewareFor(['create', 'store'], 'can:master-data.polis.create')
            ->middlewareFor(['edit', 'update'], 'can:master-data.polis.update')
            ->middlewareFor('destroy', 'can:master-data.polis.delete');

        Route::resource('rooms', RoomController::class)
            ->names([
                'index'   => 'rooms.index',
                'create'  => 'rooms.create',
                'store'   => 'rooms.store',
                'show'    => 'rooms.show',
                'edit'    => 'rooms.edit',
                'update'  => 'rooms.update',
                'destroy' => 'rooms.destroy',
            ])
            ->middlewareFor(['index', 'show'], 'can:master-data.rooms.view')
            ->middlewareFor(['create', 'store'], 'can:master-data.rooms.create')
            ->middlewareFor(['edit', 'update'], 'can:master-data.rooms.update')
            ->middlewareFor('destroy', 'can:master-data.rooms.delete');
    });

    Route::resource('patients', PatientController::class)
        ->middlewareFor(['index', 'show'], 'can:patients.view')
        ->middlewareFor(['create', 'store'], 'can:patients.create')
        ->middlewareFor(['edit', 'update'], 'can:patients.update')
        ->middlewareFor('destroy', 'can:patients.delete');

    Route::resource('medicines', MedicineController::class)
        ->middlewareFor(['index', 'show'], 'can:master-data.medicines.view')
        ->middlewareFor(['create', 'store'], 'can:master-data.medicines.create')
        ->middlewareFor(['edit', 'update'], 'can:master-data.medicines.update')
        ->middlewareFor('destroy', 'can:master-data.medicines.delete');

    Route::resource('lab-examinations', LabExaminationController::class)
        ->middlewareFor(['index', 'show'], 'can:master-data.lab-examinations.view')
        ->middlewareFor(['create', 'store'], 'can:master-data.lab-examinations.create')
        ->middlewareFor(['edit', 'update'], 'can:master-data.lab-examinations.update')
        ->middlewareFor('destroy', 'can:master-data.lab-examinations.delete');

    Route::resource('clinic-rates', ClinicRateController::class)
        ->middlewareFor(['index', 'show'], 'can:master-data.clinic-rates.view')
        ->middlewareFor(['create', 'store'], 'can:master-data.clinic-rates.create')
        ->middlewareFor(['edit', 'update'], 'can:master-data.clinic-rates.update')
        ->middlewareFor('destroy', 'can:master-data.clinic-rates.delete');

    Route::resource('patient-histories', PatientHistoryController::class)
        ->middlewareFor(['index', 'show'], 'can:patient-histories.view')
        ->middlewareFor(['create', 'store'], 'can:patient-histories.create')
        ->middlewareFor(['edit', 'update'], 'can:patient-histories.update')
        ->middlewareFor('destroy', 'can:patient-histories.delete');

    Route::prefix('pelayanan')->name('pelayanan.')->group(function () {
    Route::resource('rawat-jalan', KunjunganRawatJalanController::class)
        ->parameters(['rawat-jalan' => 'rawatJalan'])
        ->middlewareFor(['index', 'show'], 'can:rawat-jalan.view')
        ->middlewareFor(['create', 'store'], 'can:rawat-jalan.create')
        ->middlewareFor(['edit', 'update'], 'can:rawat-jalan.update')
        ->middlewareFor('destroy', 'can:rawat-jalan.delete');

    Route::resource('rawat-inap', RawatInapController::class)
        ->parameters(['rawat-inap' => 'rawatInap'])
        ->middlewareFor(['index', 'show'], 'can:rawat-inap.view')
        ->middlewareFor(['create', 'store'], 'can:rawat-inap.create')
        ->middlewareFor(['edit', 'update'], 'can:rawat-inap.update')
        ->middlewareFor('destroy', 'can:rawat-inap.delete');

    // 🆕 Pindah kamar — di luar resource karena bukan CRUD standar.
    // Ditaruh di dalam group ini supaya otomatis dapat prefix path
    // '/pelayanan/' dan prefix nama 'pelayanan.', konsisten dengan resource
    // rawat-inap di atasnya. Permission memakai 'rawat-inap.update' karena
    // secara konsep ini adalah bentuk lain dari mengubah data rawat inap.
    Route::put('rawat-inap/{rawatInap}/pindah-kamar', [RawatInapController::class, 'pindahKamar'])
        ->name('rawat-inap.pindah-kamar')
        ->middleware('can:rawat-inap.update');

    Route::resource('rekam-medis', RekamMedisController::class)
        ->parameters(['rekam-medis' => 'rekamMedis'])
        ->only(['index', 'create', 'store', 'show'])
        ->middlewareFor(['index', 'show'], 'can:rekam-medis.view')
        ->middlewareFor(['create', 'store'], 'can:rekam-medis.create');

    Route::resource('laboratorium', LaboratoriumController::class)
        ->parameters(['laboratorium' => 'laboratorium'])
        ->middlewareFor(['index', 'show'], 'can:laboratorium.view')
        ->middlewareFor(['create', 'store'], 'can:laboratorium.create')
        ->middlewareFor(['edit', 'update'], 'can:laboratorium.update')
        ->middlewareFor('destroy', 'can:laboratorium.delete');

    Route::resource('resep-obat', ResepObatController::class)
        ->parameters(['resep-obat' => 'resepObat'])
        ->middlewareFor(['index', 'show'], 'can:resep-obat.view')
        ->middlewareFor(['create', 'store'], 'can:resep-obat.create')
        ->middlewareFor(['edit', 'update'], 'can:resep-obat.update')
        ->middlewareFor('destroy', 'can:resep-obat.delete');
});

    Route::prefix('transaksi')->name('transaksi.')->group(function () {
        Route::resource('pembayaran', PembayaranController::class)
            ->parameters(['pembayaran' => 'pembayaran'])
            ->only(['index', 'create', 'store', 'show', 'update'])
            ->middlewareFor(['index', 'show'], 'can:pembayaran.view')
            ->middlewareFor(['create', 'store'], 'can:pembayaran.create')
            ->middlewareFor('update', 'can:pembayaran.update');

        Route::resource('invoice', InvoiceController::class)
            ->parameters(['invoice' => 'invoice'])
            ->only(['index', 'show'])
            ->middlewareFor(['index', 'show'], 'can:invoice.view');
    });

    Route::prefix('laporan')->name('laporan.')->group(function () {
        Route::get('pasien', LaporanPasienController::class)
            ->middleware('can:laporan.pasien.view')
            ->name('pasien');

        Route::get('rekam-medis', LaporanRekamMedisController::class)
            ->middleware('can:laporan.rekam-medis.view')
            ->name('rekam-medis');

        Route::get('rawat-inap', LaporanRawatInapController::class)
            ->middleware('can:laporan.rawat-inap.view')
            ->name('rawat-inap');

        Route::get('obat', LaporanObatController::class)
            ->middleware('can:laporan.obat.view')
            ->name('obat');

        Route::get('keuangan', LaporanKeuanganController::class)
            ->middleware('can:laporan.keuangan.view')
            ->name('keuangan');
    });

    Route::prefix('sistem')->name('sistem.')->group(function () {
        Route::get('activity-log', ActivityLogController::class)
            ->middleware('can:system.activity-log.view')
            ->name('activity-log');

        Route::get('pengaturan', [PengaturanKlinikController::class, 'edit'])
            ->middleware('can:system.pengaturan.manage')
            ->name('pengaturan.edit');

        Route::put('pengaturan', [PengaturanKlinikController::class, 'update'])
            ->middleware('can:system.pengaturan.manage')
            ->name('pengaturan.update');
    });
});

require __DIR__ . '/settings.php';
