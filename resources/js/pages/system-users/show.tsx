import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'System Users', href: '/master-data/users' },
    { title: 'Detail User', href: '#' },
];

interface SystemUser {
    id: number;
    name: string;
    email: string;
    role: string;
    phone: string | null;
    gender: string | null;
    address: string | null;
    specialization: string | null;
    employee_status: string;
}

interface Props {
    user: SystemUser;
}

function Info({ label, value }: { label: string; value: string | null | undefined }) {
    return (
        <div>
            <p className="text-muted-foreground text-sm">{label}</p>
            <p className="font-medium">{value || '-'}</p>
        </div>
    );
}

export default function ShowSystemUser({ user }: Props) {
    const roleLabel = (role: string) => {
        const labels: Record<string, string> = {
            super_admin: 'Super Admin',
            admin_kasir: 'Admin / Kasir',
            dokter: 'Dokter',
            apoteker: 'Apoteker',
            laboran: 'Laboran',
        };
        return labels[role] ?? role;
    };

    return (
        <>
            <Head title={`Detail User - ${user.name}`} />

            <div className="flex flex-1 flex-col gap-4 p-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Detail User</CardTitle>
                        <div className="flex gap-2">
                            <Button variant="outline" asChild>
                                <Link href="/master-data/users">Kembali</Link>
                            </Button>
                            <Button asChild>
                                <Link href={`/master-data/users/${user.id}/edit`}>Edit</Link>
                            </Button>
                        </div>
                    </CardHeader>

                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2">
                            <Info label="Nama Lengkap" value={user.name} />
                            <Info label="Email" value={user.email} />
                            <Info label="Role" value={roleLabel(user.role)} />
                            <Info label="Telepon" value={user.phone} />
                            <Info label="Jenis Kelamin" value={
                                user.gender === 'laki_laki' ? 'Laki-laki' :
                                user.gender === 'perempuan' ? 'Perempuan' : '-'
                            } />
                            <Info label="Spesialisasi" value={user.specialization} />
                            <div>
                                <p className="text-muted-foreground text-sm">Status Karyawan</p>
                                <Badge variant={
                                    user.employee_status === 'aktif' ? 'default' :
                                    user.employee_status === 'cuti' ? 'secondary' : 'destructive'
                                }>
                                    {user.employee_status === 'aktif' ? 'Aktif' :
                                     user.employee_status === 'cuti' ? 'Cuti' : 'Nonaktif'}
                                </Badge>
                            </div>
                        </div>

                        {user.address && (
                            <div className="mt-6">
                                <h3 className="mb-2 font-semibold">Alamat</h3>
                                <div className="rounded-lg border p-3">{user.address}</div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

ShowSystemUser.layout = {
    breadcrumbs,
};