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
import { type ResepObat } from '@/types/resep-obat';
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

// 🔧 FIX: parsing manual dari string "YYYY-MM-DD" (atau ISO datetime yang
// di-slice ke 10 karakter pertama), tanpa lewat `new Date(isoString)`.
// Kenapa: `new Date("2026-07-11")` (tanpa jam) di-parse sebagai UTC midnight
// oleh spesifikasi JS, lalu saat ditampilkan browser mengonversi ke
// timezone lokal — bisa mundur/maju sehari tergantung timezone browser
// pengguna. Dengan membangun Date dari komponen year/month/day secara
// eksplisit (constructor lokal), tidak ada konversi timezone sama sekali.
function formatTanggal(value: string | null | undefined) {
    if (!value) return '-';
    const [year, month, day] = value.slice(0, 10).split('-').map(Number);
    if (!year || !month || !day) return '-';

    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}

export default function ResepObatShow({ resep }: { resep: ResepObat }) {
    const { can } = usePermissions();

    return (
        <>
            <Head title={`Resep - ${resep.nomor_resep}`} />
            <div className="flex flex-1 flex-col gap-4 p-4">
                <div className="rounded-xl border bg-background p-6">
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold">
                                Detail Resep Obat
                            </h1>
                            <p className="font-mono text-sm text-muted-foreground">
                                {resep.nomor_resep}
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Button asChild variant="outline">
                                <Link href="/pelayanan/resep-obat">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Kembali
                                </Link>
                            </Button>
                            {can('resep-obat.update') && (
                                <Button asChild>
                                    <Link
                                        href={`/pelayanan/resep-obat/${resep.id}/edit`}
                                    >
                                        <Pencil className="mr-2 h-4 w-4" />
                                        Edit
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </div>

                    <div className="grid max-w-4xl gap-6">
                        <div className="rounded-lg border p-4">
                            <h2 className="mb-3 font-semibold">
                                Informasi Resep
                            </h2>
                            <dl>
                                <Row
                                    label="Pasien"
                                    value={`${resep.pasien?.full_name} (${resep.pasien?.medical_record_number})`}
                                />
                                <Row
                                    label="Dokter"
                                    value={resep.dokter?.name}
                                />
                                <Row
                                    label="Tanggal"
                                    value={formatTanggal(resep.tanggal_resep)}
                                />
                                <Row
                                    label="Status"
                                    value={
                                        <Badge
                                            variant={
                                                resep.status === 'selesai'
                                                    ? 'default'
                                                    : resep.status === 'batal'
                                                      ? 'destructive'
                                                      : 'outline'
                                            }
                                        >
                                            {resep.status_label}
                                        </Badge>
                                    }
                                />
                                <Row label="Catatan" value={resep.catatan} />
                                <Row
                                    label="Total Harga"
                                    value={
                                        <span className="font-semibold">
                                            {resep.total_harga_formatted}
                                        </span>
                                    }
                                />
                            </dl>
                        </div>

                        {resep.details && resep.details.length > 0 && (
                            <div className="rounded-lg border p-4">
                                <h2 className="mb-3 font-semibold">
                                    Daftar Obat
                                </h2>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Nama Obat</TableHead>
                                            <TableHead>Satuan</TableHead>
                                            <TableHead>Jumlah</TableHead>
                                            <TableHead>Aturan Pakai</TableHead>
                                            <TableHead>Keterangan</TableHead>
                                            <TableHead>Subtotal</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {resep.details.map((d, i) => (
                                            <TableRow key={i}>
                                                <TableCell>
                                                    <div>
                                                        <p className="font-medium">
                                                            {d.obat?.nama_obat}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {d.obat?.kode_obat}
                                                        </p>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {d.obat?.satuan}
                                                </TableCell>
                                                <TableCell>
                                                    {d.jumlah}
                                                </TableCell>
                                                <TableCell>
                                                    {d.aturan_pakai}
                                                </TableCell>
                                                <TableCell>
                                                    {d.keterangan ?? '-'}
                                                </TableCell>
                                                <TableCell>
                                                    {d.subtotal_formatted}
                                                </TableCell>
                                            </TableRow>
                                        ))}
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

ResepObatShow.layout = (props: { resep: ResepObat }) => ({
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Resep Obat', href: '/pelayanan/resep-obat' },
        {
            title: props.resep.nomor_resep,
            href: `/pelayanan/resep-obat/${props.resep.id}`,
        },
    ] as BreadcrumbItem[],
});