import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { type BreadcrumbItem } from '@/types';
import { type Invoice } from '@/types/transaksi';
import { Head, Link, router } from '@inertiajs/react';
import { Eye } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Invoice', href: '/transaksi/invoice' },
];

const statusVariant = (status: string) => {
    if (status === 'dibayar') return 'default' as const;
    if (status === 'batal') return 'destructive' as const;
    if (status === 'terbit') return 'secondary' as const;
    return 'outline' as const;
};

interface Props {
    invoices: {
        data: Invoice[];
        links: { url: string | null; label: string; active: boolean }[];
    };
    filters: { status?: string };
}

export default function InvoiceIndex({ invoices, filters }: Props) {
    const [status, setStatus] = useState(filters.status ?? '');

    return (
        <>
            <Head title="Invoice" />
            <div className="flex flex-1 flex-col gap-4 p-4">
                <div className="bg-background rounded-xl border p-6">
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold">Invoice</h1>
                            <p className="text-muted-foreground">Daftar invoice pembayaran pasien</p>
                        </div>
                    </div>

                    <div className="mb-4 flex gap-2">
                        <Select value={status} onValueChange={(v) => {
                            setStatus(v);
                            router.get('/transaksi/invoice', { status: v }, { preserveState: true });
                        }}>
                            <SelectTrigger className="w-44"><SelectValue placeholder="Semua Status" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="draft">Draft</SelectItem>
                                <SelectItem value="terbit">Terbit</SelectItem>
                                <SelectItem value="dibayar">Dibayar</SelectItem>
                                <SelectItem value="batal">Batal</SelectItem>
                            </SelectContent>
                        </Select>
                        {status && (
                            <Button variant="ghost" onClick={() => {
                                setStatus('');
                                router.get('/transaksi/invoice', {}, { preserveState: true });
                            }}>Reset</Button>
                        )}
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>No. Invoice</TableHead>
                                <TableHead>Pasien</TableHead>
                                <TableHead>Total</TableHead>
                                <TableHead>Tanggal</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {invoices.data.length > 0 ? (
                                invoices.data.map((inv) => (
                                    <TableRow key={inv.id}>
                                        <TableCell className="font-mono text-xs">{inv.nomor_invoice}</TableCell>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium">{inv.pasien?.full_name}</p>
                                                <p className="text-muted-foreground text-xs">{inv.pasien?.medical_record_number}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-semibold">{inv.total_formatted}</TableCell>
                                        <TableCell>{new Date(inv.tanggal_invoice).toLocaleDateString('id-ID')}</TableCell>
                                        <TableCell>
                                            <Badge variant={statusVariant(inv.status)}>{inv.status_label}</Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="outline" size="sm" asChild>
                                                <Link href={`/transaksi/invoice/${inv.id}`}><Eye className="h-4 w-4" /></Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center">Belum ada data invoice.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </>
    );
}

InvoiceIndex.layout = { breadcrumbs };