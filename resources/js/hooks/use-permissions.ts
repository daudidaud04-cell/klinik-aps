import type { Auth } from '@/types/auth';
import { usePage } from '@inertiajs/react';

export function usePermissions() {
    const { auth } = usePage<{ auth: Auth }>().props;
    const permissions = auth.permissions ?? {};

    const can = (permission: string) => Boolean(permissions[permission]);
    const canAny = (permissionList: string[]) =>
        permissionList.some((permission) => can(permission));

    return {
        auth,
        permissions,
        can,
        canAny,
    };
}
