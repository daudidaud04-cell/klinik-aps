<?php

namespace App\Support;

use App\Enums\Role;
use App\Models\SystemUser;

class Rbac
{
    /**
     * @return array<int, string>
     */
    public static function permissionsForRole(Role|string|null $role): array
    {
        if ($role instanceof Role) {
            $role = $role->value;
        }

        return config('rbac.roles.' . $role, []);
    }

    /**
     * @return array<int, string>
     */
    public static function allPermissions(): array
    {
        return config('rbac.all', []);
    }

    /**
     * @return array<string, bool>
     */
    public static function permissionsForUser(?SystemUser $user): array
    {
        $permissions = array_fill_keys(self::allPermissions(), false);

        if (! $user) {
            return $permissions;
        }

        if ($user->isSuperAdmin()) {
            return array_fill_keys(self::allPermissions(), true);
        }

        foreach (self::permissionsForRole($user->role) as $permission) {
            if (array_key_exists($permission, $permissions)) {
                $permissions[$permission] = true;
            }
        }

        return $permissions;
    }

    public static function allows(?SystemUser $user, string $permission): bool
    {
        if (! $user) {
            return false;
        }

        if ($user->isSuperAdmin()) {
            return true;
        }

        return in_array($permission, self::permissionsForRole($user->role), true);
    }
}
