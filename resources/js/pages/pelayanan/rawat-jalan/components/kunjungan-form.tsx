import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { type KunjunganFormData, type Pasien, type PoliWithDoctors } from '@/types/rawat-jalan';
import { Link } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { useEffect, useMemo, useRef } from 'react';

const STATUS_OPTIONS = [
    { value: 'menunggu', label: 'Menunggu' },
    { value: 'dalam_pemeriksaan', label: 'Dalam Pemeriksaan' },
    { value: 'selesai', label: 'Selesai' },
    { value: 'batal', label: 'Batal' },
];

interface Props {
    data: KunjunganFormData;
    setData: (key: keyof KunjunganFormData, value: string) => void;
    errors: Partial<Record<keyof KunjunganFormData, string>>;
    processing: boolean;
    onSubmit: (e: React.FormEvent) => void;
    submitLabel?: string;
    pasiens: Pasien[];
    polis: PoliWithDoctors[];
}

export default function KunjunganForm({
    data, setData, errors, processing, onSubmit,
    submitLabel = 'Simpan', pasiens, polis,
}: Props) {
    const userEditedJam = useRef(false);

    useEffect(() => {
        const setNow = () => {
            if (userEditedJam.current) return;
            const now = new Date();
            const hh = String(now.getHours()).padStart(2, '0');
            const mm = String(now.getMinutes()).padStart(2, '0');
            setData('jam_masuk', `${hh}:${mm}`);
        };
        setNow();
        const interval = setInterval(setNow, 60_000);
        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // poli yang sedang dipilih beserta daftar dokternya
    const selectedPoli = useMemo(
        () => polis.find((p) => String(p.id) === data.poli_id) ?? null,
        [polis, data.poli_id],
    );

    // 🔧 FIX UTAMA: daftar dokter yang tersedia untuk dropdown, difilter
    // berdasarkan poli yang sedang dipilih. Kalau poli belum dipilih,
    // dropdown dokter kosong.
    const availableDoctors = selectedPoli?.doctors ?? [];

    // 🔧 FIX: saat poli diganti, dokter TIDAK otomatis terisi lagi
    // (karena bisa lebih dari satu pilihan). Field dokter direset supaya
    // user memilih sendiri dokter yang sesuai untuk poli barunya.
    const handlePoliChange = (value: string) => {
        setData('poli_id', value);
        setData('dokter_id', '');
    };

    return (
        <form onSubmit={onSubmit} className="max-w-2xl space-y-4">

            {/* Pasien - searchable */}
            <div className="grid gap-2">
                <Label>Pasien *</Label>
                <SearchableSelect
                    options={pasiens.map((p) => ({
                        value: String(p.id),
                        label: p.full_name,
                        subLabel: p.medical_record_number,
                    }))}
                    value={data.pasien_id}
                    onChange={(v) => setData('pasien_id', v)}
                    placeholder="Pilih pasien"
                    searchPlaceholder="Cari nama atau no. rekam medis..."
                    emptyText="Pasien tidak ditemukan."
                    error={!!errors.pasien_id}
                />
                {errors.pasien_id && <p className="text-destructive text-sm">{errors.pasien_id}</p>}
            </div>

            {/* Poli & Dokter */}
            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label>Poli *</Label>
                    <Select value={data.poli_id} onValueChange={handlePoliChange}>
                        <SelectTrigger>
                            <SelectValue placeholder="Pilih poli" />
                        </SelectTrigger>
                        <SelectContent>
                            {polis.map((p) => (
                                <SelectItem key={p.id} value={String(p.id)}>{p.nama_poli}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.poli_id && <p className="text-destructive text-sm">{errors.poli_id}</p>}
                </div>

                {/* 🔧 FIX UTAMA: dari Input readonly jadi Select aktif,
                    isinya dokter-dokter yang terhubung ke poli terpilih */}
                <div className="grid gap-2">
                    <Label>Dokter *</Label>
                    <Select
                        value={data.dokter_id}
                        onValueChange={(v) => setData('dokter_id', v)}
                        disabled={!data.poli_id || availableDoctors.length === 0}
                    >
                        <SelectTrigger>
                            <SelectValue
                                placeholder={
                                    !data.poli_id
                                        ? 'Pilih poli dahulu'
                                        : availableDoctors.length === 0
                                            ? 'Poli ini belum memiliki dokter'
                                            : 'Pilih dokter'
                                }
                            />
                        </SelectTrigger>
                        <SelectContent>
                            {availableDoctors.map((d) => (
                                <SelectItem key={d.id} value={String(d.id)}>
                                    {d.name}{d.specialization ? ` - ${d.specialization}` : ''}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.dokter_id && <p className="text-destructive text-sm">{errors.dokter_id}</p>}
                </div>
            </div>

            {/* Tanggal & Jam Masuk */}
            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="tanggal_kunjungan">Tanggal Kunjungan *</Label>
                    <Input
                        id="tanggal_kunjungan"
                        type="date"
                        value={data.tanggal_kunjungan}
                        onChange={(e) => setData('tanggal_kunjungan', e.target.value)}
                    />
                    {errors.tanggal_kunjungan && <p className="text-destructive text-sm">{errors.tanggal_kunjungan}</p>}
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="jam_masuk">Jam Masuk</Label>
                    <Input
                        id="jam_masuk"
                        type="time"
                        value={data.jam_masuk}
                        onChange={(e) => {
                            userEditedJam.current = true;
                            setData('jam_masuk', e.target.value);
                        }}
                    />
                </div>
            </div>

            {/* Status */}
            <div className="grid gap-2">
                <Label>Status *</Label>
                <Select value={data.status} onValueChange={(v) => setData('status', v)}>
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {STATUS_OPTIONS.map((s) => (
                            <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {errors.status && <p className="text-destructive text-sm">{errors.status}</p>}
            </div>

            {/*
                ============================================================
                🔒 NONAKTIF SEMENTARA — Jenis Pembayaran & Nomor BPJS
                ============================================================
                Klinik saat ini HANYA melayani pasien umum, jadi field ini
                disembunyikan dari form (jenis_pembayaran otomatis 'umum'
                lewat default value di rawat-jalan-create.tsx).

                Field jenis_pembayaran & nomor_bpjs TIDAK dihapus dari
                database, type KunjunganFormData, maupun validasi backend
                — supaya kalau klinik mulai menerima BPJS, tinggal
                UNCOMMENT blok di bawah ini tanpa perlu bikin ulang apa pun.

                Cara mengaktifkan lagi:
                1. Uncomment blok <div className="grid grid-cols-2 gap-4"> di bawah.
                2. Uncomment blok kondisional Nomor BPJS di bawahnya.
                3. Hapus/comment blok "Status" tunggal di atas, ganti dengan
                   versi grid-2-kolom (Status + Jenis Pembayaran) yang ada
                   di dalam comment ini.
                ============================================================

            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label>Status *</Label>
                    <Select value={data.status} onValueChange={(v) => setData('status', v)}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {STATUS_OPTIONS.map((s) => (
                                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.status && <p className="text-destructive text-sm">{errors.status}</p>}
                </div>
                <div className="grid gap-2">
                    <Label>Jenis Pembayaran *</Label>
                    <Select value={data.jenis_pembayaran} onValueChange={(v) => setData('jenis_pembayaran', v)}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="umum">Umum</SelectItem>
                            <SelectItem value="bpjs">BPJS</SelectItem>
                            <SelectItem value="asuransi">Asuransi</SelectItem>
                        </SelectContent>
                    </Select>
                    {errors.jenis_pembayaran && <p className="text-destructive text-sm">{errors.jenis_pembayaran}</p>}
                </div>
            </div>

            {data.jenis_pembayaran === 'bpjs' && (
                <div className="grid gap-2">
                    <Label htmlFor="nomor_bpjs">Nomor BPJS *</Label>
                    <Input
                        id="nomor_bpjs"
                        value={data.nomor_bpjs}
                        onChange={(e) => setData('nomor_bpjs', e.target.value)}
                        placeholder="Nomor kartu BPJS"
                        maxLength={20}
                    />
                    {errors.nomor_bpjs && <p className="text-destructive text-sm">{errors.nomor_bpjs}</p>}
                </div>
            )}

            */}

            {/* Keluhan Utama */}
            <div className="grid gap-2">
                <Label htmlFor="keluhan_utama">Keluhan Utama</Label>
                <textarea
                    id="keluhan_utama"
                    value={data.keluhan_utama}
                    onChange={(e) => setData('keluhan_utama', e.target.value)}
                    placeholder="Keluhan yang disampaikan pasien..."
                    className="border-input dark:bg-input/30 min-h-20 rounded-md border bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                />
            </div>

            {/* Catatan */}
            <div className="grid gap-2">
                <Label htmlFor="catatan">Catatan Tambahan</Label>
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
                    <Link href="/pelayanan/rawat-jalan">Batal</Link>
                </Button>
            </div>
        </form>
    );
}