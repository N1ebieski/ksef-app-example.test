<script setup lang="ts">
import HeadingSmall from '@/components/HeadingSmall.vue';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { isPrivateKey, PRIVATE_KEY_NAMES } from '@/composables/usePrivateKey';
import { TYPES } from '@/container';
import { IIndexedDbConnection } from '@/indexeddb/indexedDbConnection';
import DeleteCertificateController from '@/wayfinder/actions/App/Http/Controllers/Settings/Ksef/DeleteCertificateController';
import { usePage } from '@inertiajs/vue3';
import axios from 'axios';
import { Container } from 'inversify';
import { inject } from 'vue';

const container = inject<Container>('container') as Container;
const indexedDb = container.get<IIndexedDbConnection>(
    TYPES.KsefIIndexedDbConnection,
);

const page = usePage();
const user = page.props.auth.user;

async function submit() {
    await axios.request(DeleteCertificateController());

    const indexedDbStore = await indexedDb.open(['keys']);

    const key = PRIVATE_KEY_NAMES.metadata.replace(
        '{USER_UUID}',
        user.uuid.toString(),
    );

    const privateKeyMetadata = await indexedDbStore.get('keys', key);

    await indexedDbStore.delete('keys', privateKeyMetadata.privateKey);
    await indexedDbStore.delete('keys', key);

    isPrivateKey.value = false;
}
</script>

<template>
    <div class="space-y-6">
        <HeadingSmall
            title="Delete certificate"
            description="Delete your certificate"
        />
        <div
            class="space-y-4 rounded-lg border border-red-100 bg-red-50 p-4 dark:border-red-200/10 dark:bg-red-700/10"
        >
            <div class="relative space-y-0.5 text-red-600 dark:text-red-100">
                <p class="font-medium">Warning</p>
                <p class="text-sm">
                    Please proceed with caution, this cannot be undone.
                </p>
            </div>
            <Dialog>
                <DialogTrigger as-child>
                    <Button
                        variant="destructive"
                        data-test="delete-certificate-button"
                        >Delete certificate</Button
                    >
                </DialogTrigger>
                <DialogContent>
                    <form @submit.prevent="submit" class="space-y-6">
                        <DialogHeader class="space-y-3">
                            <DialogTitle
                                >Are you sure you want to delete your
                                certificate?</DialogTitle
                            >
                        </DialogHeader>

                        <DialogFooter class="gap-2">
                            <DialogClose as-child>
                                <Button variant="secondary"> Cancel </Button>
                            </DialogClose>

                            <Button
                                type="submit"
                                variant="destructive"
                                data-test="confirm-delete-user-button"
                            >
                                Delete certificate
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    </div>
</template>
