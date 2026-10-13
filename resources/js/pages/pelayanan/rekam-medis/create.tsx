import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type BreadcrumbItem } from '@/types';
import { type Diagnosa, type RekamMedisFormData, type TindakanMedis } from '@/types/rekam-medis';
import { type KunjunganRawatJalan } from '@/types/rawat-jalan';
import { Head, Link, useForm } from '@inertiajs/react';
import { LoaderCircle, Plus, Trash2 } from 'lucide-react';
import { useEffect, useRef } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Rekam Medis', href: '/pelayanan/rekam-medis' },
    { title: 'Buat Rekam Medis', href: '/pelayanan/rekam-medis/create' },
];

interface ResepItem {
    obat_id: string;
    jumlah: string;
    aturan_pakai: string;
    keterangan: string;
}

interface Props {
    kunjungan: KunjunganRawatJalan | null;
    kunjungans: (KunjunganRawatJalan & { pasien: { full_name: string; medical_record_number: string } })[];
    tarifs: { id: number; nama_tarif: string; harga: number }[];
    obats: { id: number; kode_obat: string; nama_obat: string; satuan: string; harga_jual: number; stok: number }[];
}

function formatRibuan(value: string | number): string {
    const digitsOnly = String(value ?? '').replace(/\D/g, '');
    if (! digitsOnly) return '';
    return Number(digitsOnly).toLocaleString('id-ID');
}

function parseRibuan(value: string): string {
    return value.replace(/\D/g, '');
}


function CurrencyInput({
    id,
    value,
    onChange,
    className,
    readOnly,
}: {
    id?: string;
    value: string;
    onChange: (value: string) => void;
    className?: string;
    readOnly?: boolean;
}) {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const input = e.target;
        const rawBefore = input.value;
        const cursorBefore = input.selectionStart ?? rawBefore.length;

        const digitsBeforeCursor = rawBefore.slice(0, cursorBefore).replace(/\D/g, '').length;

        const newDigits = parseRibuan(rawBefore);
        onChange(newDigits);

        requestAnimationFrame(() => {
            if (! inputRef.current) return;
            const formatted = formatRibuan(newDigits);
            let pos = formatted.length;
            let digitCount = 0;
            for (let i = 0; i < formatted.length; i++) {
                if (digitCount >= digitsBeforeCursor) {
                    pos = i;
                    break;
                }
                if (/\d/.test(formatted[i])) digitCount++;
            }
            inputRef.current.setSelectionRange(pos, pos);
        });
    };

    return (
        <Input
            ref={inputRef}
            id={id}
            type="text"
            inputMode="numeric"
            value={formatRibuan(value)}
            onChange={handleChange}
            className={className}
            readOnly={readOnly}
        />
    );
}

