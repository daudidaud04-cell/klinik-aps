import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { PatientForm } from './components/patient-form';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Pasien', href: '/patients' },
    { title: 'Tambah Pasien', href: '/patients/create' },
];

export default function CreatePatient() {
    return (
        <>
            <Head title="Tambah Pasien" />
            <div className="flex flex-1 flex-col gap-4 p-4">
                <PatientForm />
            </div>
        </>
    );
}

CreatePatient.layout = {
    breadcrumbs,
};