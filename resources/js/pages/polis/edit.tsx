import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { PoliForm } from './components/poli-form';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Poli', href: '/master-data/polis' },
    { title: 'Edit Poli', href: '#' },
];

interface Doctor {
    id: number;
    name: string;
    specialization: string | null;
}

interface Poli {
    id: number;
    kode_poli: string;
    nama_poli: string;
    deskripsi: string | null;
    // 🔧 FIX: doctor_id tunggal diganti jadi relasi doctors (array)
    doctors?: Doctor[];
    jadwal: string | null;
    status: string;
}

interface Props {
    poli: Poli;
    doctors: Doctor[];
}

export default function EditPoli({ poli, doctors }: Props) {
    return (
        <>
            <Head title="Edit Poli" />
            <div className="flex flex-1 flex-col gap-4 p-4">
                <div className="bg-background rounded-xl border p-6">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold">Edit Poli</h1>
                        <p className="text-muted-foreground">Perbarui data poli klinik.</p>
                    </div>
                    <PoliForm poli={poli} doctors={doctors} isEdit={true} />
                </div>
            </div>
        </>
    );
}

EditPoli.layout = {
    breadcrumbs,
};