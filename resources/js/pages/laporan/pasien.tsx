import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Laporan Pasien', href: '/laporan/pasien' },
];

interface Patient {
    id: number;
    full_name: string;
    medical_record_number: string;
    phone: string | null;
    gender: string | null;
    patient_status: string;
    created_at: string;
}

interface Props {
    pasiens: {
        data: Patient[];
        links: { url: string | null; label: string; active: boolean }[];
    };
    filters: { search?: string; status?: string; dari?: string; sampai?: string };
    summary: { total: number; aktif: number; nonaktif: number };
}

export default function LaporanPasien({ pasiens, filters, summary }: Props) {
    const [search, setSearch]   = useState(filters.search ?? '');
    const [status, setStatus]   = useState(filters.status ?? '');
    const [dari, setDari]       = useState(filters.dari ?? '');
    const [sampai, setSampai]   = useState(filters.sampai ?? '');

    const handleFilter = (e?: React.FormEvent) => {
        e?.preventDefault();
        router.get('/laporan/pasien', { search, status, dari, sampai }, { preserveState: true });
    };

    const handleReset = () => {
        setSearch(''); setStatus(''); setDari(''); setSampai('');
        router.get('/laporan/pasien', {}, { preserveState: true });
    };

    return (
        <>
            <Head title="Laporan Pasien" />
            <div className="flex flex-1 flex-col gap-4 p-4">
                <div className="bg-background rounded-xl border p-6">
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold">Laporan Pasien</h1>
                            <p className="text-muted-foreground text-sm">
                                Total: {summary.total} | Aktif: {summary.aktif} | Nonaktif: {summary.nonaktif}
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleFilter} className="mb-4 flex flex-wrap gap-2">
                        <Input value={search} onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari nama atau no. RM..." className="max-w-xs" />
                        <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger className="w-36"><SelectValue placeholder="Semua Status" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="aktif">Aktif</SelectItem>
                                <SelectItem value="nonaktif">Nonaktif</SelectItem>
                            </SelectContent>
                        </Select>
                        <Input type="date" value={dari} onChange={(e) => setDari(e.target.value)} className="w-40" />
                        <Input type="date" value={sampai} onChange={(e) => setSampai(e.target.value)} className="w-40" />
                        <Button type="submit" variant="secondary">Filter</Button>
                        {(search || status || dari || sampai) && (
                            <Button type="button" variant="ghost" onClick={handleReset}>Reset</Button>
                        )}
                    </form>

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>No. RM</TableHead>
                                <TableHead>Nama Pasien</TableHead>
                                <TableHead>Telepon</TableHead>
                                <TableHead>Jenis Kelamin</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Terdaftar</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {pasiens.data.length > 0 ? (
                                pasiens.data.map((p) => (
                                    <TableRow key={p.id}>
                                        <TableCell className="font-mono text-xs">{p.medical_record_number}</TableCell>
                                        <TableCell className="font-medium">{p.full_name}</TableCell>
                                        <TableCell>{p.phone ?? '-'}</TableCell>
                                        <TableCell>{p.gender ?? '-'}</TableCell>
                                        <TableCell>
                                            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                                p.patient_status === 'aktif'
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-gray-100 text-gray-600'
                                            }`}>
                                                {p.patient_status}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-xs">{p.created_at}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center">Tidak ada data.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>

                    {pasiens.links.length > 3 && (
                        <div className="mt-4 flex flex-wrap gap-1">
                            {pasiens.links.map((link, i) =>
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

LaporanPasien.layout = { breadcrumbs };