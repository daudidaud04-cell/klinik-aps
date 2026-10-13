import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type KamarOption, type RawatInapFormData } from '@/types/rawat-inap';
import { Link } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { useEffect } from 'react';

const STATUS_OPTIONS_EDIT = [
    { value: 'aktif', label: 'Aktif' },
    { value: 'pulang', label: 'Pulang' },
    { value: 'meninggal', label: 'Meninggal' },
    { value: 'pulang_paksa', label: 'Pulang Paksa' },
];

const STATUS_KELUAR = ['pulang', 'meninggal', 'pulang_paksa'];

// Format angka jadi "Rp 1.800.000" dengan separator ribuan ala Indonesia.
function formatRupiah(value: string | number): string {
    const numeric = Math.round(Number(value) || 0);
    return 'Rp ' + numeric.toLocaleString('id-ID');
}

// Hitung selisih hari antara dua tanggal (dibulatkan ke bawah, minimal 1 hari
// kalau memang sudah lewat tengah malam sekali).
function diffDays(from: string, to: Date): number {
    const masuk = new Date(from);
    const diffMs = to.getTime() - masuk.getTime();
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

interface Props {
    data: RawatInapFormData;
    setData: (key: keyof RawatInapFormData, value: string) => void;
    errors: Partial<Record<keyof RawatInapFormData, string>>;
    processing: boolean;
    onSubmit: (e: React.FormEvent) => void;
    submitLabel?: string;
    pasiens: { id: number; full_name: string; medical_record_number: string }[];
    kamars: KamarOption[];
    dokters: { id: number; name: string }[];
    isEdit?: boolean;
}

export default function RawatInapForm({
    data, setData, errors, processing, onSubmit,
    submitLabel = 'Simpan', pasiens, kamars, dokters, isEdit = false,
}: Props) {
    const selectedKamar = kamars.find((k) => String(k.id) === data.kamar_id);
    const sisaKapasitas = selectedKamar ? selectedKamar.kapasitas - selectedKamar.terisi : null;
    const isStatusKeluar = STATUS_KELUAR.includes(data.status);

    // 🆕 Total Biaya dihitung OTOMATIS, tidak bisa diketik manual lagi:
    // - Belum didaftarkan/belum ada kamar dipilih -> 0
    // - Saat CREATE (baru daftar, belum ada hari berjalan) -> 0
    // - Saat EDIT & tanggal_keluar sudah diisi -> final: (keluar - masuk) x tarif
    // - Saat EDIT & masih dirawat (tanggal_keluar kosong) -> estimasi berjalan
    //   pakai tanggal hari ini, supaya admin bisa lihat kira-kira biaya sejauh ini
    // Rumus ini sama dengan yang dipakai RawatInap::booted() di backend saat
    // status berubah ke status keluar, jadi nilainya akan konsisten.
    useEffect(() => {
        if (!selectedKamar || !data.tanggal_masuk) {
            if (data.total_biaya !== '0') setData('total_biaya', '0');
            return;
        }

        const tarif = Number(selectedKamar.tarif_harian) || 0;

        let lamaHari = 0;
        if (isEdit) {
            const referenceDate = data.tanggal_keluar
                ? new Date(data.tanggal_keluar)
                : new Date(); // estimasi berjalan pakai hari ini

            lamaHari = Math.max(1, diffDays(data.tanggal_masuk, referenceDate));
        }
        // Saat create (isEdit === false): lamaHari tetap 0 -> total 0

        const total = String(Math.round(lamaHari * tarif));
        if (data.total_biaya !== total) {
            setData('total_biaya', total);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data.tanggal_masuk, data.tanggal_keluar, data.kamar_id, isEdit]);

    return (
        <form onSubmit={onSubmit} className="max-w-2xl space-y-4">

            {/* Pasien */}
            <div className="grid gap-2">
                <Label>Pasien *</Label>
                <Select value={data.pasien_id} onValueChange={(v) => setData('pasien_id', v)} disabled={isEdit}>
                    <SelectTrigger>
                        <SelectValue placeholder="Pilih pasien" />
                    </SelectTrigger>
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

            {/* Kamar & Dokter */}
            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label>Kamar *</Label>
                    {isEdit ? (
                        <div className="border-input bg-muted flex h-9 items-center rounded-md border px-3 text-sm">
                            {selectedKamar
                                ? `${selectedKamar.kode_kamar} — ${selectedKamar.nama_kamar} (${selectedKamar.kelas})`
                                : '-'}
                        </div>
                    ) : (
                        <Select value={data.kamar_id} onValueChange={(v) => setData('kamar_id', v)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Pilih kamar" />
                            </SelectTrigger>
                            <SelectContent>
                                {kamars.map((k) => (
                                    <SelectItem
                                        key={k.id}
                                        value={String(k.id)}
                                        disabled={k.terisi >= k.kapasitas}
                                    >
                                        {k.kode_kamar} — {k.nama_kamar} ({k.kelas})
                                        {k.terisi >= k.kapasitas ? ' [PENUH]' : ` [${k.kapasitas - k.terisi} tersisa]`}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                    {isEdit && (
                        <p className="text-muted-foreground text-xs">
                            Untuk memindahkan pasien ke kamar lain, gunakan tombol "Pindah Kamar" di halaman detail.
                        </p>
                    )}
                    {selectedKamar && !isEdit && (
                        <p className="text-muted-foreground text-xs">
                            Tarif: {formatRupiah(selectedKamar.tarif_harian)}/hari
                            {sisaKapasitas !== null && ` · Sisa: ${sisaKapasitas} tempat`}
                        </p>
                    )}
                    {errors.kamar_id && <p className="text-destructive text-sm">{errors.kamar_id}</p>}
                </div>
                <div className="grid gap-2">
                    <Label>Dokter *</Label>
                    <Select value={data.dokter_id} onValueChange={(v) => setData('dokter_id', v)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Pilih dokter" />
                        </SelectTrigger>
                        <SelectContent>
                            {dokters.map((d) => (
                                <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.dokter_id && <p className="text-destructive text-sm">{errors.dokter_id}</p>}
                </div>
            </div>

            {/* Tanggal Masuk & Keluar */}
            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="tanggal_masuk">Tanggal Masuk *</Label>
                    <Input
                        id="tanggal_masuk"
                        type="date"
                        value={data.tanggal_masuk}
                        onChange={(e) => setData('tanggal_masuk', e.target.value)}
                        disabled={isEdit}
                    />
                    {errors.tanggal_masuk && <p className="text-destructive text-sm">{errors.tanggal_masuk}</p>}
                </div>
                {isEdit && (
                    <div className="grid gap-2">
                        <Label htmlFor="tanggal_keluar">
                            Tanggal Keluar {isStatusKeluar && '*'}
                        </Label>
                        <Input
                            id="tanggal_keluar"
                            type="date"
                            value={data.tanggal_keluar}
                            onChange={(e) => setData('tanggal_keluar', e.target.value)}
                        />
                        {isStatusKeluar && !data.tanggal_keluar && (
                            <p className="text-xs text-amber-600">
                                Wajib diisi karena status yang dipilih adalah status keluar.
                            </p>
                        )}
                        {errors.tanggal_keluar && <p className="text-destructive text-sm">{errors.tanggal_keluar}</p>}
                    </div>
                )}
            </div>

            {/* Status */}
            <div className="grid gap-2">
                <Label>Status *</Label>
                {isEdit ? (
                    <Select value={data.status} onValueChange={(v) => setData('status', v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            {STATUS_OPTIONS_EDIT.map((s) => (
                                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                ) : (
                    <div className="border-input bg-muted flex h-9 items-center rounded-md border px-3 text-sm">
                        Aktif
                    </div>
                )}
                {errors.status && <p className="text-destructive text-sm">{errors.status}</p>}
            </div>

            {/* Diagnosa Masuk */}
            <div className="grid gap-2">
                <Label htmlFor="diagnosa_masuk">Diagnosa Masuk</Label>
                <textarea
                    id="diagnosa_masuk"
                    value={data.diagnosa_masuk}
                    onChange={(e) => setData('diagnosa_masuk', e.target.value)}
                    placeholder="Diagnosa awal saat masuk rawat inap..."
                    className="border-input dark:bg-input/30 min-h-20 rounded-md border bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                />
            </div>

            {/* Total Biaya & Status Bayar */}
            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="total_biaya">Total Biaya</Label>
                    {/* 🔧 FIX: sekarang read-only & otomatis terhitung — lihat
                        useEffect di atas. Tidak bisa lagi diketik manual,
                        supaya nilainya selalu konsisten dengan rumus
                        lama inap x tarif kamar/hari. */}
                    <div className="border-input bg-muted flex h-9 items-center rounded-md border px-3 text-sm font-semibold">
                        {formatRupiah(data.total_biaya)}
                    </div>
                    <p className="text-muted-foreground text-xs">
                        {isEdit && !data.tanggal_keluar
                            ? 'Estimasi berjalan (dihitung s/d hari ini). Nilai final terkunci saat Tanggal Keluar diisi.'
                            : 'Otomatis: lama inap × tarif kamar/hari.'}
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

            {/* Catatan */}
            <div className="grid gap-2">
                <Label htmlFor="catatan">Catatan</Label>
                <textarea
                    id="catatan"
                    value={data.catatan}
                    onChange={(e) => setData('catatan', e.target.value)}
                    className="border-input dark:bg-input/30 min-h-16 rounded-md border bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                />
            </div>

            <div className="flex gap-2 pt-2">
                <Button type="submit" disabled={processing}>
                    {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                    {submitLabel}
                </Button>
                <Button asChild variant="outline">
                    <Link href="/pelayanan/rawat-inap">Batal</Link>
                </Button>
            </div>
        </form>
    );
}