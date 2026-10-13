import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';

const KATEGORI = [
    'Konsultasi',
    'Administrasi',
    'Rawat Inap',
    'Tindakan Medis',
    'Tindakan Bedah Minor',
    'Laboratorium',
    'Radiologi',
    'Lainnya',
];

export interface ClinicRateFormData {
    kode_tarif: string;
    nama_tarif: string;
    kategori: string;
    harga: string;
    is_taxable: boolean;
    tax_percent: string;
    deskripsi: string;
    status: string;
}

interface Props {
    data: ClinicRateFormData;
    setData: (key: keyof ClinicRateFormData, value: string | boolean) => void;
    errors: Partial<Record<keyof ClinicRateFormData, string>>;
    processing: boolean;
    onSubmit: (e: React.FormEvent) => void;
    submitLabel?: string;
}

export default function ClinicRateForm({
    data,
    setData,
    errors,
    processing,
    onSubmit,
    submitLabel = 'Simpan',
}: Props) {
    return (
        <form onSubmit={onSubmit} className="max-w-2xl space-y-4">

            {/* Kode & Nama */}
            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="kode_tarif">Kode Tarif *</Label>
                    <Input
                        id="kode_tarif"
                        value={data.kode_tarif}
                        onChange={(e) => setData('kode_tarif', e.target.value.toUpperCase())}
                        placeholder="Contoh: TRF-KONSUL"
                    />
                    {errors.kode_tarif && <p className="text-destructive text-sm">{errors.kode_tarif}</p>}
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="nama_tarif">Nama Tarif *</Label>
                    <Input
                        id="nama_tarif"
                        value={data.nama_tarif}
                        onChange={(e) => setData('nama_tarif', e.target.value)}
                        placeholder="Contoh: Biaya Konsultasi Dokter"
                    />
                    {errors.nama_tarif && <p className="text-destructive text-sm">{errors.nama_tarif}</p>}
                </div>
            </div>

            {/* Kategori & Harga */}
            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label>Kategori *</Label>
                    <Select value={data.kategori} onValueChange={(v) => setData('kategori', v)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Pilih kategori" />
                        </SelectTrigger>
                        <SelectContent>
                            {KATEGORI.map((k) => (
                                <SelectItem key={k} value={k}>{k}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.kategori && <p className="text-destructive text-sm">{errors.kategori}</p>}
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="harga">Harga (Rp) *</Label>
                    <Input
                        id="harga"
                        type="number"
                        min="0"
                        value={data.harga}
                        onChange={(e) => setData('harga', e.target.value)}
                        placeholder="0"
                    />
                    {errors.harga && <p className="text-destructive text-sm">{errors.harga}</p>}
                </div>
            </div>

            {/* Pajak */}
            <div className="grid gap-2">
                <div className="flex items-center gap-3">
                    <input
                        id="is_taxable"
                        type="checkbox"
                        checked={data.is_taxable}
                        onChange={(e) => setData('is_taxable', e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300"
                    />
                    <Label htmlFor="is_taxable" className="cursor-pointer">
                        Kena Pajak
                    </Label>
                </div>
                {errors.is_taxable && <p className="text-destructive text-sm">{errors.is_taxable}</p>}
            </div>

            {/* Tax Percent — tampil hanya jika is_taxable */}
            {data.is_taxable && (
                <div className="grid gap-2">
                    <Label htmlFor="tax_percent">Persentase Pajak (%)</Label>
                    <Input
                        id="tax_percent"
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={data.tax_percent}
                        onChange={(e) => setData('tax_percent', e.target.value)}
                        placeholder="Contoh: 11"
                        className="max-w-xs"
                    />
                    {errors.tax_percent && <p className="text-destructive text-sm">{errors.tax_percent}</p>}
                    {data.harga && data.tax_percent && (
                        <p className="text-muted-foreground text-sm">
                            Harga setelah pajak: Rp{' '}
                            {Number(
                                parseFloat(data.harga) * (1 + parseFloat(data.tax_percent) / 100)
                            ).toLocaleString('id-ID')}
                        </p>
                    )}
                </div>
            )}

            {/* Deskripsi */}
            <div className="grid gap-2">
                <Label htmlFor="deskripsi">Deskripsi</Label>
                <textarea
                    id="deskripsi"
                    value={data.deskripsi}
                    onChange={(e) => setData('deskripsi', e.target.value)}
                    placeholder="Deskripsi singkat tarif..."
                    className="border-input dark:bg-input/30 min-h-20 rounded-md border bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                />
            </div>

            {/* Status */}
            <div className="grid gap-2">
                <Label>Status *</Label>
                <Select value={data.status} onValueChange={(v) => setData('status', v)}>
                    <SelectTrigger className="w-48">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="aktif">Aktif</SelectItem>
                        <SelectItem value="nonaktif">Nonaktif</SelectItem>
                    </SelectContent>
                </Select>
                {errors.status && <p className="text-destructive text-sm">{errors.status}</p>}
            </div>

            {/* Tombol */}
            <div className="flex gap-2 pt-2">
                <Button type="submit" disabled={processing}>
                    {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                    {submitLabel}
                </Button>
                <Button asChild variant="outline">
                    <Link href="/clinic-rates">Batal</Link>
                </Button>
            </div>
        </form>
    );
}