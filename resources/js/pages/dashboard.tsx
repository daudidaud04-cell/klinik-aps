import { StatCard } from '@/components/stat-card';
import { ExpandableStatCard } from '@/components/expandable-stat-card';
import { MiniBarChart } from '@/components/mini-bar-chart';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import type { BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import {
    Activity,
    AlertTriangle,
    BedDouble,
    ClipboardList,
    CreditCard,
    FileText,
    FlaskConical,
    Pill,
    TrendingUp,
    TrendingDown,
    Users,
    ChevronDown,
} from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
];

interface Stats {
    total_pasien: number;
    pasien_baru: number;
    rawat_jalan_bulan: number;
    rawat_inap_aktif: number;
    pendapatan_bulan: number;
    resep_bulan: number;
    lab_bulan: number;
}

type Tone = 'blue' | 'green' | 'yellow' | 'red' | 'purple';

type MonitoringIcon =
    | 'users' | 'activity' | 'bed' | 'clipboard' | 'flask'
    | 'pill' | 'credit-card' | 'file-text' | 'alert';

interface AlertCard {
    title: string;
    value: number;
    description: string;
    href: string;
    tone: Tone;
    icon: MonitoringIcon;
}

interface DashboardMonitoring {
    role_label: string;
    updated_at: string;
    alerts: AlertCard[];
}

// ─── Obat Alerts ────────────────────────────────────────────────────
interface ObatStokMenipis {
    id: number; kode_obat: string; nama_obat: string; kategori: string;
    satuan: string; stok: number; minimal_stok: number;
    stok_status: 'habis' | 'menipis' | 'aman' | null;
}
interface ObatMendekatiKadaluarsa {
    id: number; kode_obat: string; nama_obat: string; kategori: string;
    stok: number; expired_date: string | null; sisa_hari: number | null;
}
interface ObatSudahKedaluwarsa {
    id: number; kode_obat: string; nama_obat: string; kategori: string;
    stok: number; expired_date: string | null; terlambat_hari: number | null;
}
interface ObatAlerts {
    total_obat_aktif: number; total_stok_menipis: number;
    total_near_expiry: number; total_sudah_kedaluwarsa: number;
    stok_menipis: ObatStokMenipis[];
    mendekati_kadaluarsa: ObatMendekatiKadaluarsa[];
    sudah_kedaluwarsa: ObatSudahKedaluwarsa[];
}

// ─── Finansial (Super Admin saja) ──────────────────────────────────
interface BreakdownMetode {
    metode: string; label: string; total: number; jumlah: number;
}
interface Tren7Hari {
    tanggal: string; label_singkat: string; total: number;
}
interface Finansial {
    pendapatan_hari_ini: number;
    pendapatan_kemarin: number;
    pendapatan_bulan_ini: number;
    tren_persen: number;
    breakdown_metode_bayar: BreakdownMetode[];
    tren_7_hari: Tren7Hari[];
}

// ─── Bed info (diselipkan ke StatCard Rawat Inap, bukan section) ──
interface BedInfo {
    total_kapasitas: number;
    terisi: number;
    tersedia: number;
}

// ─── Antrean & Tugas Hari Ini (gabungan) ──────────────────────────
interface AntreanItemSimple {
    id?: never;
}
interface ResepAntreanItem {
    id: number; pasien: string; dokter: string; status: string; action_href: string;
}
interface LabAntreanItem {
    id: number; pasien: string; jenis: string; status: string; menunggu_sejak: string;
}
interface InvoiceAntreanItem {
    id: number; pasien: string; status: string; total: string;
    jatuh_tempo: string | null; items: { nama: string; jumlah: number }[];
}

interface AntreanCard {
    key: string;
    variant: 'simple' | 'resep' | 'lab' | 'invoice';
    title: string;
    value: number;
    description: string;
    href: string;
    tone: Tone;
    icon: MonitoringIcon;
    items?: ResepAntreanItem[] | LabAntreanItem[] | InvoiceAntreanItem[];
}

