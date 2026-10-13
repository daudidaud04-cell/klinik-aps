import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Patient } from '@/types/patient';
import { PatientForm } from './components/patient-form';

interface Props {
    patient: Patient;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Pasien', href: '/patients' },
    { title: 'Edit Pasien', href: '#' },
];

export default function EditPatient({ patient }: Props) {
    return (
        <>
            <Head title="Edit Pasien" />
            <div className="flex flex-1 flex-col gap-4 p-4">
                <div className="bg-background rounded-xl border p-6">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold">Edit Pasien</h1>
                        <p className="text-muted-foreground">Perbarui data pasien.</p>
                    </div>
                    <PatientForm patient={patient} isEdit={true} />
                </div>
            </div>
        </>
    );
}

EditPatient.layout = {
    breadcrumbs,
};