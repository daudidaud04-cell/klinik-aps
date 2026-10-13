import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { RoomForm } from './components/room-form';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Kamar', href: '/master-data/rooms' },
    { title: 'Tambah Kamar', href: '/master-data/rooms/create' },
];

export default function CreateRoom() {
    return (
        <>
            <Head title="Tambah Kamar" />
            <div className="flex flex-1 flex-col gap-4 p-4">
                <div className="bg-background rounded-xl border p-6">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold">Tambah Kamar</h1>
                        <p className="text-muted-foreground">Tambah data kamar rawat inap baru.</p>
                    </div>
                    <RoomForm />
                </div>
            </div>
        </>
    );
}

CreateRoom.layout = {
    breadcrumbs,
};