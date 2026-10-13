import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { usePermissions } from '@/hooks/use-permissions';
import { type BreadcrumbItem } from '@/types';
import { type KamarOption, type RawatInap } from '@/types/rawat-inap';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, DoorOpen, LoaderCircle, Pencil } from 'lucide-react';
import { useState } from 'react';

function Row({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="grid grid-cols-3 gap-4 border-b py-2 text-sm last:border-0">
            <dt className="font-medium text-muted-foreground">{label}</dt>
            <dd className="col-span-2">{value ?? '-'}</dd>
        </div>
    );
}

const statusVariant = (status: string) => {
    if (status === 'aktif') return 'default' as const;
    if (status === 'pulang') return 'secondary' as const;
    if (status === 'meninggal' || status === 'pulang_paksa')
        return 'destructive' as const;
    return 'outline' as const;
};

const statusBayarVariant = (status: string) => {
    if (status === 'lunas') return 'default' as const;
    if (status === 'cicilan') return 'outline' as const;
    return 'destructive' as const;
};

const formatDate = (date: string | null | undefined) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
};

const STATUS_KELUAR = ['pulang', 'meninggal', 'pulang_paksa'];

// 🆕 Dialog "Pindah Kamar" — memicu endpoint khusus pindahKamar() supaya
// kamar_id, angka terisi kedua kamar, dan riwayat pemindahan tetap konsisten
// (form edit biasa TIDAK bisa dipakai untuk ganti kamar, lihat rawat-inap-form.tsx).
function PindahKamarDialog({
    rawatInap,
    kamars,
}: {
    rawatInap: RawatInap;
    kamars: KamarOption[];
}) {
    const [open, setOpen] = useState(false);
    const [kamarTujuanId, setKamarTujuanId] = useState('');
    const [alasan, setAlasan] = useState('');
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const kamarPilihan = kamars.filter(
        (k) => k.id !== rawatInap.kamar_id && k.terisi < k.kapasitas,
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!kamarTujuanId) return;

        setProcessing(true);
        setError(null);

        router.put(
            `/pelayanan/rawat-inap/${rawatInap.id}/pindah-kamar`,
            { kamar_tujuan_id: kamarTujuanId, alasan },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setOpen(false);
                    setKamarTujuanId('');
                    setAlasan('');
                },
                onError: (errors) => {
                    setError(errors.kamar_tujuan_id ?? errors.status ?? 'Gagal memindahkan kamar.');
                },
                onFinish: () => setProcessing(false),
            },
        );
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="secondary">
                    <DoorOpen className="mr-2 h-4 w-4" />
                    Pindah Kamar
                </Button>
            </DialogTrigger>
            <DialogContent>
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Pindah Kamar</DialogTitle>
                        <DialogDescription>
                            Pindahkan {rawatInap.pasien?.full_name} dari kamar{' '}
                            <span className="font-medium">{rawatInap.kamar?.nama_kamar}</span> ke kamar lain.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label>Kamar Tujuan *</Label>
                            <Select value={kamarTujuanId} onValueChange={setKamarTujuanId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih kamar tujuan" />
                                </SelectTrigger>
                                <SelectContent>
                                    {kamarPilihan.length === 0 ? (
                                        <div className="text-muted-foreground px-3 py-2 text-sm">
                                            Tidak ada kamar lain yang tersedia.
                                        </div>
                                    ) : (
                                        kamarPilihan.map((k) => (
                                            <SelectItem key={k.id} value={String(k.id)}>
                                                {k.kode_kamar} — {k.nama_kamar} ({k.kelas})
                                                {' '}[{k.kapasitas - k.terisi} tersisa]
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="alasan">Alasan (opsional)</Label>
                            <Textarea
                                id="alasan"
                                value={alasan}
                                onChange={(e) => setAlasan(e.target.value)}
                                placeholder="Mis. permintaan keluarga, kondisi pasien membaik, dsb."
                            />
                        </div>

                        {error && <p className="text-destructive text-sm">{error}</p>}
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                        >
                            Batal
                        </Button>
                        <Button type="submit" disabled={processing || !kamarTujuanId}>
                            {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                            Pindahkan
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default function RawatInapShow({
    rawatInap,
    kamars,
}: {
    rawatInap: RawatInap;
    kamars: KamarOption[];
}) {
    const { can } = usePermissions();

    // Pindah kamar & edit status hanya relevan kalau pasien masih dirawat
    const masihDirawat = !STATUS_KELUAR.includes(rawatInap.status);

    return (
        <>
            <Head title={`Rawat Inap - ${rawatInap.nomor_rawat_inap}`} />
            <div className="flex flex-1 flex-col gap-4 p-4">
                <div className="rounded-xl border bg-background p-6">
                    {/* Header */}
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold">
                                Detail Rawat Inap
                            </h1>
                            <p className="font-mono text-sm text-muted-foreground">
                                {rawatInap.nomor_rawat_inap}
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Button asChild variant="outline">
                                <Link href="/pelayanan/rawat-inap">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Kembali
                                </Link>
                            </Button>
                            {can('rawat-inap.update') && masihDirawat && (
                                <PindahKamarDialog rawatInap={rawatInap} kamars={kamars} />
                            )}
                            {can('rawat-inap.update') && (
                                <Button asChild>
                                    <Link
                                        href={`/pelayanan/rawat-inap/${rawatInap.id}/edit`}
                                    >
                                        <Pencil className="mr-2 h-4 w-4" />
                                        Edit
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </div>

                    <div className="grid max-w-4xl gap-6">
                        {/* Info Pasien & Kamar */}
                        <div className="grid grid-cols-2 gap-6">
                            <div className="rounded-lg border p-4">
                                <h2 className="mb-3 font-semibold">
                                    Data Pasien
                                </h2>
                                <dl>
                                    <Row
                                        label="No. RM"
                                        value={
                                            rawatInap.pasien
                                                ?.medical_record_number
                                        }
                                    />
                                    <Row
                                        label="Nama"
                                        value={rawatInap.pasien?.full_name}
                                    />
                                    <Row
                                        label="NIK"
                                        value={rawatInap.pasien?.nik}
                                    />
                                    <Row
                                        label="Telepon"
                                        value={rawatInap.pasien?.phone}
                                    />
                                </dl>
                            </div>
                            <div className="rounded-lg border p-4">
                                <h2 className="mb-3 font-semibold">
                                    Info Kamar
                                </h2>
                                <dl>
                                    <Row
                                        label="Kamar"
                                        value={rawatInap.kamar?.nama_kamar}
                                    />
                                    <Row
                                        label="Kelas"
                                        value={rawatInap.kamar?.kelas}
                                    />
                                    <Row
                                        label="Tarif/Hari"
                                        value={
                                            rawatInap.kamar?.tarif_harian
                                                ? `Rp ${Number(rawatInap.kamar.tarif_harian).toLocaleString('id-ID')}`
                                                : '-'
                                        }
                                    />
                                    <Row
                                        label="Dokter"
                                        value={rawatInap.dokter?.name}
                                    />
                                </dl>
                            </div>
                        </div>

                        {/* Info Perawatan */}
                        <div className="rounded-lg border p-4">
                            <h2 className="mb-3 font-semibold">
                                Info Perawatan
                            </h2>
                            <dl>
                                <Row
                                    label="Tanggal Masuk"
                                    value={formatDate(rawatInap.tanggal_masuk)}
                                />
                                <Row
                                    label="Tanggal Keluar"
                                    value={formatDate(rawatInap.tanggal_keluar)}
                                />
                                <Row
                                    label="Lama Inap"
                                    value={
                                        rawatInap.lama_inap
                                            ? `${rawatInap.lama_inap} hari`
                                            : '-'
                                    }
                                />
                                <Row
                                    label="Diagnosa Masuk"
                                    value={rawatInap.diagnosa_masuk}
                                />
                                <Row
                                    label="Pembayaran"
                                    value={
                                        <Badge variant="outline">
                                            {rawatInap.jenis_pembayaran_label}
                                        </Badge>
                                    }
                                />
                                <Row
                                    label="No. BPJS"
                                    value={rawatInap.nomor_bpjs}
                                />
                                <Row
                                    label="Status"
                                    value={
                                        <Badge
                                            variant={statusVariant(
                                                rawatInap.status,
                                            )}
                                        >
                                            {rawatInap.status_label}
                                        </Badge>
                                    }
                                />
                                <Row
                                    label="Total Biaya"
                                    value={
                                        <span className="font-semibold">
                                            {rawatInap.total_biaya_formatted}
                                        </span>
                                    }
                                />
                                <Row
                                    label="Status Bayar"
                                    value={
                                        <Badge
                                            variant={statusBayarVariant(
                                                rawatInap.status_bayar,
                                            )}
                                        >
                                            {rawatInap.status_bayar_label}
                                        </Badge>
                                    }
                                />
                            </dl>
                        </div>

                        {/* Perkembangan Harian */}
                        {rawatInap.details && rawatInap.details.length > 0 && (
                            <div className="rounded-lg border p-4">
                                <h2 className="mb-3 font-semibold">
                                    Perkembangan Harian
                                </h2>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Tanggal</TableHead>
                                            <TableHead>TD</TableHead>
                                            <TableHead>Suhu</TableHead>
                                            <TableHead>Nadi</TableHead>
                                            <TableHead>Perkembangan</TableHead>
                                            <TableHead>Biaya</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {rawatInap.details.map((d) => (
                                            <TableRow key={d.id}>
                                                <TableCell>
                                                    {formatDate(d.tanggal)}
                                                </TableCell>
                                                <TableCell>
                                                    {d.tekanan_darah ?? '-'}
                                                </TableCell>
                                                <TableCell>
                                                    {d.suhu_tubuh
                                                        ? `${d.suhu_tubuh}°C`
                                                        : '-'}
                                                </TableCell>
                                                <TableCell>
                                                    {d.nadi
                                                        ? `${d.nadi}x/mnt`
                                                        : '-'}
                                                </TableCell>
                                                <TableCell className="max-w-xs truncate">
                                                    {d.perkembangan ?? '-'}
                                                </TableCell>
                                                <TableCell>
                                                    {d.biaya_harian_formatted}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}

                        {/* Riwayat Pindah Kamar */}
                        {rawatInap.pemindahan_kamars &&
                            rawatInap.pemindahan_kamars.length > 0 && (
                                <div className="rounded-lg border p-4">
                                    <h2 className="mb-3 font-semibold">
                                        Riwayat Pindah Kamar
                                    </h2>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Tanggal</TableHead>
                                                <TableHead>
                                                    Dari Kamar
                                                </TableHead>
                                                <TableHead>Ke Kamar</TableHead>
                                                <TableHead>Alasan</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {rawatInap.pemindahan_kamars.map(
                                                (p) => (
                                                    <TableRow key={p.id}>
                                                        <TableCell>
                                                            {formatDate(
                                                                p.tanggal_pindah,
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            {p.kamar_asal
                                                                ?.nama_kamar ??
                                                                '-'}
                                                        </TableCell>
                                                        <TableCell>
                                                            {p.kamar_tujuan
                                                                ?.nama_kamar ??
                                                                '-'}
                                                        </TableCell>
                                                        <TableCell>
                                                            {p.alasan ?? '-'}
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

RawatInapShow.layout = (props: { rawatInap: RawatInap }) => ({
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Rawat Inap', href: '/pelayanan/rawat-inap' },
        {
            title: props.rawatInap.nomor_rawat_inap,
            href: `/pelayanan/rawat-inap/${props.rawatInap.id}`,
        },
    ] as BreadcrumbItem[],
});