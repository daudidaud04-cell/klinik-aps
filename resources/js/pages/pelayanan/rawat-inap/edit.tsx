import RawatInapForm from '@/pages/pelayanan/rawat-inap/components/rawat-inap-form';
import { type BreadcrumbItem } from '@/types';
import { type KamarOption, type RawatInap, type RawatInapFormData } from '@/types/rawat-inap';
import { Head, useForm } from '@inertiajs/react';

interface Props {
    rawatInap: RawatInap;
    pasiens: { id: number; full_name: string; medical_record_number: string }[];
    kamars: KamarOption[];
    dokters: { id: number; name: string }[];
}

export default function RawatInapEdit({ rawatInap, pasiens, kamars, dokters }: Props) {
    const { data, setData, put, processing, errors } = useForm<RawatInapFormData>({
        pasien_id: String(rawatInap.pasien_id),
        kamar_id: String(rawatInap.kamar_id),
        dokter_id: String(rawatInap.dokter_id),
        rekam_medis_id: rawatInap.rekam_medis_id ? String(rawatInap.rekam_medis_id) : '',
        tanggal_masuk: rawatInap.tanggal_masuk ? rawatInap.tanggal_masuk.slice(0, 10) : '',
        tanggal_keluar: rawatInap.tanggal_keluar ? rawatInap.tanggal_keluar.slice(0, 10) : '',
        status: rawatInap.status,
        // 🔧 FIX: dikunci ke 'umum' meski data lama (dari sebelum kebijakan
        // ini berlaku) mungkin masih 'bpjs'/'asuransi' — supaya begitu
        // record diedit & disimpan ulang, otomatis ter-normalisasi ke umum.
        jenis_pembayaran: 'umum',
        nomor_bpjs: '',
        diagnosa_masuk: rawatInap.diagnosa_masuk ?? '',
        catatan: rawatInap.catatan ?? '',
        total_biaya: String(rawatInap.total_biaya),
        status_bayar: rawatInap.status_bayar,
    });

    return (
        <>
            <Head title="Edit Rawat Inap" />
            <div className="flex flex-1 flex-col gap-4 p-4">
                <div className="bg-background rounded-xl border p-6">
                    <h1 className="mb-2 text-2xl font-bold">Edit Rawat Inap</h1>
                    <p className="text-muted-foreground mb-6 text-sm font-mono">{rawatInap.nomor_rawat_inap}</p>
                    <RawatInapForm
                        data={data}
                        setData={setData}
                        errors={errors}
                        processing={processing}
                        onSubmit={(e) => { e.preventDefault(); put(`/pelayanan/rawat-inap/${rawatInap.id}`); }}
                        submitLabel="Simpan Perubahan"
                        pasiens={pasiens}
                        kamars={kamars}
                        dokters={dokters}
                        isEdit={true}
                    />
                </div>
            </div>
        </>
    );
}

RawatInapEdit.layout = (props: { rawatInap: RawatInap }) => ({
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Rawat Inap', href: '/pelayanan/rawat-inap' },
        { title: `Edit: ${props.rawatInap.nomor_rawat_inap}`, href: `/pelayanan/rawat-inap/${props.rawatInap.id}/edit` },
    ] as BreadcrumbItem[],
});