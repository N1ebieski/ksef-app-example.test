import { InertiaLinkProps } from '@inertiajs/vue3';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function urlIsActive(
    urlToCheck: NonNullable<InertiaLinkProps['href']>,
    currentUrl: string,
) {
    return toUrl(urlToCheck) === currentUrl;
}

export function toUrl(href: NonNullable<InertiaLinkProps['href']>) {
    return typeof href === 'string' ? href : href?.url;
}

export function base64Encode(data: Uint8Array | string): string {
    let bytes: Uint8Array;

    if (typeof data === 'string') {
        bytes = new TextEncoder().encode(data);
    } else {
        bytes = data;
    }

    let binary = '';
    const chunkSize = 0x8000;

    for (let i = 0; i < bytes.length; i += chunkSize) {
        const chunk = bytes.subarray(i, i + chunkSize);

        binary += String.fromCharCode(...chunk);
    }

    return btoa(binary);
}

export function base64Decode(
    data: string,
    asString = false,
): Uint8Array | string {
    const binary = atob(data);
    const bytes = new Uint8Array(binary.length);

    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }

    if (asString) {
        return new TextDecoder().decode(bytes);
    }

    return bytes;
}
