import LabExaminationForm, { type LabExaminationFormData } from '@/pages/lab-examinations/components/lab-examination-form';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';

interface LabExamination {
    id: number;
    kode_pemeriksaan: string;
    nama_pemeriksaan: string;
    kategori: string;
    harga: number;
    satuan_hasil: string | null;
    nilai_normal_min: string | null;
    nilai_normal_max: string | null;
    deskripsi: string | null;
    estimasi_durasi_menit: number;
    status: string;
}

export default function LabExaminationsEdit({ labExamination }: { labExamination: LabExamination }) {
    const { data, setData, put, processing, errors } = useForm<LabExaminationFormData>({
        kode_pemeriksaan: labExamination.kode_pemeriksaan,
        nama_pemeriksaan: labExamination.nama_pemeriksaan,
        kategori: labExamination.kategori,
        harga: String(labExamination.harga),
        satuan_hasil: labExamination.satuan_hasil ?? '',
        nilai_normal_min: labExamination.nilai_normal_min ?? '',
        nilai_normal_max: labExamination.nilai_normal_max ?? '',
        deskripsi: labExamination.deskripsi ?? '',
        estimasi_durasi_menit: String(labExamination.estimasi_durasi_menit),
        status: labExamination.status,
    });

    return (
        <>
            <Head title="Edit Pemeriksaan Lab" />
            <div className="flex flex-1 flex-col gap-4 p-4">
                <div className="bg-background rounded-xl border p-6">
                    <h1 className="mb-6 text-2xl font-bold">Edit Pemeriksaan Lab</h1>
                    <LabExaminationForm
                        data={data}
                        setData={setData}
                        errors={errors}
                        processing={processing}
                        onSubmit={(e) => { e.preventDefault(); put(`/lab-examinations/${labExamination.id}`); }}
                        submitLabel="Simpan Perubahan"
                    />
                </div>
            </div>
        </>
    );
}

LabExaminationsEdit.layout = (props: { labExamination: LabExamination }) => ({
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Pemeriksaan Lab', href: '/lab-examinations' },
        { title: `Edit: ${props.labExamination.nama_pemeriksaan}`, href: `/lab-examinations/${props.labExamination.id}/edit` },
    ] as BreadcrumbItem[],
});