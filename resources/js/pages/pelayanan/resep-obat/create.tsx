import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type BreadcrumbItem } from '@/types';
import { type DetailResepObat, type ObatOption, type ResepObatFormData } from '@/types/resep-obat';
import { Head, Link, useForm } from '@inertiajs/react';
import { LoaderCircle, Plus, Trash2 } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Resep Obat', href: '/pelayanan/resep-obat' },
    { title: 'Buat Resep', href: '/pelayanan/resep-obat/create' },
];

interface Props {
    pasiens: { id: number; full_name: string; medical_record_number: string }[];
    dokters: { id: number; name: string }[];
    obats: ObatOption[];
}

export default function ResepObatCreate({ pasiens, dokters, obats }: Props) {
    const { data, setData, post, processing, errors } = useForm<ResepObatFormData>({
        pasien_id: '',
        rekam_medis_id: null,
        dokter_id: '',
        tanggal_resep: new Date().toISOString().split('T')[0],
        status: 'menunggu',
        catatan: '',
        details: [],
    });

    const addDetail = () => {
        setData('details', [
            ...data.details,
            { obat_id: '', jumlah: '1', aturan_pakai: '', keterangan: '' },
        ]);
    };

    const updateDetail = (index: number, field: keyof DetailResepObat, value: string) => {
        const updated = [...data.details];
        updated[index] = { ...updated[index], [field]: value };
        setData('details', updated);
    };

    const removeDetail = (index: number) => {
        setData('details', data.details.filter((_, i) => i !== index));
    };

    const totalHarga = data.details.reduce((sum, d) => {
        const obat = obats.find((o) => String(o.id) === d.obat_id);
        return sum + (obat ? obat.harga_jual * parseInt(d.jumlah || '0') : 0);
    }, 0);

    return (
        <>
            <Head title="Buat Resep Obat" />
            <div className="flex flex-1 flex-col gap-4 p-4">
                <div className="bg-background rounded-xl border p-6">
                    <h1 className="mb-6 text-2xl font-bold">Buat Resep Obat</h1>

                    <form onSubmit={(e) => { e.preventDefault(); post('/pelayanan/resep-obat'); }} className="space-y-6">

                        {/* Info Resep */}
                        <section className="rounded-lg border p-4">
                            <h2 className="mb-4 font-semibold">Informasi Resep</h2>
                            <div className="space-y-4">
                                <div className="grid gap-2">
                                    <Label>Pasien *</Label>
                                    <Select value={data.pasien_id} onValueChange={(v) => setData('pasien_id', v)}>
                                        <SelectTrigger><SelectValue placeholder="Pilih pasien" /></SelectTrigger>
                                        <SelectContent>
                                            {pasiens.map((p) => (
                                                <SelectItem key={p.id} value={String(p.id)}>
                                                    {p.medical_record_number} — {p.full_name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.pasien_id && <p className="text-destructive text-sm">{errors.pasien_id}</p>}
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div className="grid gap-2">
                                        <Label>Dokter *</Label>
                                        <Select value={data.dokter_id} onValueChange={(v) => setData('dokter_id', v)}>
                                            <SelectTrigger><SelectValue placeholder="Pilih dokter" /></SelectTrigger>
                                            <SelectContent>
                                                {dokters.map((d) => (
                                                    <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.dokter_id && <p className="text-destructive text-sm">{errors.dokter_id}</p>}
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="tanggal_resep">Tanggal *</Label>
                                        <Input id="tanggal_resep" type="date" value={data.tanggal_resep}
                                            onChange={(e) => setData('tanggal_resep', e.target.value)} />
                                        {errors.tanggal_resep && <p className="text-destructive text-sm">{errors.tanggal_resep}</p>}
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Status *</Label>
                                        <Select value={data.status} onValueChange={(v) => setData('status', v)}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="menunggu">Menunggu</SelectItem>
                                                <SelectItem value="diproses">Diproses</SelectItem>
                                                <SelectItem value="selesai">Selesai</SelectItem>
                                                <SelectItem value="batal">Batal</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.status && <p className="text-destructive text-sm">{errors.status}</p>}
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="catatan">Catatan</Label>
                                    <textarea id="catatan" value={data.catatan}
                                        onChange={(e) => setData('catatan', e.target.value)}
                                        className="border-input dark:bg-input/30 min-h-16 rounded-md border bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50" />
                                    {errors.catatan && <p className="text-destructive text-sm">{errors.catatan}</p>}
                                </div>
                            </div>
                        </section>

                        {/* Detail Obat */}
                        <section className="rounded-lg border p-4">
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="font-semibold">Daftar Obat *</h2>
                                <Button type="button" variant="outline" size="sm" onClick={addDetail}>
                                    <Plus className="mr-2 h-4 w-4" />Tambah Obat
                                </Button>
                            </div>

                            {errors.details && (
                                <p className="text-destructive mb-3 text-sm">{errors.details as unknown as string}</p>
                            )}

                            {data.details.length === 0 && (
                                <p className="text-muted-foreground text-sm">Klik "Tambah Obat" untuk menambahkan obat ke resep.</p>
                            )}

                            {data.details.map((d, i) => {
                                const selectedObat = obats.find((o) => String(o.id) === d.obat_id);
                                const obatIdError = (errors as Record<string, string>)[`details.${i}.obat_id`];
                                const jumlahError = (errors as Record<string, string>)[`details.${i}.jumlah`];
                                const aturanError = (errors as Record<string, string>)[`details.${i}.aturan_pakai`];

                                return (
                                    <div key={i} className="mb-3 grid grid-cols-12 gap-2 rounded-md border p-3">
                                        <div className="col-span-4 grid gap-1">
                                            <Label className="text-xs">Obat *</Label>
                                            <Select value={d.obat_id} onValueChange={(v) => updateDetail(i, 'obat_id', v)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Pilih obat" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {obats.map((o) => (
                                                        <SelectItem key={o.id} value={String(o.id)}>
                                                            {o.nama_obat} ({o.satuan}) — Stok: {o.stok}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {selectedObat && (
                                                <p className="text-muted-foreground text-xs">
                                                    Rp {Number(selectedObat.harga_jual).toLocaleString('id-ID')}/{selectedObat.satuan}
                                                </p>
                                            )}
                                            {obatIdError && <p className="text-destructive text-xs">{obatIdError}</p>}
                                        </div>
                                        <div className="col-span-1 grid gap-1">
                                            <Label className="text-xs">Jml *</Label>
                                            <Input type="number" min="1" value={d.jumlah}
                                                onChange={(e) => updateDetail(i, 'jumlah', e.target.value)} />
                                            {jumlahError && <p className="text-destructive text-xs">{jumlahError}</p>}
                                        </div>
                                        <div className="col-span-3 grid gap-1">
                                            <Label className="text-xs">Aturan Pakai *</Label>
                                            <Input value={d.aturan_pakai}
                                                onChange={(e) => updateDetail(i, 'aturan_pakai', e.target.value)}
                                                placeholder="3x1 sesudah makan" />
                                            {aturanError && <p className="text-destructive text-xs">{aturanError}</p>}
                                        </div>
                                        <div className="col-span-3 grid gap-1">
                                            <Label className="text-xs">Keterangan</Label>
                                            <Input value={d.keterangan}
                                                onChange={(e) => updateDetail(i, 'keterangan', e.target.value)} />
                                        </div>
                                        <div className="col-span-1 flex items-end">
                                            <Button type="button" variant="destructive" size="icon" onClick={() => removeDetail(i)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}

                            {data.details.length > 0 && (
                                <div className="mt-2 text-right text-sm font-semibold">
                                    Total: Rp {totalHarga.toLocaleString('id-ID')}
                                </div>
                            )}
                        </section>

                        <div className="flex gap-2">
                            <Button type="submit" disabled={processing}>
                                {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                Simpan Resep
                            </Button>
                            <Button asChild variant="outline">
                                <Link href="/pelayanan/resep-obat">Batal</Link>
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

ResepObatCreate.layout = { breadcrumbs };