import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { SystemUserForm } from './components/system-user-form';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'System Users', href: '/master-data/users' },
    { title: 'Edit User', href: '#' },
];

interface SystemUser {
    id: number;
    name: string;
    email: string;
    role: string;
    phone: string | null;
    gender: string | null;
    address: string | null;
    specialization: string | null;
    employee_status: string;
}

interface Props {
    user: SystemUser;
}

export default function EditSystemUser({ user }: Props) {
    return (
        <>
            <Head title="Edit User" />
            <div className="flex flex-1 flex-col gap-4 p-4">
                <div className="bg-background rounded-xl border p-6">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold">Edit User</h1>
                        <p className="text-muted-foreground">Perbarui data pengguna sistem.</p>
                    </div>
                    <SystemUserForm user={user} isEdit={true} />
                </div>
            </div>
        </>
    );
}

EditSystemUser.layout = {
    breadcrumbs,
};