import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Kamar', href: '/master-data/rooms' },
    { title: 'Detail Kamar', href: '#' },
];

interface Room {
    id: number;
    kode_kamar: string;
    nama_kamar: string;
    kelas: string;
    kapasitas: number;
    terisi: number;
    tarif_harian: number;
    fasilitas: string | null;
    status: string;
}

interface Props {
    room: Room;
}

function Info({ label, value }: { label: string; value: string | number | null | undefined }) {
    return (
        <div>
            <p className="text-muted-foreground text-sm">{label}</p>
            <p className="font-medium">{value ?? '-'}</p>
        </div>
    );
}

export default function ShowRoom({ room }: Props) {
    const formatRupiah = (value: number) =>
        'Rp ' + Number(value).toLocaleString('id-ID');

    const statusColor = (status: string) => {
        if (status === 'tersedia') return 'default';
        if (status === 'penuh') return 'destructive';
        return 'secondary';
    };

    const statusLabel = (status: string) => {
        if (status === 'tersedia') return 'Tersedia';
        if (status === 'penuh') return 'Penuh';
        return 'Maintenance';
    };

    return (
        <>
            <Head title={`Detail Kamar - ${room.nama_kamar}`} />

            <div className="flex flex-1 flex-col gap-4 p-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Detail Kamar</CardTitle>
                        <div className="flex gap-2">
                            <Button variant="outline" asChild>
                                <Link href="/master-data/rooms">Kembali</Link>
                            </Button>
                            <Button asChild>
                                <Link href={`/master-data/rooms/${room.id}/edit`}>Edit</Link>
                            </Button>
                        </div>
                    </CardHeader>

                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2">
                            <Info label="Kode Kamar" value={room.kode_kamar} />
                            <Info label="Nama Kamar" value={room.nama_kamar} />
                            <Info label="Kelas" value={room.kelas} />
                            <Info label="Kapasitas" value={`${room.terisi}/${room.kapasitas} tempat tidur`} />
                            <Info label="Tarif Harian" value={formatRupiah(room.tarif_harian)} />
                            <div>
                                <p className="text-muted-foreground text-sm">Status</p>
                                <Badge variant={statusColor(room.status) as any}>
                                    {statusLabel(room.status)}
                                </Badge>
                            </div>
                        </div>

                        {room.fasilitas && (
                            <div className="mt-6">
                                <h3 className="mb-2 font-semibold">Fasilitas</h3>
                                <div className="rounded-lg border p-3">{room.fasilitas}</div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

ShowRoom.layout = {
    breadcrumbs,
};