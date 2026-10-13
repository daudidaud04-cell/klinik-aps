import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { usePermissions } from '@/hooks/use-permissions';
import { type BreadcrumbItem } from '@/types';
import { type KunjunganRawatJalan } from '@/types/rawat-jalan';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, ClipboardPlus, Pencil } from 'lucide-react';

function Row({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="grid grid-cols-3 gap-4 border-b py-3 text-sm last:border-0">
            <dt className="font-medium text-muted-foreground">{label}</dt>
            <dd className="col-span-2">{value ?? '-'}</dd>
        </div>
    );
}

const statusVariant = (status: string) => {
    if (status === 'selesai') return 'default' as const;
    if (status === 'dalam_pemeriksaan') return 'secondary' as const;
    if (status === 'batal') return 'destructive' as const;
    return 'outline' as const;
};

export default function RawatJalanShow({
    kunjungan,
}: {
    kunjungan: KunjunganRawatJalan;
}) {
    const { can } = usePermissions();

    return (
        <>
            <Head title={`Kunjungan - ${kunjungan.nomor_kunjungan}`} />
            <div className="flex flex-1 flex-col gap-4 p-4">
                <div className="rounded-xl border bg-background p-6">
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold">
                                Detail Kunjungan
                            </h1>
                            <p className="font-mono text-sm text-muted-foreground">
                                {kunjungan.nomor_kunjungan}
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Button asChild variant="outline">
                                <Link href="/pelayanan/rawat-jalan">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Kembali
                                </Link>
                            </Button>
                            {/* Tombol buat rekam medis hanya jika belum ada */}
                            {!kunjungan.rekam_medis &&
                                kunjungan.status !== 'batal' &&
                                can('rekam-medis.create') && (
                                    <Button asChild variant="secondary">
                                        <Link
                                            href={`/pelayanan/rekam-medis/create?kunjungan_id=${kunjungan.id}`}
                                        >
                                            <ClipboardPlus className="mr-2 h-4 w-4" />
                                            Buat Rekam Medis
                                        </Link>
                                    </Button>
                                )}
                            {kunjungan.rekam_medis && (
                                <Button asChild variant="secondary">
                                    <Link
                                        href={`/pelayanan/rekam-medis/${kunjungan.rekam_medis.id}`}
                                    >
                                        <ClipboardPlus className="mr-2 h-4 w-4" />
                                        Lihat Rekam Medis
                                    </Link>
                                </Button>
                            )}
                            {can('rawat-jalan.update') && (
                                <Button asChild>
                                    <Link
                                        href={`/pelayanan/rawat-jalan/${kunjungan.id}/edit`}
                                    >
                                        <Pencil className="mr-2 h-4 w-4" />
                                        Edit
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </div>

                    <div className="grid max-w-4xl grid-cols-2 gap-6">
                        {/* Info Pasien */}
                        <div className="rounded-lg border p-4">
                            <h2 className="mb-3 font-semibold">Data Pasien</h2>
                            <dl>
                                <Row
                                    label="No. RM"
                                    value={
                                        kunjungan.pasien?.medical_record_number
                                    }
                                />
                                <Row
                                    label="Nama"
                                    value={kunjungan.pasien?.full_name}
                                />
                                <Row
                                    label="NIK"
                                    value={kunjungan.pasien?.nik}
                                />
                                <Row
                                    label="Telepon"
                                    value={kunjungan.pasien?.phone}
                                />
                            </dl>
                        </div>

                        {/* Info Kunjungan */}
                        <div className="rounded-lg border p-4">
                            <h2 className="mb-3 font-semibold">
                                Info Kunjungan
                            </h2>
                            <dl>
                                <Row
                                    label="Tanggal"
                                    value={kunjungan.tanggal_kunjungan}
                                />
                                <Row
                                    label="Jam Masuk"
                                    value={kunjungan.jam_masuk}
                                />
                                <Row
                                    label="Poli"
                                    value={kunjungan.poli?.nama_poli}
                                />
                                <Row
                                    label="Dokter"
                                    value={kunjungan.dokter?.name}
                                />
                                <Row
                                    label="Pembayaran"
                                    value={
                                        <Badge variant="outline">
                                            {kunjungan.jenis_pembayaran_label}
                                        </Badge>
                                    }
                                />
                                <Row
                                    label="No. BPJS"
                                    value={kunjungan.nomor_bpjs}
                                />
                                <Row
                                    label="Status"
                                    value={
                                        <Badge
                                            variant={statusVariant(
                                                kunjungan.status,
                                            )}
                                        >
                                            {kunjungan.status_label}
                                        </Badge>
                                    }
                                />
                            </dl>
                        </div>
                    </div>

                    {/* Keluhan */}
                    {kunjungan.keluhan_utama && (
                        <div className="mt-4 max-w-4xl rounded-lg border p-4">
                            <h2 className="mb-2 font-semibold">
                                Keluhan Utama
                            </h2>
                            <p className="text-sm">{kunjungan.keluhan_utama}</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

RawatJalanShow.layout = (props: { kunjungan: KunjunganRawatJalan }) => ({
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Rawat Jalan', href: '/pelayanan/rawat-jalan' },
        {
            title: props.kunjungan.nomor_kunjungan,
            href: `/pelayanan/rawat-jalan/${props.kunjungan.id}`,
        },
    ] as BreadcrumbItem[],
});
