import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Eye, Search } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Riwayat Pasien', href: '/patient-histories' },
];

interface Patient {
    id: number;
    full_name: string;
    medical_record_number: string;
}

interface Doctor {
    id: number;
    name: string;
}

interface History {
    id: number;
    type: string;
    visit_date: string;
    total_biaya: number;
    status_bayar: string;
    patient: Patient;
    doctor: Doctor | null;
}

interface Props {
    histories: {
        data: History[];
        current_page: number;
        last_page: number;
        total: number;
    };
    filters: {
        search?: string;
        type?: string;
        status_bayar?: string;
    };
}

export default function PatientHistoriesIndex({ histories, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');

    const handleSearch = () => {
        router.get('/patient-histories', { search: search || undefined }, {
            preserveState: true,
            replace: true,
        });
    };

    const typeLabel = (type: string) => {
        const labels: Record<string, string> = {
            rawat_jalan: 'Rawat Jalan',
            rawat_inap: 'Rawat Inap',
            laboratorium: 'Laboratorium',
            resep: 'Resep Obat',
            tindakan: 'Tindakan Medis',
        };
        return labels[type] ?? type;
    };

    const statusBayarColor = (status: string) => {
        if (status === 'lunas') return 'default';
        if (status === 'cicilan') return 'secondary';
        return 'destructive';
    };

    const statusBayarLabel = (status: string) => {
        if (status === 'lunas') return 'Lunas';
        if (status === 'cicilan') return 'Cicilan';
        return 'Belum Bayar';
    };

    const formatRupiah = (value: number) => 'Rp ' + Number(value).toLocaleString('id-ID');

    const formatDate = (date: string) =>
        new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

    return (
        <>
            <Head title="Riwayat Pasien" />

            <div className="flex flex-1 flex-col gap-4 p-4">
                <div className="bg-background rounded-xl border p-6">
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold">Riwayat Pasien</h1>
                            <p className="text-muted-foreground">
                                Riwayat kunjungan dan tindakan medis pasien (otomatis dari data pelayanan)
                                {histories.total > 0 && <span className="ml-1 text-sm">({histories.total} riwayat)</span>}
                            </p>
                        </div>
                    </div>

                    <div className="mb-4 flex gap-3">
                        <div className="relative max-w-sm flex-1">
                            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                            <Input
                                placeholder="Cari nama atau no. RM pasien..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                className="pl-9"
                            />
                        </div>
                        <Button onClick={handleSearch}>
                            <Search className="mr-2 h-4 w-4" />
                            Cari
                        </Button>
                    </div>

                    <div className="overflow-hidden rounded-lg border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Tanggal</TableHead>
                                    <TableHead>Pasien</TableHead>
                                    <TableHead>Jenis</TableHead>
                                    <TableHead>Dokter</TableHead>
                                    <TableHead>Total Biaya</TableHead>
                                    <TableHead>Status Bayar</TableHead>
                                    <TableHead className="text-right">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {histories?.data?.length > 0 ? (
                                    histories.data.map((history) => (
                                        <TableRow key={history.id}>
                                            <TableCell>{formatDate(history.visit_date)}</TableCell>
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium">{history.patient.full_name}</p>
                                                    <p className="text-muted-foreground text-xs">{history.patient.medical_record_number}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell>{typeLabel(history.type)}</TableCell>
                                            <TableCell>{history.doctor?.name ?? '-'}</TableCell>
                                            <TableCell>{formatRupiah(history.total_biaya)}</TableCell>
                                            <TableCell>
                                                <Badge variant={statusBayarColor(history.status_bayar) as any}>
                                                    {statusBayarLabel(history.status_bayar)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="outline" size="sm" asChild>
                                                    <Link href={`/patient-histories/${history.id}`}>
                                                        <Eye className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-muted-foreground py-6 text-center">
                                            Belum ada riwayat pasien
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>
        </>
    );
}

PatientHistoriesIndex.layout = {
    breadcrumbs,
};