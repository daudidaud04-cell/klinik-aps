import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { useRef } from 'react';

const KATEGORI = ['Obat Keras', 'Obat Bebas', 'Obat Bebas Terbatas', 'Narkotika', 'Psikotropika', 'Suplemen', 'Alat Kesehatan'];

interface Medicine {
    id: number;
    kode_obat: string;
    nama_obat: string;
    kategori: string;
    satuan: string;
    stok: number;
    minimal_stok: number;
    harga_beli: number;
    harga_jual: number;
    expired_date: string | null;
    manufacturer: string | null;
    deskripsi: string | null;
    status: string;
}

// Format & parse ribuan yang aman terhadap string desimal dari backend
// (mis. "15000.00" dari decimal cast Laravel) supaya tidak salah baca
// jadi 1.500.000. Number() menangani titik desimal dengan benar,
// beda dengan replace(/\D/g, '') yang membuang titik apa adanya.
function formatRibuan(value: string | number): string {
    const numeric = Math.round(Number(value) || 0);
    if (!numeric) return '';
    return numeric.toLocaleString('id-ID');
}

function parseRibuan(value: string): string {
    return value.replace(/\D/g, '');
}

// Input mata uang yang menjaga posisi kursor saat diformat ulang,
// supaya mengetik di tengah angka tidak menggeser/merusak nilai.
function CurrencyInput({
    id,
    value,
    onChange,
    className,
}: {
    id?: string;
    value: string;
    onChange: (value: string) => void;
    className?: string;
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
        />
    );
}

export default function MedicinesEdit({ medicine }: { medicine: Medicine }) {
    const { data, setData, put, processing, errors } = useForm({
        kode_obat: medicine.kode_obat,
        nama_obat: medicine.nama_obat,
        kategori: medicine.kategori,
        satuan: medicine.satuan,
        stok: String(medicine.stok),
        minimal_stok: String(medicine.minimal_stok),
        // 🔧 FIX: bulatkan dulu dengan Math.round(Number(...)) sebelum
        // dijadikan string, supaya "15000.00" dari backend tidak lolos
        // mentah-mentah ke CurrencyInput.
        harga_beli: String(Math.round(Number(medicine.harga_beli) || 0)),
        harga_jual: String(Math.round(Number(medicine.harga_jual) || 0)),
        expired_date: medicine.expired_date ?? '',
        manufacturer: medicine.manufacturer ?? '',
        deskripsi: medicine.deskripsi ?? '',
        status: medicine.status,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/medicines/${medicine.id}`);
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Data Obat', href: '/medicines' },
        { title: `Edit: ${medicine.nama_obat}`, href: `/medicines/${medicine.id}/edit` },
    ];

    return (
        <>
            <Head title="Edit Obat" />
            <div className="flex flex-1 flex-col gap-4 p-4">
                <div className="bg-background rounded-xl border p-6">
                    <h1 className="mb-6 text-2xl font-bold">Edit Data Obat</h1>

                    <form onSubmit={submit} className="max-w-2xl space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="kode_obat">Kode Obat *</Label>
                                <Input id="kode_obat" value={data.kode_obat}
                                    onChange={(e) => setData('kode_obat', e.target.value.toUpperCase())} />
                                {errors.kode_obat && <p className="text-destructive text-sm">{errors.kode_obat}</p>}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="nama_obat">Nama Obat *</Label>
                                <Input id="nama_obat" value={data.nama_obat}
                                    onChange={(e) => setData('nama_obat', e.target.value)} />
                                {errors.nama_obat && <p className="text-destructive text-sm">{errors.nama_obat}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Kategori *</Label>
                                <Select value={data.kategori} onValueChange={(v) => setData('kategori', v)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {KATEGORI.map((k) => <SelectItem key={k} value={k}>{k}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                {errors.kategori && <p className="text-destructive text-sm">{errors.kategori}</p>}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="satuan">Satuan *</Label>
                                <Input id="satuan" value={data.satuan}
                                    onChange={(e) => setData('satuan', e.target.value)} />
                                {errors.satuan && <p className="text-destructive text-sm">{errors.satuan}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="stok">Stok *</Label>
                                <Input id="stok" type="number" min="0" value={data.stok}
                                    onChange={(e) => setData('stok', e.target.value)} />
                                {errors.stok && <p className="text-destructive text-sm">{errors.stok}</p>}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="minimal_stok">Minimal Stok *</Label>
                                <Input id="minimal_stok" type="number" min="0" value={data.minimal_stok}
                                    onChange={(e) => setData('minimal_stok', e.target.value)} />
                                {errors.minimal_stok && <p className="text-destructive text-sm">{errors.minimal_stok}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="harga_beli">Harga Beli *</Label>
                                <CurrencyInput
                                    id="harga_beli"
                                    value={data.harga_beli}
                                    onChange={(v) => setData('harga_beli', v)}
                                />
                                {errors.harga_beli && <p className="text-destructive text-sm">{errors.harga_beli}</p>}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="harga_jual">Harga Jual *</Label>
                                <CurrencyInput
                                    id="harga_jual"
                                    value={data.harga_jual}
                                    onChange={(v) => setData('harga_jual', v)}
                                />
                                {errors.harga_jual && <p className="text-destructive text-sm">{errors.harga_jual}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="expired_date">Tanggal Expired</Label>
                                <Input id="expired_date" type="date" value={data.expired_date}
                                    onChange={(e) => setData('expired_date', e.target.value)} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="manufacturer">Produsen</Label>
                                <Input id="manufacturer" value={data.manufacturer}
                                    onChange={(e) => setData('manufacturer', e.target.value)} />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="deskripsi">Deskripsi</Label>
                            <textarea id="deskripsi" value={data.deskripsi}
                                onChange={(e) => setData('deskripsi', e.target.value)}
                                className="border-input dark:bg-input/30 min-h-20 rounded-md border bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50" />
                        </div>

                        <div className="grid gap-2">
                            <Label>Status *</Label>
                            <Select value={data.status} onValueChange={(v) => setData('status', v)}>
                                <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="aktif">Aktif</SelectItem>
                                    <SelectItem value="nonaktif">Nonaktif</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex gap-2 pt-2">
                            <Button type="submit" disabled={processing}>
                                {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                Simpan Perubahan
                            </Button>
                            <Button asChild variant="outline">
                                <Link href="/medicines">Batal</Link>
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

MedicinesEdit.layout = (props: { medicine: Medicine }) => ({
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Data Obat', href: '/medicines' },
        { title: `Edit: ${props.medicine.nama_obat}`, href: `/medicines/${props.medicine.id}/edit` },
    ],
});