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
import { type PemeriksaanLab } from '@/types/laboratorium';
import { Head, Link, router } from '@inertiajs/react';
import { Eye, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Laboratorium', href: '/pelayanan/laboratorium' },
];

const STATUS_OPTIONS = [
    { value: 'menunggu', label: 'Menunggu' },
    { value: 'proses', label: 'Diproses' },
    { value: 'selesai', label: 'Selesai' },
    { value: 'batal', label: 'Batal' },
];

const statusVariant = (status: string) => {
    if (status === 'selesai') return 'default' as const;
    if (status === 'proses') return 'secondary' as const;
    if (status === 'batal') return 'destructive' as const;
    return 'outline' as const;
};

interface Props {
    pemeriksaans: {
        data: PemeriksaanLab[];
        links: { url: string | null; label: string; active: boolean }[];
    };
    filters: { search?: string; status?: string };
}

export default function LaboratoriumIndex({ pemeriksaans, filters }: Props) {
    const { can } = usePermissions();
    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState(filters.status ?? '');

    const handleFilter = (e?: React.FormEvent) => {
        e?.preventDefault();
        router.get(
            '/pelayanan/laboratorium',
            { search, status },
            { preserveState: true },
        );
    };

    const handleReset = () => {
        setSearch('');
        setStatus('');
        router.get('/pelayanan/laboratorium', {}, { preserveState: true });
    };

    return (
        <>
            <Head title="Laboratorium" />
            <div className="flex flex-1 flex-col gap-4 p-4">
                <div className="rounded-xl border bg-background p-6">
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold">
                                Pemeriksaan Laboratorium
                            </h1>
                            <p className="text-muted-foreground">
                                Kelola pemeriksaan lab pasien
                            </p>
                        </div>
                        {can('laboratorium.create') && (
                            <Button asChild>
                                <Link href="/pelayanan/laboratorium/create">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Buat Pemeriksaan
                                </Link>
                            </Button>
                        )}
                    </div>

                    <form
                        onSubmit={handleFilter}
                        className="mb-4 flex flex-wrap gap-2"
                    >
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari no. pemeriksaan atau nama pasien..."
                            className="max-w-xs"
                        />
                        <Select
                            value={status}
                            onValueChange={(v) => setStatus(v)}
                        >
                            <SelectTrigger className="w-40">
                                <SelectValue placeholder="Semua Status" />
                            </SelectTrigger>
                            <SelectContent>
                                {STATUS_OPTIONS.map((s) => (
                                    <SelectItem key={s.value} value={s.value}>
                                        {s.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button type="submit" variant="secondary">
                            Cari
                        </Button>
                        {(search || status) && (
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={handleReset}
                            >
                                Reset
                            </Button>
                        )}
                    </form>

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>No. Pemeriksaan</TableHead>
                                <TableHead>Pasien</TableHead>
                                <TableHead>Jenis</TableHead>
                                <TableHead>Tanggal</TableHead>
                                <TableHead>Harga</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">
                                    Aksi
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {pemeriksaans.data.length > 0 ? (
                                pemeriksaans.data.map((p) => (
                                    <TableRow key={p.id}>
                                        <TableCell className="font-mono text-xs">
                                            {p.nomor_pemeriksaan}
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium">
                                                    {p.pasien?.full_name}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {
                                                        p.pasien
                                                            ?.medical_record_number
                                                    }
                                                </p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <p>
                                                    {p.jenis?.nama_pemeriksaan}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {p.jenis?.kategori}
                                                </p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {p.tanggal_pemeriksaan}
                                        </TableCell>
                                        <TableCell>
                                            {p.harga_formatted}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={statusVariant(
                                                    p.status,
                                                )}
                                            >
                                                {p.status_label}
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
                                                        href={`/pelayanan/laboratorium/${p.id}`}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                                {can('laboratorium.update') && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        asChild
                                                    >
                                                        <Link
                                                            href={`/pelayanan/laboratorium/${p.id}/edit`}
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                )}
                                                {can('laboratorium.delete') && (
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => {
                                                            if (
                                                                confirm(
                                                                    `Hapus pemeriksaan ${p.nomor_pemeriksaan}?`,
                                                                )
                                                            ) {
                                                                router.delete(
                                                                    `/pelayanan/laboratorium/${p.id}`,
                                                                    {
                                                                        preserveScroll: true,
                                                                    },
                                                                );
                                                            }
                                                        }}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={7}
                                        className="text-center"
                                    >
                                        Belum ada data pemeriksaan.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>

                    {pemeriksaans.links.length > 3 && (
                        <div className="mt-4 flex flex-wrap gap-1">
                            {pemeriksaans.links.map((link, i) =>
                                link.url ? (
                                    <Button
                                        key={i}
                                        asChild
                                        size="sm"
                                        variant={
                                            link.active ? 'default' : 'outline'
                                        }
                                    >
                                        <Link
                                            href={link.url}
                                            dangerouslySetInnerHTML={{
                                                __html: link.label,
                                            }}
                                        />
                                    </Button>
                                ) : (
                                    <Button
                                        key={i}
                                        size="sm"
                                        variant="outline"
                                        disabled
                                    >
                                        <span
                                            dangerouslySetInnerHTML={{
                                                __html: link.label,
                                            }}
                                        />
                                    </Button>
                                ),
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

LaboratoriumIndex.layout = { breadcrumbs };
