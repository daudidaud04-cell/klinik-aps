import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { type PemeriksaanLab } from '@/types/laboratorium';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Pencil } from 'lucide-react';

function Row({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="grid grid-cols-3 gap-4 border-b py-2 text-sm last:border-0">
            <dt className="font-medium text-muted-foreground">{label}</dt>
            <dd className="col-span-2">{value ?? '-'}</dd>
        </div>
    );
}

const keteranganVariant = (ket: string) => {
    if (ket === 'tinggi') return 'destructive' as const;
    if (ket === 'rendah') return 'outline' as const;
    if (ket === 'normal') return 'default' as const;
    return 'secondary' as const;
};

export default function LaboratoriumShow({
    pemeriksaan,
}: {
    pemeriksaan: PemeriksaanLab;
}) {
    const { can } = usePermissions();

    return (
        <>
            <Head title={`Lab - ${pemeriksaan.nomor_pemeriksaan}`} />
            <div className="flex flex-1 flex-col gap-4 p-4">
                <div className="rounded-xl border bg-background p-6">
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold">
                                Hasil Pemeriksaan Lab
                            </h1>
                            <p className="font-mono text-sm text-muted-foreground">
                                {pemeriksaan.nomor_pemeriksaan}
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Button asChild variant="outline">
                                <Link href="/pelayanan/laboratorium">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Kembali
                                </Link>
                            </Button>
                            {can('laboratorium.update') && (
                                <Button asChild>
                                    <Link
                                        href={`/pelayanan/laboratorium/${pemeriksaan.id}/edit`}
                                    >
                                        <Pencil className="mr-2 h-4 w-4" />
                                        Edit
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </div>

                    <div className="grid max-w-4xl gap-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="rounded-lg border p-4">
                                <h2 className="mb-3 font-semibold">
                                    Data Pasien
                                </h2>
                                <dl>
                                    <Row
                                        label="No. RM"
                                        value={
                                            pemeriksaan.pasien
                                                ?.medical_record_number
                                        }
                                    />
                                    <Row
                                        label="Nama"
                                        value={pemeriksaan.pasien?.full_name}
                                    />
                                </dl>
                            </div>
                            <div className="rounded-lg border p-4">
                                <h2 className="mb-3 font-semibold">
                                    Info Pemeriksaan
                                </h2>
                                <dl>
                                    <Row
                                        label="Jenis"
                                        value={
                                            pemeriksaan.jenis?.nama_pemeriksaan
                                        }
                                    />
                                    <Row
                                        label="Kategori"
                                        value={pemeriksaan.jenis?.kategori}
                                    />
                                    <Row
                                        label="Tanggal"
                                        value={pemeriksaan.tanggal_pemeriksaan}
                                    />
                                    <Row
                                        label="Harga"
                                        value={pemeriksaan.harga_formatted}
                                    />
                                    <Row
                                        label="Status"
                                        value={
                                            <Badge
                                                variant={
                                                    pemeriksaan.status ===
                                                    'selesai'
                                                        ? 'default'
                                                        : pemeriksaan.status ===
                                                            'batal'
                                                          ? 'destructive'
                                                          : 'outline'
                                                }
                                            >
                                                {pemeriksaan.status_label}
                                            </Badge>
                                        }
                                    />
                                </dl>
                            </div>
                        </div>

                        {pemeriksaan.hasil_labs &&
                            pemeriksaan.hasil_labs.length > 0 && (
                                <div className="rounded-lg border p-4">
                                    <h2 className="mb-3 font-semibold">
                                        Hasil Pemeriksaan
                                    </h2>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Parameter</TableHead>
                                                <TableHead>Nilai</TableHead>
                                                <TableHead>Satuan</TableHead>
                                                <TableHead>
                                                    Nilai Normal
                                                </TableHead>
                                                <TableHead>
                                                    Keterangan
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {pemeriksaan.hasil_labs.map(
                                                (h, i) => (
                                                    <TableRow key={i}>
                                                        <TableCell className="font-medium">
                                                            {h.parameter}
                                                        </TableCell>
                                                        <TableCell className="font-mono">
                                                            {h.nilai}
                                                        </TableCell>
                                                        <TableCell>
                                                            {h.satuan || '-'}
                                                        </TableCell>
                                                        <TableCell>
                                                            {h.nilai_normal ||
                                                                '-'}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge
                                                                variant={keteranganVariant(
                                                                    h.keterangan,
                                                                )}
                                                            >
                                                                {h.keterangan ===
                                                                'tinggi'
                                                                    ? 'Tinggi ↑'
                                                                    : h.keterangan ===
                                                                        'rendah'
                                                                      ? 'Rendah ↓'
                                                                      : h.keterangan ===
                                                                          'normal'
                                                                        ? 'Normal'
                                                                        : '-'}
                                                            </Badge>
                                                        </TableCell>
                                                    </TableRow>
                                                ),
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                    </div>
                </div>
            </div>
        </>
    );
}

LaboratoriumShow.layout = (props: { pemeriksaan: PemeriksaanLab }) => ({
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Laboratorium', href: '/pelayanan/laboratorium' },
        {
            title: props.pemeriksaan.nomor_pemeriksaan,
            href: `/pelayanan/laboratorium/${props.pemeriksaan.id}`,
        },
    ] as BreadcrumbItem[],
});
