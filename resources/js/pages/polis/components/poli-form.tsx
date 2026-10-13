import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from '@inertiajs/react';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const poliSchema = z.object({
    kode_poli: z.string().min(1, 'Kode poli wajib diisi').max(10),
    nama_poli: z.string().min(1, 'Nama poli wajib diisi').max(100),
    deskripsi: z.string().optional().or(z.literal('')),
    // 🔧 FIX: doctor_id (string tunggal) diganti jadi doctor_ids (array string),
    // supaya satu poli bisa menyimpan banyak dokter sekaligus.
    doctor_ids: z.array(z.string()).optional().default([]),
    jadwal: z.string().optional().or(z.literal('')),
    status: z.enum(['aktif', 'nonaktif']),
});

type PoliSchemaType = z.input<typeof poliSchema>;

interface Doctor {
    id: number;
    name: string;
    specialization: string | null;
}

interface Poli {
    id: number;
    kode_poli: string;
    nama_poli: string;
    deskripsi: string | null;
    // 🔧 FIX: doctor_id tunggal diganti jadi relasi doctors (array)
    doctors?: Doctor[];
    jadwal: string | null;
    status: string;
}

interface PoliFormProps {
    poli?: Poli;
    doctors: Doctor[];
    isEdit?: boolean;
}

export function PoliForm({ poli, doctors, isEdit = false }: PoliFormProps) {
    const form = useForm<PoliSchemaType>({
        resolver: zodResolver(poliSchema),
        defaultValues: {
            kode_poli: poli?.kode_poli ?? '',
            nama_poli: poli?.nama_poli ?? '',
            deskripsi: poli?.deskripsi ?? '',
            // 🔧 FIX: default value sekarang array id dokter yang sudah
            // terpasang ke poli ini (kalau mode edit)
            doctor_ids: poli?.doctors?.map((d) => String(d.id)) ?? [],
            jadwal: poli?.jadwal ?? '',
            status: (poli?.status as any) ?? 'aktif',
        },
    });

    const { isSubmitting } = form.formState;

    const onSubmit = (values: PoliSchemaType) => {
        if (isEdit && poli) {
            router.put(`/master-data/polis/${poli.id}`, values, {
                onError: (errors) => {
                    Object.entries(errors).forEach(([key, msg]) => {
                        form.setError(key as keyof PoliSchemaType, { message: msg as string });
                    });
                },
            });
        } else {
            router.post('/master-data/polis', values, {
                onError: (errors) => {
                    Object.entries(errors).forEach(([key, msg]) => {
                        form.setError(key as keyof PoliSchemaType, { message: msg as string });
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
                        <CardTitle className="text-base font-semibold text-slate-700">Informasi Poli</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <FormField control={form.control} name="kode_poli" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Kode Poli <span className="text-red-500">*</span></FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="Contoh: PLU, PLG, UGD" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <FormField control={form.control} name="nama_poli" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nama Poli <span className="text-red-500">*</span></FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="Contoh: Poli Umum" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />

                        {/* 🔧 FIX UTAMA: dropdown single-select diganti jadi
                            daftar checkbox multi-select, supaya bisa pilih
                            lebih dari satu dokter untuk satu poli. */}
                        <FormField control={form.control} name="doctor_ids" render={({ field }) => (
                            <FormItem className="md:col-span-2">
                                <FormLabel>Dokter Praktik</FormLabel>
                                <FormControl>
                                    <div className="max-h-56 space-y-2 overflow-y-auto rounded-md border p-3">
                                        {doctors.length === 0 && (
                                            <p className="text-muted-foreground text-sm">Belum ada data dokter.</p>
                                        )}
                                        {doctors.map((doctor) => {
                                            const value = String(doctor.id);
                                            const checked = (field.value ?? []).includes(value);

                                            return (
                                                <label
                                                    key={doctor.id}
                                                    className="flex cursor-pointer items-center gap-2 text-sm"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        className="h-4 w-4 rounded border-gray-300"
                                                        checked={checked}
                                                        onChange={(e) => {
                                                            const current = field.value ?? [];
                                                            if (e.target.checked) {
                                                                field.onChange([...current, value]);
                                                            } else {
                                                                field.onChange(current.filter((v) => v !== value));
                                                            }
                                                        }}
                                                    />
                                                    <span>
                                                        {doctor.name}
                                                        {doctor.specialization ? ` - ${doctor.specialization}` : ''}
                                                    </span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <FormField control={form.control} name="jadwal" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Jadwal</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="Contoh: Senin-Jumat 08:00-12:00" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <FormField control={form.control} name="status" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Status <span className="text-red-500">*</span></FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih status" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="aktif">Aktif</SelectItem>
                                        <SelectItem value="nonaktif">Nonaktif</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <FormField control={form.control} name="deskripsi" render={({ field }) => (
                            <FormItem className="md:col-span-2">
                                <FormLabel>Deskripsi</FormLabel>
                                <FormControl>
                                    <Textarea {...field} placeholder="Deskripsi poli" rows={3} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </CardContent>
                </Card>

                <div className="flex items-center justify-end gap-3">
                    <Button type="button" variant="outline" onClick={() => router.visit('/master-data/polis')}>
                        Batal
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isEdit ? 'Simpan Perubahan' : 'Tambah Poli'}
                    </Button>
                </div>
            </form>
        </Form>
    );
}