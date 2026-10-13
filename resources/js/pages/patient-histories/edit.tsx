import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { PatientHistoryForm } from './components/patient-history-form';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Riwayat Pasien', href: '/patient-histories' },
    { title: 'Edit Riwayat', href: '#' },
];

interface History {
    id: number;
    patient_id: number;
    type: string;
    doctor_id: number | null;
    poli_id: number | null;
    visit_date: string;
    chief_complaint: string | null;
    diagnosis_summary: string | null;
    total_biaya: number;
    status_bayar: string;
}

interface Props {
    history: History;
    patients: { id: number; full_name: string; medical_record_number: string }[];
    doctors: { id: number; name: string; specialization?: string | null }[];
    polis: { id: number; nama_poli: string }[];
}

export default function EditPatientHistory({ history, patients, doctors, polis }: Props) {
    return (
        <>
            <Head title="Edit Riwayat Pasien" />
            <div className="flex flex-1 flex-col gap-4 p-4">
                <div className="bg-background rounded-xl border p-6">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold">Edit Riwayat Pasien</h1>
                        <p className="text-muted-foreground">Perbarui data riwayat kunjungan.</p>
                    </div>
                    <PatientHistoryForm history={history} patients={patients} doctors={doctors} polis={polis} isEdit={true} />
                </div>
            </div>
        </>
    );
}

EditPatientHistory.layout = {
    breadcrumbs,
};