import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ComboboxCreatable } from '@/components/ui/combobox-creatable';
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

const systemUserSchema = z.object({
    name: z.string().min(1, 'Nama wajib diisi').max(100),
    email: z.string().email('Format email tidak valid').max(100),
    password: z.string().min(8, 'Password minimal 8 karakter').optional().or(z.literal('')),
    password_confirmation: z.string().optional().or(z.literal('')),
    role: z.enum(['super_admin', 'admin_kasir', 'dokter', 'apoteker', 'laboran']),
    phone: z.string().max(20).optional().or(z.literal('')),
    gender: z.enum(['laki_laki', 'perempuan']).optional().or(z.literal('')),
    address: z.string().optional().or(z.literal('')),
    specialization: z.string().max(100).optional().or(z.literal('')),
    employee_status: z.enum(['aktif', 'cuti', 'nonaktif']),
});

type SystemUserSchemaType = z.input<typeof systemUserSchema>;

interface SystemUser {
    id: number;
    name: string;
    email: string;
    role: string;
    phone: string | null;
    gender: string | null;
    address: string | null;
    specialization: string | null;
    employee_status: string;
}

interface SystemUserFormProps {
    user?: SystemUser;
    isEdit?: boolean;
}

// 🔧 Daftar spesialisasi yang sudah dikenal sistem. Klinik ini baru
// punya 2 kategori poli (Umum & Gigi), jadi ini nilai awalnya. Kalau
// nanti ada kategori baru, admin bisa langsung ketik lewat combobox
// tanpa perlu ubah baris ini — tapi menambahkannya di sini membuat
// pilihan itu muncul otomatis di dropdown untuk user berikutnya.
const SPESIALISASI_OPTIONS = [
    { value: 'Umum', label: 'Umum' },
    { value: 'Gigi', label: 'Gigi' },
];

export function SystemUserForm({ user, isEdit = false }: SystemUserFormProps) {
    const form = useForm<SystemUserSchemaType>({
        resolver: zodResolver(systemUserSchema),
        defaultValues: {
            name: user?.name ?? '',
            email: user?.email ?? '',
            password: '',
            password_confirmation: '',
            role: (user?.role as any) ?? undefined,
            phone: user?.phone ?? '',
            gender: (user?.gender as any) ?? '',
            address: user?.address ?? '',
            specialization: user?.specialization ?? '',
            employee_status: (user?.employee_status as any) ?? 'aktif',
        },
    });

    useEffect(() => {
        if (user) {
            form.reset({
                name: user.name ?? '',
                email: user.email ?? '',
                password: '',
                password_confirmation: '',
                role: user.role as any,
                phone: user.phone ?? '',
                gender: (user.gender as any) ?? '',
                address: user.address ?? '',
                specialization: user.specialization ?? '',
                employee_status: user.employee_status as any,
            });
        }
    }, [user]);

    const { isSubmitting } = form.formState;
    const selectedRole = form.watch('role');

    const onSubmit = (values: SystemUserSchemaType) => {
        if (isEdit && user) {
            router.put(`/master-data/users/${user.id}`, values, {
                onError: (errors) => {
                    Object.entries(errors).forEach(([key, msg]) => {
                        form.setError(key as keyof SystemUserSchemaType, { message: msg });
                    });
                },
            });
        } else {
            router.post('/master-data/users', values, {
                onError: (errors) => {
                    Object.entries(errors).forEach(([key, msg]) => {
                        form.setError(key as keyof SystemUserSchemaType, { message: msg });
                    });
                },
            });
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                {/* Data Utama */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-semibold text-slate-700">Data Utama</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nama Lengkap <span className="text-red-500">*</span></FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="Nama lengkap" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <FormField control={form.control} name="email" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email <span className="text-red-500">*</span></FormLabel>
                                <FormControl>
                                    <Input {...field} type="email" placeholder="email@klinik.com" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <FormField control={form.control} name="password" render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Password {!isEdit && <span className="text-red-500">*</span>}
                                    {isEdit && <span className="text-xs text-slate-400">(kosongkan jika tidak diubah)</span>}
                                </FormLabel>
                                <FormControl>
                                    <Input {...field} type="password" placeholder="Min. 8 karakter" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <FormField control={form.control} name="password_confirmation" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Konfirmasi Password</FormLabel>
                                <FormControl>
                                    <Input {...field} type="password" placeholder="Ulangi password" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <FormField control={form.control} name="role" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Role <span className="text-red-500">*</span></FormLabel>
                                <Select onValueChange={field.onChange} value={field.value ?? ''}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih role" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="super_admin">Super Admin</SelectItem>
                                        <SelectItem value="admin_kasir">Admin / Kasir</SelectItem>
                                        <SelectItem value="dokter">Dokter</SelectItem>
                                        <SelectItem value="apoteker">Apoteker</SelectItem>
                                        <SelectItem value="laboran">Laboran</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <FormField control={form.control} name="employee_status" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Status Karyawan <span className="text-red-500">*</span></FormLabel>
                                <Select onValueChange={field.onChange} value={field.value ?? ''}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih status" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="aktif">Aktif</SelectItem>
                                        <SelectItem value="cuti">Cuti</SelectItem>
                                        <SelectItem value="nonaktif">Nonaktif</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </CardContent>
                </Card>

                {/* Data Pribadi */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-semibold text-slate-700">Data Pribadi</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <FormField control={form.control} name="phone" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Telepon</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="08xxxxxxxxxx" inputMode="tel" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <FormField control={form.control} name="gender" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Jenis Kelamin</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value ?? ''}>
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

                        {/* 🔧 FIX UTAMA: dari Input teks bebas jadi ComboboxCreatable
                            — bisa pilih "Umum"/"Gigi" dari daftar, atau ketik
                            kategori baru kalau memang belum ada. Cuma relevan
                            & ditampilkan aktif kalau role = dokter. */}
                        <FormField control={form.control} name="specialization" render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Spesialisasi <span className="text-xs text-slate-400">(khusus dokter)</span>
                                </FormLabel>
                                <FormControl>
                                    <ComboboxCreatable
                                        options={SPESIALISASI_OPTIONS}
                                        value={field.value ?? ''}
                                        onChange={field.onChange}
                                        placeholder="Pilih atau ketik spesialisasi"
                                        searchPlaceholder="Cari Umum, Gigi, atau ketik baru..."
                                        disabled={selectedRole !== 'dokter'}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <FormField control={form.control} name="address" render={({ field }) => (
                            <FormItem className="md:col-span-2">
                                <FormLabel>Alamat</FormLabel>
                                <FormControl>
                                    <Textarea {...field} placeholder="Alamat lengkap" rows={3} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-3">
                    <Button type="button" variant="outline" onClick={() => router.visit('/master-data/users')}>
                        Batal
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isEdit ? 'Simpan Perubahan' : 'Tambah User'}
                    </Button>
                </div>
            </form>
        </Form>
    );
}