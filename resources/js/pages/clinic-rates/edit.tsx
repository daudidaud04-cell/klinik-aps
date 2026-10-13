import ClinicRateForm, { type ClinicRateFormData } from '@/pages/clinic-rates/components/clinic-rate-form';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';

interface ClinicRate {
    id: number;
    kode_tarif: string;
    nama_tarif: string;
    kategori: string;
    harga: number;
    is_taxable: boolean;
    tax_percent: number;
    deskripsi: string | null;
    status: string;
}

export default function ClinicRatesEdit({ clinicRate }: { clinicRate: ClinicRate }) {
    const { data, setData, put, processing, errors } = useForm<ClinicRateFormData>({
        kode_tarif: clinicRate.kode_tarif,
        nama_tarif: clinicRate.nama_tarif,
        kategori: clinicRate.kategori,
        harga: String(clinicRate.harga),
        is_taxable: clinicRate.is_taxable,
        tax_percent: String(clinicRate.tax_percent),
        deskripsi: clinicRate.deskripsi ?? '',
        status: clinicRate.status,
    });

    return (
        <>
            <Head title="Edit Tarif Klinik" />
            <div className="flex flex-1 flex-col gap-4 p-4">
                <div className="bg-background rounded-xl border p-6">
                    <h1 className="mb-6 text-2xl font-bold">Edit Tarif Klinik</h1>
                    <ClinicRateForm
                        data={data}
                        setData={setData}
                        errors={errors}
                        processing={processing}
                        onSubmit={(e) => { e.preventDefault(); put(`/clinic-rates/${clinicRate.id}`); }}
                        submitLabel="Simpan Perubahan"
                    />
                </div>
            </div>
        </>
    );
}

ClinicRatesEdit.layout = (props: { clinicRate: ClinicRate }) => ({
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Tarif Klinik', href: '/clinic-rates' },
        { title: `Edit: ${props.clinicRate.nama_tarif}`, href: `/clinic-rates/${props.clinicRate.id}/edit` },
    ] as BreadcrumbItem[],
});