import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Laporan Keuangan', href: '/laporan/keuangan' },
];

interface Pembayaran {
    id: number;
    nomor_pembayaran: string;
    pasien: { full_name: string; medical_record_number: string } | null;
    total: number;
    metode_bayar: string;
    status: string;
    status_label: string;
    tanggal_bayar: string;
}

interface Props {
    pembayarans: {
        data: Pembayaran[];
        links: { url: string | null; label: string; active: boolean }[];
    };
    total_pendapatan: number;
    filters: { dari?: string; sampai?: string; status?: string };
}

export default function LaporanKeuangan({ pembayarans, total_pendapatan, filters }: Props) {
    const [dari, setDari]     = useState(filters.dari ?? '');
    const [sampai, setSampai] = useState(filters.sampai ?? '');
    const [status, setStatus] = useState(filters.status ?? '');

    const handleFilter = (e?: React.FormEvent) => {
        e?.preventDefault();
        router.get('/laporan/keuangan', { dari, sampai, status }, { preserveState: true });
    };

    const handleReset = () => {
        setDari(''); setSampai(''); setStatus('');
        router.get('/laporan/keuangan', {}, { preserveState: true });
    };

    return (
        <>
            <Head title="Laporan Keuangan" />
            <div className="flex flex-1 flex-col gap-4 p-4">
                <div className="bg-background rounded-xl border p-6">
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold">Laporan Keuangan</h1>
                            <p className="text-muted-foreground text-sm">
                                Total Pendapatan (Lunas):&nbsp;
                                <span className="font-semibold text-green-600">
                                    Rp {Number(total_pendapatan).toLocaleString('id-ID')}
                                </span>
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleFilter} className="mb-4 flex flex-wrap gap-2">
                        <Input type="date" value={dari} onChange={(e) => setDari(e.target.value)} className="w-40" />
                        <Input type="date" value={sampai} onChange={(e) => setSampai(e.target.value)} className="w-40" />
                        <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger className="w-36"><SelectValue placeholder="Semua Status" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="menunggu">Menunggu</SelectItem>
                                <SelectItem value="lunas">Lunas</SelectItem>
                                <SelectItem value="gagal">Gagal</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button type="submit" variant="secondary">Filter</Button>
                        {(dari || sampai || status) && (
                            <Button type="button" variant="ghost" onClick={handleReset}>Reset</Button>
                        )}
                    </form>

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>No. Pembayaran</TableHead>
                                <TableHead>Pasien</TableHead>
                                <TableHead>Total</TableHead>
                                <TableHead>Metode</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Tanggal</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {pembayarans.data.length > 0 ? (
                                pembayarans.data.map((p) => (
                                    <TableRow key={p.id}>
                                        <TableCell className="font-mono text-xs">{p.nomor_pembayaran}</TableCell>
                                        <TableCell>
                                            <p className="font-medium">{p.pasien?.full_name ?? '-'}</p>
                                            <p className="text-muted-foreground text-xs">{p.pasien?.medical_record_number}</p>
                                        </TableCell>
                                        <TableCell>Rp {Number(p.total).toLocaleString('id-ID')}</TableCell>
                                        <TableCell className="capitalize">{p.metode_bayar}</TableCell>
                                        <TableCell>
                                            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                                p.status === 'lunas'
                                                    ? 'bg-green-100 text-green-700'
                                                    : p.status === 'gagal'
                                                    ? 'bg-red-100 text-red-700'
                                                    : 'bg-yellow-100 text-yellow-700'
                                            }`}>
                                                {p.status_label}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-xs">{p.tanggal_bayar}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center">Tidak ada data.</TableCell>
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
                                )
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

LaporanKeuangan.layout = { breadcrumbs };