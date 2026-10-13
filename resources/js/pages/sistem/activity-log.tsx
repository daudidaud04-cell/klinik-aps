import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Activity Log', href: '/sistem/activity-log' },
];

interface ActivityLog {
    id: number;
    log_name: string;
    description: string;
    causer: { id: number; name: string } | null;
    created_at: string;
}

interface Props {
    logs: {
        data: ActivityLog[];
        links: { url: string | null; label: string; active: boolean }[];
    };
}

export default function ActivityLog({ logs }: Props) {
    return (
        <>
            <Head title="Activity Log" />
            <div className="flex flex-1 flex-col gap-4 p-4">
                <div className="bg-background rounded-xl border p-6">
                    <h1 className="mb-2 text-2xl font-bold">Activity Log</h1>
                    <p className="text-muted-foreground mb-6 text-sm">Riwayat aktivitas pengguna sistem.</p>

                    <div className="space-y-2">
                        {logs.data.length === 0 ? (
                            <p className="text-muted-foreground text-sm">Belum ada aktivitas tercatat.</p>
                        ) : (
                            logs.data.map((log) => (
                                <div key={log.id} className="flex items-start justify-between rounded-lg border p-3 text-sm">
                                    <div>
                                        <p className="font-medium">{log.description}</p>
                                        <p className="text-muted-foreground text-xs">
                                            oleh {log.causer?.name ?? 'Sistem'} · {log.log_name}
                                        </p>
                                    </div>
                                    <p className="text-muted-foreground shrink-0 text-xs">{log.created_at}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

ActivityLog.layout = { breadcrumbs };