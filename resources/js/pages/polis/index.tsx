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
    { title: 'Poli', href: '/master-data/polis' },
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
    jadwal: string | null;
    status: string;
    // 🔧 FIX: doctor (tunggal) diganti jadi doctors (array)
    doctors: Doctor[];
}

interface Filters {
    search?: string;
    status?: string;
}

interface Props {
    polis: {
        data: Poli[];
        current_page: number;
        last_page: number;
        total: number;
    };
    filters: Filters;
}

export default function PolisIndex({ polis, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState(filters.status ?? '');

    const handleSearch = () => {
        router.get('/master-data/polis', {
            search: search || undefined,
            status: status || undefined,
        }, { preserveState: true, replace: true });
    };

    const handleReset = () => {
        setSearch('');
        setStatus('');
        router.get('/master-data/polis', {}, { preserveState: true, replace: true });
    };

    const handleDelete = (id: number) => {
        router.delete(`/master-data/polis/${id}`, { preserveScroll: true });
    };

    const hasFilters = search || status;

    // 🔧 FIX: helper untuk merangkai nama-nama dokter jadi satu string,
    // dipakai di kolom tabel supaya tetap ringkas dibaca.
    const formatDoctors = (doctors: Doctor[]) => {
        if (!doctors || doctors.length === 0) return '-';
        return doctors
            .map((d) => `${d.name}${d.specialization ? ` (${d.specialization})` : ''}`)
            .join(', ');
    };

    return (
        <>
            <Head title="Data Poli" />

            <div className="flex flex-1 flex-col gap-4 p-4">
                <div className="bg-background rounded-xl border p-6">
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold">Data Poli</h1>
                            <p className="text-muted-foreground">
                                Kelola data poli klinik
                                {polis.total > 0 && <span className="ml-1 text-sm">({polis.total} poli)</span>}
                            </p>
                        </div>
                        <Button asChild>
                            <Link href="/master-data/polis/create">Tambah Poli</Link>
                        </Button>
                    </div>

                    <div className="mb-4 flex flex-wrap gap-3">
                        <div className="relative flex-1 min-w-[200px]">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Cari kode atau nama poli..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                className="pl-9"
                            />
                        </div>

                        <Select value={status || 'all'} onValueChange={(v) => setStatus(v === 'all' ? '' : v)}>
                            <SelectTrigger className="w-[150px]">
                                <SelectValue placeholder="Semua Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Status</SelectItem>
                                <SelectItem value="aktif">Aktif</SelectItem>
                                <SelectItem value="nonaktif">Nonaktif</SelectItem>
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
                                    <TableHead>Nama Poli</TableHead>
                                    <TableHead>Dokter</TableHead>
                                    <TableHead>Jadwal</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {polis?.data?.length > 0 ? (
                                    polis.data.map((poli) => (
                                        <TableRow key={poli.id}>
                                            <TableCell>{poli.kode_poli}</TableCell>
                                            <TableCell>{poli.nama_poli}</TableCell>
                                            <TableCell className="max-w-[250px]">
                                                {formatDoctors(poli.doctors)}
                                            </TableCell>
                                            <TableCell>{poli.jadwal ?? '-'}</TableCell>
                                            <TableCell>
                                                <Badge variant={poli.status === 'aktif' ? 'default' : 'secondary'}>
                                                    {poli.status === 'aktif' ? 'Aktif' : 'Nonaktif'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="outline" size="sm" asChild>
                                                        <Link href={`/master-data/polis/${poli.id}`}>
                                                            <Eye className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                    <Button variant="outline" size="sm" asChild>
                                                        <Link href={`/master-data/polis/${poli.id}/edit`}>
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
                                                                <AlertDialogTitle>Hapus Poli?</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    Data poli <strong>{poli.nama_poli}</strong> akan dihapus. Tindakan ini tidak dapat dibatalkan.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                                                <AlertDialogAction onClick={() => handleDelete(poli.id)}>
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
                                        <TableCell colSpan={6} className="py-6 text-center text-muted-foreground">
                                            {hasFilters ? 'Tidak ada data yang sesuai filter' : 'Belum ada data poli'}
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

PolisIndex.layout = {
    breadcrumbs,
};