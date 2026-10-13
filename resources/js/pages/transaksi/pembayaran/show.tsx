import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { type BreadcrumbItem } from '@/types';
import { type Pembayaran } from '@/types/transaksi';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, FileText } from 'lucide-react';
import { useRef, useState } from 'react';

function Row({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="grid grid-cols-3 gap-4 border-b py-2 text-sm last:border-0">
            <dt className="text-muted-foreground font-medium">{label}</dt>
            <dd className="col-span-2">{value ?? '-'}</dd>
        </div>
    );
}

const statusVariant = (status: string) => {
    if (status === 'lunas') return 'default' as const;
    if (status === 'gagal' || status === 'refund') return 'destructive' as const;
    return 'outline' as const;
};

const METODE_BAYAR_OPTIONS = [
    { value: 'tunai', label: 'Tunai' },
    { value: 'transfer', label: 'Transfer' },
];

// 🔧 FIX: gunakan Number() untuk parsing, bukan regex \D saja,
// supaya string desimal seperti "70000.00" dari backend (decimal cast Laravel)
// tidak ikut kebuang titiknya dan berubah jadi "7000000".
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

export default function PembayaranShow({ pembayaran }: { pembayaran: Pembayaran }) {
    const [catatan, setCatatan] = useState(pembayaran.catatan ?? '');
    // 🔧 FIX: bulatkan total ke integer sebelum dijadikan string,
    // supaya "70000.00" (string desimal dari backend) tidak lolos
    // ke CurrencyInput sebagai nilai mentah.
    const [dibayar, setDibayar] = useState(String(Math.round(Number(pembayaran.total ?? 0))));
    const [metodeBayar, setMetodeBayar] = useState(pembayaran.metode_bayar || 'tunai');
    const [processing, setProcessing] = useState(false);

    const total = Number(pembayaran.total ?? 0);
    const dibayarNum = Number(dibayar) || 0;
    const kembalian = Math.max(dibayarNum - total, 0);
    const kurangBayar = dibayarNum < total;

    const updateStatus = (status: 'lunas' | 'refund' | 'menunggu') => {
        setProcessing(true);
        router.put(`/transaksi/pembayaran/${pembayaran.id}`, {
            status,
            catatan,
            ...(status === 'lunas' ? {
                dibayar: dibayarNum,
                kembalian: kembalian,
                metode_bayar: metodeBayar,
            } : {}),
        }, {
            preserveScroll: true,
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <>
            <Head title={`Pembayaran - ${pembayaran.nomor_pembayaran}`} />
            <div className="flex flex-1 flex-col gap-4 p-4">
                <div className="bg-background rounded-xl border p-6">
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold">Detail Pembayaran</h1>
                            <p className="text-muted-foreground font-mono text-sm">{pembayaran.nomor_pembayaran}</p>
                        </div>
                        <div className="flex gap-2">
                            <Button asChild variant="outline">
                                <Link href="/transaksi/pembayaran"><ArrowLeft className="mr-2 h-4 w-4" />Kembali</Link>
                            </Button>
                            {pembayaran.invoice && (
                                <Button asChild variant="secondary">
                                    <Link href={`/transaksi/invoice/${pembayaran.invoice.id}`}>
                                        <FileText className="mr-2 h-4 w-4" />Lihat Invoice
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </div>

                    <dl className="max-w-2xl">
                        <Row label="Pasien" value={`${pembayaran.pasien?.full_name} (${pembayaran.pasien?.medical_record_number})`} />
                        <Row label="Jenis Layanan" value={<Badge variant="outline">{pembayaran.jenis_layanan.replace('_', ' ')}</Badge>} />
                        <Row label="Subtotal" value={`Rp ${Number(pembayaran.subtotal).toLocaleString('id-ID')}`} />
                        <Row label="Diskon" value={`Rp ${Number(pembayaran.diskon).toLocaleString('id-ID')}`} />
                        <Row label="Pajak" value={`Rp ${Number(pembayaran.pajak).toLocaleString('id-ID')}`} />
                        <Row label="Total" value={<span className="font-semibold text-lg">{pembayaran.total_formatted}</span>} />
                        <Row label="Dibayar" value={`Rp ${Number(pembayaran.dibayar).toLocaleString('id-ID')}`} />
                        <Row label="Kembalian" value={`Rp ${Number(pembayaran.kembalian).toLocaleString('id-ID')}`} />
                        <Row label="Metode Bayar" value={pembayaran.metode_bayar_label} />
                        <Row label="Kasir" value={pembayaran.kasir?.name} />
                        <Row label="Tanggal Bayar" value={pembayaran.tanggal_bayar_formatted} />
                        <Row label="Waktu Bayar" value={pembayaran.jam_bayar} />
                        <Row label="Status" value={
                            <Badge variant={statusVariant(pembayaran.status)}>{pembayaran.status_label}</Badge>
                        } />
                        <Row label="Catatan" value={pembayaran.catatan} />
                    </dl>

                    {pembayaran.status !== 'lunas' && (
                        <div className="mt-6 max-w-2xl border-t pt-6">
                            <h2 className="mb-3 font-semibold">Ubah Status Pembayaran</h2>

                            <div className="mb-3 grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label>Metode Bayar</Label>
                                    <Select value={metodeBayar} onValueChange={setMetodeBayar}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih metode bayar" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {METODE_BAYAR_OPTIONS.map((m) => (
                                                <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="dibayar">Jumlah Dibayar</Label>
                                    <CurrencyInput
                                        id="dibayar"
                                        value={dibayar}
                                        onChange={setDibayar}
                                    />
                                </div>
                            </div>

                            <div className="mb-3 grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label>Kembalian</Label>
                                    <div className="border-input flex h-9 items-center rounded-md border px-3 text-sm">
                                        Rp {kembalian.toLocaleString('id-ID')}
                                    </div>
                                </div>
                                <div className="flex items-end">
                                    {kurangBayar && (
                                        <p className="text-destructive text-xs">
                                            Jumlah dibayar kurang dari total tagihan (Rp {total.toLocaleString('id-ID')}).
                                        </p>
                                    )}
                                </div>
                            </div>

                            <Textarea
                                value={catatan}
                                onChange={(e) => setCatatan(e.target.value)}
                                placeholder="Catatan (opsional)..."
                                className="mb-3"
                            />

                            <div className="flex flex-wrap gap-2">
                                <Button
                                    disabled={processing || kurangBayar}
                                    onClick={() => updateStatus('lunas')}
                                >
                                    Tandai Lunas
                                </Button>
                            </div>
                        </div>
                    )}

                    {pembayaran.status === 'lunas' && (
                        <div className="mt-6 max-w-2xl border-t pt-6">
                            <h2 className="mb-3 font-semibold">Ubah Status Pembayaran</h2>
                            <Button
                                variant="outline"
                                disabled={processing}
                                onClick={() => updateStatus('refund')}
                            >
                                Refund
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

PembayaranShow.layout = (props: { pembayaran: Pembayaran }) => ({
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Pembayaran', href: '/transaksi/pembayaran' },
        { title: props.pembayaran.nomor_pembayaran, href: `/transaksi/pembayaran/${props.pembayaran.id}` },
    ] as BreadcrumbItem[],
});