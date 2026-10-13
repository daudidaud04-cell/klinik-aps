import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Pencil } from 'lucide-react';

interface LabExamination {
    id: number;
    kode_pemeriksaan: string;
    nama_pemeriksaan: string;
    kategori: string;
    harga_formatted: string;
    satuan_hasil: string | null;
    nilai_normal_range: string | null;
    nilai_normal_min: string | null;
    nilai_normal_max: string | null;
    deskripsi: string | null;
    estimasi_durasi_menit: number;
    status: string;
    status_label: string;
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="grid grid-cols-3 gap-4 border-b py-3 text-sm last:border-0">
            <dt className="text-muted-foreground font-medium">{label}</dt>
            <dd className="col-span-2">{value ?? '-'}</dd>
        </div>
    );
}

export default function LabExaminationsShow({ labExamination }: { labExamination: LabExamination }) {
    return (
        <>
            <Head title={`Lab - ${labExamination.nama_pemeriksaan}`} />
            <div className="flex flex-1 flex-col gap-4 p-4">
                <div className="bg-background rounded-xl border p-6">
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold">{labExamination.nama_pemeriksaan}</h1>
                            <p className="text-muted-foreground">Kode: {labExamination.kode_pemeriksaan}</p>
                        </div>
                        <div className="flex gap-2">
                            <Button asChild variant="outline">
                                <Link href="/lab-examinations">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Kembali
                                </Link>
                            </Button>
                            <Button asChild>
                                <Link href={`/lab-examinations/${labExamination.id}/edit`}>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Edit
                                </Link>
                            </Button>
                        </div>
                    </div>

                    <dl className="max-w-2xl">
                        <Row label="Kode Pemeriksaan" value={labExamination.kode_pemeriksaan} />
                        <Row label="Nama Pemeriksaan" value={labExamination.nama_pemeriksaan} />
                        <Row label="Kategori" value={<Badge variant="outline">{labExamination.kategori}</Badge>} />
                        <Row label="Harga" value={labExamination.harga_formatted} />
                        <Row label="Satuan Hasil" value={labExamination.satuan_hasil} />
                        <Row label="Nilai Normal" value={labExamination.nilai_normal_range} />
                        <Row label="Estimasi Durasi" value={`${labExamination.estimasi_durasi_menit} menit`} />
                        <Row label="Deskripsi" value={labExamination.deskripsi} />
                        <Row
                            label="Status"
                            value={
                                <Badge variant={labExamination.status === 'aktif' ? 'default' : 'secondary'}>
                                    {labExamination.status_label}
                                </Badge>
                            }
                        />
                    </dl>
                </div>
            </div>
        </>
    );
}

LabExaminationsShow.layout = (props: { labExamination: LabExamination }) => ({
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Pemeriksaan Lab', href: '/lab-examinations' },
        { title: props.labExamination.nama_pemeriksaan, href: `/lab-examinations/${props.labExamination.id}` },
    ] as BreadcrumbItem[],
});