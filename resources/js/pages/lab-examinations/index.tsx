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
    { title: 'Pemeriksaan Lab', href: '/lab-examinations' },
];

const KATEGORI = [
    'Hematologi',
    'Kimia Darah',
    'Urinalisis',
    'Mikrobiologi',
    'Serologi',
    'Parasitologi',
    'Lainnya',
];

interface LabExamination {
    id: number;
    kode_pemeriksaan: string;
    nama_pemeriksaan: string;
    kategori: string;
    harga_formatted: string;
    satuan_hasil: string | null;
    nilai_normal_range: string | null;
    estimasi_durasi_menit: number;
    status: string;
    status_label: string;
}

interface Props {
    labExaminations: {
        data: LabExamination[];
        links: { url: string | null; label: string; active: boolean }[];
    };
    filters: {
        search?: string;
        kategori?: string;
        status?: string;
    };
}

export default function LabExaminationsIndex({ labExaminations, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [kategori, setKategori] = useState(filters.kategori ?? '');
    const [status, setStatus] = useState(filters.status ?? '');

    const handleFilter = (e?: React.FormEvent) => {
        e?.preventDefault();
        router.get('/lab-examinations', { search, kategori, status }, { preserveState: true });
    };

    const handleReset = () => {
        setSearch('');
        setKategori('');
        setStatus('');
        router.get('/lab-examinations', {}, { preserveState: true });
    };

    return (
        <>
            <Head title="Pemeriksaan Lab" />
            <div className="flex flex-1 flex-col gap-4 p-4">
                <div className="bg-background rounded-xl border p-6">
                    {/* Header */}
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold">Pemeriksaan Laboratorium</h1>
                            <p className="text-muted-foreground">Kelola data pemeriksaan lab klinik</p>
                        </div>
                        <Button asChild>
                            <Link href="/lab-examinations/create">
                                <Plus className="mr-2 h-4 w-4" />
                                Tambah Pemeriksaan
                            </Link>
                        </Button>
                    </div>

                    {/* Filter */}
                    <form onSubmit={handleFilter} className="mb-4 flex flex-wrap gap-2">
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari kode atau nama..."
                            className="max-w-xs"
                        />
                        <Select value={kategori} onValueChange={(v) => setKategori(v)}>
                            <SelectTrigger className="w-44">
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
                                <TableHead>Nama Pemeriksaan</TableHead>
                                <TableHead>Kategori</TableHead>
                                <TableHead>Harga</TableHead>
                                <TableHead>Durasi</TableHead>
                                <TableHead>Nilai Normal</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {labExaminations.data.length > 0 ? (
                                labExaminations.data.map((lab) => (
                                    <TableRow key={lab.id}>
                                        <TableCell className="font-mono">{lab.kode_pemeriksaan}</TableCell>
                                        <TableCell>{lab.nama_pemeriksaan}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{lab.kategori}</Badge>
                                        </TableCell>
                                        <TableCell>{lab.harga_formatted}</TableCell>
                                        <TableCell>{lab.estimasi_durasi_menit} menit</TableCell>
                                        <TableCell>{lab.nilai_normal_range ?? '-'}</TableCell>
                                        <TableCell>
                                            <Badge variant={lab.status === 'aktif' ? 'default' : 'secondary'}>
                                                {lab.status_label}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="outline" size="sm" asChild>
                                                    <Link href={`/lab-examinations/${lab.id}`}>
                                                        <Eye className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                                <Button variant="outline" size="sm" asChild>
                                                    <Link href={`/lab-examinations/${lab.id}/edit`}>
                                                        <Pencil className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => {
                                                        if (confirm(`Hapus pemeriksaan "${lab.nama_pemeriksaan}"?`)) {
                                                            router.delete(`/lab-examinations/${lab.id}`, { preserveScroll: true });
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
                                        Belum ada data pemeriksaan lab.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>

                    {/* Pagination */}
                    {labExaminations.links.length > 3 && (
                        <div className="mt-4 flex flex-wrap gap-1">
                            {labExaminations.links.map((link, i) =>
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

LabExaminationsIndex.layout = { breadcrumbs };