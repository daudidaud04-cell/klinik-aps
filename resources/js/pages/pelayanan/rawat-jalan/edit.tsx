import KunjunganForm from '@/pages/pelayanan/rawat-jalan/components/kunjungan-form';
import { type BreadcrumbItem } from '@/types';
import { type KunjunganFormData, type KunjunganRawatJalan } from '@/types/rawat-jalan';
import { Head, useForm } from '@inertiajs/react';

interface Props {
    kunjungan: KunjunganRawatJalan;
    pasiens: { id: number; full_name: string; medical_record_number: string }[];
    polis: { id: number; nama_poli: string }[];
    dokters: { id: number; name: string }[];
}

export default function RawatJalanEdit({ kunjungan, pasiens, polis, dokters }: Props) {
    const { data, setData, put, processing, errors } = useForm<KunjunganFormData>({
        pasien_id: String(kunjungan.pasien_id),
        poli_id: String(kunjungan.poli_id),
        dokter_id: String(kunjungan.dokter_id),
        tanggal_kunjungan: kunjungan.tanggal_kunjungan,
        jam_masuk: kunjungan.jam_masuk ?? '',
        status: kunjungan.status,
        jenis_pembayaran: kunjungan.jenis_pembayaran,
        nomor_bpjs: kunjungan.nomor_bpjs ?? '',
        keluhan_utama: kunjungan.keluhan_utama ?? '',
        catatan: kunjungan.catatan ?? '',
    });

    return (
        <>
            <Head title="Edit Kunjungan" />
            <div className="flex flex-1 flex-col gap-4 p-4">
                <div className="bg-background rounded-xl border p-6">
                    <h1 className="mb-6 text-2xl font-bold">Edit Kunjungan</h1>
                    <p className="text-muted-foreground mb-6 text-sm">No: {kunjungan.nomor_kunjungan}</p>
                    <KunjunganForm
                        data={data}
                        setData={setData}
                        errors={errors}
                        processing={processing}
                        onSubmit={(e) => { e.preventDefault(); put(`/pelayanan/rawat-jalan/${kunjungan.id}`); }}
                        submitLabel="Simpan Perubahan"
                        pasiens={pasiens}
                        polis={polis}
                        dokters={dokters}
                    />
                </div>
            </div>
        </>
    );
}

RawatJalanEdit.layout = (props: { kunjungan: KunjunganRawatJalan }) => ({
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Rawat Jalan', href: '/pelayanan/rawat-jalan' },
        { title: `Edit: ${props.kunjungan.nomor_kunjungan}`, href: `/pelayanan/rawat-jalan/${props.kunjungan.id}/edit` },
    ] as BreadcrumbItem[],
});