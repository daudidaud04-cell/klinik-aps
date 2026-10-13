import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Pengaturan Klinik', href: '/sistem/pengaturan' },
];

interface Pengaturan {
    id: number;
    nama_klinik: string;
    tagline: string | null;
    logo: string | null;
    alamat: string | null;
    kota: string | null;
    provinsi: string | null;
    kode_pos: string | null;
    telepon: string | null;
    email: string | null;
    website: string | null;
    npwp: string | null;
    no_izin_praktik: string | null;
    nama_pimpinan: string | null;
    no_str_pimpinan: string | null;
    jam_buka: string | null;
    jam_tutup: string | null;
    hari_operasional: string | null;
    footer_invoice: string | null;
    warna_tema: string | null;
}

export default function PengaturanKlinik({ pengaturan }: { pengaturan: Pengaturan }) {
    const { data, setData, put, processing, errors } = useForm({
        nama_klinik:      pengaturan.nama_klinik ?? '',
        tagline:          pengaturan.tagline ?? '',
        alamat:           pengaturan.alamat ?? '',
        kota:             pengaturan.kota ?? '',
        provinsi:         pengaturan.provinsi ?? '',
        kode_pos:         pengaturan.kode_pos ?? '',
        telepon:          pengaturan.telepon ?? '',
        email:            pengaturan.email ?? '',
        website:          pengaturan.website ?? '',
        npwp:             pengaturan.npwp ?? '',
        no_izin_praktik:  pengaturan.no_izin_praktik ?? '',
        nama_pimpinan:    pengaturan.nama_pimpinan ?? '',
        no_str_pimpinan:  pengaturan.no_str_pimpinan ?? '',
        jam_buka:         pengaturan.jam_buka ?? '',
        jam_tutup:        pengaturan.jam_tutup ?? '',
        hari_operasional: pengaturan.hari_operasional ?? '',
        footer_invoice:   pengaturan.footer_invoice ?? '',
        warna_tema:       pengaturan.warna_tema ?? '#000000',
    });

    return (
        <>
            <Head title="Pengaturan Klinik" />
            <div className="flex flex-1 flex-col gap-4 p-4">
                <div className="bg-background rounded-xl border p-6">
                    <h1 className="mb-6 text-2xl font-bold">Pengaturan Klinik</h1>

                    <form onSubmit={(e) => { e.preventDefault(); put('/sistem/pengaturan'); }} className="space-y-6 max-w-3xl">

                        {/* Identitas */}
                        <section className="rounded-lg border p-4">
                            <h2 className="mb-4 font-semibold">Identitas Klinik</h2>
                            <div className="space-y-4">
                                <div className="grid gap-2">
                                    <Label>Nama Klinik *</Label>
                                    <Input value={data.nama_klinik} onChange={(e) => setData('nama_klinik', e.target.value)} />
                                    {errors.nama_klinik && <p className="text-destructive text-sm">{errors.nama_klinik}</p>}
                                </div>
                                <div className="grid gap-2">
                                    <Label>Tagline</Label>
                                    <Input value={data.tagline} onChange={(e) => setData('tagline', e.target.value)} />
                                </div>
                            </div>
                        </section>

                        {/* Kontak */}
                        <section className="rounded-lg border p-4">
                            <h2 className="mb-4 font-semibold">Kontak & Lokasi</h2>
                            <div className="space-y-4">
                                <div className="grid gap-2">
                                    <Label>Alamat</Label>
                                    <textarea value={data.alamat} onChange={(e) => setData('alamat', e.target.value)}
                                        className="border-input dark:bg-input/30 min-h-16 rounded-md border bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50" />
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="grid gap-2">
                                        <Label>Kota</Label>
                                        <Input value={data.kota} onChange={(e) => setData('kota', e.target.value)} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Provinsi</Label>
                                        <Input value={data.provinsi} onChange={(e) => setData('provinsi', e.target.value)} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Kode Pos</Label>
                                        <Input value={data.kode_pos} onChange={(e) => setData('kode_pos', e.target.value)} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label>Telepon</Label>
                                        <Input value={data.telepon} onChange={(e) => setData('telepon', e.target.value)} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Email</Label>
                                        <Input type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} />
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label>Website</Label>
                                    <Input value={data.website} onChange={(e) => setData('website', e.target.value)} />
                                </div>
                            </div>
                        </section>

                        {/* Legal */}
                        <section className="rounded-lg border p-4">
                            <h2 className="mb-4 font-semibold">Informasi Legal</h2>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label>NPWP</Label>
                                        <Input value={data.npwp} onChange={(e) => setData('npwp', e.target.value)} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>No. Izin Praktik</Label>
                                        <Input value={data.no_izin_praktik} onChange={(e) => setData('no_izin_praktik', e.target.value)} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label>Nama Pimpinan</Label>
                                        <Input value={data.nama_pimpinan} onChange={(e) => setData('nama_pimpinan', e.target.value)} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>No. STR Pimpinan</Label>
                                        <Input value={data.no_str_pimpinan} onChange={(e) => setData('no_str_pimpinan', e.target.value)} />
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Operasional */}
                        <section className="rounded-lg border p-4">
                            <h2 className="mb-4 font-semibold">Jam Operasional</h2>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="grid gap-2">
                                    <Label>Jam Buka</Label>
                                    <Input type="time" value={data.jam_buka} onChange={(e) => setData('jam_buka', e.target.value)} />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Jam Tutup</Label>
                                    <Input type="time" value={data.jam_tutup} onChange={(e) => setData('jam_tutup', e.target.value)} />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Hari Operasional</Label>
                                    <Input value={data.hari_operasional} onChange={(e) => setData('hari_operasional', e.target.value)}
                                        placeholder="Senin - Sabtu" />
                                </div>
                            </div>
                        </section>

                        {/* Invoice */}
                        <section className="rounded-lg border p-4">
                            <h2 className="mb-4 font-semibold">Invoice & Tampilan</h2>
                            <div className="space-y-4">
                                <div className="grid gap-2">
                                    <Label>Footer Invoice</Label>
                                    <textarea value={data.footer_invoice} onChange={(e) => setData('footer_invoice', e.target.value)}
                                        className="border-input dark:bg-input/30 min-h-16 rounded-md border bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                                        placeholder="Terima kasih telah mempercayakan kesehatan Anda kepada kami." />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Warna Tema</Label>
                                    <div className="flex items-center gap-3">
                                        <input type="color" value={data.warna_tema}
                                            onChange={(e) => setData('warna_tema', e.target.value)}
                                            className="h-10 w-16 cursor-pointer rounded border" />
                                        <Input value={data.warna_tema} onChange={(e) => setData('warna_tema', e.target.value)}
                                            className="w-32" placeholder="#000000" />
                                    </div>
                                </div>
                            </div>
                        </section>

                        <Button type="submit" disabled={processing}>
                            {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                            Simpan Pengaturan
                        </Button>
                    </form>
                </div>
            </div>
        </>
    );
}

PengaturanKlinik.layout = { breadcrumbs };