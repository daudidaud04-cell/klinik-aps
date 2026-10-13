import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Pencil } from 'lucide-react';

interface ClinicRate {
    id: number;
    kode_tarif: string;
    nama_tarif: string;
    kategori: string;
    harga_formatted: string;
    harga_after_tax_formatted: string;
    is_taxable: boolean;
    tax_percent: number;
    deskripsi: string | null;
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

export default function ClinicRatesShow({ clinicRate }: { clinicRate: ClinicRate }) {
    return (
        <>
            <Head title={`Tarif - ${clinicRate.nama_tarif}`} />
            <div className="flex flex-1 flex-col gap-4 p-4">
                <div className="bg-background rounded-xl border p-6">
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold">{clinicRate.nama_tarif}</h1>
                            <p className="text-muted-foreground">Kode: {clinicRate.kode_tarif}</p>
                        </div>
                        <div className="flex gap-2">
                            <Button asChild variant="outline">
                                <Link href="/clinic-rates">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Kembali
                                </Link>
                            </Button>
                            <Button asChild>
                                <Link href={`/clinic-rates/${clinicRate.id}/edit`}>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Edit
                                </Link>
                            </Button>
                        </div>
                    </div>

                    <dl className="max-w-2xl">
                        <Row label="Kode Tarif" value={clinicRate.kode_tarif} />
                        <Row label="Nama Tarif" value={clinicRate.nama_tarif} />
                        <Row label="Kategori" value={<Badge variant="outline">{clinicRate.kategori}</Badge>} />
                        <Row label="Harga" value={clinicRate.harga_formatted} />
                        <Row
                            label="Kena Pajak"
                            value={
                                clinicRate.is_taxable
                                    ? <Badge variant="secondary">Ya ({clinicRate.tax_percent}%)</Badge>
                                    : <span className="text-muted-foreground">Tidak</span>
                            }
                        />
                        {clinicRate.is_taxable && (
                            <Row label="Harga + Pajak" value={clinicRate.harga_after_tax_formatted} />
                        )}
                        <Row label="Deskripsi" value={clinicRate.deskripsi} />
                        <Row
                            label="Status"
                            value={
                                <Badge variant={clinicRate.status === 'aktif' ? 'default' : 'secondary'}>
                                    {clinicRate.status_label}
                                </Badge>
                            }
                        />
                    </dl>
                </div>
            </div>
        </>
    );
}

ClinicRatesShow.layout = (props: { clinicRate: ClinicRate }) => ({
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Tarif Klinik', href: '/clinic-rates' },
        { title: props.clinicRate.nama_tarif, href: `/clinic-rates/${props.clinicRate.id}` },
    ] as BreadcrumbItem[],
});