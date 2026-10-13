import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Pencil } from 'lucide-react';

interface Medicine {
    id: number;
    kode_obat: string;
    nama_obat: string;
    kategori: string;
    satuan: string;
    stok: number;
    minimal_stok: number;
    harga_beli_formatted?: string;
    harga_jual_formatted: string;
    stok_status: string;
    is_expired: boolean;
    is_near_expiry: boolean;
    margin: number;
    expired_date: string | null;
    manufacturer: string | null;
    deskripsi: string | null;
    status: string;
    status_label: string;
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="grid grid-cols-3 gap-4 border-b py-3 text-sm last:border-0">
            <dt className="text-muted-foreground font-medium">{label}</dt>
            <dd className="col-span-2">{value ?? '-'}</dd>
        </div>
    );
}

// 🔧 FIX: format tanggal jadi human-readable, bukan string ISO mentah dari backend.
function formatTanggal(value: string | null): string | null {
    if (! value) return null;
    const date = new Date(value);
    if (isNaN(date.getTime())) return value; // fallback kalau format tak terduga
    return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
}

export default function MedicinesShow({ medicine }: { medicine: Medicine }) {
    return (
        <>
            <Head title={`Obat - ${medicine.nama_obat}`} />
            <div className="flex flex-1 flex-col gap-4 p-4">
                <div className="bg-background rounded-xl border p-6">
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold">{medicine.nama_obat}</h1>
                            <p className="text-muted-foreground">Kode: {medicine.kode_obat}</p>
                        </div>
                        <div className="flex gap-2">
                            <Button asChild variant="outline">
                                <Link href="/medicines"><ArrowLeft className="mr-2 h-4 w-4" />Kembali</Link>
                            </Button>
                            <Button asChild>
                                <Link href={`/medicines/${medicine.id}/edit`}><Pencil className="mr-2 h-4 w-4" />Edit</Link>
                            </Button>
                        </div>
                    </div>

                    {/* 🔧 FIX: peringatan menonjol kalau obat sudah/akan kedaluwarsa —
                        sebelumnya field is_expired & is_near_expiry sama sekali
                        tidak dimanfaatkan, padahal krusial untuk konteks klinik. */}
                    {medicine.is_expired && (
                        <div className="mb-4 rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                            Obat ini sudah <strong>kedaluwarsa</strong>. Sebaiknya tidak lagi diresepkan ke pasien.
                        </div>
                    )}
                    {! medicine.is_expired && medicine.is_near_expiry && (
                        <div className="mb-4 rounded-md border border-yellow-400/50 bg-yellow-50 px-4 py-3 text-sm text-yellow-700">
                            Obat ini akan <strong>segera kedaluwarsa</strong> dalam waktu dekat.
                        </div>
                    )}

                    <dl className="max-w-2xl">
                        <Row label="Kode Obat" value={medicine.kode_obat} />
                        <Row label="Nama Obat" value={medicine.nama_obat} />
                        <Row label="Kategori" value={medicine.kategori} />
                        <Row label="Satuan" value={medicine.satuan} />
                        <Row label="Stok" value={
                            <span className={medicine.stok_status === 'habis' ? 'text-destructive font-semibold' : medicine.stok_status === 'menipis' ? 'text-orange-600 font-semibold' : ''}>
                                {medicine.stok} {medicine.satuan} {medicine.stok_status === 'menipis' && '(Menipis)'} {medicine.stok_status === 'habis' && '(Habis)'}
                            </span>
                        } />
                        <Row label="Minimal Stok" value={`${medicine.minimal_stok} ${medicine.satuan}`} />
                        <Row label="Harga Jual" value={medicine.harga_jual_formatted} />
                        {/* 🔧 FIX: harga_beli_formatted sebelumnya di-declare tapi
                            tidak pernah dirender. Ditampilkan sekarang bersama margin,
                            berguna untuk kalkulasi keuntungan admin/apoteker. */}
                        {medicine.harga_beli_formatted && (
                            <Row label="Harga Beli" value={medicine.harga_beli_formatted} />
                        )}
                        {typeof medicine.margin === 'number' && (
                            <Row label="Margin" value={`${medicine.margin.toFixed(1)}%`} />
                        )}
                        <Row
                            label="Tanggal Expired"
                            value={
                                medicine.expired_date ? (
                                    <span className={medicine.is_expired ? 'text-destructive font-semibold' : medicine.is_near_expiry ? 'text-yellow-700 font-semibold' : ''}>
                                        {formatTanggal(medicine.expired_date)}
                                    </span>
                                ) : null
                            }
                        />
                        <Row label="Produsen" value={medicine.manufacturer} />
                        <Row label="Deskripsi" value={medicine.deskripsi} />
                        <Row label="Status" value={
                            <Badge variant={medicine.status === 'aktif' ? 'default' : 'secondary'}>
                                {medicine.status_label}
                            </Badge>
                        } />
                    </dl>
                </div>
            </div>
        </>
    );
}

MedicinesShow.layout = (props: { medicine: Medicine }) => ({
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Data Obat', href: '/medicines' },
        { title: props.medicine.nama_obat, href: `/medicines/${props.medicine.id}` },
    ],
});