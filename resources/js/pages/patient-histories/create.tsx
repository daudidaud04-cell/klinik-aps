import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { PatientHistoryForm } from './components/patient-history-form';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Riwayat Pasien', href: '/patient-histories' },
    { title: 'Tambah Riwayat', href: '/patient-histories/create' },
];

interface Props {
    patients: { id: number; full_name: string; medical_record_number: string }[];
    doctors: { id: number; name: string; specialization?: string | null }[];
    polis: { id: number; nama_poli: string }[];
}

export default function CreatePatientHistory({ patients, doctors, polis }: Props) {
    return (
        <>
            <Head title="Tambah Riwayat Pasien" />
            <div className="flex flex-1 flex-col gap-4 p-4">
                <div className="bg-background rounded-xl border p-6">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold">Tambah Riwayat Pasien</h1>
                        <p className="text-muted-foreground">Catat kunjungan atau tindakan medis baru.</p>
                    </div>
                    <PatientHistoryForm patients={patients} doctors={doctors} polis={polis} />
                </div>
            </div>
        </>
    );
}

CreatePatientHistory.layout = {
    breadcrumbs,
};