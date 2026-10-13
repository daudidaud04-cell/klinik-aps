import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { type BreadcrumbItem } from '@/types';
import { type Pembayaran } from '@/types/transaksi';
import { Head, Link, router } from '@inertiajs/react';
import { FileText, Plus, Receipt } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Pembayaran', href: '/transaksi/pembayaran' },
];

const statusVariant = (status: string) => {
    if (status === 'lunas') return 'default' as const;
    if (status === 'gagal' || status === 'refund') return 'destructive' as const;
    return 'outline' as const;
};

interface Props {
    pembayarans: {
        data: Pembayaran[];
        links: { url: string | null; label: string; active: boolean }[];
    };
    filters: { search?: string; status?: string };
}

export default function PembayaranIndex({ pembayarans, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState(filters.status ?? '');

    const handleFilter = (e?: React.FormEvent) => {
        e?.preventDefault();
        router.get('/transaksi/pembayaran', { search, status }, { preserveState: true });
    };

    return (
        <>
            <Head title="Pembayaran" />
            <div className="flex flex-1 flex-col gap-4 p-4">
                <div className="bg-background rounded-xl border p-6">
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold">Pembayaran</h1>
                            <p className="text-muted-foreground">Kelola transaksi pembayaran pasien</p>
                        </div>
                        <Button asChild>
                            <Link href="/transaksi/pembayaran/create">
                                <Plus className="mr-2 h-4 w-4" />Buat Pembayaran
                            </Link>
                        </Button>
                    </div>

                    <form onSubmit={handleFilter} className="mb-4 flex flex-wrap gap-2">
                        <Input value={search} onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari no. pembayaran atau nama pasien..." className="max-w-xs" />
                        <Select value={status} onValueChange={(v) => setStatus(v)}>
                            <SelectTrigger className="w-40"><SelectValue placeholder="Semua Status" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="menunggu">Menunggu</SelectItem>
                                <SelectItem value="lunas">Lunas</SelectItem>
                                <SelectItem value="gagal">Gagal</SelectItem>
                                <SelectItem value="refund">Refund</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button type="submit" variant="secondary">Cari</Button>
                        {(search || status) && (
                            <Button type="button" variant="ghost" onClick={() => {
                                setSearch(''); setStatus('');
                                router.get('/transaksi/pembayaran', {}, { preserveState: true });
                            }}>Reset</Button>
                        )}
                    </form>

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>No. Pembayaran</TableHead>
                                <TableHead>Pasien</TableHead>
                                <TableHead>Layanan</TableHead>
                                <TableHead>Total</TableHead>
                                <TableHead>Metode</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {pembayarans.data.length > 0 ? (
                                pembayarans.data.map((p) => (
                                    <TableRow key={p.id}>
                                        <TableCell className="font-mono text-xs">{p.nomor_pembayaran}</TableCell>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium">{p.pasien?.full_name}</p>
                                                <p className="text-muted-foreground text-xs">{p.pasien?.medical_record_number}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{p.jenis_layanan.replace('_', ' ')}</Badge>
                                        </TableCell>
                                        <TableCell className="font-semibold">{p.total_formatted}</TableCell>
                                        <TableCell>{p.metode_bayar_label}</TableCell>
                                        <TableCell>
                                            <Badge variant={statusVariant(p.status)}>{p.status_label}</Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="outline" size="sm" asChild>
                                                    <Link href={`/transaksi/pembayaran/${p.id}`}><Receipt className="h-4 w-4" /></Link>
                                                </Button>
                                                {p.invoice && (
                                                    <Button variant="outline" size="sm" asChild>
                                                        <Link href={`/transaksi/invoice/${p.invoice.id}`}><FileText className="h-4 w-4" /></Link>
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center">Belum ada data pembayaran.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>

                    {pembayarans.links.length > 3 && (
                        <div className="mt-4 flex flex-wrap gap-1">
                            {pembayarans.links.map((link, i) =>
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

PembayaranIndex.layout = { breadcrumbs };