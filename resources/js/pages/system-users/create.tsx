import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { SystemUserForm } from './components/system-user-form';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'System Users', href: '/master-data/users' },
    { title: 'Tambah User', href: '/master-data/users/create' },
];

export default function CreateSystemUser() {
    return (
        <>
            <Head title="Tambah User" />
            <div className="flex flex-1 flex-col gap-4 p-4">
                <div className="bg-background rounded-xl border p-6">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold">Tambah User</h1>
                        <p className="text-muted-foreground">Tambah pengguna sistem klinik baru.</p>
                    </div>
                    <SystemUserForm />
                </div>
            </div>
        </>
    );
}

CreateSystemUser.layout = {
    breadcrumbs,
};