import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { FileText, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Data Obat', href: '/medicines' },
];

interface Medicine {
    id: number;
    kode_obat: string;
    nama_obat: string;
    kategori: string;
    satuan: string;
    stok: number;
    minimal_stok: number;
    harga_beli_formatted: string;
    harga_jual_formatted: string;
    stok_status: string;
    is_low_stock: boolean;
    is_expired: boolean;
    is_near_expiry: boolean;
    margin: number;
    status: string;
    status_label: string;
    expired_date: string | null;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface Props {
    medicines: {
        data: Medicine[];
        links: PaginationLink[];
        from: number | null;
        to: number | null;
        total: number;
    };
    filters: {
        search?: string;
        status?: string;
        kategori?: string;
        sort_by?: string;
        sort_dir?: string;
        per_page?: string;
    };
}

export default function MedicinesIndex({ medicines, filters }: Props) {
    const { can } = usePermissions();
    const [search, setSearch] = useState(filters.search ?? '');
    const [deletingId, setDeletingId] = useState<number | null>(null);

    // 🔧 FIX: kirim semua filter yang sedang aktif (bukan cuma search+status),
    // supaya kategori/sort/per_page yang sedang dipakai tidak hilang saat cari.
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            '/medicines',
            { ...filters, search },
            { preserveState: true },
        );
    };

    const handleDelete = (medicine: Medicine) => {
        if (!confirm(`Hapus obat "${medicine.nama_obat}"?`)) return;

        setDeletingId(medicine.id);
        router.delete(`/medicines/${medicine.id}`, {
            preserveScroll: true,
            onFinish: () => setDeletingId(null),
        });
    };

    // Kolom "Stok" selalu menampilkan angka stok aktual.
    const stokValue = (medicine: Medicine) => <span>{medicine.stok}</span>;

    // Kolom "Info Stok" khusus menampilkan badge peringatan stok.
    const infoStokBadge = (medicine: Medicine) => {
        if (medicine.stok_status === 'habis')
            return <Badge variant="destructive">Habis</Badge>;
        if (medicine.stok_status === 'menipis')
            return (
                <Badge
                    variant="outline"
                    className="border-orange-400 text-orange-600"
                >
                    Menipis
                </Badge>
            );
        return <span className="text-muted-foreground">-</span>;
    };

        // Kolom "Kedaluwarsa": cukup tampilkan tanggal aktualnya saja.
        // Indikator "segera/sudah kedaluwarsa" sudah diwakili oleh warna baris
        // (rowHighlightClass), jadi badge di dalam sel tidak perlu lagi —
        // menghindari duplikasi informasi.
        const expiryCell = (medicine: Medicine) => {
            if (!medicine.expired_date) {
                return <span className="text-muted-foreground">-</span>;
            }

            return (
                <span>
                    {new Date(medicine.expired_date).toLocaleDateString('id-ID', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                    })}
                </span>
            );
        };

    // 🔧 FIX: warna dipertegas (bg-red-50 -> bg-red-100) karena terlalu pucat
// untuk terlihat jelas sebagai peringatan. Ditambah border kiri tebal
// sebagai indikator visual kedua yang lebih tegas dan tidak ambigu.
const rowHighlightClass = (medicine: Medicine) => {
    if (medicine.is_expired) {
        return 'bg-red-100 hover:bg-red-200 border-l-4 border-l-red-500';
    }
    if (medicine.is_near_expiry) {
        return 'bg-yellow-100 hover:bg-yellow-200 border-l-4 border-l-yellow-500';
    }
    return '';
};

    return (
        <>
            <Head title="Data Obat" />
            <div className="flex flex-1 flex-col gap-4 p-4">
                <div className="rounded-xl border bg-background p-6">
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold">Data Obat</h1>
                            <p className="text-muted-foreground">
                                Kelola data obat klinik
                            </p>
                        </div>
                        {can('master-data.medicines.create') && (
                            <Button asChild>
                                <Link href="/medicines/create">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Tambah Obat
                                </Link>
                            </Button>
                        )}
                    </div>

                    <form onSubmit={handleSearch} className="mb-4 flex gap-2">
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari kode atau nama obat..."
                            className="max-w-sm"
                        />
                        <Button type="submit" variant="secondary">
                            Cari
                        </Button>
                    </form>

                    {/* 🆕 Legenda warna baris */}
                    <div className="mb-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                        <span className="h-3 w-3 rounded-sm bg-yellow-100 border-2 border-yellow-500" />
                        Segera kedaluwarsa (≤30 hari)
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="h-3 w-3 rounded-sm bg-red-100 border-2 border-red-500" />
                        Sudah kedaluwarsa
                    </div>
                </div>

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Kode</TableHead>
                                <TableHead>Nama Obat</TableHead>
                                <TableHead>Kategori</TableHead>
                                <TableHead>Satuan</TableHead>
                                <TableHead>Stok</TableHead>
                                <TableHead>Info Stok</TableHead>
                                <TableHead>Kedaluwarsa</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">
                                    Aksi
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {medicines.data.length > 0 ? (
                                medicines.data.map((medicine) => (
                                    <TableRow
                                        key={medicine.id}
                                        className={rowHighlightClass(medicine)}
                                    >
                                        <TableCell className="font-mono">
                                            {medicine.kode_obat}
                                        </TableCell>
                                        <TableCell>
                                            {medicine.nama_obat}
                                        </TableCell>
                                        <TableCell>
                                            {medicine.kategori}
                                        </TableCell>
                                        <TableCell>{medicine.satuan}</TableCell>
                                        <TableCell>
                                            {stokValue(medicine)}
                                        </TableCell>
                                        <TableCell>
                                            {infoStokBadge(medicine)}
                                        </TableCell>
                                        <TableCell>
                                            {expiryCell(medicine)}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={
                                                    medicine.status === 'aktif'
                                                        ? 'default'
                                                        : 'secondary'
                                                }
                                            >
                                                {medicine.status_label}
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
                                                        href={`/medicines/${medicine.id}`}
                                                    >
                                                        <FileText className="h-4 w-4" />
                                                    </Link>
                                                </Button>

                                                {can(
                                                    'master-data.medicines.update',
                                                ) && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        asChild
                                                    >
                                                        <Link
                                                            href={`/medicines/${medicine.id}/edit`}
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                )}

                                                {can(
                                                    'master-data.medicines.delete',
                                                ) && (
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        disabled={
                                                            deletingId ===
                                                            medicine.id
                                                        }
                                                        onClick={() =>
                                                            handleDelete(
                                                                medicine,
                                                            )
                                                        }
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
                                        colSpan={9}
                                        className="text-center"
                                    >
                                        Belum ada data obat
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>

                    {medicines.data.length > 0 && (
                        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                            <p className="text-sm text-muted-foreground">
                                Menampilkan {medicines.from ?? 0}–
                                {medicines.to ?? 0} dari {medicines.total} obat
                            </p>
                            <div className="flex flex-wrap gap-1">
                                {medicines.links.map((link, i) => (
                                    <Button
                                        key={i}
                                        variant={
                                            link.active ? 'default' : 'outline'
                                        }
                                        size="sm"
                                        disabled={!link.url}
                                        onClick={() =>
                                            link.url &&
                                            router.get(
                                                link.url,
                                                {},
                                                {
                                                    preserveState: true,
                                                    preserveScroll: true,
                                                },
                                            )
                                        }
                                        dangerouslySetInnerHTML={{
                                            __html: link.label,
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

MedicinesIndex.layout = { breadcrumbs };