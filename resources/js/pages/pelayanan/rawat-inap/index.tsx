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
import { type RawatInap } from '@/types/rawat-inap';
import { Head, Link, router } from '@inertiajs/react';
import { Eye, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Rawat Inap', href: '/pelayanan/rawat-inap' },
];

const STATUS_OPTIONS = [
    { value: 'aktif', label: 'Aktif' },
    { value: 'pindah_kamar', label: 'Pindah Kamar' },
    { value: 'pulang', label: 'Pulang' },
    { value: 'meninggal', label: 'Meninggal' },
    { value: 'pulang_paksa', label: 'Pulang Paksa' },
];

const statusVariant = (status: string) => {
    if (status === 'aktif') return 'default' as const;
    if (status === 'pulang') return 'secondary' as const;
    if (status === 'meninggal' || status === 'pulang_paksa')
        return 'destructive' as const;
    return 'outline' as const;
};

const formatTanggal = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
};

interface Props {
    rawatInaps: {
        data: RawatInap[];
        links: { url: string | null; label: string; active: boolean }[];
    };
    filters: { search?: string; status?: string };
}

export default function RawatInapIndex({ rawatInaps, filters }: Props) {
    const { can } = usePermissions();
    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState(filters.status ?? '');

    const handleFilter = (e?: React.FormEvent) => {
        e?.preventDefault();
        router.get(
            '/pelayanan/rawat-inap',
            { search, status },
            { preserveState: true },
        );
    };

    const handleReset = () => {
        setSearch('');
        setStatus('');
        router.get('/pelayanan/rawat-inap', {}, { preserveState: true });
    };

    return (
        <>
            <Head title="Rawat Inap" />
            <div className="flex flex-1 flex-col gap-4 p-4">
                <div className="rounded-xl border bg-background p-6">
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold">Rawat Inap</h1>
                            <p className="text-muted-foreground">
                                Kelola data pasien rawat inap
                            </p>
                        </div>
                        {can('rawat-inap.create') && (
                            <Button asChild>
                                <Link href="/pelayanan/rawat-inap/create">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Daftar Rawat Inap
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
                            placeholder="Cari no. rawat inap atau nama pasien..."
                            className="max-w-xs"
                        />
                        <Select
                            value={status}
                            onValueChange={(v) => setStatus(v)}
                        >
                            <SelectTrigger className="w-44">
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
                                <TableHead>No. Rawat Inap</TableHead>
                                <TableHead>Pasien</TableHead>
                                <TableHead>Kamar</TableHead>
                                <TableHead>Dokter</TableHead>
                                <TableHead>Masuk</TableHead>
                                <TableHead>Lama</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">
                                    Aksi
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rawatInaps.data.length > 0 ? (
                                rawatInaps.data.map((ri) => (
                                    <TableRow key={ri.id}>
                                        <TableCell className="font-mono text-xs">
                                            {ri.nomor_rawat_inap}
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium">
                                                    {ri.pasien?.full_name}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {
                                                        ri.pasien
                                                            ?.medical_record_number
                                                    }
                                                </p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <p>{ri.kamar?.nama_kamar}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {ri.kamar?.kelas}
                                                </p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {ri.dokter?.name ?? '-'}
                                        </TableCell>
                                        <TableCell>
                                            {formatTanggal(ri.tanggal_masuk)}
                                        </TableCell>
                                        <TableCell>
                                            {ri.lama_inap !== null
                                                ? `${ri.lama_inap} hari`
                                                : '-'}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={statusVariant(
                                                    ri.status,
                                                )}
                                            >
                                                {ri.status_label}
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
                                                        href={`/pelayanan/rawat-inap/${ri.id}`}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                                {can('rawat-inap.update') && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        asChild
                                                    >
                                                        <Link
                                                            href={`/pelayanan/rawat-inap/${ri.id}/edit`}
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                )}
                                                {can('rawat-inap.delete') && (
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => {
                                                            if (
                                                                confirm(
                                                                    `Hapus data rawat inap ${ri.nomor_rawat_inap}?`,
                                                                )
                                                            ) {
                                                                router.delete(
                                                                    `/pelayanan/rawat-inap/${ri.id}`,
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
                                        colSpan={8}
                                        className="text-center"
                                    >
                                        Belum ada data rawat inap.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>

                    {rawatInaps.links.length > 3 && (
                        <div className="mt-4 flex flex-wrap gap-1">
                            {rawatInaps.links.map((link, i) =>
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

RawatInapIndex.layout = { breadcrumbs };
