import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePermissions } from '@/hooks/use-permissions';
import { type BreadcrumbItem } from '@/types';
import { Patient } from '@/types/patient';
import { Head, Link } from '@inertiajs/react';

interface Props {
    patient: Patient;
}

function Info({
    label,
    value,
}: {
    label: string;
    value: string | number | null | undefined;
}) {
    return (
        <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="font-medium">{value || '-'}</p>
        </div>
    );
}

// ← breadcrumbs dipindah ke LUAR function
const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Pasien', href: '/patients' },
];

export default function ShowPatient({ patient }: Props) {
    const { can } = usePermissions();

    return (
        <>
            <Head title={`Detail Pasien - ${patient.full_name}`} />

            <div className="flex flex-1 flex-col gap-4 p-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Detail Pasien</CardTitle>
                        <div className="flex gap-2">
                            <Button variant="outline" asChild>
                                <Link href="/patients">Kembali</Link>
                            </Button>
                            {can('patients.update') && (
                                <Button asChild>
                                    <Link href={`/patients/${patient.id}/edit`}>
                                        Edit
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </CardHeader>

                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2">
                            <Info
                                label="No Rekam Medis"
                                value={patient.medical_record_number}
                            />
                            <Info label="NIK" value={patient.nik} />
                            <Info
                                label="Nama Lengkap"
                                value={patient.full_name}
                            />
                            <Info
                                label="Jenis Kelamin"
                                value={
                                    patient.gender === 'laki_laki'
                                        ? 'Laki-laki'
                                        : 'Perempuan'
                                }
                            />
                            <Info
                                label="Tempat Lahir"
                                value={patient.birth_place}
                            />
                            <Info
                                label="Tanggal Lahir"
                                value={new Date(
                                    patient.birth_date,
                                ).toLocaleDateString('id-ID', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric',
                                })}
                            />
                            <Info
                                label="Umur"
                                value={
                                    patient.age ? `${patient.age} Tahun` : '-'
                                }
                            />
                            <Info
                                label="Golongan Darah"
                                value={patient.blood_type}
                            />
                            <Info label="Telepon" value={patient.phone} />
                            <Info label="Email" value={patient.email} />
                            <Info
                                label="Pekerjaan"
                                value={patient.occupation}
                            />
                            <Info
                                label="Status Perkawinan"
                                value={
                                    patient.marital_status === 'belum_menikah'
                                        ? 'Belum Menikah'
                                        : patient.marital_status === 'menikah'
                                          ? 'Menikah'
                                          : patient.marital_status ===
                                              'cerai_hidup'
                                            ? 'Cerai Hidup'
                                            : patient.marital_status ===
                                                'cerai_mati'
                                              ? 'Cerai Mati'
                                              : '-'
                                }
                            />
                            <Info
                                label="Agama"
                                value={
                                    patient.religion === 'islam'
                                        ? 'Islam'
                                        : patient.religion === 'kristen'
                                          ? 'Kristen'
                                          : patient.religion === 'katolik'
                                            ? 'Katolik'
                                            : patient.religion === 'hindu'
                                              ? 'Hindu'
                                              : patient.religion === 'buddha'
                                                ? 'Buddha'
                                                : patient.religion ===
                                                    'konghucu'
                                                  ? 'Konghucu'
                                                  : patient.religion ===
                                                      'lainnya'
                                                    ? 'Lainnya'
                                                    : '-'
                                }
                            />
                            <Info
                                label="Jenis Asuransi"
                                value={patient.insurance_type}
                            />
                            <Info
                                label="No Asuransi"
                                value={patient.insurance_number}
                            />
                            <Info
                                label="Kontak Darurat"
                                value={patient.emergency_contact_name}
                            />
                            <Info
                                label="No Kontak Darurat"
                                value={patient.emergency_contact_phone}
                            />
                            <Info
                                label="Status Pasien"
                                value={
                                    patient.patient_status === 'aktif'
                                        ? 'Aktif'
                                        : 'Nonaktif'
                                }
                            />
                        </div>

                        <div className="mt-6">
                            <h3 className="mb-2 font-semibold">Alamat</h3>
                            <div className="rounded-lg border p-3">
                                {patient.address}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

ShowPatient.layout = {
    breadcrumbs,
};
