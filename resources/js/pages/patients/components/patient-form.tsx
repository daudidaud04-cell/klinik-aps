import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { patientSchema } from '@/lib/validations/patient';
import { Patient } from '@/types/patient';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from '@inertiajs/react';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

type PatientSchemaType = z.input<typeof patientSchema>;

interface PatientFormProps {
    patient?: Patient;
    isEdit?: boolean;
}

export function PatientForm({ patient, isEdit = false }: PatientFormProps) {
    const form = useForm<PatientSchemaType>({
        resolver: zodResolver(patientSchema),
        defaultValues: {
            nik: patient?.nik ?? '',
            full_name: patient?.full_name ?? '',
            gender: patient?.gender ?? undefined,
            birth_place: patient?.birth_place ?? '',
            birth_date: patient?.birth_date ?? '',
            blood_type: patient?.blood_type ?? '',
            phone: patient?.phone ?? '',
            email: patient?.email ?? '',
            address: patient?.address ?? '',
            occupation: patient?.occupation ?? '',
            marital_status: patient?.marital_status ?? '',
            religion: patient?.religion ?? '',
            // 🔒 Klinik saat ini hanya melayani umum — default dikunci ke 'Umum'.
            // Field ini tetap ada di schema/DB untuk kesiapan BPJS ke depan.
            insurance_type: patient?.insurance_type ?? 'Umum',
            insurance_number: patient?.insurance_number ?? '',
            emergency_contact_name: patient?.emergency_contact_name ?? '',
            emergency_contact_phone: patient?.emergency_contact_phone ?? '',
            patient_status: patient?.patient_status ?? 'aktif',
        },
    });

    const { isSubmitting } = form.formState;

    const onSubmit = (values: PatientSchemaType) => {
        if (isEdit && patient) {
            router.put(`/patients/${patient.id}`, values, {
                onError: (errors) => {
                    Object.entries(errors).forEach(([key, msg]) => {
                        form.setError(key as keyof PatientSchemaType, { message: msg });
                    });
                },
            });
        } else {
            router.post('/patients', values, {
                onError: (errors) => {
                    Object.entries(errors).forEach(([key, msg]) => {
                        form.setError(key as keyof PatientSchemaType, { message: msg });
                    });
                },
            });
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                {/* Identitas Diri */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-semibold text-slate-700">Identitas Diri</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <FormField control={form.control} name="nik" render={({ field }) => (
                            <FormItem>
                                <FormLabel>NIK <span className="text-xs text-slate-400">(opsional)</span></FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="16 digit NIK" maxLength={16} inputMode="numeric" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <FormField control={form.control} name="full_name" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nama Lengkap <span className="text-red-500">*</span></FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="Nama sesuai KTP" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <FormField control={form.control} name="gender" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Jenis Kelamin <span className="text-red-500">*</span></FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih jenis kelamin" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="laki_laki">Laki-laki</SelectItem>
                                        <SelectItem value="perempuan">Perempuan</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <FormField control={form.control} name="birth_place" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tempat Lahir <span className="text-red-500">*</span></FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="Kota/Kabupaten" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <FormField control={form.control} name="birth_date" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tanggal Lahir <span className="text-red-500">*</span></FormLabel>
                                <FormControl>
                                    <Input {...field} type="date" max={new Date().toISOString().split('T')[0]} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <FormField control={form.control} name="blood_type" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Golongan Darah</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value ?? ''}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih golongan darah" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {['A', 'B', 'AB', 'O'].map((bt) => (
                                            <SelectItem key={bt} value={bt}>{bt}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </CardContent>
                </Card>

                {/* Kontak & Alamat */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-semibold text-slate-700">Kontak & Alamat</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <FormField control={form.control} name="phone" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nomor HP <span className="text-red-500">*</span></FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="08xxxxxxxxxx" inputMode="tel" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <FormField control={form.control} name="email" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input {...field} type="email" placeholder="email@domain.com" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <FormField control={form.control} name="address" render={({ field }) => (
                            <FormItem className="md:col-span-2">
                                <FormLabel>Alamat Lengkap <span className="text-red-500">*</span></FormLabel>
                                <FormControl>
                                    <Textarea {...field} placeholder="Jl. ... No. ..., RT/RW, Kelurahan, Kecamatan, Kota" rows={3} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </CardContent>
                </Card>

                {/* Data Sosial */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-semibold text-slate-700">Data Sosial</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <FormField control={form.control} name="occupation" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Pekerjaan</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="e.g. Karyawan Swasta" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <FormField control={form.control} name="marital_status" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Status Pernikahan</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value ?? ''}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih status" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="belum_menikah">Belum Menikah</SelectItem>
                                        <SelectItem value="menikah">Menikah</SelectItem>
                                        <SelectItem value="cerai_hidup">Cerai Hidup</SelectItem>
                                        <SelectItem value="cerai_mati">Cerai Mati</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <FormField control={form.control} name="religion" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Agama</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value ?? ''}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih agama" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {[
                                            ['islam', 'Islam'],
                                            ['kristen', 'Kristen'],
                                            ['katolik', 'Katolik'],
                                            ['hindu', 'Hindu'],
                                            ['buddha', 'Buddha'],
                                            ['konghucu', 'Konghucu'],
                                            ['lainnya', 'Lainnya'],
                                        ].map(([v, l]) => (
                                            <SelectItem key={v} value={v}>{l}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </CardContent>
                </Card>

                {/*
                    ============================================================
                    🔒 NONAKTIF SEMENTARA — Informasi Pembayaran (BPJS/Asuransi)
                    ============================================================
                    Klinik saat ini HANYA melayani pasien umum, jadi Card ini
                    disembunyikan dari form. insurance_type otomatis 'Umum'
                    lewat defaultValues di atas.

                    Field insurance_type & insurance_number TIDAK dihapus dari
                    schema (patientSchema), type Patient, maupun database —
                    supaya kalau klinik mulai menerima BPJS, tinggal UNCOMMENT
                    Card di bawah ini tanpa perlu bikin ulang apa pun.

                    Cara mengaktifkan lagi:
                    1. Uncomment Card "Informasi Pembayaran" di bawah.
                    2. Ubah defaultValues.insurance_type di atas kembali ke
                       `patient?.insurance_type ?? ''` (opsional, boleh juga
                       tetap 'Umum' sebagai default pilihan).
                    ============================================================

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-semibold text-slate-700">Informasi Pembayaran</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <FormField control={form.control} name="insurance_type" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Jenis Pembayaran</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value ?? ''}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih jenis pembayaran" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="BPJS">BPJS</SelectItem>
                                        <SelectItem value="Umum">Umum / Pribadi</SelectItem>
                                        <SelectItem value="Asuransi">Asuransi Swasta</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <FormField control={form.control} name="insurance_number" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nomor Kartu / Asuransi</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="Nomor kepesertaan" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </CardContent>
                </Card>

                */}

                {/* Kontak Darurat */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-semibold text-slate-700">Kontak Darurat</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <FormField control={form.control} name="emergency_contact_name" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nama Kontak Darurat</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="Nama keluarga/wali" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <FormField control={form.control} name="emergency_contact_phone" render={({ field }) => (
                            <FormItem>
                                <FormLabel>No. HP Kontak Darurat</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="08xxxxxxxxxx" inputMode="tel" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </CardContent>
                </Card>

                {/* Status Pasien - hanya saat edit */}
                {isEdit && (
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base font-semibold text-slate-700">Status Pasien</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <FormField control={form.control} name="patient_status" render={({ field }) => (
                                <FormItem className="w-48">
                                    <FormLabel>Status</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="aktif">Aktif</SelectItem>
                                            <SelectItem value="nonaktif">Non-aktif</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </CardContent>
                    </Card>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-3">
                    <Button type="button" variant="outline" onClick={() => router.visit('/patients')}>
                        Batal
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isEdit ? 'Simpan Perubahan' : 'Tambah Pasien'}
                    </Button>
                </div>
            </form>
        </Form>
    );
}