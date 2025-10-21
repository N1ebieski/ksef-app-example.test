<script setup lang="ts">
import { SignDocumentHandler } from '@/actions/signDocumentHandler';
import Button from '@/components/ui/button/Button.vue';
import { PRIVATE_KEY_NAMES, PrivateKeyType } from '@/composables/usePrivateKey';
import { TYPES } from '@/container';
import { IIndexedDbConnection } from '@/indexeddb/indexedDbConnection';
import AuthenticateController from '@/wayfinder/actions/App/Http/Controllers/Ksef/Auth/AuthenticateController';
import XadesSignatureController from '@/wayfinder/actions/App/Http/Controllers/Ksef/Auth/XadesSignatureController';
import { usePage } from '@inertiajs/vue3';
import axios from 'axios';
import { Container } from 'inversify';
import { RotateCcwIcon } from 'lucide-vue-next';
import { inject, onMounted, ref } from 'vue';
import { useSidebar } from './ui/sidebar';

const container = inject<Container>('container') as Container;
const signDocumentHandler = container.get(SignDocumentHandler);
const indexedDb = container.get<IIndexedDbConnection>(
    TYPES.KsefIIndexedDbConnection,
);

const page = usePage();
const user = page.props.auth.user;
const { state } = useSidebar();

const isAuthenticated = ref({
    value: page.props.ksef.isAuthenticated,

    getLabel(): string {
        if (processing.value) {
            return 'Processing...';
        }

        return this.value ? 'Authenticated' : 'Not authenticated';
    },

    getLabelClass(): string {
        if (processing.value) {
            return 'text-current';
        }

        return this.value ? 'text-green-500' : 'text-red-500';
    },

    getIconClass(): string {
        return this.value ? 'bg-green-500' : 'bg-red-500';
    },
});
const processing = ref(false);

async function authenticate() {
    if (isAuthenticated.value.value) {
        return;
    }

    const indexedDbStore = await indexedDb.open(['keys']);

    const key = PRIVATE_KEY_NAMES.metadata.replace(
        '{USER_UUID}',
        user.uuid.toString(),
    );

    const privateKeyMetadata = await indexedDbStore.get('keys', key);

    if (!privateKeyMetadata) {
        return;
    }

    const privateKey = (await indexedDbStore.get(
        'keys',
        privateKeyMetadata.privateKey,
    )) as CryptoKey;

    if (!privateKey) {
        return;
    }

    processing.value = true;

    try {
        const xadesSignatureResponse = await axios.request(
            XadesSignatureController(),
        );

        const privateKeyType = new PrivateKeyType(
            privateKeyMetadata.privateKeyType,
        );

        const signedDocument = await signDocumentHandler.handle({
            certificate: {
                raw: xadesSignatureResponse.data.certificate,
                privateKeyType: privateKeyType,
                privateKey: privateKey,
            },
            document: xadesSignatureResponse.data.document,
        });

        const authenticateResponse = await axios.request({
            ...AuthenticateController(),
            data: {
                document: signedDocument,
            },
        });

        if (authenticateResponse.data.status.code === 200) {
            isAuthenticated.value.value = true;
        }
    } finally {
        processing.value = false;
    }
}

onMounted(() => {
    authenticate();
});
</script>

<template>
    <div
        class="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 text-sm shadow-sm dark:border-neutral-700 dark:bg-neutral-800"
    >
        <template v-if="state === 'expanded'">
            <div class="font-medium text-gray-600 dark:text-white">
                KsEF Status:
            </div>
            <div
                v-text="isAuthenticated.getLabel()"
                :class="[
                    'rounded-md px-2 py-1 text-xs font-semibold',
                    isAuthenticated.getLabelClass(),
                ]"
            ></div>
            <div v-if="!isAuthenticated.value && !processing">
                <Button
                    variant="outline"
                    size="sm"
                    @click="authenticate"
                    class="cursor-pointer rounded-md border-gray-300 text-gray-600 hover:bg-gray-100 dark:border-neutral-600 dark:text-gray-200 dark:hover:bg-neutral-700"
                >
                    <RotateCcwIcon class="size-4" />
                </Button>
            </div>
        </template>
        <template v-else>
            <div
                :class="[
                    'h-3 w-3 rounded-full',
                    isAuthenticated.getIconClass(),
                ]"
            ></div>
        </template>
    </div>
</template>
