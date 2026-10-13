import * as React from 'react';
import { Check, ChevronsUpDown, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface Option {
    value: string;
    label: string;
}

interface ComboboxCreatableProps {
    options: Option[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    searchPlaceholder?: string;
    emptyText?: string;
    disabled?: boolean;
    error?: boolean;
}

/**
 * Combobox yang bisa PILIH dari daftar pilihan yang sudah ada, ATAU
 * KETIK nilai baru yang belum ada di daftar (creatable).
 *
 * Dipakai misalnya untuk field "Spesialisasi" dokter: sekarang cuma
 * ada "Umum" dan "Gigi", tapi kalau nanti klinik buka poli baru
 * (misal "Anak"), admin bisa langsung ketik tanpa perlu ubah kode.
 */
export function ComboboxCreatable({
    options,
    value,
    onChange,
    placeholder = 'Pilih atau ketik...',
    searchPlaceholder = 'Cari atau ketik baru...',
    emptyText = 'Tidak ditemukan.',
    disabled = false,
    error = false,
}: ComboboxCreatableProps) {
    const [open, setOpen] = React.useState(false);
    const [search, setSearch] = React.useState('');

    // Cari apakah value sekarang cocok dengan salah satu option (untuk label)
    const selectedOption = options.find(
        (o) => o.value.toLowerCase() === value.toLowerCase(),
    );

    // Tampilkan value asli kalau tidak cocok dengan option manapun
    // (berarti ini nilai custom yang diketik manual)
    const displayLabel = selectedOption ? selectedOption.label : value;

    // Cek apakah teks yang sedang diketik SUDAH persis sama dengan salah
    // satu option yang ada (case-insensitive) — kalau sudah ada, tidak
    // perlu tampilkan opsi "+ Tambah baru"
    const searchTrimmed = search.trim();
    const exactMatch = options.some(
        (o) => o.label.toLowerCase() === searchTrimmed.toLowerCase(),
    );

    const handleSelect = (val: string) => {
        onChange(val);
        setSearch('');
        setOpen(false);
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    disabled={disabled}
                    className={cn(
                        'w-full justify-between font-normal',
                        !value && 'text-muted-foreground',
                        error && 'border-destructive',
                    )}
                >
                    <span className="truncate">{value ? displayLabel : placeholder}</span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                <Command shouldFilter={true}>
                    <CommandInput
                        placeholder={searchPlaceholder}
                        value={search}
                        onValueChange={setSearch}
                    />
                    <CommandList>
                        {!exactMatch && searchTrimmed === '' && options.length === 0 && (
                            <CommandEmpty>{emptyText}</CommandEmpty>
                        )}
                        <CommandGroup>
                            {options.map((option) => (
                                <CommandItem
                                    key={option.value}
                                    value={option.label}
                                    onSelect={() => handleSelect(option.value)}
                                >
                                    <Check
                                        className={cn(
                                            'mr-2 h-4 w-4',
                                            value.toLowerCase() === option.value.toLowerCase()
                                                ? 'opacity-100'
                                                : 'opacity-0',
                                        )}
                                    />
                                    {option.label}
                                </CommandItem>
                            ))}

                            {/* 🔧 Opsi "+ Tambah baru" — cuma muncul kalau user sedang
                                mengetik sesuatu yang belum ada di daftar pilihan */}
                            {searchTrimmed !== '' && !exactMatch && (
                                <CommandItem
                                    value={`__create__${searchTrimmed}`}
                                    onSelect={() => handleSelect(searchTrimmed)}
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Tambah "{searchTrimmed}"
                                </CommandItem>
                            )}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}