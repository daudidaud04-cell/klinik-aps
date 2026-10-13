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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { usePermissions } from '@/hooks/use-permissions';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Eye, Pencil, Search, Trash2, X } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Pasien', href: '/patients' },
];

interface Patient {
    id: number;
    nik: string | null;
    full_name: string;
    gender: string;
    phone: string;
    patient_status: string;
}

interface Filters {
    search?: string;
    gender?: string;
    status?: string;
    insurance_type?: string;
}

interface Props {
    patients: {
        data: Patient[];
        current_page: number;
        last_page: number;
        total: number;
        per_page: number;
    };
    filters: Filters;
}

export default function PatientsIndex({ patients, filters }: Props) {
    const { can } = usePermissions();
    const [search, setSearch] = useState(filters.search ?? '');
    const [gender, setGender] = useState(filters.gender ?? '');
    const [status, setStatus] = useState(filters.status ?? '');

    const handleSearch = () => {
        router.get(
            '/patients',
            {
                search: search || undefined,
                gender: gender || undefined,
                status: status || undefined,
            },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const handleReset = () => {
        setSearch('');
        setGender('');
        setStatus('');
        router.get(
            '/patients',
            {},
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const handleDelete = (id: number) => {
        router.delete(`/patients/${id}`, {
            preserveScroll: true,
        });
    };

    const hasFilters = search || gender || status;

    return (
        <>
            <Head title="Data Pasien" />

            <div className="flex flex-1 flex-col gap-4 p-4">
                <div className="rounded-xl border bg-background p-6">
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold">Data Pasien</h1>
                            <p className="text-muted-foreground">
                                Kelola data pasien klinik
                                {patients.total > 0 && (
                                    <span className="ml-1 text-sm">
                                        ({patients.total} pasien)
                                    </span>
                                )}
                            </p>
                        </div>
                        {can('patients.create') && (
                            <Button asChild>
                                <Link href="/patients/create">
                                    Tambah Pasien
                                </Link>
                            </Button>
                        )}
                    </div>

                    {/* Search & Filter */}
                    <div className="mb-4 flex flex-wrap gap-3">
                        <div className="relative min-w-50 flex-1">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Cari nama, NIK, atau telepon..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) =>
                                    e.key === 'Enter' && handleSearch()
                                }
                                className="pl-9"
                            />
                        </div>

                        <Select
                            value={gender || 'all'}
                            onValueChange={(v) =>
                                setGender(v === 'all' ? '' : v)
                            }
                        >
                            <SelectTrigger className="w-45">
                                <SelectValue placeholder="Semua Gender" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    Semua Gender
                                </SelectItem>
                                <SelectItem value="laki_laki">
                                    Laki-laki
                                </SelectItem>
                                <SelectItem value="perempuan">
                                    Perempuan
                                </SelectItem>
                            </SelectContent>
                        </Select>

                        <Select
                            value={status || 'all'}
                            onValueChange={(v) =>
                                setStatus(v === 'all' ? '' : v)
                            }
                        >
                            <SelectTrigger className="w-45">
                                <SelectValue placeholder="Semua Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    Semua Status
                                </SelectItem>
                                <SelectItem value="aktif">Aktif</SelectItem>
                                <SelectItem value="nonaktif">
                                    Nonaktif
                                </SelectItem>
                            </SelectContent>
                        </Select>

                        <Button onClick={handleSearch}>
                            <Search className="mr-2 h-4 w-4" />
                            Cari
                        </Button>

                        {hasFilters && (
                            <Button variant="outline" onClick={handleReset}>
                                <X className="mr-2 h-4 w-4" />
                                Reset
                            </Button>
                        )}
                    </div>

                    <div className="overflow-hidden rounded-lg border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>NIK</TableHead>
                                    <TableHead>Nama Pasien</TableHead>
                                    <TableHead>Gender</TableHead>
                                    <TableHead>Telepon</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">
                                        Aksi
                                    </TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {patients?.data?.length > 0 ? (
                                    patients.data.map((patient) => (
                                        <TableRow key={patient.id}>
                                            <TableCell>
                                                {patient.nik ?? '-'}
                                            </TableCell>
                                            <TableCell>
                                                {patient.full_name}
                                            </TableCell>
                                            <TableCell>
                                                {patient.gender === 'laki_laki'
                                                    ? 'Laki-laki'
                                                    : 'Perempuan'}
                                            </TableCell>
                                            <TableCell>
                                                {patient.phone}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={
                                                        patient.patient_status ===
                                                        'aktif'
                                                            ? 'default'
                                                            : 'secondary'
                                                    }
                                                >
                                                    {patient.patient_status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        asChild
                                                    >
                                                        <Link
                                                            href={`/patients/${patient.id}`}
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Link>
                                                    </Button>

                                                    {can('patients.update') && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            asChild
                                                        >
                                                            <Link
                                                                href={`/patients/${patient.id}/edit`}
                                                            >
                                                                <Pencil className="h-4 w-4" />
                                                            </Link>
                                                        </Button>
                                                    )}

                                                    {can('patients.delete') && (
                                                        <AlertDialog>
                                                            <AlertDialogTrigger
                                                                asChild
                                                            >
                                                                <Button
                                                                    variant="destructive"
                                                                    size="sm"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>
                                                                        Hapus
                                                                        Pasien?
                                                                    </AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        Data
                                                                        pasien{' '}
                                                                        <strong>
                                                                            {
                                                                                patient.full_name
                                                                            }
                                                                        </strong>{' '}
                                                                        akan
                                                                        dihapus.
                                                                        Tindakan
                                                                        ini
                                                                        tidak
                                                                        dapat
                                                                        dibatalkan.
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>
                                                                        Batal
                                                                    </AlertDialogCancel>
                                                                    <AlertDialogAction
                                                                        onClick={() =>
                                                                            handleDelete(
                                                                                patient.id,
                                                                            )
                                                                        }
                                                                    >
                                                                        Ya,
                                                                        Hapus
                                                                    </AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={6}
                                            className="py-6 text-center text-muted-foreground"
                                        >
                                            {hasFilters
                                                ? 'Tidak ada data yang sesuai filter'
                                                : 'Belum ada data pasien'}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    {patients.last_page > 1 && (
                        <div className="mt-4 flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">
                                Halaman {patients.current_page} dari{' '}
                                {patients.last_page}
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={patients.current_page === 1}
                                    onClick={() =>
                                        router.get(
                                            '/patients',
                                            {
                                                ...filters,
                                                page: patients.current_page - 1,
                                            },
                                            { preserveState: true },
                                        )
                                    }
                                >
                                    Sebelumnya
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={
                                        patients.current_page ===
                                        patients.last_page
                                    }
                                    onClick={() =>
                                        router.get(
                                            '/patients',
                                            {
                                                ...filters,
                                                page: patients.current_page + 1,
                                            },
                                            { preserveState: true },
                                        )
                                    }
                                >
                                    Selanjutnya
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

PatientsIndex.layout = {
    breadcrumbs,
};
