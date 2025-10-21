import { PrivateKeyType } from '@/composables/usePrivateKey';
import { InertiaLinkProps } from '@inertiajs/vue3';
import type { LucideIcon } from 'lucide-vue-next';

export interface Auth {
    user: User;
}

export interface Ksef {
    isAuthenticated: boolean;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavItem {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
    icon?: LucideIcon;
    isActive?: boolean;
}

export type AppPageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    ksef: Ksef;
    sidebarOpen: boolean;
};

export interface User {
    id: number;
    uuid: string;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
}

export type PrivateKeyTypeType = 'RSA' | 'ECDSA';

export interface Certificate {
    raw: string;
    privateKeyType: PrivateKeyType;
    privateKey: CryptoKey;
}

export type BreadcrumbItemType = BreadcrumbItem;
