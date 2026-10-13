import RawatInapForm from '@/pages/pelayanan/rawat-inap/components/rawat-inap-form';
import { type BreadcrumbItem } from '@/types';
import { type KamarOption, type RawatInapFormData } from '@/types/rawat-inap';
import { Head, useForm } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Rawat Inap', href: '/pelayanan/rawat-inap' },
    { title: 'Daftar Rawat Inap', href: '/pelayanan/rawat-inap/create' },
];

interface Props {
    pasiens: { id: number; full_name: string; medical_record_number: string }[];
    kamars: KamarOption[];
    dokters: { id: number; name: string }[];
}

export default function RawatInapCreate({ pasiens, kamars, dokters }: Props) {
    const { data, setData, post, processing, errors } = useForm<RawatInapFormData>({
        pasien_id: '',
        kamar_id: '',
        dokter_id: '',
        rekam_medis_id: '',
        tanggal_masuk: new Date().toISOString().split('T')[0],
        tanggal_keluar: '',
        status: 'aktif',
        // 🔧 FIX: klinik hanya menerima umum — nilai ini dikunci, tidak ada
        // input untuk mengubahnya (lihat rawat-inap-form.tsx).
        jenis_pembayaran: 'umum',
        nomor_bpjs: '',
        diagnosa_masuk: '',
        catatan: '',
        total_biaya: '0',
        status_bayar: 'belum_bayar',
    });

    return (
        <>
            <Head title="Daftar Rawat Inap" />
            <div className="flex flex-1 flex-col gap-4 p-4">
                <div className="bg-background rounded-xl border p-6">
                    <h1 className="mb-6 text-2xl font-bold">Daftar Rawat Inap</h1>
                    <RawatInapForm
                        data={data}
                        setData={setData}
                        errors={errors}
                        processing={processing}
                        onSubmit={(e) => { e.preventDefault(); post('/pelayanan/rawat-inap'); }}
                        submitLabel="Daftarkan"
                        pasiens={pasiens}
                        kamars={kamars}
                        dokters={dokters}
                        isEdit={false}
                    />
                </div>
            </div>
        </>
    );
}

RawatInapCreate.layout = { breadcrumbs };