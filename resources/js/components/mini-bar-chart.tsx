interface MiniBarChartProps {
    data: { label_singkat: string; total: number }[];
}

export function MiniBarChart({ data }: MiniBarChartProps) {
    const max = Math.max(...data.map((d) => d.total), 1);

    return (
        <div className="flex h-24 items-end gap-2">
            {data.map((d) => {
                const heightPct = Math.max((d.total / max) * 100, 2);
                return (
                    <div key={d.label_singkat} className="flex flex-1 flex-col items-center gap-1">
                        <div className="flex h-16 w-full items-end">
                            <div
                                className="w-full rounded-t bg-primary/70"
                                style={{ height: `${heightPct}%` }}
                                title={`Rp ${d.total.toLocaleString('id-ID')}`}
                            />
                        </div>
                        <span className="text-[10px] text-muted-foreground">{d.label_singkat}</span>
                    </div>
                );
            })}
        </div>
    );
}