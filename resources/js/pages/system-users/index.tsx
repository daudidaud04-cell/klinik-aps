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
import { Eye, Pencil, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'System Users', href: '/master-data/users' },
];

interface SystemUser {
    id: number;
    name: string;
    email: string;
    role: string;
    phone: string | null;
    employee_status: string;
}

interface Filters {
    search?: string;
    role?: string;
    status?: string;
}

interface Props {
    users: {
        data: SystemUser[];
        current_page: number;
        last_page: number;
        total: number;
    };
    filters: Filters;
}

export default function SystemUsersIndex({ users, filters }: Props) {
    const { can } = usePermissions();
    const [search, setSearch] = useState(filters.search ?? '');
    const [role, setRole] = useState(filters.role ?? '');
    const [status, setStatus] = useState(filters.status ?? '');

    const handleSearch = () => {
        router.get(
            '/master-data/users',
            {
                search: search || undefined,
                role: role || undefined,
                status: status || undefined,
            },
            { preserveState: true, replace: true },
        );
    };

    const handleReset = () => {
        setSearch('');
        setRole('');
        setStatus('');
        router.get(
            '/master-data/users',
            {},
            { preserveState: true, replace: true },
        );
    };

    const handleDelete = (id: number) => {
        router.delete(`/master-data/users/${id}`, { preserveScroll: true });
    };

    const roleLabel = (role: string) => {
        const labels: Record<string, string> = {
            super_admin: 'Super Admin',
            admin_kasir: 'Admin / Kasir',
            dokter: 'Dokter',
            apoteker: 'Apoteker',
            laboran: 'Laboran',
        };
        return labels[role] ?? role;
    };

    const statusColor = (status: string) =>
        status === 'aktif'
            ? 'default'
            : status === 'cuti'
              ? 'secondary'
              : 'destructive';

    const statusLabel = (status: string) => {
        if (status === 'aktif') return 'Aktif';
        if (status === 'cuti') return 'Cuti';
        return 'Nonaktif';
    };

    const hasFilters = search || role || status;

    return (
        <>
            <Head title="System Users" />

            <div className="flex flex-1 flex-col gap-4 p-4">
                <div className="rounded-xl border bg-background p-6">
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold">System Users</h1>
                            <p className="text-muted-foreground">
                                Kelola data pengguna sistem klinik
                                {users.total > 0 && (
                                    <span className="ml-1 text-sm">
                                        ({users.total} user)
                                    </span>
                                )}
                            </p>
                        </div>
                        {can('master-data.users.create') && (
                            <Button asChild>
                                <Link href="/master-data/users/create">
                                    Tambah User
                                </Link>
                            </Button>
                        )}
                    </div>

                    <div className="mb-4 flex flex-wrap gap-3">
                        <div className="relative min-w-[200px] flex-1">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Cari nama atau email..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) =>
                                    e.key === 'Enter' && handleSearch()
                                }
                                className="pl-9"
                            />
                        </div>

                        <Select
                            value={role || 'all'}
                            onValueChange={(v) => setRole(v === 'all' ? '' : v)}
                        >
                            <SelectTrigger className="w-[170px]">
                                <SelectValue placeholder="Semua Role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Role</SelectItem>
                                <SelectItem value="super_admin">
                                    Super Admin
                                </SelectItem>
                                <SelectItem value="admin_kasir">
                                    Admin / Kasir
                                </SelectItem>
                                <SelectItem value="dokter">Dokter</SelectItem>
                                <SelectItem value="apoteker">
                                    Apoteker
                                </SelectItem>
                                <SelectItem value="laboran">Laboran</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select
                            value={status || 'all'}
                            onValueChange={(v) =>
                                setStatus(v === 'all' ? '' : v)
                            }
                        >
                            <SelectTrigger className="w-[150px]">
                                <SelectValue placeholder="Semua Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    Semua Status
                                </SelectItem>
                                <SelectItem value="aktif">Aktif</SelectItem>
                                <SelectItem value="cuti">Cuti</SelectItem>
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
                                Reset
                            </Button>
                        )}
                    </div>

                    <div className="overflow-hidden rounded-lg border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nama</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Telepon</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">
                                        Aksi
                                    </TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {users?.data?.length > 0 ? (
                                    users.data.map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell>{user.name}</TableCell>
                                            <TableCell>{user.email}</TableCell>
                                            <TableCell>
                                                {roleLabel(user.role)}
                                            </TableCell>
                                            <TableCell>
                                                {user.phone ?? '-'}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={
                                                        statusColor(
                                                            user.employee_status,
                                                        ) as any
                                                    }
                                                >
                                                    {statusLabel(
                                                        user.employee_status,
                                                    )}
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
                                                            href={`/master-data/users/${user.id}`}
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Link>
                                                    </Button>

                                                    {can(
                                                        'master-data.users.update',
                                                    ) && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            asChild
                                                        >
                                                            <Link
                                                                href={`/master-data/users/${user.id}/edit`}
                                                            >
                                                                <Pencil className="h-4 w-4" />
                                                            </Link>
                                                        </Button>
                                                    )}

                                                    {can(
                                                        'master-data.users.delete',
                                                    ) && (
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
                                                                        User?
                                                                    </AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        User{' '}
                                                                        <strong>
                                                                            {
                                                                                user.name
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
                                                                                user.id,
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
                                                : 'Belum ada data user'}
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

SystemUsersIndex.layout = {
    breadcrumbs,
};
