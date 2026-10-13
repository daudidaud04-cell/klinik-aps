export type Role =
    | 'super_admin'
    | 'admin_kasir'
    | 'dokter'
    | 'apoteker'
    | 'laboran';

export type PermissionMap = Record<string, boolean>;

export type User = {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    role: Role;
    permissions: PermissionMap;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
};

export type Auth = {
    user: User | null;
    permissions: PermissionMap;
};

/* @chisel-passkeys */
export type Passkey = {
    id: number;
    name: string;
    authenticator: string | null;
    created_at_diff: string;
    last_used_at_diff: string | null;
};
/* @end-chisel-passkeys */

export type TwoFactorSetupData = {
    svg: string;
    url: string;
};

export type TwoFactorSecretKey = {
    secretKey: string;
};