export default function RekamMedisCreate({ kunjungan, kunjungans, tarifs, obats }: Props) {
    const { data, setData, post, processing, errors } = useForm<RekamMedisFormData & {
        resep: ResepItem[];
        catatan_resep: string;
    }>({
        kunjungan_id: kunjungan ? String(kunjungan.id) : '',
        tarif_id: '',
        tekanan_darah: '',
        suhu_tubuh: '',
        nadi: '',
        pernapasan: '',
        berat_badan: '',
        tinggi_badan: '',
        anamnesis: '',
        pemeriksaan_fisik: '',
        rencana_terapi: '',
        catatan_dokter: '',
        total_biaya: '0',
        status_bayar: 'belum_bayar',
        diagnosas: [],
        tindakan: [],
        resep: [],
        catatan_resep: '',
    });

    // ─── Diagnosa handlers ───────────────────────────────────────────────
    const addDiagnosa = () => {
        setData('diagnosas', [
            ...data.diagnosas,
            { kode_icd: '', nama_diagnosa: '', jenis: 'utama', keterangan: '' },
        ]);
    };

    const updateDiagnosa = (index: number, field: keyof Diagnosa, value: string) => {
        const updated = [...data.diagnosas];
        updated[index] = { ...updated[index], [field]: value };
        setData('diagnosas', updated);
    };

    const removeDiagnosa = (index: number) => {
        setData('diagnosas', data.diagnosas.filter((_, i) => i !== index));
    };

    // ─── Tindakan handlers ───────────────────────────────────────────────
    const addTindakan = () => {
        setData('tindakan', [
            ...data.tindakan,
            { tarif_id: '', nama_tindakan: '', keterangan: '', biaya: '0', jumlah: '1' },
        ]);
    };

    const updateTindakan = (index: number, field: keyof TindakanMedis, value: string) => {
        const updated = [...data.tindakan];
        updated[index] = { ...updated[index], [field]: value };

        if (field === 'tarif_id' && value) {
            const tarif = tarifs.find((t) => String(t.id) === value);
            if (tarif) {
                updated[index].biaya = String(Math.round(Number(tarif.harga)));
                updated[index].nama_tindakan = tarif.nama_tarif;
            }
        }
        setData('tindakan', updated);
    };

    const removeTindakan = (index: number) => {
        setData('tindakan', data.tindakan.filter((_, i) => i !== index));
    };

    // ─── Resep Obat handlers ───────────────────────────────────────────────
    const addResep = () => {
        setData('resep', [
            ...data.resep,
            { obat_id: '', jumlah: '1', aturan_pakai: '', keterangan: '' },
        ]);
    };

    const updateResep = (index: number, field: keyof ResepItem, value: string) => {
        const updated = [...data.resep];
        updated[index] = { ...updated[index], [field]: value };
        setData('resep', updated);
    };

    const removeResep = (index: number) => {
        setData('resep', data.resep.filter((_, i) => i !== index));
    };

    // ─── Total biaya otomatis ─────────────────────────────────────────────
    const totalTindakan = data.tindakan.reduce((sum, t) => {
        return sum + (parseFloat(t.biaya || '0') * parseInt(t.jumlah || '1'));
    }, 0);

    const totalResep = data.resep.reduce((sum, r) => {
        const obat = obats.find((o) => String(o.id) === r.obat_id);
        const harga = obat ? Number(obat.harga_jual) : 0;
        return sum + harga * parseInt(r.jumlah || '1');
    }, 0);

    const grandTotal = totalTindakan + totalResep;

    // 🔧 FIX: Total Biaya (Rp) sekarang otomatis mengikuti grandTotal
    // (Total Tindakan + Total Resep) setiap kali ada perubahan, tanpa
    // perlu klik tombol "Pakai ini" lagi. Field ini dibuat read-only
    // di bawah karena sepenuhnya hasil kalkulasi.
    useEffect(() => {
        const grandTotalStr = String(grandTotal);
        if (data.total_biaya !== grandTotalStr) {
            setData('total_biaya', grandTotalStr);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [grandTotal]);

    // Helper ambil pesan error untuk field di dalam array (mis. diagnosas.0.nama_diagnosa)
    const arrayError = (prefix: 'diagnosas' | 'tindakan' | 'resep') => {
        const key = Object.keys(errors).find((k) => k.startsWith(`${prefix}.`) || k === prefix);
        return key ? (errors as Record<string, string>)[key] : null;
    };

    return (
        <>
            <Head title="Buat Rekam Medis" />
            <div className="flex flex-1 flex-col gap-4 p-4">
                <div className="bg-background rounded-xl border p-6">
                    <h1 className="mb-6 text-2xl font-bold">Buat Rekam Medis</h1>

                    <form
                        onSubmit={(e) => { e.preventDefault(); post('/pelayanan/rekam-medis'); }}
                        className="space-y-6"
                    >
                        {/* Pilih Kunjungan */}
                        <section className="rounded-lg border p-4">
                            <h2 className="mb-4 font-semibold">Data Kunjungan</h2>
                            {kunjungan ? (
                                <div className="flex items-center gap-4">
                                    <div>
                                        <p className="font-medium">{kunjungan.pasien?.full_name}</p>
                                        <p className="text-muted-foreground text-sm">{kunjungan.nomor_kunjungan} — {kunjungan.poli?.nama_poli}</p>
                                    </div>
                                    <Badge variant="outline">{kunjungan.status_label}</Badge>
                                </div>
                            ) : (
                                <div className="grid gap-2">
                                    <Label>Pilih Kunjungan *</Label>
                                    <Select value={data.kunjungan_id} onValueChange={(v) => setData('kunjungan_id', v)}>
                                        <SelectTrigger className="max-w-md">
                                            <SelectValue placeholder="Pilih kunjungan" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {kunjungans.map((k) => (
                                                <SelectItem key={k.id} value={String(k.id)}>
                                                    {k.nomor_kunjungan} — {k.pasien?.full_name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.kunjungan_id && <p className="text-destructive text-sm">{errors.kunjungan_id}</p>}
                                </div>
                            )}
                        </section>

                        {/* Pemeriksaan Fisik */}
                        <section className="rounded-lg border p-4">
                            <h2 className="mb-4 font-semibold">Pemeriksaan Fisik</h2>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="tekanan_darah">Tekanan Darah</Label>
                                    <Input id="tekanan_darah" value={data.tekanan_darah}
                                        onChange={(e) => setData('tekanan_darah', e.target.value)}
                                        placeholder="120/80 mmHg" />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="suhu_tubuh">Suhu Tubuh (°C)</Label>
                                    <Input id="suhu_tubuh" type="number" step="0.1" value={data.suhu_tubuh}
                                        onChange={(e) => setData('suhu_tubuh', e.target.value)}
                                        placeholder="36.5" />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="nadi">Nadi (x/menit)</Label>
                                    <Input id="nadi" type="number" min="0" value={data.nadi}
                                        onChange={(e) => setData('nadi', e.target.value)}
                                        placeholder="80" />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="pernapasan">Pernapasan (x/menit)</Label>
                                    <Input id="pernapasan" type="number" min="0" value={data.pernapasan}
                                        onChange={(e) => setData('pernapasan', e.target.value)}
                                        placeholder="20" />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="berat_badan">Berat Badan (kg)</Label>
                                    <Input id="berat_badan" type="number" min="0" step="0.1" value={data.berat_badan}
                                        onChange={(e) => setData('berat_badan', e.target.value)}
                                        placeholder="60" />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="tinggi_badan">Tinggi Badan (cm)</Label>
                                    <Input id="tinggi_badan" type="number" min="0" step="0.1" value={data.tinggi_badan}
                                        onChange={(e) => setData('tinggi_badan', e.target.value)}
                                        placeholder="165" />
                                </div>
                            </div>
                        </section>

                        {/* Catatan Medis */}
                        <section className="rounded-lg border p-4">
                            <h2 className="mb-4 font-semibold">Catatan Medis</h2>
                            <div className="space-y-4">
                                {[
                                    { key: 'anamnesis', label: 'Anamnesis / Riwayat Penyakit' },
                                    { key: 'pemeriksaan_fisik', label: 'Hasil Pemeriksaan Fisik' },
                                    { key: 'rencana_terapi', label: 'Rencana Terapi' },
                                    { key: 'catatan_dokter', label: 'Catatan Dokter' },
                                ].map(({ key, label }) => (
                                    <div key={key} className="grid gap-2">
                                        <Label htmlFor={key}>{label}</Label>
                                        <textarea
                                            id={key}
                                            value={data[key as keyof RekamMedisFormData] as string}
                                            onChange={(e) => setData(key as keyof RekamMedisFormData, e.target.value)}
                                            className="border-input dark:bg-input/30 min-h-20 rounded-md border bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                                        />
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Diagnosa */}
                        <section className="rounded-lg border p-4">
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="font-semibold">Diagnosa</h2>
                                <Button type="button" variant="outline" size="sm" onClick={addDiagnosa} disabled={processing}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Tambah Diagnosa
                                </Button>
                            </div>
                            {data.diagnosas.length === 0 && (
                                <p className="text-muted-foreground text-sm">Belum ada diagnosa. Klik "Tambah Diagnosa".</p>
                            )}
                            {data.diagnosas.map((d, i) => (
                                <div key={i} className="mb-3 grid grid-cols-12 gap-2 rounded-md border p-3">
                                    <div className="col-span-2 grid gap-1">
                                        <Label className="text-xs">Kode ICD</Label>
                                        <Input value={d.kode_icd} onChange={(e) => updateDiagnosa(i, 'kode_icd', e.target.value)} placeholder="A00" />
                                    </div>
                                    <div className="col-span-5 grid gap-1">
                                        <Label className="text-xs">Nama Diagnosa *</Label>
                                        <Input value={d.nama_diagnosa} onChange={(e) => updateDiagnosa(i, 'nama_diagnosa', e.target.value)} placeholder="Nama diagnosa" />
                                    </div>
                                    <div className="col-span-2 grid gap-1">
                                        <Label className="text-xs">Jenis</Label>
                                        <Select value={d.jenis} onValueChange={(v) => updateDiagnosa(i, 'jenis', v)}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="utama">Utama</SelectItem>
                                                <SelectItem value="sekunder">Sekunder</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="col-span-2 grid gap-1">
                                        <Label className="text-xs">Keterangan</Label>
                                        <Input value={d.keterangan} onChange={(e) => updateDiagnosa(i, 'keterangan', e.target.value)} />
                                    </div>
                                    <div className="col-span-1 flex items-end">
                                        <Button type="button" variant="destructive" size="icon" onClick={() => removeDiagnosa(i)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                            {arrayError('diagnosas') && (
                                <p className="text-destructive text-sm">{arrayError('diagnosas')}</p>
                            )}
                        </section>

                        {/* Tindakan Medis */}
                        <section className="rounded-lg border p-4">
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="font-semibold">Tindakan Medis</h2>
                                <Button type="button" variant="outline" size="sm" onClick={addTindakan} disabled={processing}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Tambah Tindakan
                                </Button>
                            </div>
                            {data.tindakan.length === 0 && (
                                <p className="text-muted-foreground text-sm">Belum ada tindakan. Klik "Tambah Tindakan".</p>
                            )}
                            {data.tindakan.map((t, i) => (
                                <div key={i} className="mb-3 grid grid-cols-12 gap-2 rounded-md border p-3">
                                    <div className="col-span-3 grid gap-1">
                                        <Label className="text-xs">Tarif (opsional)</Label>
                                        <Select value={t.tarif_id} onValueChange={(v) => updateTindakan(i, 'tarif_id', v)}>
                                            <SelectTrigger><SelectValue placeholder="Pilih tarif" /></SelectTrigger>
                                            <SelectContent>
                                                {tarifs.map((tr) => (
                                                    <SelectItem key={tr.id} value={String(tr.id)}>{tr.nama_tarif}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="col-span-3 grid gap-1">
                                        <Label className="text-xs">Nama Tindakan *</Label>
                                        <Input value={t.nama_tindakan} onChange={(e) => updateTindakan(i, 'nama_tindakan', e.target.value)} placeholder="Nama tindakan" />
                                    </div>
                                    <div className="col-span-2 grid gap-1">
                                        <Label className="text-xs">Biaya (Rp)</Label>
                                        <CurrencyInput
                                            value={t.biaya}
                                            onChange={(v) => updateTindakan(i, 'biaya', v)}
                                        />
                                    </div>
                                    <div className="col-span-1 grid gap-1">
                                        <Label className="text-xs">Jml</Label>
                                        <Input type="number" min="1" value={t.jumlah} onChange={(e) => updateTindakan(i, 'jumlah', e.target.value)} />
                                    </div>
                                    <div className="col-span-2 grid gap-1">
                                        <Label className="text-xs">Subtotal</Label>
                                        <div className="bg-muted flex h-9 items-center rounded-md px-3">
                                            <p className="text-sm font-medium">
                                                Rp {(parseFloat(t.biaya || '0') * parseInt(t.jumlah || '1')).toLocaleString('id-ID')}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="col-span-1 flex items-end">
                                        <Button type="button" variant="destructive" size="icon" onClick={() => removeTindakan(i)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                            {data.tindakan.length > 0 && (
                                <div className="bg-muted mt-2 rounded-md px-3 py-2 text-right text-sm font-semibold">
                                    Total Tindakan: Rp {totalTindakan.toLocaleString('id-ID')}
                                </div>
                            )}
                            {arrayError('tindakan') && (
                                <p className="text-destructive text-sm">{arrayError('tindakan')}</p>
                            )}
                        </section>

                        {/* Resep Obat */}
                        <section className="rounded-lg border p-4">
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="font-semibold">Resep Obat (Opsional)</h2>
                                <Button type="button" variant="outline" size="sm" onClick={addResep} disabled={processing}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Tambah Obat
                                </Button>
                            </div>
                            {data.resep.length === 0 && (
                                <p className="text-muted-foreground text-sm">
                                    Belum ada resep. Klik "Tambah Obat" kalau pasien perlu obat.
                                </p>
                            )}
                            {data.resep.map((r, i) => {
                                const obatDipilih = obats.find((o) => String(o.id) === r.obat_id);
                                const jumlahDiminta = parseInt(r.jumlah || '0');
                                const melebihiStok = obatDipilih && jumlahDiminta > obatDipilih.stok;

                                return (
                                    <div key={i} className="mb-3 grid grid-cols-12 gap-2 rounded-md border p-3">
                                        <div className="col-span-3 grid gap-1">
                                            <Label className="text-xs">Obat *</Label>
                                            <Select value={r.obat_id} onValueChange={(v) => updateResep(i, 'obat_id', v)}>
                                                <SelectTrigger><SelectValue placeholder="Pilih obat" /></SelectTrigger>
                                                <SelectContent>
                                                    {obats.map((o) => (
                                                        <SelectItem key={o.id} value={String(o.id)}>
                                                            {o.nama_obat} (stok: {o.stok})
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="col-span-2 grid gap-1">
                                            <Label className="text-xs">Jumlah *</Label>
                                            <Input
                                                type="number"
                                                min="1"
                                                max={obatDipilih?.stok}
                                                value={r.jumlah}
                                                onChange={(e) => updateResep(i, 'jumlah', e.target.value)}
                                                className={melebihiStok ? 'border-destructive' : ''}
                                            />
                                            {melebihiStok && (
                                                <p className="text-destructive text-xs">Melebihi stok ({obatDipilih?.stok})</p>
                                            )}
                                        </div>
                                        <div className="col-span-4 grid gap-1">
                                            <Label className="text-xs">Aturan Pakai *</Label>
                                            <Input
                                                value={r.aturan_pakai}
                                                onChange={(e) => updateResep(i, 'aturan_pakai', e.target.value)}
                                                placeholder="3x sehari 1 tablet setelah makan"
                                            />
                                        </div>
                                        <div className="col-span-2 grid gap-1">
                                            <Label className="text-xs">Subtotal</Label>
                                            <div className="bg-muted flex h-9 items-center rounded-md px-3">
                                                <p className="text-sm font-medium">
                                                    Rp {(
                                                        (obatDipilih ? Number(obatDipilih.harga_jual) : 0) *
                                                        jumlahDiminta
                                                    ).toLocaleString('id-ID')}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="col-span-1 flex items-end">
                                            <Button type="button" variant="destructive" size="icon" onClick={() => removeResep(i)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                            {data.resep.length > 0 && (
                                <>
                                    <div className="mt-2 grid gap-2">
                                        <Label className="text-xs">Catatan Resep (opsional)</Label>
                                        <Input
                                            value={data.catatan_resep}
                                            onChange={(e) => setData('catatan_resep', e.target.value)}
                                            placeholder="Catatan untuk apoteker..."
                                        />
                                    </div>
                                    <div className="bg-muted mt-2 rounded-md px-3 py-2 text-right text-sm font-semibold">
                                        Total Resep: Rp {totalResep.toLocaleString('id-ID')}
                                    </div>
                                </>
                            )}
                            {arrayError('resep') && (
                                <p className="text-destructive text-sm">{arrayError('resep')}</p>
                            )}
                        </section>

                        {/* Pembayaran */}
                        <section className="rounded-lg border p-4">
                            <h2 className="mb-4 font-semibold">Pembayaran</h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="total_biaya">Total Biaya (Rp)</Label>
                                    {/* 🔧 FIX: readOnly karena sekarang otomatis dari useEffect
                                        di atas, tombol "Pakai ini" tidak diperlukan lagi */}
                                    <CurrencyInput
                                        id="total_biaya"
                                        value={data.total_biaya}
                                        onChange={() => {}}
                                        className="bg-muted font-semibold"
                                        readOnly
                                    />
                                    <p className="text-muted-foreground text-xs">
                                        Otomatis dihitung dari Total Tindakan + Total Resep.
                                    </p>
                                    {errors.total_biaya && <p className="text-destructive text-sm">{errors.total_biaya}</p>}
                                </div>
                                <div className="grid gap-2">
                                    <Label>Status Bayar *</Label>
                                    <Select value={data.status_bayar} onValueChange={(v) => setData('status_bayar', v)}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="belum_bayar">Belum Bayar</SelectItem>
                                            <SelectItem value="lunas">Lunas</SelectItem>
                                            <SelectItem value="cicilan">Cicilan</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.status_bayar && <p className="text-destructive text-sm">{errors.status_bayar}</p>}
                                </div>
                            </div>
                        </section>

                        <div className="flex gap-2">
                            <Button type="submit" disabled={processing}>
                                {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                Simpan Rekam Medis
                            </Button>
                            <Button asChild variant="outline">
                                <Link href="/pelayanan/rekam-medis">Batal</Link>
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

RekamMedisCreate.layout = { breadcrumbs };