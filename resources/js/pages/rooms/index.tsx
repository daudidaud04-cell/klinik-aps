import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Eye, Pencil, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Kamar', href: '/master-data/rooms' },
];

interface Room {
    id: number;
    kode_kamar: string;
    nama_kamar: string;
    kelas: string;
    kapasitas: number;
    terisi: number;
    tarif_harian: number;
    status: string;
}

interface Filters {
    search?: string;
    kelas?: string;
    status?: string;
}

interface Props {
    rooms: {
        data: Room[];
        current_page: number;
        last_page: number;
        total: number;
    };
    filters: Filters;
}

export default function RoomsIndex({ rooms, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [kelas, setKelas] = useState(filters.kelas ?? '');
    const [status, setStatus] = useState(filters.status ?? '');

    const handleSearch = () => {
        router.get('/master-data/rooms', {
            search: search || undefined,
            kelas: kelas || undefined,
            status: status || undefined,
        }, { preserveState: true, replace: true });
    };

    const handleReset = () => {
        setSearch('');
        setKelas('');
        setStatus('');
        router.get('/master-data/rooms', {}, { preserveState: true, replace: true });
    };

    const handleDelete = (id: number) => {
        router.delete(`/master-data/rooms/${id}`, { preserveScroll: true });
    };

    const formatRupiah = (value: number) => 'Rp ' + Number(value).toLocaleString('id-ID');

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

    const hasFilters = search || kelas || status;

    return (
        <>
            <Head title="Data Kamar" />

            <div className="flex flex-1 flex-col gap-4 p-4">
                <div className="bg-background rounded-xl border p-6">
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold">Data Kamar</h1>
                            <p className="text-muted-foreground">
                                Kelola data kamar rawat inap
                                {rooms.total > 0 && <span className="ml-1 text-sm">({rooms.total} kamar)</span>}
                            </p>
                        </div>
                        <Button asChild>
                            <Link href="/master-data/rooms/create">Tambah Kamar</Link>
                        </Button>
                    </div>

                    <div className="mb-4 flex flex-wrap gap-3">
                        <div className="relative flex-1 min-w-[200px]">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Cari kode atau nama kamar..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                className="pl-9"
                            />
                        </div>

                        <Select value={kelas || 'all'} onValueChange={(v) => setKelas(v === 'all' ? '' : v)}>
                            <SelectTrigger className="w-[150px]">
                                <SelectValue placeholder="Semua Kelas" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Kelas</SelectItem>
                                <SelectItem value="VIP">VIP</SelectItem>
                                <SelectItem value="Kelas 1">Kelas 1</SelectItem>
                                <SelectItem value="Kelas 2">Kelas 2</SelectItem>
                                <SelectItem value="Kelas 3">Kelas 3</SelectItem>
                                <SelectItem value="Isolasi">Isolasi</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={status || 'all'} onValueChange={(v) => setStatus(v === 'all' ? '' : v)}>
                            <SelectTrigger className="w-[150px]">
                                <SelectValue placeholder="Semua Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Status</SelectItem>
                                <SelectItem value="tersedia">Tersedia</SelectItem>
                                <SelectItem value="penuh">Penuh</SelectItem>
                                <SelectItem value="maintenance">Maintenance</SelectItem>
                            </SelectContent>
                        </Select>

                        <Button onClick={handleSearch}>
                            <Search className="mr-2 h-4 w-4" />
                            Cari
                        </Button>

                        {hasFilters && (
                            <Button variant="outline" onClick={handleReset}>
                                Reset
                            </Button>
                        )}
                    </div>

                    <div className="overflow-hidden rounded-lg border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Kode</TableHead>
                                    <TableHead>Nama Kamar</TableHead>
                                    <TableHead>Kelas</TableHead>
                                    <TableHead>Kapasitas</TableHead>
                                    <TableHead>Tarif/Hari</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {rooms?.data?.length > 0 ? (
                                    rooms.data.map((room) => (
                                        <TableRow key={room.id}>
                                            <TableCell>{room.kode_kamar}</TableCell>
                                            <TableCell>{room.nama_kamar}</TableCell>
                                            <TableCell>{room.kelas}</TableCell>
                                            <TableCell>{room.terisi}/{room.kapasitas}</TableCell>
                                            <TableCell>{formatRupiah(room.tarif_harian)}</TableCell>
                                            <TableCell>
                                                <Badge variant={statusColor(room.status) as any}>
                                                    {statusLabel(room.status)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="outline" size="sm" asChild>
                                                        <Link href={`/master-data/rooms/${room.id}`}>
                                                            <Eye className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                    <Button variant="outline" size="sm" asChild>
                                                        <Link href={`/master-data/rooms/${room.id}/edit`}>
                                                            <Pencil className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button variant="destructive" size="sm">
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Hapus Kamar?</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    Data kamar <strong>{room.nama_kamar}</strong> akan dihapus. Tindakan ini tidak dapat dibatalkan.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                                                <AlertDialogAction onClick={() => handleDelete(room.id)}>
                                                                    Ya, Hapus
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={7} className="py-6 text-center text-muted-foreground">
                                            {hasFilters ? 'Tidak ada data yang sesuai filter' : 'Belum ada data kamar'}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>
        </>
    );
}

RoomsIndex.layout = {
    breadcrumbs,
};