import LabExaminationForm, { type LabExaminationFormData } from '@/pages/lab-examinations/components/lab-examination-form';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Pemeriksaan Lab', href: '/lab-examinations' },
    { title: 'Tambah Pemeriksaan', href: '/lab-examinations/create' },
];

export default function LabExaminationsCreate() {
    const { data, setData, post, processing, errors } = useForm<LabExaminationFormData>({
        kode_pemeriksaan: '',
        nama_pemeriksaan: '',
        kategori: '',
        harga: '0',
        satuan_hasil: '',
        nilai_normal_min: '',
        nilai_normal_max: '',
        deskripsi: '',
        estimasi_durasi_menit: '30',
        status: 'aktif',
    });

    return (
        <>
            <Head title="Tambah Pemeriksaan Lab" />
            <div className="flex flex-1 flex-col gap-4 p-4">
                <div className="bg-background rounded-xl border p-6">
                    <h1 className="mb-6 text-2xl font-bold">Tambah Pemeriksaan Lab</h1>
                    <LabExaminationForm
                        data={data}
                        setData={setData}
                        errors={errors}
                        processing={processing}
                        onSubmit={(e) => { e.preventDefault(); post('/lab-examinations'); }}
                        submitLabel="Simpan"
                    />
                </div>
            </div>
        </>
    );
}

LabExaminationsCreate.layout = { breadcrumbs };