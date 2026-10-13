import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type BreadcrumbItem } from '@/types';
import { type HasilLab, type JenisPemeriksaanLab, type PemeriksaanLabFormData } from '@/types/laboratorium';
import { Head, Link, useForm } from '@inertiajs/react';
import { LoaderCircle, Plus, Trash2 } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Laboratorium', href: '/pelayanan/laboratorium' },
    { title: 'Buat Pemeriksaan', href: '/pelayanan/laboratorium/create' },
];

interface Props {
    pasiens: { id: number; full_name: string; medical_record_number: string }[];
    jenis: JenisPemeriksaanLab[];
    petugas: { id: number; name: string }[];
}

export default function LaboratoriumCreate({ pasiens, jenis, petugas }: Props) {
    const { data, setData, post, processing, errors } = useForm<PemeriksaanLabFormData>({
        pasien_id: '',
        jenis_id: '',
        rekam_medis_id: '',
        petugas_id: '',
        tanggal_pemeriksaan: new Date().toISOString().split('T')[0],
        status: 'menunggu',
        catatan: '',
        harga: '0',
        hasil: [],
    });

    const handleJenisChange = (jenisId: string) => {
        setData('jenis_id', jenisId);
        const selected = jenis.find((j) => String(j.id) === jenisId);
        if (selected) setData('harga', String(selected.harga));
    };

    const addHasil = () => {
        setData('hasil', [
            ...data.hasil,
            { parameter: '', nilai: '', satuan: '', nilai_normal: '', keterangan: '-', catatan: '' },
        ]);
    };

    const updateHasil = (index: number, field: keyof HasilLab, value: string) => {
        const updated = [...data.hasil];
        updated[index] = { ...updated[index], [field]: value };
        setData('hasil', updated);
    };

    const removeHasil = (index: number) => {
        setData('hasil', data.hasil.filter((_, i) => i !== index));
    };

    return (
        <>
            <Head title="Buat Pemeriksaan Lab" />
            <div className="flex flex-1 flex-col gap-4 p-4">
                <div className="bg-background rounded-xl border p-6">
                    <h1 className="mb-6 text-2xl font-bold">Buat Pemeriksaan Laboratorium</h1>

                    <form onSubmit={(e) => { e.preventDefault(); post('/pelayanan/laboratorium'); }} className="space-y-6">

                        {/* Info Dasar */}
                        <section className="rounded-lg border p-4">
                            <h2 className="mb-4 font-semibold">Informasi Pemeriksaan</h2>
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

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label>Jenis Pemeriksaan *</Label>
                                        <Select value={data.jenis_id} onValueChange={handleJenisChange}>
                                            <SelectTrigger><SelectValue placeholder="Pilih jenis" /></SelectTrigger>
                                            <SelectContent>
                                                {jenis.map((j) => (
                                                    <SelectItem key={j.id} value={String(j.id)}>
                                                        {j.kode_pemeriksaan} — {j.nama_pemeriksaan}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.jenis_id && <p className="text-destructive text-sm">{errors.jenis_id}</p>}
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Petugas Lab</Label>
                                        <Select value={data.petugas_id} onValueChange={(v) => setData('petugas_id', v)}>
                                            <SelectTrigger><SelectValue placeholder="Pilih petugas" /></SelectTrigger>
                                            <SelectContent>
                                                {petugas.map((p) => (
                                                    <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="tanggal_pemeriksaan">Tanggal *</Label>
                                        <Input id="tanggal_pemeriksaan" type="date" value={data.tanggal_pemeriksaan}
                                            onChange={(e) => setData('tanggal_pemeriksaan', e.target.value)} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Status *</Label>
                                        <Select value={data.status} onValueChange={(v) => setData('status', v)}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="menunggu">Menunggu</SelectItem>
                                                <SelectItem value="proses">Diproses</SelectItem>
                                                <SelectItem value="selesai">Selesai</SelectItem>
                                                <SelectItem value="batal">Batal</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="harga">Harga (Rp)</Label>
                                        <Input id="harga" type="number" min="0" value={data.harga}
                                            onChange={(e) => setData('harga', e.target.value)} />
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="catatan">Catatan</Label>
                                    <textarea id="catatan" value={data.catatan}
                                        onChange={(e) => setData('catatan', e.target.value)}
                                        className="border-input dark:bg-input/30 min-h-16 rounded-md border bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50" />
                                </div>
                            </div>
                        </section>

                        {/* Hasil Lab */}
                        <section className="rounded-lg border p-4">
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="font-semibold">Hasil Pemeriksaan</h2>
                                <Button type="button" variant="outline" size="sm" onClick={addHasil}>
                                    <Plus className="mr-2 h-4 w-4" />Tambah Parameter
                                </Button>
                            </div>
                            {data.hasil.length === 0 && (
                                <p className="text-muted-foreground text-sm">Hasil bisa diisi setelah pemeriksaan selesai.</p>
                            )}
                            {data.hasil.map((h, i) => (
                                <div key={i} className="mb-3 grid grid-cols-12 gap-2 rounded-md border p-3">
                                    <div className="col-span-3 grid gap-1">
                                        <Label className="text-xs">Parameter *</Label>
                                        <Input value={h.parameter} onChange={(e) => updateHasil(i, 'parameter', e.target.value)} placeholder="Hemoglobin" />
                                    </div>
                                    <div className="col-span-2 grid gap-1">
                                        <Label className="text-xs">Nilai *</Label>
                                        <Input value={h.nilai} onChange={(e) => updateHasil(i, 'nilai', e.target.value)} placeholder="12.5" />
                                    </div>
                                    <div className="col-span-2 grid gap-1">
                                        <Label className="text-xs">Satuan</Label>
                                        <Input value={h.satuan} onChange={(e) => updateHasil(i, 'satuan', e.target.value)} placeholder="g/dL" />
                                    </div>
                                    <div className="col-span-2 grid gap-1">
                                        <Label className="text-xs">Normal</Label>
                                        <Input value={h.nilai_normal} onChange={(e) => updateHasil(i, 'nilai_normal', e.target.value)} placeholder="12-16" />
                                    </div>
                                    <div className="col-span-2 grid gap-1">
                                        <Label className="text-xs">Keterangan</Label>
                                        <Select value={h.keterangan} onValueChange={(v) => updateHasil(i, 'keterangan', v)}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="-">-</SelectItem>
                                                <SelectItem value="normal">Normal</SelectItem>
                                                <SelectItem value="rendah">Rendah ↓</SelectItem>
                                                <SelectItem value="tinggi">Tinggi ↑</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="col-span-1 flex items-end">
                                        <Button type="button" variant="destructive" size="icon" onClick={() => removeHasil(i)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </section>

                        <div className="flex gap-2">
                            <Button type="submit" disabled={processing}>
                                {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                Simpan
                            </Button>
                            <Button asChild variant="outline">
                                <Link href="/pelayanan/laboratorium">Batal</Link>
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

LaboratoriumCreate.layout = { breadcrumbs };