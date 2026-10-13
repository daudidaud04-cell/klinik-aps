import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';

const KATEGORI = [
    'Obat Keras',
    'Obat Bebas',
    'Obat Bebas Terbatas',
    'Narkotika',
    'Psikotropika',
    'Suplemen',
    'Alat Kesehatan',
];

interface MedicineFormData {
    kode_obat: string;
    nama_obat: string;
    kategori: string;
    satuan: string;
    stok: string;
    minimal_stok: string;
    harga_beli: string;
    harga_jual: string;
    expired_date: string;
    manufacturer: string;
    deskripsi: string;
    status: string;
}

interface Props {
    data: MedicineFormData;
    setData: (key: keyof MedicineFormData, value: string) => void;
    errors: Partial<Record<keyof MedicineFormData, string>>;
    processing: boolean;
    onSubmit: (e: React.FormEvent) => void;
    submitLabel?: string;
}

export default function MedicineForm({
    data,
    setData,
    errors,
    processing,
    onSubmit,
    submitLabel = 'Simpan',
}: Props) {
    return (
        <form onSubmit={onSubmit} className="max-w-2xl space-y-4">

            {/* Baris 1: Kode & Nama */}
            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="kode_obat">Kode Obat *</Label>
                    <Input
                        id="kode_obat"
                        value={data.kode_obat}
                        onChange={(e) => setData('kode_obat', e.target.value.toUpperCase())}
                        placeholder="Contoh: OBT-001"
                    />
                    {errors.kode_obat && <p className="text-destructive text-sm">{errors.kode_obat}</p>}
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="nama_obat">Nama Obat *</Label>
                    <Input
                        id="nama_obat"
                        value={data.nama_obat}
                        onChange={(e) => setData('nama_obat', e.target.value)}
                        placeholder="Nama lengkap obat"
                    />
                    {errors.nama_obat && <p className="text-destructive text-sm">{errors.nama_obat}</p>}
                </div>
            </div>

            {/* Baris 2: Kategori & Satuan */}
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
                    <Label htmlFor="satuan">Satuan *</Label>
                    <Input
                        id="satuan"
                        value={data.satuan}
                        onChange={(e) => setData('satuan', e.target.value)}
                        placeholder="Tablet, Kapsul, Botol..."
                    />
                    {errors.satuan && <p className="text-destructive text-sm">{errors.satuan}</p>}
                </div>
            </div>

            {/* Baris 3: Stok & Minimal Stok */}
            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="stok">Stok *</Label>
                    <Input
                        id="stok"
                        type="number"
                        min="0"
                        value={data.stok}
                        onChange={(e) => setData('stok', e.target.value)}
                    />
                    {errors.stok && <p className="text-destructive text-sm">{errors.stok}</p>}
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="minimal_stok">Minimal Stok *</Label>
                    <Input
                        id="minimal_stok"
                        type="number"
                        min="0"
                        value={data.minimal_stok}
                        onChange={(e) => setData('minimal_stok', e.target.value)}
                    />
                    {errors.minimal_stok && <p className="text-destructive text-sm">{errors.minimal_stok}</p>}
                </div>
            </div>

            {/* Baris 4: Harga Beli & Harga Jual */}
            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="harga_beli">Harga Beli (Rp) *</Label>
                    <Input
                        id="harga_beli"
                        type="number"
                        min="0"
                        value={data.harga_beli}
                        onChange={(e) => setData('harga_beli', e.target.value)}
                    />
                    {errors.harga_beli && <p className="text-destructive text-sm">{errors.harga_beli}</p>}
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="harga_jual">Harga Jual (Rp) *</Label>
                    <Input
                        id="harga_jual"
                        type="number"
                        min="0"
                        value={data.harga_jual}
                        onChange={(e) => setData('harga_jual', e.target.value)}
                    />
                    {errors.harga_jual && <p className="text-destructive text-sm">{errors.harga_jual}</p>}
                </div>
            </div>

            {/* Baris 5: Expired & Produsen */}
            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="expired_date">Tanggal Expired</Label>
                    <Input
                        id="expired_date"
                        type="date"
                        value={data.expired_date}
                        onChange={(e) => setData('expired_date', e.target.value)}
                    />
                    {errors.expired_date && <p className="text-destructive text-sm">{errors.expired_date}</p>}
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="manufacturer">Produsen</Label>
                    <Input
                        id="manufacturer"
                        value={data.manufacturer}
                        onChange={(e) => setData('manufacturer', e.target.value)}
                        placeholder="Nama produsen/distributor"
                    />
                    {errors.manufacturer && <p className="text-destructive text-sm">{errors.manufacturer}</p>}
                </div>
            </div>

            {/* Deskripsi */}
            <div className="grid gap-2">
                <Label htmlFor="deskripsi">Deskripsi</Label>
                <textarea
                    id="deskripsi"
                    value={data.deskripsi}
                    onChange={(e) => setData('deskripsi', e.target.value)}
                    placeholder="Deskripsi singkat obat..."
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
                    <Link href="/medicines">Batal</Link>
                </Button>
            </div>
        </form>
    );
}