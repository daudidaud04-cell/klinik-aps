<?php

use App\Enums\Role;

$dashboardPermissions = [
    'dashboard.view',
];

$patientPermissions = [
    'patients.view',
    'patients.create',
    'patients.update',
    'patients.delete',
    'patient-histories.view',
    'patient-histories.create',
    'patient-histories.update',
    'patient-histories.delete',
];

$clinicalPermissions = [
    'rawat-jalan.view',
    'rawat-jalan.create',
    'rawat-jalan.update',
    'rawat-jalan.delete',
    'rawat-inap.view',
    'rawat-inap.create',
    'rawat-inap.update',
    'rawat-inap.delete',
    'rekam-medis.view',
    'rekam-medis.create',
    'rekam-medis.update',
    'rekam-medis.delete',
    'laboratorium.view',
    'laboratorium.create',
    'laboratorium.update',
    'laboratorium.delete',
    'resep-obat.view',
    'resep-obat.create',
    'resep-obat.update',
    'resep-obat.delete',
];

$transactionPermissions = [
    'pembayaran.view',
    'pembayaran.create',
    'pembayaran.update',
    'pembayaran.delete',
    'invoice.view',
];

$masterDataPermissions = [
    'master-data.polis.view',
    'master-data.polis.create',
    'master-data.polis.update',
    'master-data.polis.delete',
    'master-data.rooms.view',
    'master-data.rooms.create',
    'master-data.rooms.update',
    'master-data.rooms.delete',
    'master-data.users.view',
    'master-data.users.create',
    'master-data.users.update',
    'master-data.users.delete',
    'master-data.medicines.view',
    'master-data.medicines.create',
    'master-data.medicines.update',
    'master-data.medicines.delete',
    'master-data.lab-examinations.view',
    'master-data.lab-examinations.create',
    'master-data.lab-examinations.update',
    'master-data.lab-examinations.delete',
    'master-data.clinic-rates.view',
    'master-data.clinic-rates.create',
    'master-data.clinic-rates.update',
    'master-data.clinic-rates.delete',
];

$reportPermissions = [
    'laporan.pasien.view',
    'laporan.pasien.export',
    'laporan.rekam-medis.view',
    'laporan.rekam-medis.export',
    'laporan.rawat-inap.view',
    'laporan.rawat-inap.export',
    'laporan.obat.view',
    'laporan.obat.export',
    'laporan.keuangan.view',
    'laporan.keuangan.export',
];

$systemPermissions = [
    'system.activity-log.view',
    'system.pengaturan.manage',
];

$allPermissions = array_values(array_unique(array_merge(
    $dashboardPermissions,
    $patientPermissions,
    $clinicalPermissions,
    $transactionPermissions,
    $masterDataPermissions,
    $reportPermissions,
    $systemPermissions,
)));

return [
    'permissions' => [
        'dashboard' => $dashboardPermissions,
        'patients' => $patientPermissions,
        'clinical' => $clinicalPermissions,
        'transactions' => $transactionPermissions,
        'master_data' => $masterDataPermissions,
        'reports' => $reportPermissions,
        'system' => $systemPermissions,
    ],

    'roles' => [
        Role::SuperAdmin->value => ['*'],

        Role::AdminKasir->value => [
            'dashboard.view',

            'patients.view',
            'patients.create',
            'patients.update',
            'patients.delete',
            'patient-histories.view',
            'patient-histories.create',
            'patient-histories.update',
            'patient-histories.delete',

            'rawat-jalan.view',
            'rawat-jalan.create',
            'rawat-inap.view',
            'rawat-inap.create',

            'rekam-medis.view',
            'laboratorium.view',
            'resep-obat.view',

            'pembayaran.view',
            'pembayaran.create',
            'pembayaran.update',
            'pembayaran.delete',
            'invoice.view',

            'laporan.pasien.view',
            'laporan.pasien.export',
            'laporan.rekam-medis.view',
            'laporan.rawat-inap.view',
            'laporan.rawat-inap.export',
            'laporan.obat.view',
            'laporan.keuangan.view',
            'laporan.keuangan.export',
        ],

        Role::Dokter->value => [
            'dashboard.view',

            'patients.view',
            'patient-histories.view',

            'rawat-jalan.view',
            'rawat-jalan.create',
            'rawat-jalan.update',
            'rawat-jalan.delete',
            'rawat-inap.view',
            'rawat-inap.create',
            'rawat-inap.update',
            'rawat-inap.delete',
            'rekam-medis.view',
            'rekam-medis.create',
            'rekam-medis.update',
            'rekam-medis.delete',
            'laboratorium.view',
            'laboratorium.create',
            'laboratorium.update',
            'laboratorium.delete',
            'resep-obat.view',
            'resep-obat.create',
            'resep-obat.update',
            'resep-obat.delete',
        ],

        Role::Apoteker->value => [
            'dashboard.view',

            'master-data.medicines.view',
            'master-data.medicines.create',
            'master-data.medicines.update',
            'master-data.medicines.delete',

            'resep-obat.view',
            'resep-obat.create',
            'resep-obat.update',
            'resep-obat.delete',
        ],

        Role::Laboran->value => [
            'dashboard.view',

            'master-data.lab-examinations.view',
            'master-data.lab-examinations.create',
            'master-data.lab-examinations.update',
            'master-data.lab-examinations.delete',

            'laboratorium.view',
            'laboratorium.create',
            'laboratorium.update',
            'laboratorium.delete',
        ],
    ],

    'all' => $allPermissions,
];
