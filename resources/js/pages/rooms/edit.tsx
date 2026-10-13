import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { RoomForm } from './components/room-form';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Kamar', href: '/master-data/rooms' },
    { title: 'Edit Kamar', href: '#' },
];

interface Room {
    id: number;
    kode_kamar: string;
    nama_kamar: string;
    kelas: string;
    kapasitas: number;
    tarif_harian: number;
    fasilitas: string | null;
    status: string;
}

interface Props {
    room: Room;
}

export default function EditRoom({ room }: Props) {
    return (
        <>
            <Head title="Edit Kamar" />
            <div className="flex flex-1 flex-col gap-4 p-4">
                <div className="bg-background rounded-xl border p-6">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold">Edit Kamar</h1>
                        <p className="text-muted-foreground">Perbarui data kamar rawat inap.</p>
                    </div>
                    <RoomForm room={room} isEdit={true} />
                </div>
            </div>
        </>
    );
}

EditRoom.layout = {
    breadcrumbs,
};