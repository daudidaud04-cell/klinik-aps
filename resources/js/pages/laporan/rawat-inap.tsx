import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Laporan Rawat Inap', href: '/laporan/rawat-inap' },
];

interface RawatInap {
    id: number;
    pasien: { full_name: string; medical_record_number: string } | null;
    kamar: { nama_kamar: string; kelas: string } | null;
    tanggal_masuk: string;
    tanggal_keluar: string | null;
    status: string;
    status_label: string;
}

interface Props {
    rawatInaps: {
        data: RawatInap[];
        links: { url: string | null; label: string; active: boolean }[];
    };
    filters: { status?: string; dari?: string; sampai?: string };
    summary: { aktif: number; keluar: number };
}

const formatDate = (date: string | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
};

export default function LaporanRawatInap({ rawatInaps, filters, summary }: Props) {
    const [status, setStatus] = useState(filters.status ?? '');
    const [dari, setDari]     = useState(filters.dari ?? '');
    const [sampai, setSampai] = useState(filters.sampai ?? '');

    const handleFilter = (e?: React.FormEvent) => {
        e?.preventDefault();
        router.get('/laporan/rawat-inap', { status, dari, sampai }, { preserveState: true });
    };

    const handleReset = () => {
        setStatus(''); setDari(''); setSampai('');
        router.get('/laporan/rawat-inap', {}, { preserveState: true });
    };

    return (
        <>
            <Head title="Laporan Rawat Inap" />
            <div className="flex flex-1 flex-col gap-4 p-4">
                <div className="bg-background rounded-xl border p-6">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold">Laporan Rawat Inap</h1>
                        <p className="text-muted-foreground text-sm">
                            Aktif: {summary.aktif} | Sudah Keluar: {summary.keluar}
                        </p>
                    </div>

                    <form onSubmit={handleFilter} className="mb-4 flex flex-wrap gap-2">
                        <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger className="w-40"><SelectValue placeholder="Semua Status" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="aktif">Aktif</SelectItem>
                                <SelectItem value="pulang">Pulang</SelectItem>
                                <SelectItem value="meninggal">Meninggal</SelectItem>
                                <SelectItem value="pulang_paksa">Pulang Paksa</SelectItem>
                            </SelectContent>
                        </Select>
                        <Input type="date" value={dari} onChange={(e) => setDari(e.target.value)} className="w-40" />
                        <Input type="date" value={sampai} onChange={(e) => setSampai(e.target.value)} className="w-40" />
                        <Button type="submit" variant="secondary">Filter</Button>
                        {(status || dari || sampai) && (
                            <Button type="button" variant="ghost" onClick={handleReset}>Reset</Button>
                        )}
                    </form>

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Pasien</TableHead>
                                <TableHead>Kamar</TableHead>
                                <TableHead>Tanggal Masuk</TableHead>
                                <TableHead>Tanggal Keluar</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rawatInaps.data.length > 0 ? (
                                rawatInaps.data.map((r) => (
                                    <TableRow key={r.id}>
                                        <TableCell>
                                            <p className="font-medium">{r.pasien?.full_name ?? '-'}</p>
                                            <p className="text-muted-foreground text-xs">{r.pasien?.medical_record_number}</p>
                                        </TableCell>
                                        <TableCell>
                                            <p>{r.kamar?.nama_kamar ?? '-'}</p>
                                            <p className="text-muted-foreground text-xs">{r.kamar?.kelas}</p>
                                        </TableCell>
                                        <TableCell className="text-xs">{formatDate(r.tanggal_masuk)}</TableCell>
                                        <TableCell className="text-xs">{formatDate(r.tanggal_keluar)}</TableCell>
                                        <TableCell>
                                            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                                r.status === 'aktif'
                                                    ? 'bg-green-100 text-green-700'
                                                    : r.status === 'meninggal' || r.status === 'pulang_paksa'
                                                    ? 'bg-red-100 text-red-700'
                                                    : 'bg-gray-100 text-gray-600'
                                            }`}>
                                                {r.status_label}
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center">Tidak ada data.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>

                    {rawatInaps.links.length > 3 && (
                        <div className="mt-4 flex flex-wrap gap-1">
                            {rawatInaps.links.map((link, i) =>
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

LaporanRawatInap.layout = { breadcrumbs };