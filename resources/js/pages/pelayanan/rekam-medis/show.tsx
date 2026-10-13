import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { type BreadcrumbItem } from '@/types';
import { type RekamMedis, type DetailResep } from '@/types/rekam-medis';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

function Row({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="grid grid-cols-3 gap-4 border-b py-2 text-sm last:border-0">
            <dt className="text-muted-foreground font-medium">{label}</dt>
            <dd className="col-span-2">{value ?? '-'}</dd>
        </div>
    );
}

const statusBayarVariant = (status: string) => {
    if (status === 'lunas') return 'default' as const;
    if (status === 'cicilan') return 'outline' as const;
    return 'destructive' as const;
};

// Badge untuk status resep (menunggu/diproses/selesai, sesuaikan
// dengan enum status yang sebenarnya dipakai di kolom resep_obats.status)
const statusResepVariant = (status: string) => {
    if (status === 'selesai') return 'default' as const;
    if (status === 'diproses') return 'outline' as const;
    return 'secondary' as const; // menunggu, dll
};

// Format tanggal human-readable, dipakai untuk tanggal kunjungan
function formatTanggal(value: string | null | undefined): string | null {
    if (! value) return null;
    const date = new Date(value);
    if (isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
}

// 🔧 FIX: potong detik dari format waktu "HH:mm:ss" jadi "HH:mm" saja
function formatJam(value: string | null | undefined): string | null {
    if (! value) return null;
    return value.slice(0, 5);
}

// Helper untuk cek nilai vital sign secara eksplisit, supaya
// nilai 0 tidak ikut disembunyikan oleh truthy check
function formatVital(value: number | string | null | undefined, suffix: string): string | null {
    if (value === null || value === undefined || value === '') return null;
    return `${value} ${suffix}`;
}

export default function RekamMedisShow({ rekamMedis }: { rekamMedis: RekamMedis }) {
    const k = rekamMedis.kunjungan;
    const resep = rekamMedis.resep_obat;

    return (
        <>
            <Head title={`Rekam Medis - ${rekamMedis.nomor_rekam_medis}`} />
            <div className="flex flex-1 flex-col gap-4 p-4">
                <div className="bg-background rounded-xl border p-6">
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold">Rekam Medis</h1>
                            <p className="text-muted-foreground font-mono text-sm">{rekamMedis.nomor_rekam_medis}</p>
                        </div>
                        <div className="flex gap-2">
                            <Button asChild variant="outline">
                                <Link href="/pelayanan/rekam-medis">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Kembali
                                </Link>
                            </Button>
                        </div>
                    </div>

                    <div className="grid max-w-4xl gap-6">

                        {/* Info Pasien & Kunjungan */}
                        <div className="grid grid-cols-2 gap-6">
                            <div className="rounded-lg border p-4">
                                <h2 className="mb-3 font-semibold">Data Pasien</h2>
                                <dl>
                                    <Row label="No. RM" value={k?.pasien?.medical_record_number} />
                                    <Row label="Nama" value={k?.pasien?.full_name} />
                                    <Row label="Gender" value={k?.pasien?.gender === 'laki_laki' ? 'Laki-laki' : 'Perempuan'} />
                                </dl>
                            </div>
                            <div className="rounded-lg border p-4">
                                <h2 className="mb-3 font-semibold">Info Kunjungan</h2>
                                <dl>
                                    <Row label="No. Kunjungan" value={k?.nomor_kunjungan} />
                                    <Row label="Tanggal" value={formatTanggal(k?.tanggal_kunjungan)} />
                                    {/* 🔧 FIX: tambahan baris Jam Masuk */}
                                    <Row label="Jam Masuk" value={formatJam(k?.jam_masuk)} />
                                    <Row label="Dokter" value={k?.dokter?.name} />
                                    <Row label="Poli" value={k?.poli?.nama_poli} />
                                </dl>
                            </div>
                        </div>

                        {/* Pemeriksaan Fisik */}
                        <div className="rounded-lg border p-4">
                            <h2 className="mb-3 font-semibold">Pemeriksaan Fisik</h2>
                            <div className="grid grid-cols-3 gap-4">
                                <Row label="Tekanan Darah" value={rekamMedis.tekanan_darah} />
                                <Row label="Suhu Tubuh" value={formatVital(rekamMedis.suhu_tubuh, '°C')} />
                                <Row label="Nadi" value={formatVital(rekamMedis.nadi, 'x/mnt')} />
                                <Row label="Pernapasan" value={formatVital(rekamMedis.pernapasan, 'x/mnt')} />
                                <Row label="Berat Badan" value={formatVital(rekamMedis.berat_badan, 'kg')} />
                                <Row label="Tinggi Badan" value={formatVital(rekamMedis.tinggi_badan, 'cm')} />
                                {rekamMedis.imt !== null && rekamMedis.imt !== undefined && (
                                    <Row label="IMT" value={`${rekamMedis.imt} kg/m²`} />
                                )}
                            </div>
                        </div>

                        {/* Catatan Medis */}
                        <div className="rounded-lg border p-4">
                            <h2 className="mb-3 font-semibold">Catatan Medis</h2>
                            <dl>
                                <Row label="Anamnesis" value={rekamMedis.anamnesis} />
                                <Row label="Pemeriksaan Fisik" value={rekamMedis.pemeriksaan_fisik} />
                                <Row label="Rencana Terapi" value={rekamMedis.rencana_terapi} />
                                <Row label="Catatan Dokter" value={rekamMedis.catatan_dokter} />
                            </dl>
                        </div>

                        {/* Diagnosa */}
                        {rekamMedis.diagnosas && rekamMedis.diagnosas.length > 0 && (
                            <div className="rounded-lg border p-4">
                                <h2 className="mb-3 font-semibold">Diagnosa</h2>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Kode ICD</TableHead>
                                            <TableHead>Nama Diagnosa</TableHead>
                                            <TableHead>Jenis</TableHead>
                                            <TableHead>Keterangan</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {rekamMedis.diagnosas.map((d, i) => (
                                            <TableRow key={i}>
                                                <TableCell className="font-mono">{d.kode_icd || '-'}</TableCell>
                                                <TableCell>{d.nama_diagnosa}</TableCell>
                                                <TableCell>
                                                    <Badge variant={d.jenis === 'utama' ? 'default' : 'secondary'}>
                                                        {d.jenis === 'utama' ? 'Utama' : 'Sekunder'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{d.keterangan || '-'}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}

                        {/* Tindakan Medis */}
                        {rekamMedis.tindakan_medis && rekamMedis.tindakan_medis.length > 0 && (
                            <div className="rounded-lg border p-4">
                                <h2 className="mb-3 font-semibold">Tindakan Medis</h2>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Nama Tindakan</TableHead>
                                            <TableHead>Biaya</TableHead>
                                            <TableHead>Jumlah</TableHead>
                                            <TableHead>Subtotal</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {rekamMedis.tindakan_medis.map((t, i) => (
                                            <TableRow key={i}>
                                                <TableCell>{t.nama_tindakan}</TableCell>
                                                <TableCell>Rp {Number(t.biaya).toLocaleString('id-ID')}</TableCell>
                                                <TableCell>{t.jumlah}</TableCell>
                                                <TableCell>{t.subtotal_formatted}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}

                        {/* Resep Obat */}
                        {resep && resep.details && resep.details.length > 0 && (
                            <div className="rounded-lg border p-4">
                                <div className="mb-3 flex items-center justify-between">
                                    <div>
                                        <h2 className="font-semibold">Resep Obat</h2>
                                        <p className="text-muted-foreground font-mono text-xs">{resep.nomor_resep}</p>
                                    </div>
                                    <Badge variant={statusResepVariant(resep.status)}>
                                        {resep.status_label}
                                    </Badge>
                                </div>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Nama Obat</TableHead>
                                            <TableHead>Jumlah</TableHead>
                                            <TableHead>Aturan Pakai</TableHead>
                                            <TableHead>Harga Satuan</TableHead>
                                            <TableHead>Subtotal</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {resep.details.map((d: DetailResep, i: number) => (
                                            <TableRow key={i}>
                                                <TableCell>
                                                    {d.obat?.nama_obat ?? '-'}
                                                    {d.obat?.kode_obat && (
                                                        <span className="text-muted-foreground ml-1 font-mono text-xs">
                                                            ({d.obat.kode_obat})
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell>{d.jumlah} {d.obat?.satuan ?? ''}</TableCell>
                                                <TableCell>{d.aturan_pakai}</TableCell>
                                                <TableCell>Rp {Number(d.harga_satuan).toLocaleString('id-ID')}</TableCell>
                                                <TableCell>{d.subtotal_formatted}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                                {resep.catatan && (
                                    <p className="text-muted-foreground mt-3 text-sm">
                                        <span className="font-medium">Catatan untuk apoteker:</span> {resep.catatan}
                                    </p>
                                )}
                                <div className="mt-2 text-right text-sm font-semibold">
                                    Total Resep: {resep.total_harga_formatted}
                                </div>
                            </div>
                        )}

                        {/* Pembayaran */}
                        <div className="rounded-lg border p-4">
                            <h2 className="mb-3 font-semibold">Pembayaran</h2>
                            <dl>
                                <Row label="Total Biaya" value={<span className="font-semibold">{rekamMedis.total_biaya_formatted}</span>} />
                                <Row label="Status Bayar" value={
                                    <Badge variant={statusBayarVariant(rekamMedis.status_bayar)}>
                                        {rekamMedis.status_bayar_label}
                                    </Badge>
                                } />
                            </dl>
                        </div>

                    </div>
                </div>
            </div>
        </>
    );
}

RekamMedisShow.layout = (props: { rekamMedis: RekamMedis }) => ({
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Rekam Medis', href: '/pelayanan/rekam-medis' },
        { title: props.rekamMedis.nomor_rekam_medis, href: `/pelayanan/rekam-medis/${props.rekamMedis.id}` },
    ] as BreadcrumbItem[],
});