interface DashboardProps {
    stats: Stats;
    obatAlerts: ObatAlerts | null;
    finansial: Finansial | null;
    bedInfo: BedInfo | null;
    antrean: AntreanCard[];
    monitoring: DashboardMonitoring;
}

const iconMap: Record<MonitoringIcon, typeof Users> = {
    users: Users, activity: Activity, bed: BedDouble, clipboard: ClipboardList,
    flask: FlaskConical, pill: Pill, 'credit-card': CreditCard,
    'file-text': FileText, alert: AlertTriangle,
};

const formatRupiah = (value: number) => 'Rp ' + value.toLocaleString('id-ID');

function AlertCardLink({ card }: { card: AlertCard }) {
    const Icon = iconMap[card.icon];
    return (
        <Link href={card.href} className="block transition-transform duration-200 hover:-translate-y-1">
            <StatCard title={card.title} value={card.value} icon={Icon} description={card.description} color={card.tone} />
        </Link>
    );
}

// ─── Section 1: Peringatan & Stok Obat ─────────────────────────────
function ObatAlertSection({ data }: { data: ObatAlerts }) {
    return (
        <section className="space-y-4">
            <div>
                <h2 className="text-xl font-semibold">Peringatan &amp; Stok Obat</h2>
                <p className="text-sm font-medium text-foreground/70">
                    Ringkasan stok gudang obat — hanya untuk dipantau, perubahan data dilakukan di Master Data Obat.
                </p>
            </div>

            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <div className="rounded-xl border bg-background p-4">
                    <p className="text-sm font-medium text-foreground/70">Total Obat Aktif</p>
                    <p className="mt-1 text-2xl font-bold">{data.total_obat_aktif}</p>
                </div>
                <div className="rounded-xl border bg-background p-4">
                    <p className="text-sm font-medium text-foreground/70">Stok Menipis</p>
                    <p className={`mt-1 text-2xl font-bold ${data.total_stok_menipis > 0 ? 'text-red-600' : ''}`}>{data.total_stok_menipis}</p>
                </div>
                <div className="rounded-xl border bg-background p-4">
                    <p className="text-sm font-medium text-foreground/70">Mendekati Kedaluwarsa</p>
                    <p className={`mt-1 text-2xl font-bold ${data.total_near_expiry > 0 ? 'text-yellow-600' : ''}`}>{data.total_near_expiry}</p>
                </div>
                <div className="rounded-xl border bg-background p-4">
                    <p className="text-sm font-medium text-foreground/70">Sudah Kedaluwarsa</p>
                    <p className={`mt-1 text-2xl font-bold ${data.total_sudah_kedaluwarsa > 0 ? 'text-red-700' : ''}`}>{data.total_sudah_kedaluwarsa}</p>
                </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
                <div className="rounded-xl border bg-background p-4">
                    <h3 className="mb-3 font-semibold">Stok Menipis / Habis</h3>
                    {data.stok_menipis.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Obat</TableHead><TableHead>Stok</TableHead>
                                    <TableHead>Min. Stok</TableHead><TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.stok_menipis.map((o) => (
                                    <TableRow key={o.id}>
                                        <TableCell><p className="font-medium">{o.nama_obat}</p><p className="text-xs text-muted-foreground">{o.kode_obat}</p></TableCell>
                                        <TableCell>{o.stok} {o.satuan}</TableCell>
                                        <TableCell>{o.minimal_stok} {o.satuan}</TableCell>
                                        <TableCell><Badge variant={o.stok_status === 'habis' ? 'destructive' : 'outline'}>{o.stok_status === 'habis' ? 'Habis' : 'Menipis'}</Badge></TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : <p className="text-sm font-medium text-foreground/70">Tidak ada obat dengan stok menipis.</p>}
                </div>

                <div className="rounded-xl border bg-background p-4">
                    <h3 className="mb-3 font-semibold">Mendekati Kedaluwarsa (30 hari)</h3>
                    {data.mendekati_kadaluarsa.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow><TableHead>Obat</TableHead><TableHead>Stok</TableHead><TableHead>Kedaluwarsa</TableHead><TableHead>Sisa Hari</TableHead></TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.mendekati_kadaluarsa.map((o) => (
                                    <TableRow key={o.id}>
                                        <TableCell><p className="font-medium">{o.nama_obat}</p><p className="text-xs text-muted-foreground">{o.kode_obat}</p></TableCell>
                                        <TableCell>{o.stok}</TableCell>
                                        <TableCell>{o.expired_date ?? '-'}</TableCell>
                                        <TableCell>{o.sisa_hari !== null ? <Badge variant={o.sisa_hari <= 7 ? 'destructive' : 'outline'}>{o.sisa_hari} hari</Badge> : '-'}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : <p className="text-sm font-medium text-foreground/70">Tidak ada obat yang mendekati kedaluwarsa.</p>}
                </div>

                <div className="rounded-xl border bg-background p-4">
                    <h3 className="mb-3 font-semibold">Sudah Kedaluwarsa</h3>
                    {data.sudah_kedaluwarsa.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow><TableHead>Obat</TableHead><TableHead>Stok</TableHead><TableHead>Kedaluwarsa</TableHead><TableHead>Terlambat</TableHead></TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.sudah_kedaluwarsa.map((o) => (
                                    <TableRow key={o.id}>
                                        <TableCell><p className="font-medium">{o.nama_obat}</p><p className="text-xs text-muted-foreground">{o.kode_obat}</p></TableCell>
                                        <TableCell>{o.stok}</TableCell>
                                        <TableCell>{o.expired_date ?? '-'}</TableCell>
                                        <TableCell><Badge variant="destructive">{o.terlambat_hari} hari lalu</Badge></TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : <p className="text-sm font-medium text-foreground/70">Tidak ada obat yang sudah kedaluwarsa.</p>}
                </div>
            </div>
        </section>
    );
}

// ─── Section 2 (BARU, DI ATAS): Antrean & Tugas Hari Ini ───────────
function AntreanSection({ data }: { data: AntreanCard[] }) {
    if (data.length === 0) {
        return (
            <section className="space-y-4">
                <div>
                    <h2 className="text-xl font-semibold">Antrean &amp; Tugas Hari Ini</h2>
                </div>
                <div className="rounded-xl border border-dashed p-6 text-sm font-medium text-foreground/70">
                    Tidak ada tugas operasional yang perlu ditindaklanjuti untuk peran ini.
                </div>
            </section>
        );
    }

    return (
        <section className="space-y-4">
            <div>
                <h2 className="text-xl font-semibold">Antrean &amp; Tugas Hari Ini</h2>
                <p className="text-sm font-medium text-foreground/70">
                    Siapa saja yang harus ditangani hari ini — klik card untuk buka rincian.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {data.map((card) => {
                    if (card.variant === 'simple') {
                        return <AlertCardLink key={card.key} card={card} />;
                    }

                    const Icon = iconMap[card.icon];

                    if (card.variant === 'resep') {
                        const items = (card.items ?? []) as ResepAntreanItem[];
                        return (
                            <ExpandableStatCard key={card.key} title={card.title} value={card.value} icon={Icon} description={card.description} color={card.tone} href={card.href}>
                                {items.length > 0 ? (
                                    <div className="space-y-2">
                                        {items.map((r) => (
                                            <div key={r.id} className="flex items-center justify-between rounded-lg border p-2 text-sm">
                                                <div>
                                                    <p className="font-medium">{r.pasien}</p>
                                                    <p className="text-xs text-muted-foreground">{r.dokter} • {r.status}</p>
                                                </div>
                                                <Link href={r.action_href} className="rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90">
                                                    Proses
                                                </Link>
                                            </div>
                                        ))}
                                    </div>
                                ) : <p className="text-sm font-medium text-foreground/70">Tidak ada resep menunggu.</p>}
                            </ExpandableStatCard>
                        );
                    }

                    if (card.variant === 'lab') {
                        const items = (card.items ?? []) as LabAntreanItem[];
                        return (
                            <ExpandableStatCard key={card.key} title={card.title} value={card.value} icon={Icon} description={card.description} color={card.tone} href={card.href}>
                                {items.length > 0 ? (
                                    <Table>
                                        <TableHeader>
                                            <TableRow><TableHead>Pasien</TableHead><TableHead>Jenis</TableHead><TableHead>Status</TableHead><TableHead>Antre Sejak</TableHead></TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {items.map((l) => (
                                                <TableRow key={l.id}>
                                                    <TableCell className="font-medium">{l.pasien}</TableCell>
                                                    <TableCell>{l.jenis}</TableCell>
                                                    <TableCell><Badge variant={l.status === 'Menunggu' ? 'destructive' : 'outline'}>{l.status}</Badge></TableCell>
                                                    <TableCell className="text-xs text-muted-foreground">{l.menunggu_sejak}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                ) : <p className="text-sm font-medium text-foreground/70">Tidak ada antrean lab.</p>}
                            </ExpandableStatCard>
                        );
                    }

                    // variant === 'invoice'
                    const items = (card.items ?? []) as InvoiceAntreanItem[];
                    return (
                        <ExpandableStatCard key={card.key} title={card.title} value={card.value} icon={Icon} description={card.description} color={card.tone} href={card.href}>
                            {items.length > 0 ? (
                                <div className="space-y-3">
                                    {items.map((inv) => (
                                        <div key={inv.id} className="rounded-lg border p-2 text-sm">
                                            <div className="flex items-center justify-between">
                                                <p className="font-medium">{inv.pasien}</p>
                                                <Badge variant={inv.status === 'Draft' ? 'outline' : 'destructive'}>{inv.status}</Badge>
                                            </div>
                                            <p className="text-xs text-muted-foreground">Total: {inv.total} • Jatuh tempo: {inv.jatuh_tempo ?? '-'}</p>
                                            {inv.items.length > 0 && (
                                                <ul className="mt-1 list-inside list-disc text-xs text-muted-foreground">
                                                    {inv.items.map((it, idx) => <li key={idx}>{it.nama} x{it.jumlah}</li>)}
                                                </ul>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : <p className="text-sm font-medium text-foreground/70">Tidak ada invoice belum lunas.</p>}
                        </ExpandableStatCard>
                    );
                })}
            </div>
        </section>
    );
}

// ─── Section 3: Finansial & Pendapatan (Super Admin saja) ──────────
function FinancialSection({ data }: { data: Finansial }) {
    const [showBreakdown, setShowBreakdown] = useState(false);
    const naik = data.tren_persen >= 0;
    const TrenIcon = naik ? TrendingUp : TrendingDown;

    return (
        <section className="space-y-4">
            <div>
                <h2 className="text-xl font-semibold">Finansial &amp; Pendapatan</h2>
                <p className="text-sm font-medium text-foreground/70">
                    Ringkasan pendapatan klinik hari ini — khusus Super Admin.
                </p>
            </div>

            <div className="rounded-xl border bg-background p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                        <p className="text-sm font-medium text-foreground/70">Pendapatan Hari Ini</p>
                        <p className="mt-1 text-3xl font-bold">{formatRupiah(data.pendapatan_hari_ini)}</p>
                        <div className="mt-2 flex items-center gap-3">
                            <span className={`inline-flex items-center gap-1 text-sm font-semibold ${naik ? 'text-green-600' : 'text-red-600'}`}>
                                <TrenIcon className="h-4 w-4" />
                                {Math.abs(data.tren_persen)}% vs kemarin
                            </span>
                            <span className="text-sm font-medium text-foreground/70">
                                Bulan ini: {formatRupiah(data.pendapatan_bulan_ini)}
                            </span>
                        </div>
                    </div>

                    <div className="w-full md:w-72">
                        <p className="mb-2 text-sm font-medium text-foreground/70">Tren 7 Hari Terakhir</p>
                        <MiniBarChart data={data.tren_7_hari} />
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => setShowBreakdown((v) => !v)}
                    className="mt-4 flex w-full items-center justify-between border-t pt-3 text-left text-sm font-medium"
                >
                    <span>Rincian Metode Pembayaran (Hari Ini)</span>
                    <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${showBreakdown ? 'rotate-180' : ''}`} />
                </button>

                {showBreakdown && (
                    <div className="mt-3">
                        {data.breakdown_metode_bayar.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow><TableHead>Metode</TableHead><TableHead>Jumlah Transaksi</TableHead><TableHead>Total</TableHead></TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data.breakdown_metode_bayar.map((b) => (
                                        <TableRow key={b.metode}>
                                            <TableCell>{b.label}</TableCell>
                                            <TableCell>{b.jumlah}</TableCell>
                                            <TableCell className="font-medium">{formatRupiah(b.total)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <p className="text-sm font-medium text-foreground/70">Belum ada transaksi lunas hari ini.</p>
                        )}
                    </div>
                )}
            </div>
        </section>
    );
}

export default function Dashboard({ stats, obatAlerts, finansial, bedInfo, antrean, monitoring }: DashboardProps) {
    const bedDescription = bedInfo
        ? `Sedang dirawat • ${bedInfo.tersedia}/${bedInfo.total_kapasitas} kamar tersedia`
        : 'Sedang dirawat';

    return (
        <>
            <Head title="Dashboard" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">

                <div className="flex items-center justify-end gap-2">
                    <Badge variant="secondary">{monitoring.role_label}</Badge>
                    <span className="text-xs text-muted-foreground">Diperbarui {monitoring.updated_at}</span>
                </div>

                {obatAlerts && <ObatAlertSection data={obatAlerts} />}

                <AntreanSection data={antrean} />

                {finansial && <FinancialSection data={finansial} />}

                <div className="flex flex-col gap-3 rounded-2xl border bg-linear-to-br from-background via-background to-muted/40 p-5 shadow-sm md:flex-row md:items-end md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Monitoring Dashboard</h1>
                        <p className="mt-2 max-w-2xl text-sm font-medium text-foreground/70">
                            Ringkasan aktivitas klinik dan peringatan operasional berdasarkan hak akses pengguna.
                        </p>
                    </div>
                    <div className="text-sm font-medium text-foreground/70">
                        Fokus utama: pasien, layanan, transaksi, dan stok yang butuh tindakan.
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    <StatCard title="Total Pasien" value={stats.total_pasien} icon={Users} description="Semua pasien terdaftar" color="blue" showIcon={false} />
                    <StatCard title="Pasien Baru" value={stats.pasien_baru} icon={Users} description="Bulan ini" color="green" showIcon={false} />
                    <StatCard title="Kunjungan Rawat Jalan" value={stats.rawat_jalan_bulan} icon={Activity} description="Total bulan ini (semua status)" color="blue" showIcon={false} />
                    <StatCard title="Rawat Inap Aktif" value={stats.rawat_inap_aktif} icon={BedDouble} description={bedDescription} color="yellow" />
                    {finansial && (
                        <StatCard title="Pendapatan" value={formatRupiah(stats.pendapatan_bulan)} icon={TrendingUp} description="Bulan ini (lunas)" color="green" />
                    )}
                    <StatCard title="Resep Obat" value={stats.resep_bulan} icon={Pill} description="Bulan ini" color="purple" showIcon={false} />
                    <StatCard title="Pemeriksaan Lab" value={stats.lab_bulan} icon={FlaskConical} description="Bulan ini" color="blue" showIcon={false} />
                </div>

                {monitoring.alerts.length > 0 && (
                    <section className="space-y-4">
                        <div>
                            <h2 className="text-xl font-semibold">Peringatan Cepat</h2>
                            <p className="text-sm font-medium text-foreground/70">Sinyal operasional lain yang perlu dipantau.</p>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                            {monitoring.alerts.map((card) => <AlertCardLink key={card.title} card={card} />)}
                        </div>
                    </section>
                )}
            </div>
        </>
    );
}

Dashboard.layout = { breadcrumbs };