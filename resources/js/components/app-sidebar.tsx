import { Link } from '@inertiajs/react';
import {
    Activity,
    BarChart3,
    BedDouble,
    BookOpen,
    Building2,
    ClipboardList,
    CreditCard,
    FileClock,
    FileText,
    FlaskConical,
    FolderGit2,
    LayoutGrid,
    Pill,
    Receipt,
    Settings,
    UserCog,
    Users,
} from 'lucide-react';

import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { usePermissions } from '@/hooks/use-permissions';

import { dashboard } from '@/routes';
import patients from '@/routes/patients';
import patientHistories from '@/routes/patient-histories';
import rooms from '@/routes/master-data/rooms';
import users from '@/routes/master-data/users';
import polis from '@/routes/master-data/polis';
import medicines from '@/routes/medicines';
import labExaminations from '@/routes/lab-examinations';
import clinicRates from '@/routes/clinic-rates';

import rawatJalan from '@/routes/pelayanan/rawat-jalan';
import rawatInap from '@/routes/pelayanan/rawat-inap';
import rekamMedis from '@/routes/pelayanan/rekam-medis';
import laboratorium from '@/routes/pelayanan/laboratorium';
import resepObat from '@/routes/pelayanan/resep-obat';

import pembayaran from '@/routes/transaksi/pembayaran';
import invoice from '@/routes/transaksi/invoice';

import laporan from '@/routes/laporan';
import sistem from '@/routes/sistem';

import type { NavItem } from '@/types';

const dashboardItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
        permission: 'dashboard.view',
    },
];

const pasienItems: NavItem[] = [
    {
        title: 'Data Pasien',
        href: patients.index(),
        icon: Users,
        permission: 'patients.view',
    },
    {
        title: 'Riwayat Kunjungan',
        href: patientHistories.index(),
        icon: ClipboardList,
        permission: 'patient-histories.view',
    },
];

const pelayananItems: NavItem[] = [
    {
        title: 'Rawat Jalan',
        href: rawatJalan.index(),
        icon: Activity,
        permission: 'rawat-jalan.view',
    },
    {
        title: 'Rawat Inap',
        href: rawatInap.index(),
        icon: BedDouble,
        permission: 'rawat-inap.view',
    },
    {
        title: 'Rekam Medis',
        href: rekamMedis.index(),
        icon: ClipboardList,
        permission: 'rekam-medis.view',
    },
    {
        title: 'Laboratorium',
        href: laboratorium.index(),
        icon: FlaskConical,
        permission: 'laboratorium.view',
    },
    {
        title: 'Resep Obat',
        href: resepObat.index(),
        icon: Pill,
        permission: 'resep-obat.view',
    },
];

const transaksiItems: NavItem[] = [
    {
        title: 'Pembayaran',
        href: pembayaran.index(),
        icon: CreditCard,
        permission: 'pembayaran.view',
    },
    {
        title: 'Invoice',
        href: invoice.index(),
        icon: FileText,
        permission: 'invoice.view',
    },
];

const masterDataItems: NavItem[] = [
    {
        title: 'Data Poli',
        href: polis.index(),
        icon: Building2,
        permission: 'master-data.polis.view',
    },
    {
        title: 'Data Kamar',
        href: rooms.index(),
        icon: BedDouble,
        permission: 'master-data.rooms.view',
    },
    {
        title: 'System Users',
        href: users.index(),
        icon: UserCog,
        permission: 'master-data.users.view',
    },
    {
        title: 'Data Obat',
        href: medicines.index(),
        icon: Pill,
        permission: 'master-data.medicines.view',
    },
    {
        title: 'Pemeriksaan Lab',
        href: labExaminations.index(),
        icon: FlaskConical,
        permission: 'master-data.lab-examinations.view',
    },
    {
        title: 'Tarif Klinik',
        href: clinicRates.index(),
        icon: Receipt,
        permission: 'master-data.clinic-rates.view',
    },
];

const laporanItems: NavItem[] = [
    {
        title: 'Laporan Pasien',
        href: laporan.pasien(),
        icon: Users,
        permission: 'laporan.pasien.view',
    },
    {
        title: 'Laporan Rekam Medis',
        href: laporan.rekamMedis(),
        icon: ClipboardList,
        permission: 'laporan.rekam-medis.view',
    },
    {
        title: 'Laporan Rawat Inap',
        href: laporan.rawatInap(),
        icon: BedDouble,
        permission: 'laporan.rawat-inap.view',
    },
    {
        title: 'Laporan Obat',
        href: laporan.obat(),
        icon: Pill,
        permission: 'laporan.obat.view',
    },
    {
        title: 'Laporan Keuangan',
        href: laporan.keuangan(),
        icon: BarChart3,
        permission: 'laporan.keuangan.view',
    },
];

const sistemItems: NavItem[] = [
    {
        title: 'Activity Log',
        href: sistem.activityLog(),
        icon: FileClock,
        permission: 'system.activity-log.view',
    },
    {
        title: 'Pengaturan',
        href: sistem.pengaturan.edit(),
        icon: Settings,
        permission: 'system.pengaturan.manage',
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: FolderGit2,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    const { permissions } = usePermissions();

    const visibleItems = (items: NavItem[]) =>
        items.filter(
            (item) => !item.permission || permissions[item.permission],
        );

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                {visibleItems(dashboardItems).length > 0 && (
                    <NavMain
                        items={visibleItems(dashboardItems)}
                        label="Menu"
                    />
                )}

                {visibleItems(pasienItems).length > 0 && (
                    <NavMain
                        items={visibleItems(pasienItems)}
                        label="Pasien"
                        collapsible
                        defaultOpen={false}
                    />
                )}

                {visibleItems(pelayananItems).length > 0 && (
                    <NavMain
                        items={visibleItems(pelayananItems)}
                        label="Pelayanan"
                        collapsible
                        defaultOpen={false}
                    />
                )}

                {visibleItems(transaksiItems).length > 0 && (
                    <NavMain
                        items={visibleItems(transaksiItems)}
                        label="Transaksi"
                        collapsible
                        defaultOpen={false}
                    />
                )}

                {visibleItems(masterDataItems).length > 0 && (
                    <NavMain
                        items={visibleItems(masterDataItems)}
                        label="Master Data"
                        collapsible
                        defaultOpen={false}
                    />
                )}

                {visibleItems(laporanItems).length > 0 && (
                    <NavMain
                        items={visibleItems(laporanItems)}
                        label="Laporan"
                        collapsible
                        defaultOpen={false}
                    />
                )}

                {visibleItems(sistemItems).length > 0 && (
                    <NavMain
                        items={visibleItems(sistemItems)}
                        label="Sistem"
                        collapsible
                        defaultOpen={false}
                    />
                )}
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
