import { type LucideIcon, ChevronDown } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { useState, type ReactNode } from 'react';

interface ExpandableStatCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    description?: string;
    color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
    href: string;
    children: ReactNode;
    defaultOpen?: boolean;
}

const colorMap = {
    blue:   'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400',
    green:  'bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400',
    yellow: 'bg-yellow-50 text-yellow-600 dark:bg-yellow-950 dark:text-yellow-400',
    red:    'bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400',
    purple: 'bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400',
};

export function ExpandableStatCard({
    title,
    value,
    icon: Icon,
    description,
    color = 'blue',
    href,
    children,
    defaultOpen = false,
}: ExpandableStatCardProps) {
    const [open, setOpen] = useState(defaultOpen);

    return (
        <div className="rounded-xl border bg-background">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="flex w-full items-center justify-between p-6 text-left"
            >
                <div>
                    <p className="text-sm font-medium text-muted-foreground">{title}</p>
                    <p className="mt-1 text-3xl font-bold">{value}</p>
                    {description && (
                        <p className="mt-1 text-sm font-medium text-foreground/70">{description}</p>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <div className={`rounded-full p-3 ${colorMap[color]}`}>
                        <Icon className="h-6 w-6" />
                    </div>
                    <ChevronDown
                        className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                    />
                </div>
            </button>

            {open && (
                <div className="border-t px-6 py-4">
                    {children}
                    <Link
                        href={href}
                        className="mt-3 inline-block text-sm font-medium text-primary hover:underline"
                    >
                        Lihat semua &rarr;
                    </Link>
                </div>
            )}
        </div>
    );
}