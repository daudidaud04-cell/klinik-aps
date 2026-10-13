import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Eye, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Tarif Klinik', href: '/clinic-rates' },
];

const KATEGORI = [
    'Konsultasi', 'Administrasi', 'Rawat Inap', 'Tindakan Medis',
    'Tindakan Bedah Minor', 'Laboratorium', 'Radiologi', 'Lainnya',
];

interface ClinicRate {
    id: number;
    kode_tarif: string;
    nama_tarif: string;
    kategori: string;
    harga_formatted: string;
    harga_after_tax_formatted: string;
    is_taxable: boolean;
    tax_percent: number;
    status: string;
    status_label: string;
}

interface Props {
    clinicRates: {
        data: ClinicRate[];
        links: { url: string | null; label: string; active: boolean }[];
    };
    filters: { search?: string; kategori?: string; status?: string };
}

export default function ClinicRatesIndex({ clinicRates, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [kategori, setKategori] = useState(filters.kategori ?? '');
    const [status, setStatus] = useState(filters.status ?? '');

    const handleFilter = (e?: React.FormEvent) => {
        e?.preventDefault();
        router.get('/clinic-rates', { search, kategori, status }, { preserveState: true });
    };

    const handleReset = () => {
        setSearch(''); setKategori(''); setStatus('');
        router.get('/clinic-rates', {}, { preserveState: true });
    };

    return (
        <>
            <Head title="Tarif Klinik" />
            <div className="flex flex-1 flex-col gap-4 p-4">
                <div className="bg-background rounded-xl border p-6">
                    {/* Header */}
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold">Tarif Klinik</h1>
                            <p className="text-muted-foreground">Kelola data tarif layanan klinik</p>
                        </div>
                        <Button asChild>
                            <Link href="/clinic-rates/create">
                                <Plus className="mr-2 h-4 w-4" />
                                Tambah Tarif
                            </Link>
                        </Button>
                    </div>

                    {/* Filter */}
                    <form onSubmit={handleFilter} className="mb-4 flex flex-wrap gap-2">
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari kode atau nama tarif..."
                            className="max-w-xs"
                        />
                        <Select value={kategori} onValueChange={(v) => setKategori(v)}>
                            <SelectTrigger className="w-48">
                                <SelectValue placeholder="Semua Kategori" />
                            </SelectTrigger>
                            <SelectContent>
                                {KATEGORI.map((k) => (
                                    <SelectItem key={k} value={k}>{k}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={status} onValueChange={(v) => setStatus(v)}>
                            <SelectTrigger className="w-36">
                                <SelectValue placeholder="Semua Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="aktif">Aktif</SelectItem>
                                <SelectItem value="nonaktif">Nonaktif</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button type="submit" variant="secondary">Cari</Button>
                        {(search || kategori || status) && (
                            <Button type="button" variant="ghost" onClick={handleReset}>Reset</Button>
                        )}
                    </form>

                    {/* Tabel */}
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Kode</TableHead>
                                <TableHead>Nama Tarif</TableHead>
                                <TableHead>Kategori</TableHead>
                                <TableHead>Harga</TableHead>
                                <TableHead>Harga + Pajak</TableHead>
                                <TableHead>Pajak</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {clinicRates.data.length > 0 ? (
                                clinicRates.data.map((rate) => (
                                    <TableRow key={rate.id}>
                                        <TableCell className="font-mono">{rate.kode_tarif}</TableCell>
                                        <TableCell>{rate.nama_tarif}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{rate.kategori}</Badge>
                                        </TableCell>
                                        <TableCell>{rate.harga_formatted}</TableCell>
                                        <TableCell>
                                            {rate.is_taxable ? rate.harga_after_tax_formatted : '-'}
                                        </TableCell>
                                        <TableCell>
                                            {rate.is_taxable
                                                ? <Badge variant="secondary">{rate.tax_percent}%</Badge>
                                                : <span className="text-muted-foreground text-xs">Tidak</span>
                                            }
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={rate.status === 'aktif' ? 'default' : 'secondary'}>
                                                {rate.status_label}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="outline" size="sm" asChild>
                                                    <Link href={`/clinic-rates/${rate.id}`}>
                                                        <Eye className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                                <Button variant="outline" size="sm" asChild>
                                                    <Link href={`/clinic-rates/${rate.id}/edit`}>
                                                        <Pencil className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                                <Button
                                                    variant="destructive" size="sm"
                                                    onClick={() => {
                                                        if (confirm(`Hapus tarif "${rate.nama_tarif}"?`)) {
                                                            router.delete(`/clinic-rates/${rate.id}`, { preserveScroll: true });
                                                        }
                                                    }}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center">
                                        Belum ada data tarif klinik.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>

                    {/* Pagination */}
                    {clinicRates.links.length > 3 && (
                        <div className="mt-4 flex flex-wrap gap-1">
                            {clinicRates.links.map((link, i) =>
                                link.url ? (
                                    <Button key={i} asChild size="sm" variant={link.active ? 'default' : 'outline'}>
                                        <Link href={link.url} dangerouslySetInnerHTML={{ __html: link.label }} />
                                    </Button>
                                ) : (
                                    <Button key={i} size="sm" variant="outline" disabled>
                                        <span dangerouslySetInnerHTML={{ __html: link.label }} />
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

ClinicRatesIndex.layout = { breadcrumbs };