import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
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
import { type RekamMedis } from '@/types/rekam-medis';
import { Head, Link, router } from '@inertiajs/react';
import { FileText, Plus } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Rekam Medis', href: '/pelayanan/rekam-medis' },
];

const statusBayarVariant = (status: string) => {
    if (status === 'lunas') return 'default' as const;
    if (status === 'cicilan') return 'outline' as const;
    return 'destructive' as const;
};

interface Props {
    rekamMedis: {
        data: RekamMedis[];
        links: { url: string | null; label: string; active: boolean }[];
    };
    filters: { status_bayar?: string };
}

export default function RekamMedisIndex({ rekamMedis, filters }: Props) {
    const { can } = usePermissions();
    const [statusBayar, setStatusBayar] = useState(filters.status_bayar ?? '');

    const handleFilter = () => {
        router.get(
            '/pelayanan/rekam-medis',
            { status_bayar: statusBayar },
            { preserveState: true },
        );
    };

    return (
        <>
            <Head title="Rekam Medis" />
            <div className="flex flex-1 flex-col gap-4 p-4">
                <div className="rounded-xl border bg-background p-6">
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold">Rekam Medis</h1>
                            <p className="text-muted-foreground">
                                Data rekam medis pasien rawat jalan
                            </p>
                        </div>
                        {can('rekam-medis.create') && (
                            <Button asChild>
                                <Link href="/pelayanan/rekam-medis/create">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Buat Rekam Medis
                                </Link>
                            </Button>
                        )}
                    </div>

                    <div className="mb-4 flex gap-2">
                        <Select
                            value={statusBayar}
                            onValueChange={(v) => {
                                setStatusBayar(v);
                            }}
                        >
                            <SelectTrigger className="w-44">
                                <SelectValue placeholder="Semua Status Bayar" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="belum_bayar">
                                    Belum Bayar
                                </SelectItem>
                                <SelectItem value="lunas">Lunas</SelectItem>
                                <SelectItem value="cicilan">Cicilan</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button variant="secondary" onClick={handleFilter}>
                            Filter
                        </Button>
                        {statusBayar && (
                            <Button
                                variant="ghost"
                                onClick={() => {
                                    setStatusBayar('');
                                    router.get(
                                        '/pelayanan/rekam-medis',
                                        {},
                                        { preserveState: true },
                                    );
                                }}
                            >
                                Reset
                            </Button>
                        )}
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>No. Rekam Medis</TableHead>
                                <TableHead>Pasien</TableHead>
                                <TableHead>Dokter</TableHead>
                                <TableHead>Poli</TableHead>
                                <TableHead>Total Biaya</TableHead>
                                <TableHead>Status Bayar</TableHead>
                                <TableHead className="text-right">
                                    Aksi
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rekamMedis.data.length > 0 ? (
                                rekamMedis.data.map((rm) => (
                                    <TableRow key={rm.id}>
                                        <TableCell className="font-mono text-xs">
                                            {rm.nomor_rekam_medis}
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium">
                                                    {
                                                        rm.kunjungan?.pasien
                                                            ?.full_name
                                                    }
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {
                                                        rm.kunjungan?.pasien
                                                            ?.medical_record_number
                                                    }
                                                </p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {rm.kunjungan?.dokter?.name ?? '-'}
                                        </TableCell>
                                        <TableCell>
                                            {rm.kunjungan?.poli?.nama_poli ??
                                                '-'}
                                        </TableCell>
                                        <TableCell>
                                            {rm.total_biaya_formatted}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={statusBayarVariant(
                                                    rm.status_bayar,
                                                )}
                                            >
                                                {rm.status_bayar_label}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                asChild
                                            >
                                                <Link
                                                    href={`/pelayanan/rekam-medis/${rm.id}`}
                                                >
                                                    <FileText className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={7}
                                        className="text-center"
                                    >
                                        Belum ada data rekam medis.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>

                    {rekamMedis.links.length > 3 && (
                        <div className="mt-4 flex flex-wrap gap-1">
                            {rekamMedis.links.map((link, i) =>
                                link.url ? (
                                    <Button
                                        key={i}
                                        asChild
                                        size="sm"
                                        variant={
                                            link.active ? 'default' : 'outline'
                                        }
                                    >
                                        <Link
                                            href={link.url}
                                            dangerouslySetInnerHTML={{
                                                __html: link.label,
                                            }}
                                        />
                                    </Button>
                                ) : (
                                    <Button
                                        key={i}
                                        size="sm"
                                        variant="outline"
                                        disabled
                                    >
                                        <span
                                            dangerouslySetInnerHTML={{
                                                __html: link.label,
                                            }}
                                        />
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

RekamMedisIndex.layout = { breadcrumbs };