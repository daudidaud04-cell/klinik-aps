import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Poli', href: '/master-data/polis' },
    { title: 'Detail Poli', href: '#' },
];

interface Doctor {
    id: number;
    name: string;
    specialization: string | null;
}

interface Poli {
    id: number;
    kode_poli: string;
    nama_poli: string;
    deskripsi: string | null;
    jadwal: string | null;
    status: string;
    // 🔧 FIX: doctor_id & doctor (tunggal) diganti jadi doctors (array)
    doctors: Doctor[];
}

interface Props {
    poli: Poli;
}

function Info({ label, value }: { label: string; value: string | null | undefined }) {
    return (
        <div>
            <p className="text-muted-foreground text-sm">{label}</p>
            <p className="font-medium">{value || '-'}</p>
        </div>
    );
}

export default function ShowPoli({ poli }: Props) {
    return (
        <>
            <Head title={`Detail Poli - ${poli.nama_poli}`} />

            <div className="flex flex-1 flex-col gap-4 p-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Detail Poli</CardTitle>
                        <div className="flex gap-2">
                            <Button variant="outline" asChild>
                                <Link href="/master-data/polis">Kembali</Link>
                            </Button>
                            <Button asChild>
                                <Link href={`/master-data/polis/${poli.id}/edit`}>Edit</Link>
                            </Button>
                        </div>
                    </CardHeader>

                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2">
                            <Info label="Kode Poli" value={poli.kode_poli} />
                            <Info label="Nama Poli" value={poli.nama_poli} />
                            <Info label="Jadwal" value={poli.jadwal} />
                            <div>
                                <p className="text-muted-foreground text-sm">Status</p>
                                <Badge variant={poli.status === 'aktif' ? 'default' : 'secondary'}>
                                    {poli.status === 'aktif' ? 'Aktif' : 'Nonaktif'}
                                </Badge>
                            </div>
                        </div>

                        {/* 🔧 FIX UTAMA: sekarang menampilkan DAFTAR dokter,
                            bukan cuma satu nama. Ditampilkan sebagai badge-badge
                            supaya rapi kalau jumlahnya banyak. */}
                        <div className="mt-6">
                            <p className="text-muted-foreground mb-2 text-sm">Dokter Praktik</p>
                            {poli.doctors && poli.doctors.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {poli.doctors.map((doctor) => (
                                        <Badge key={doctor.id} variant="outline">
                                            {doctor.name}
                                            {doctor.specialization ? ` (${doctor.specialization})` : ''}
                                        </Badge>
                                    ))}
                                </div>
                            ) : (
                                <p className="font-medium">-</p>
                            )}
                        </div>

                        {poli.deskripsi && (
                            <div className="mt-6">
                                <h3 className="mb-2 font-semibold">Deskripsi</h3>
                                <div className="rounded-lg border p-3">{poli.deskripsi}</div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

ShowPoli.layout = {
    breadcrumbs,
};