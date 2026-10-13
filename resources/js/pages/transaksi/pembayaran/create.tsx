import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type BreadcrumbItem } from '@/types';
import { type PembayaranFormData } from '@/types/transaksi';
import { Head, Link, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Pembayaran', href: '/transaksi/pembayaran' },
    { title: 'Buat Pembayaran', href: '/transaksi/pembayaran/create' },
];

interface Props {
    pasiens: { id: number; full_name: string; medical_record_number: string }[];
    tarifs: { id: number; nama_tarif: string; harga: number; kategori: string }[];
}

export default function PembayaranCreate({ pasiens, tarifs }: Props) {
    const { data, setData, post, processing, errors } = useForm<PembayaranFormData>({
        pasien_id: '',
        tarif_id: '',
        jenis_layanan: '',
        subtotal: '0',
        diskon: '0',
        pajak: '0',
        total: '0',
        dibayar: '0',
        metode_bayar: 'tunai',
        status: 'menunggu',
        catatan: '',
        tanggal_bayar: '',
    });

    // Hitung total otomatis
    const hitungTotal = (subtotal: string, diskon: string, pajak: string) => {
        const s = parseFloat(subtotal || '0');
        const d = parseFloat(diskon || '0');
        const p = parseFloat(pajak || '0');
        return String(Math.max(0, s - d + p));
    };

    const handleSubtotalChange = (val: string) => {
        setData('subtotal', val);
        setData('total', hitungTotal(val, data.diskon, data.pajak));
    };

    const handleDiskonChange = (val: string) => {
        setData('diskon', val);
        setData('total', hitungTotal(data.subtotal, val, data.pajak));
    };

    const kembalian = Math.max(0, parseFloat(data.dibayar || '0') - parseFloat(data.total || '0'));

    return (
        <>
            <Head title="Buat Pembayaran" />
            <div className="flex flex-1 flex-col gap-4 p-4">
                <div className="bg-background rounded-xl border p-6">
                    <h1 className="mb-6 text-2xl font-bold">Buat Pembayaran</h1>

                    <form onSubmit={(e) => { e.preventDefault(); post('/transaksi/pembayaran'); }} className="max-w-2xl space-y-4">

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
                                <Label>Jenis Layanan *</Label>
                                <Select value={data.jenis_layanan} onValueChange={(v) => setData('jenis_layanan', v)}>
                                    <SelectTrigger><SelectValue placeholder="Pilih jenis" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="rawat_jalan">Rawat Jalan</SelectItem>
                                        <SelectItem value="rawat_inap">Rawat Inap</SelectItem>
                                        <SelectItem value="laboratorium">Laboratorium</SelectItem>
                                        <SelectItem value="resep">Resep Obat</SelectItem>
                                        <SelectItem value="tindakan">Tindakan Medis</SelectItem>
                                        <SelectItem value="lainnya">Lainnya</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.jenis_layanan && <p className="text-destructive text-sm">{errors.jenis_layanan}</p>}
                            </div>
                            <div className="grid gap-2">
                                <Label>Tarif (opsional)</Label>
                                <Select value={data.tarif_id} onValueChange={(v) => setData('tarif_id', v)}>
                                    <SelectTrigger><SelectValue placeholder="Pilih tarif" /></SelectTrigger>
                                    <SelectContent>
                                        {tarifs.map((t) => (
                                            <SelectItem key={t.id} value={String(t.id)}>
                                                {t.nama_tarif}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="rounded-lg border p-4">
                            <h2 className="mb-4 font-semibold">Rincian Biaya</h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="subtotal">Subtotal (Rp) *</Label>
                                    <Input id="subtotal" type="number" min="0" value={data.subtotal}
                                        onChange={(e) => handleSubtotalChange(e.target.value)} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="diskon">Diskon (Rp)</Label>
                                    <Input id="diskon" type="number" min="0" value={data.diskon}
                                        onChange={(e) => handleDiskonChange(e.target.value)} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="total">Total (Rp) *</Label>
                                    <Input id="total" type="number" min="0" value={data.total}
                                        onChange={(e) => setData('total', e.target.value)}
                                        className="font-semibold" />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="dibayar">Dibayar (Rp) *</Label>
                                    <Input id="dibayar" type="number" min="0" value={data.dibayar}
                                        onChange={(e) => setData('dibayar', e.target.value)} />
                                    {parseFloat(data.dibayar) > 0 && (
                                        <p className="text-muted-foreground text-xs">
                                            Kembalian: Rp {kembalian.toLocaleString('id-ID')}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Metode Bayar *</Label>
                                <Select value={data.metode_bayar} onValueChange={(v) => setData('metode_bayar', v)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="tunai">Tunai</SelectItem>
                                        <SelectItem value="transfer">Transfer Bank</SelectItem>
                                        <SelectItem value="bpjs">BPJS</SelectItem>
                                        <SelectItem value="asuransi">Asuransi</SelectItem>
                                        <SelectItem value="kartu_debit">Kartu Debit</SelectItem>
                                        <SelectItem value="kartu_kredit">Kartu Kredit</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label>Status *</Label>
                                <Select value={data.status} onValueChange={(v) => setData('status', v)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="menunggu">Menunggu</SelectItem>
                                        <SelectItem value="lunas">Lunas</SelectItem>
                                        <SelectItem value="gagal">Gagal</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="catatan">Catatan</Label>
                            <textarea id="catatan" value={data.catatan}
                                onChange={(e) => setData('catatan', e.target.value)}
                                className="border-input dark:bg-input/30 min-h-16 rounded-md border bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50" />
                        </div>

                        <div className="flex gap-2 pt-2">
                            <Button type="submit" disabled={processing}>
                                {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                Proses Pembayaran
                            </Button>
                            <Button asChild variant="outline">
                                <Link href="/transaksi/pembayaran">Batal</Link>
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

PembayaranCreate.layout = { breadcrumbs };