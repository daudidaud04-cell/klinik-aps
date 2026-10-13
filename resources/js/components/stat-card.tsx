import { type LucideIcon } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    description?: string;
    color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
    // 🔧 FIX: opsi sembunyikan ikon — dipakai untuk mengurangi noise visual
    // di card yang sifatnya informasi rutin (bukan urgent/perlu perhatian).
    showIcon?: boolean;
}

const colorMap = {
    blue:   'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400',
    green:  'bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400',
    yellow: 'bg-yellow-50 text-yellow-600 dark:bg-yellow-950 dark:text-yellow-400',
    red:    'bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400',
    purple: 'bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400',
};

export function StatCard({ title, value, icon: Icon, description, color = 'blue', showIcon = true }: StatCardProps) {
    return (
        <div className="bg-background rounded-xl border p-6">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-muted-foreground text-sm font-medium">{title}</p>
                    <p className="mt-1 text-3xl font-bold">{value}</p>
                    {/* 🔧 FIX: dipertegas — dari text-xs text-muted-foreground (abu tipis)
                        jadi text-sm dengan warna lebih gelap, supaya readable untuk
                        pengguna senior/dokter, sesuai permintaan revisi. */}
                    {description && (
                        <p className="mt-1 text-sm font-medium text-foreground/70">{description}</p>
                    )}
                </div>
                {showIcon && (
                    <div className={`rounded-full p-3 ${colorMap[color]}`}>
                        <Icon className="h-6 w-6" />
                    </div>
                )}
            </div>
        </div>
    );
}