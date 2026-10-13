import { Link } from '@inertiajs/react';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import type { NavItem } from '@/types';

interface NavGroupProps {
    label?: string;
    items: NavItem[];
    collapsible?: boolean;
    defaultOpen?: boolean;
}

export function NavMain({
    items = [],
    label = 'Platform',
    collapsible = false,
    defaultOpen = false,
}: NavGroupProps) {
    const { isCurrentUrl } = useCurrentUrl();

    // Otomatis buka dropdown jika salah satu item di grup ini sedang aktif
    const hasActiveItem = items.some((item) => isCurrentUrl(item.href));
    const [open, setOpen] = useState(defaultOpen || hasActiveItem);

    // Mode flat — untuk Dashboard
    if (!collapsible) {
        return (
            <SidebarGroup className="px-2 py-0">
                <SidebarGroupLabel>{label}</SidebarGroupLabel>
                <SidebarMenu>
                    {items.map((item) => (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                                asChild
                                isActive={isCurrentUrl(item.href)}
                                tooltip={{ children: item.title }}
                            >
                                <Link href={item.href} prefetch>
                                    {item.icon && <item.icon />}
                                    <span>{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarGroup>
        );
    }

    // Mode collapsible dropdown — untuk Master Data
    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarMenu>
                <Collapsible open={open} onOpenChange={setOpen}>
                    <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                            <SidebarMenuButton
                                isActive={hasActiveItem}
                                tooltip={{ children: label }}
                            >
                                <span className="font-medium">{label}</span>
                                <ChevronDown
                                    className={`ml-auto h-4 w-4 transition-transform duration-200 ${
                                        open ? 'rotate-180' : ''
                                    }`}
                                />
                            </SidebarMenuButton>
                        </CollapsibleTrigger>

                        <CollapsibleContent>
                            <SidebarMenuSub>
                                {items.map((item) => (
                                    <SidebarMenuSubItem key={item.title}>
                                        <SidebarMenuSubButton
                                            asChild
                                            isActive={isCurrentUrl(item.href)}
                                        >
                                            <Link href={item.href} prefetch>
                                                {item.icon && <item.icon className="h-4 w-4" />}
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuSubButton>
                                    </SidebarMenuSubItem>
                                ))}
                            </SidebarMenuSub>
                        </CollapsibleContent>
                    </SidebarMenuItem>
                </Collapsible>
            </SidebarMenu>
        </SidebarGroup>
    );
}