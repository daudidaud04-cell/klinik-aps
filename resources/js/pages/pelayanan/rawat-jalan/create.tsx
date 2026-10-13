import KunjunganForm from '@/pages/pelayanan/rawat-jalan/components/kunjungan-form';
import { type BreadcrumbItem } from '@/types';
import { type KunjunganFormData, type Pasien, type PoliWithDoctors } from '@/types/rawat-jalan';
import { Head, useForm } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Rawat Jalan', href: '/pelayanan/rawat-jalan' },
    { title: 'Daftar Kunjungan', href: '/pelayanan/rawat-jalan/create' },
];

interface Props {
    pasiens: Pasien[];
    polis: PoliWithDoctors[];
}

export default function RawatJalanCreate({ pasiens, polis }: Props) {
    const { data, setData, post, processing, errors } = useForm<KunjunganFormData>({
        pasien_id: '',
        poli_id: '',
        dokter_id: '',
        tanggal_kunjungan: new Date().toISOString().split('T')[0],
        jam_masuk: '',
        status: 'menunggu',
        jenis_pembayaran: 'umum',
        nomor_bpjs: '',
        keluhan_utama: '',
        catatan: '',
    });
    return (
        <>
            <Head title="Daftar Kunjungan" />
            <div className="flex flex-1 flex-col gap-4 p-4">
                <div className="bg-background rounded-xl border p-6">
                    <h1 className="mb-6 text-2xl font-bold">Daftar Kunjungan Rawat Jalan</h1>
                    <KunjunganForm
                        data={data}
                        setData={setData}
                        errors={errors}
                        processing={processing}
                        onSubmit={(e) => {
                            e.preventDefault();
                            post('/pelayanan/rawat-jalan');
                        }}
                        submitLabel="Daftarkan"
                        pasiens={pasiens}
                        polis={polis}
                    />
                </div>
            </div>
        </>
    );
}
RawatJalanCreate.layout = { breadcrumbs };