import ClinicRateForm, { type ClinicRateFormData } from '@/pages/clinic-rates/components/clinic-rate-form';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Tarif Klinik', href: '/clinic-rates' },
    { title: 'Tambah Tarif', href: '/clinic-rates/create' },
];

export default function ClinicRatesCreate() {
    const { data, setData, post, processing, errors } = useForm<ClinicRateFormData>({
        kode_tarif: '',
        nama_tarif: '',
        kategori: '',
        harga: '0',
        is_taxable: false,
        tax_percent: '0',
        deskripsi: '',
        status: 'aktif',
    });

    return (
        <>
            <Head title="Tambah Tarif Klinik" />
            <div className="flex flex-1 flex-col gap-4 p-4">
                <div className="bg-background rounded-xl border p-6">
                    <h1 className="mb-6 text-2xl font-bold">Tambah Tarif Klinik</h1>
                    <ClinicRateForm
                        data={data}
                        setData={setData}
                        errors={errors}
                        processing={processing}
                        onSubmit={(e) => { e.preventDefault(); post('/clinic-rates'); }}
                        submitLabel="Simpan"
                    />
                </div>
            </div>
        </>
    );
}

ClinicRatesCreate.layout = { breadcrumbs };