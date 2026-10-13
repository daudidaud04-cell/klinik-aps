import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Riwayat Pasien', href: '/patient-histories' },
    { title: 'Detail Riwayat', href: '#' },
];

interface History {
    id: number;
    type: string;
    visit_date: string;
    chief_complaint: string | null;
    diagnosis_summary: string | null;
    total_biaya: number;
    status_bayar: string;
    patient: { full_name: string; medical_record_number: string };
    doctor: { name: string } | null;
    poli: { nama_poli: string } | null;
}

interface Props {
    history: History;
}

function Info({ label, value }: { label: string; value: string | null | undefined }) {
    return (
        <div>
            <p className="text-muted-foreground text-sm">{label}</p>
            <p className="font-medium">{value || '-'}</p>
        </div>
    );
}

export default function ShowPatientHistory({ history }: Props) {
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

    const formatRupiah = (value: number) => 'Rp ' + Number(value).toLocaleString('id-ID');
    const formatDate = (date: string) =>
        new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

    return (
        <>
            <Head title="Detail Riwayat Pasien" />

            <div className="flex flex-1 flex-col gap-4 p-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Detail Riwayat Pasien</CardTitle>
                        <div className="flex gap-2">
                            <Button variant="outline" asChild>
                                <Link href="/patient-histories">Kembali</Link>
                            </Button>
                            <Button asChild>
                                <Link href={`/patient-histories/${history.id}/edit`}>Edit</Link>
                            </Button>
                        </div>
                    </CardHeader>

                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2">
                            <Info label="Nama Pasien" value={history.patient.full_name} />
                            <Info label="No. Rekam Medis" value={history.patient.medical_record_number} />
                            <Info label="Jenis Kunjungan" value={typeLabel(history.type)} />
                            <Info label="Tanggal Kunjungan" value={formatDate(history.visit_date)} />
                            <Info label="Dokter" value={history.doctor?.name} />
                            <Info label="Poli" value={history.poli?.nama_poli} />
                            <Info label="Total Biaya" value={formatRupiah(history.total_biaya)} />
                            <div>
                                <p className="text-muted-foreground text-sm">Status Bayar</p>
                                <Badge variant={
                                    history.status_bayar === 'lunas' ? 'default' :
                                    history.status_bayar === 'cicilan' ? 'secondary' : 'destructive'
                                }>
                                    {history.status_bayar === 'lunas' ? 'Lunas' :
                                     history.status_bayar === 'cicilan' ? 'Cicilan' : 'Belum Bayar'}
                                </Badge>
                            </div>
                        </div>

                        {history.chief_complaint && (
                            <div className="mt-6">
                                <h3 className="mb-2 font-semibold">Keluhan Utama</h3>
                                <div className="rounded-lg border p-3">{history.chief_complaint}</div>
                            </div>
                        )}

                        {history.diagnosis_summary && (
                            <div className="mt-6">
                                <h3 className="mb-2 font-semibold">Ringkasan Diagnosis</h3>
                                <div className="rounded-lg border p-3">{history.diagnosis_summary}</div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

ShowPatientHistory.layout = {
    breadcrumbs,
};