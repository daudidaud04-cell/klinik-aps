import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { type BreadcrumbItem } from '@/types';
import { type Invoice } from '@/types/transaksi';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Printer } from 'lucide-react';

function Row({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="grid grid-cols-3 gap-4 border-b py-2 text-sm last:border-0">
            <dt className="text-muted-foreground font-medium">{label}</dt>
            <dd className="col-span-2">{value ?? '-'}</dd>
        </div>
    );
}

export default function InvoiceShow({ invoice }: { invoice: Invoice }) {
    return (
        <>
            <Head title={`Invoice - ${invoice.nomor_invoice}`} />
            <div className="flex flex-1 flex-col gap-4 p-4">
                <div className="bg-background rounded-xl border p-6">
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold">Invoice</h1>
                            <p className="text-muted-foreground font-mono text-sm">{invoice.nomor_invoice}</p>
                        </div>
                        <div className="flex gap-2">
                            <Button asChild variant="outline">
                                <Link href="/transaksi/invoice"><ArrowLeft className="mr-2 h-4 w-4" />Kembali</Link>
                            </Button>
                            <Button variant="outline" onClick={() => window.print()}>
                                <Printer className="mr-2 h-4 w-4" />Print
                            </Button>
                        </div>
                    </div>

                    <div className="grid max-w-3xl gap-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="rounded-lg border p-4">
                                <h2 className="mb-3 font-semibold">Data Pasien</h2>
                                <dl>
                                    <Row label="No. RM" value={invoice.pasien?.medical_record_number} />
                                    <Row label="Nama" value={invoice.pasien?.full_name} />
                                    <Row label="Telepon" value={invoice.pasien?.phone} />
                                    <Row label="Alamat" value={invoice.pasien?.address} />
                                </dl>
                            </div>
                            <div className="rounded-lg border p-4">
                                <h2 className="mb-3 font-semibold">Info Invoice</h2>
                                <dl>
                                    <Row label="No. Invoice" value={invoice.nomor_invoice} />
                                    <Row label="Tanggal" value={new Date(invoice.tanggal_invoice).toLocaleDateString('id-ID')} />
                                    <Row label="Status" value={
                                        <Badge variant={invoice.status === 'dibayar' ? 'default' : 'outline'}>
                                            {invoice.status_label}
                                        </Badge>
                                    } />
                                    <Row label="No. Pembayaran" value={invoice.pembayaran?.nomor_pembayaran} />
                                    <Row label="Metode Bayar" value={invoice.pembayaran?.metode_bayar_label} />
                                </dl>
                            </div>
                        </div>

                        <div className="rounded-lg border p-4">
                            <h2 className="mb-3 font-semibold">Rincian Biaya</h2>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span>Rp {Number(invoice.subtotal).toLocaleString('id-ID')}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Diskon</span>
                                    <span className="text-green-600">- Rp {Number(invoice.diskon).toLocaleString('id-ID')}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Pajak</span>
                                    <span>Rp {Number(invoice.pajak).toLocaleString('id-ID')}</span>
                                </div>
                                <div className="flex justify-between border-t pt-2 font-semibold">
                                    <span>Total</span>
                                    <span className="text-lg">{invoice.total_formatted}</span>
                                </div>
                            </div>
                        </div>

                        {invoice.catatan && (
                            <div className="rounded-lg border p-4">
                                <h2 className="mb-2 font-semibold">Catatan</h2>
                                <p className="text-sm">{invoice.catatan}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

InvoiceShow.layout = (props: { invoice: Invoice }) => ({
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Invoice', href: '/transaksi/invoice' },
        { title: props.invoice.nomor_invoice, href: `/transaksi/invoice/${props.invoice.id}` },
    ] as BreadcrumbItem[],
});