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
import { type KunjunganRawatJalan } from '@/types/rawat-jalan';
import { Head, Link, router } from '@inertiajs/react';
import { FileText, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Rawat Jalan', href: '/pelayanan/rawat-jalan' },
];

const STATUS_OPTIONS = [
    { value: 'menunggu', label: 'Menunggu' },
    { value: 'dalam_pemeriksaan', label: 'Dalam Pemeriksaan' },
    { value: 'selesai', label: 'Selesai' },
    { value: 'batal', label: 'Batal' },
];

const statusVariant = (status: string) => {
    if (status === 'selesai') return 'default' as const;
    if (status === 'dalam_pemeriksaan') return 'secondary' as const;
    if (status === 'batal') return 'destructive' as const;
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
    kunjungans: {
        data: KunjunganRawatJalan[];
        links: { url: string | null; label: string; active: boolean }[];
    };
    filters: { search?: string; status?: string; tanggal?: string };
}

export default function RawatJalanIndex({ kunjungans, filters }: Props) {
    const { can } = usePermissions();
    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState(filters.status ?? '');
    const [tanggal, setTanggal] = useState(filters.tanggal ?? '');

    const handleFilter = (e?: React.FormEvent) => {
        e?.preventDefault();
        router.get(
            '/pelayanan/rawat-jalan',
            { search, status, tanggal },
            { preserveState: true },
        );
    };

    const handleReset = () => {
        setSearch('');
        setStatus('');
        setTanggal('');
        router.get('/pelayanan/rawat-jalan', {}, { preserveState: true });
    };

    return (
        <>
            <Head title="Rawat Jalan" />
            <div className="flex flex-1 flex-col gap-4 p-4">
                <div className="rounded-xl border bg-background p-6">
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold">
                                Kunjungan Rawat Jalan
                            </h1>
                            <p className="text-muted-foreground">
                                Kelola kunjungan rawat jalan pasien
                            </p>
                        </div>
                        {can('rawat-jalan.create') && (
                            <Button asChild>
                                <Link href="/pelayanan/rawat-jalan/create">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Daftar Kunjungan
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
                            placeholder="Cari no. kunjungan atau nama pasien..."
                            className="max-w-xs"
                        />
                        <Input
                            type="date"
                            value={tanggal}
                            onChange={(e) => setTanggal(e.target.value)}
                            className="w-44"
                        />
                        <Select
                            value={status}
                            onValueChange={(v) => setStatus(v)}
                        >
                            <SelectTrigger className="w-48">
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
                        {(search || status || tanggal) && (
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
                                <TableHead>No. Kunjungan</TableHead>
                                <TableHead>Pasien</TableHead>
                                <TableHead>Poli</TableHead>
                                <TableHead>Dokter</TableHead>
                                <TableHead>Tanggal</TableHead>
                                <TableHead>Pembayaran</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">
                                    Aksi
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {kunjungans.data.length > 0 ? (
                                kunjungans.data.map((k) => (
                                    <TableRow key={k.id}>
                                        <TableCell className="font-mono text-xs">
                                            {k.nomor_kunjungan}
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium">
                                                    {k.pasien?.full_name}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {
                                                        k.pasien
                                                            ?.medical_record_number
                                                    }
                                                </p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {k.poli?.nama_poli ?? '-'}
                                        </TableCell>
                                        <TableCell>
                                            {k.dokter?.name ?? '-'}
                                        </TableCell>
                                        <TableCell>
                                            {formatTanggal(k.tanggal_kunjungan)}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">
                                                {k.jenis_pembayaran_label}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={statusVariant(
                                                    k.status,
                                                )}
                                            >
                                                {k.status_label}
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
                                                        href={`/pelayanan/rawat-jalan/${k.id}`}
                                                    >
                                                        <FileText className="h-4 w-4" />
                                                    </Link>
                                                </Button>

                                                {can('rawat-jalan.update') && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        asChild
                                                    >
                                                        <Link
                                                            href={`/pelayanan/rawat-jalan/${k.id}/edit`}
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                )}

                                                {can('rawat-jalan.delete') && (
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => {
                                                            if (
                                                                confirm(
                                                                    `Hapus kunjungan ${k.nomor_kunjungan}?`,
                                                                )
                                                            ) {
                                                                router.delete(
                                                                    `/pelayanan/rawat-jalan/${k.id}`,
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
                                        Belum ada data kunjungan.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>

                    {kunjungans.links.length > 3 && (
                        <div className="mt-4 flex flex-wrap gap-1">
                            {kunjungans.links.map((link, i) =>
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

RawatJalanIndex.layout = { breadcrumbs };