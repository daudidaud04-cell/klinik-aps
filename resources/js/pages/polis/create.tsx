import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { PoliForm } from './components/poli-form';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Poli', href: '/master-data/polis' },
    { title: 'Tambah Poli', href: '/master-data/polis/create' },
];

interface Doctor {
    id: number;
    name: string;
    specialization: string | null;
}

interface Props {
    doctors: Doctor[];
}

export default function CreatePoli({ doctors }: Props) {
    return (
        <>
            <Head title="Tambah Poli" />
            <div className="flex flex-1 flex-col gap-4 p-4">
                <div className="bg-background rounded-xl border p-6">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold">Tambah Poli</h1>
                        <p className="text-muted-foreground">Tambah data poli klinik baru.</p>
                    </div>
                    <PoliForm doctors={doctors} />
                </div>
            </div>
        </>
    );
}

CreatePoli.layout = {
    breadcrumbs,
};