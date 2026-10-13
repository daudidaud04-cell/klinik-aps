import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';

const KATEGORI = [
    'Hematologi',
    'Kimia Darah',
    'Urinalisis',
    'Mikrobiologi',
    'Serologi',
    'Parasitologi',
    'Lainnya',
];

export interface LabExaminationFormData {
    kode_pemeriksaan: string;
    nama_pemeriksaan: string;
    kategori: string;
    harga: string;
    satuan_hasil: string;
    nilai_normal_min: string;
    nilai_normal_max: string;
    deskripsi: string;
    estimasi_durasi_menit: string;
    status: string;
}

interface Props {
    data: LabExaminationFormData;
    setData: (key: keyof LabExaminationFormData, value: string) => void;
    errors: Partial<Record<keyof LabExaminationFormData, string>>;
    processing: boolean;
    onSubmit: (e: React.FormEvent) => void;
    submitLabel?: string;
}

export default function LabExaminationForm({
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
                    <Label htmlFor="kode_pemeriksaan">Kode Pemeriksaan *</Label>
                    <Input
                        id="kode_pemeriksaan"
                        value={data.kode_pemeriksaan}
                        onChange={(e) => setData('kode_pemeriksaan', e.target.value.toUpperCase())}
                        placeholder="Contoh: LAB-DL"
                    />
                    {errors.kode_pemeriksaan && <p className="text-destructive text-sm">{errors.kode_pemeriksaan}</p>}
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="nama_pemeriksaan">Nama Pemeriksaan *</Label>
                    <Input
                        id="nama_pemeriksaan"
                        value={data.nama_pemeriksaan}
                        onChange={(e) => setData('nama_pemeriksaan', e.target.value)}
                        placeholder="Contoh: Darah Lengkap"
                    />
                    {errors.nama_pemeriksaan && <p className="text-destructive text-sm">{errors.nama_pemeriksaan}</p>}
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

            {/* Satuan Hasil & Estimasi Durasi */}
            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="satuan_hasil">Satuan Hasil</Label>
                    <Input
                        id="satuan_hasil"
                        value={data.satuan_hasil}
                        onChange={(e) => setData('satuan_hasil', e.target.value)}
                        placeholder="Contoh: mg/dL, g/dL"
                    />
                    {errors.satuan_hasil && <p className="text-destructive text-sm">{errors.satuan_hasil}</p>}
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="estimasi_durasi_menit">Estimasi Durasi (menit) *</Label>
                    <Input
                        id="estimasi_durasi_menit"
                        type="number"
                        min="1"
                        value={data.estimasi_durasi_menit}
                        onChange={(e) => setData('estimasi_durasi_menit', e.target.value)}
                        placeholder="30"
                    />
                    {errors.estimasi_durasi_menit && <p className="text-destructive text-sm">{errors.estimasi_durasi_menit}</p>}
                </div>
            </div>

            {/* Nilai Normal Min & Max */}
            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="nilai_normal_min">Nilai Normal Min</Label>
                    <Input
                        id="nilai_normal_min"
                        value={data.nilai_normal_min}
                        onChange={(e) => setData('nilai_normal_min', e.target.value)}
                        placeholder="Contoh: 70"
                    />
                    {errors.nilai_normal_min && <p className="text-destructive text-sm">{errors.nilai_normal_min}</p>}
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="nilai_normal_max">Nilai Normal Max</Label>
                    <Input
                        id="nilai_normal_max"
                        value={data.nilai_normal_max}
                        onChange={(e) => setData('nilai_normal_max', e.target.value)}
                        placeholder="Contoh: 110"
                    />
                    {errors.nilai_normal_max && <p className="text-destructive text-sm">{errors.nilai_normal_max}</p>}
                </div>
            </div>

            {/* Deskripsi */}
            <div className="grid gap-2">
                <Label htmlFor="deskripsi">Deskripsi</Label>
                <textarea
                    id="deskripsi"
                    value={data.deskripsi}
                    onChange={(e) => setData('deskripsi', e.target.value)}
                    placeholder="Deskripsi singkat pemeriksaan..."
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
                    <Link href="/lab-examinations">Batal</Link>
                </Button>
            </div>
        </form>
    );
}