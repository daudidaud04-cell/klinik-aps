import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Laporan Obat', href: '/laporan/obat' },
];

interface Obat {
    id: number;
    kode_obat: string;
    nama_obat: string;
    kategori: string | null;
    satuan: string;
    stok: number;
    harga_jual: number;
    status: string;
}

interface Props {
    obats: {
        data: Obat[];
        links: { url: string | null; label: string; active: boolean }[];
    };
    total_terjual: number;
    filters: { search?: string; dari?: string; sampai?: string };
}

export default function LaporanObat({ obats, total_terjual, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [dari, setDari]     = useState(filters.dari ?? '');
    const [sampai, setSampai] = useState(filters.sampai ?? '');

    const handleFilter = (e?: React.FormEvent) => {
        e?.preventDefault();
        router.get('/laporan/obat', { search, dari, sampai }, { preserveState: true });
    };

    const handleReset = () => {
        setSearch(''); setDari(''); setSampai('');
        router.get('/laporan/obat', {}, { preserveState: true });
    };

    return (
        <>
            <Head title="Laporan Obat" />
            <div className="flex flex-1 flex-col gap-4 p-4">
                <div className="bg-background rounded-xl border p-6">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold">Laporan Obat</h1>
                        <p className="text-muted-foreground text-sm">
                            Total terjual (periode filter): <span className="font-semibold">{total_terjual} item</span>
                        </p>
                    </div>

                    <form onSubmit={handleFilter} className="mb-4 flex flex-wrap gap-2">
                        <Input value={search} onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari nama atau kode obat..." className="max-w-xs" />
                        <Input type="date" value={dari} onChange={(e) => setDari(e.target.value)} className="w-40" />
                        <Input type="date" value={sampai} onChange={(e) => setSampai(e.target.value)} className="w-40" />
                        <Button type="submit" variant="secondary">Filter</Button>
                        {(search || dari || sampai) && (
                            <Button type="button" variant="ghost" onClick={handleReset}>Reset</Button>
                        )}
                    </form>

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Kode</TableHead>
                                <TableHead>Nama Obat</TableHead>
                                <TableHead>Kategori</TableHead>
                                <TableHead>Satuan</TableHead>
                                <TableHead>Stok</TableHead>
                                <TableHead>Harga Jual</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {obats.data.length > 0 ? (
                                obats.data.map((o) => (
                                    <TableRow key={o.id}>
                                        <TableCell className="font-mono text-xs">{o.kode_obat}</TableCell>
                                        <TableCell className="font-medium">{o.nama_obat}</TableCell>
                                        <TableCell>{o.kategori ?? '-'}</TableCell>
                                        <TableCell>{o.satuan}</TableCell>
                                        <TableCell>
                                            <span className={o.stok <= 10 ? 'font-semibold text-red-600' : ''}>
                                                {o.stok}
                                            </span>
                                        </TableCell>
                                        <TableCell>Rp {Number(o.harga_jual).toLocaleString('id-ID')}</TableCell>
                                        <TableCell>
                                            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                                o.status === 'aktif'
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-gray-100 text-gray-600'
                                            }`}>
                                                {o.status}
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center">Tidak ada data.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>

                    {obats.links.length > 3 && (
                        <div className="mt-4 flex flex-wrap gap-1">
                            {obats.links.map((link, i) =>
                                link.url ? (
                                    <Button key={i} asChild size="sm" variant={link.active ? 'default' : 'outline'}>
                                        <Link href={link.url} dangerouslySetInnerHTML={{ __html: link.label }} />
                                    </Button>
                                ) : (
                                    <Button key={i} size="sm" variant="outline" disabled>
                                        <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                    </Button>
                                )
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

LaporanObat.layout = { breadcrumbs };