import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Laporan Rekam Medis', href: '/laporan/rekam-medis' },
];

interface RekamMedis {
    id: number;
    nomor_rekam_medis: string;
    anamnesis: string | null;
    kunjungan: {
        tanggal_kunjungan: string;
        keluhan_utama: string | null;
        pasien: { full_name: string; medical_record_number: string } | null;
        dokter: { name: string } | null;
    } | null;
}

interface Props {
    rekamMedis: {
        data: RekamMedis[];
        links: { url: string | null; label: string; active: boolean }[];
    };
    filters: { search?: string; dari?: string; sampai?: string };
}

export default function LaporanRekamMedis({ rekamMedis, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [dari, setDari]     = useState(filters.dari ?? '');
    const [sampai, setSampai] = useState(filters.sampai ?? '');

    const handleFilter = (e?: React.FormEvent) => {
        e?.preventDefault();
        router.get('/laporan/rekam-medis', { search, dari, sampai }, { preserveState: true });
    };

    const handleReset = () => {
        setSearch(''); setDari(''); setSampai('');
        router.get('/laporan/rekam-medis', {}, { preserveState: true });
    };

    return (
        <>
            <Head title="Laporan Rekam Medis" />
            <div className="flex flex-1 flex-col gap-4 p-4">
                <div className="bg-background rounded-xl border p-6">
                    <h1 className="mb-6 text-2xl font-bold">Laporan Rekam Medis</h1>

                    <form onSubmit={handleFilter} className="mb-4 flex flex-wrap gap-2">
                        <Input value={search} onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari nama atau no. RM..." className="max-w-xs" />
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
                                <TableHead>No. Rekam Medis</TableHead>
                                <TableHead>Pasien</TableHead>
                                <TableHead>Dokter</TableHead>
                                <TableHead>Tanggal</TableHead>
                                <TableHead>Keluhan</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rekamMedis.data.length > 0 ? (
                                rekamMedis.data.map((r) => (
                                    <TableRow key={r.id}>
                                        <TableCell className="font-mono text-xs">{r.nomor_rekam_medis}</TableCell>
                                        <TableCell>
                                            <p className="font-medium">{r.kunjungan?.pasien?.full_name ?? '-'}</p>
                                            <p className="text-muted-foreground text-xs">{r.kunjungan?.pasien?.medical_record_number}</p>
                                        </TableCell>
                                        <TableCell>{r.kunjungan?.dokter?.name ?? '-'}</TableCell>
                                        <TableCell className="text-xs">{r.kunjungan?.tanggal_kunjungan ?? '-'}</TableCell>
                                        <TableCell className="max-w-xs truncate text-xs">
                                            {r.kunjungan?.keluhan_utama ?? r.anamnesis ?? '-'}
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

                    {rekamMedis.links.length > 3 && (
                        <div className="mt-4 flex flex-wrap gap-1">
                            {rekamMedis.links.map((link, i) =>
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

LaporanRekamMedis.layout = { breadcrumbs };