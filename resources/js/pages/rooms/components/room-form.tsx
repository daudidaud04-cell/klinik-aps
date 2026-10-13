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

const roomSchema = z.object({
    kode_kamar: z.string().min(1, 'Kode kamar wajib diisi').max(10),
    nama_kamar: z.string().min(1, 'Nama kamar wajib diisi').max(100),
    kelas: z.enum(['VIP', 'Kelas 1', 'Kelas 2', 'Kelas 3', 'Isolasi']),
    kapasitas: z.coerce.number().min(1, 'Kapasitas minimal 1'),
    tarif_harian: z.coerce.number().min(0, 'Tarif tidak boleh negatif'),
    fasilitas: z.string().optional().or(z.literal('')),
    status: z.enum(['tersedia', 'penuh', 'maintenance']),
});

type RoomSchemaType = z.input<typeof roomSchema>;

interface Room {
    id: number;
    kode_kamar: string;
    nama_kamar: string;
    kelas: string;
    kapasitas: number;
    tarif_harian: number;
    fasilitas: string | null;
    status: string;
}

interface RoomFormProps {
    room?: Room;
    isEdit?: boolean;
}

export function RoomForm({ room, isEdit = false }: RoomFormProps) {
    const form = useForm<RoomSchemaType>({
        resolver: zodResolver(roomSchema),
        defaultValues: {
            kode_kamar: room?.kode_kamar ?? '',
            nama_kamar: room?.nama_kamar ?? '',
            kelas: (room?.kelas as any) ?? undefined,
            kapasitas: room?.kapasitas ?? 1,
            tarif_harian: room?.tarif_harian ?? 0,
            fasilitas: room?.fasilitas ?? '',
            status: (room?.status as any) ?? 'tersedia',
        },
    });

    const { isSubmitting } = form.formState;

    const onSubmit = (values: RoomSchemaType) => {
        if (isEdit && room) {
            router.put(`/master-data/rooms/${room.id}`, values, {
                onError: (errors) => {
                    Object.entries(errors).forEach(([key, msg]) => {
                        form.setError(key as keyof RoomSchemaType, { message: msg });
                    });
                },
            });
        } else {
            router.post('/master-data/rooms', values, {
                onError: (errors) => {
                    Object.entries(errors).forEach(([key, msg]) => {
                        form.setError(key as keyof RoomSchemaType, { message: msg });
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
                        <CardTitle className="text-base font-semibold text-slate-700">Informasi Kamar</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <FormField control={form.control} name="kode_kamar" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Kode Kamar <span className="text-red-500">*</span></FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="Contoh: VIP-01" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <FormField control={form.control} name="nama_kamar" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nama Kamar <span className="text-red-500">*</span></FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="Contoh: Kamar VIP Melati" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <FormField control={form.control} name="kelas" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Kelas <span className="text-red-500">*</span></FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih kelas" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {['VIP', 'Kelas 1', 'Kelas 2', 'Kelas 3', 'Isolasi'].map((k) => (
                                            <SelectItem key={k} value={k}>{k}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <FormField control={form.control} name="kapasitas" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Kapasitas <span className="text-red-500">*</span></FormLabel>
                                <FormControl>
                                    <Input {...field} type="number" min={1} placeholder="Jumlah tempat tidur" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <FormField control={form.control} name="tarif_harian" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tarif Harian <span className="text-red-500">*</span></FormLabel>
                                <FormControl>
                                    <Input {...field} type="number" min={0} placeholder="0" />
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
                                        <SelectItem value="tersedia">Tersedia</SelectItem>
                                        <SelectItem value="penuh">Penuh</SelectItem>
                                        <SelectItem value="maintenance">Maintenance</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <FormField control={form.control} name="fasilitas" render={({ field }) => (
                            <FormItem className="md:col-span-2">
                                <FormLabel>Fasilitas</FormLabel>
                                <FormControl>
                                    <Textarea {...field} placeholder="Contoh: AC, TV, Kamar Mandi Dalam" rows={3} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </CardContent>
                </Card>

                <div className="flex items-center justify-end gap-3">
                    <Button type="button" variant="outline" onClick={() => router.visit('/master-data/rooms')}>
                        Batal
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isEdit ? 'Simpan Perubahan' : 'Tambah Kamar'}
                    </Button>
                </div>
            </form>
        </Form>
    );
}