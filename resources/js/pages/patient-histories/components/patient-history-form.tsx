import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from '@inertiajs/react';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const historySchema = z.object({
    patient_id: z.string().min(1, 'Pasien wajib dipilih'),
    type: z.enum(['rawat_jalan', 'rawat_inap', 'laboratorium', 'resep', 'tindakan']),
    doctor_id: z.string().optional().or(z.literal('')),
    poli_id: z.string().optional().or(z.literal('')),
    visit_date: z.string().min(1, 'Tanggal kunjungan wajib diisi'),
    chief_complaint: z.string().optional().or(z.literal('')),
    diagnosis_summary: z.string().optional().or(z.literal('')),
    total_biaya: z.coerce.number().min(0).optional(),
    status_bayar: z.enum(['lunas', 'belum_bayar', 'cicilan']),
});

type HistorySchemaType = z.input<typeof historySchema>;

interface Patient {
    id: number;
    full_name: string;
    medical_record_number: string;
}

interface Doctor {
    id: number;
    name: string;
    specialization?: string | null;
}

interface Poli {
    id: number;
    nama_poli: string;
}

interface History {
    id: number;
    patient_id: number;
    type: string;
    doctor_id: number | null;
    poli_id: number | null;
    visit_date: string;
    chief_complaint: string | null;
    diagnosis_summary: string | null;
    total_biaya: number;
    status_bayar: string;
}

interface PatientHistoryFormProps {
    history?: History;
    patients: Patient[];
    doctors: Doctor[];
    polis: Poli[];
    isEdit?: boolean;
}

export function PatientHistoryForm({ history, patients, doctors, polis, isEdit = false }: PatientHistoryFormProps) {
    const form = useForm<HistorySchemaType>({
        resolver: zodResolver(historySchema),
        defaultValues: {
            patient_id: history?.patient_id ? String(history.patient_id) : '',
            type: (history?.type as any) ?? undefined,
            doctor_id: history?.doctor_id ? String(history.doctor_id) : '',
            poli_id: history?.poli_id ? String(history.poli_id) : '',
            visit_date: history?.visit_date ?? '',
            chief_complaint: history?.chief_complaint ?? '',
            diagnosis_summary: history?.diagnosis_summary ?? '',
            total_biaya: history?.total_biaya ?? 0,
            status_bayar: (history?.status_bayar as any) ?? 'belum_bayar',
        },
    });

    useEffect(() => {
        if (history) {
            form.reset({
                patient_id: String(history.patient_id),
                type: history.type as any,
                doctor_id: history.doctor_id ? String(history.doctor_id) : '',
                poli_id: history.poli_id ? String(history.poli_id) : '',
                visit_date: history.visit_date,
                chief_complaint: history.chief_complaint ?? '',
                diagnosis_summary: history.diagnosis_summary ?? '',
                total_biaya: history.total_biaya,
                status_bayar: history.status_bayar as any,
            });
        }
    }, [history]);

    const { isSubmitting } = form.formState;

    const onSubmit = (values: HistorySchemaType) => {
        if (isEdit && history) {
            router.put(`/patient-histories/${history.id}`, values, {
                onError: (errors) => {
                    Object.entries(errors).forEach(([key, msg]) => {
                        form.setError(key as keyof HistorySchemaType, { message: msg });
                    });
                },
            });
        } else {
            router.post('/patient-histories', values, {
                onError: (errors) => {
                    Object.entries(errors).forEach(([key, msg]) => {
                        form.setError(key as keyof HistorySchemaType, { message: msg });
                    });
                },
            });
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-semibold text-slate-700">Informasi Kunjungan</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <FormField control={form.control} name="patient_id" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Pasien <span className="text-red-500">*</span></FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih pasien" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {patients.map((p) => (
                                            <SelectItem key={p.id} value={String(p.id)}>
                                                {p.full_name} ({p.medical_record_number})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <FormField control={form.control} name="type" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Jenis Kunjungan <span className="text-red-500">*</span></FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih jenis" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="rawat_jalan">Rawat Jalan</SelectItem>
                                        <SelectItem value="rawat_inap">Rawat Inap</SelectItem>
                                        <SelectItem value="laboratorium">Laboratorium</SelectItem>
                                        <SelectItem value="resep">Resep Obat</SelectItem>
                                        <SelectItem value="tindakan">Tindakan Medis</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <FormField control={form.control} name="doctor_id" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Dokter</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value ?? ''}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih dokter" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {doctors.map((d) => (
                                            <SelectItem key={d.id} value={String(d.id)}>
                                                {d.name}{d.specialization ? ` - ${d.specialization}` : ''}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <FormField control={form.control} name="poli_id" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Poli</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value ?? ''}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih poli" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {polis.map((p) => (
                                            <SelectItem key={p.id} value={String(p.id)}>{p.nama_poli}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <FormField control={form.control} name="visit_date" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tanggal Kunjungan <span className="text-red-500">*</span></FormLabel>
                                <FormControl>
                                    <Input {...field} type="date" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <FormField control={form.control} name="status_bayar" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Status Bayar <span className="text-red-500">*</span></FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih status" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="lunas">Lunas</SelectItem>
                                        <SelectItem value="belum_bayar">Belum Bayar</SelectItem>
                                        <SelectItem value="cicilan">Cicilan</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <FormField control={form.control} name="total_biaya" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Total Biaya</FormLabel>
                                <FormControl>
                                    <Input {...field} type="number" min={0} placeholder="0" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-semibold text-slate-700">Catatan Medis</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 gap-4">
                        <FormField control={form.control} name="chief_complaint" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Keluhan Utama</FormLabel>
                                <FormControl>
                                    <Textarea {...field} placeholder="Keluhan pasien" rows={3} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <FormField control={form.control} name="diagnosis_summary" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Ringkasan Diagnosis</FormLabel>
                                <FormControl>
                                    <Textarea {...field} placeholder="Diagnosis dokter" rows={3} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </CardContent>
                </Card>

                <div className="flex items-center justify-end gap-3">
                    <Button type="button" variant="outline" onClick={() => router.visit('/patient-histories')}>
                        Batal
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isEdit ? 'Simpan Perubahan' : 'Tambah Riwayat'}
                    </Button>
                </div>
            </form>
        </Form>
    );
}