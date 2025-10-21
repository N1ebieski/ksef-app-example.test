<script setup lang="ts">
import { ConvertFileToStringHandler } from '@/actions/convertFileToStringHandler';
import { ConvertPemToDerHandler } from '@/actions/convertPemToDerHandler';
import AlertError from '@/components/AlertError.vue';
import DeleteCertificate from '@/components/DeleteCertificate.vue';
import HeadingSmall from '@/components/HeadingSmall.vue';
import InputError from '@/components/InputError.vue';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Select from '@/components/ui/select/Select.vue';
import SelectContent from '@/components/ui/select/SelectContent.vue';
import SelectGroup from '@/components/ui/select/SelectGroup.vue';
import SelectItem from '@/components/ui/select/SelectItem.vue';
import SelectTrigger from '@/components/ui/select/SelectTrigger.vue';
import SelectValue from '@/components/ui/select/SelectValue.vue';
import {
    isPrivateKey,
    PRIVATE_KEY_NAMES,
    PrivateKeyType,
} from '@/composables/usePrivateKey';
import { TYPES } from '@/container';
import { IIndexedDbConnection } from '@/indexeddb/indexedDbConnection';
import AppLayout from '@/layouts/AppLayout.vue';
import SettingsLayout from '@/layouts/settings/Layout.vue';
import { base64Encode } from '@/lib/utils';
import { CryptoRepository } from '@/repositories/cryptoRepository';
import { PrivateKeyTypeType, type BreadcrumbItem } from '@/types';
import EditController from '@/wayfinder/actions/App/Http/Controllers/Settings/Ksef/EditController';
import UpdateController from '@/wayfinder/actions/App/Http/Controllers/Settings/Ksef/UpdateController';
import { useForm, usePage } from '@inertiajs/vue3';
import axios from 'axios';
import { Container } from 'inversify';
import { inject, onMounted } from 'vue';

const breadcrumbItems: BreadcrumbItem[] = [
    {
        title: 'KsEF settings',
        href: EditController().url,
    },
];

const container = inject<Container>('container') as Container;
const cryptoRepository = container.get(CryptoRepository);
const convertFileToStringHandler = container.get(ConvertFileToStringHandler);
const indexedDb = container.get<IIndexedDbConnection>(
    TYPES.KsefIIndexedDbConnection,
);

const privateKeyTypes: PrivateKeyTypeType[] = ['RSA', 'ECDSA'];
const form = useForm({
    identifier: '',
    certificate: null as File | null,
    privateKeyType: 'RSA' as PrivateKeyTypeType,
    privateKey: null as File | null,
});
const page = usePage();
const user = page.props.auth.user;
const alert = {
    errors: [] as string[],
    clearErrors() {
        this.errors = [];
    },
};

onMounted(async () => {
    const indexedDbStore = await indexedDb.open(['keys']);

    const key = PRIVATE_KEY_NAMES.metadata.replace(
        '{USER_UUID}',
        user.uuid.toString(),
    );

    const privateKeyMetadata = await indexedDbStore.get('keys', key);

    if (!privateKeyMetadata) {
        return;
    }

    if (await indexedDbStore.get('keys', privateKeyMetadata.privateKey)) {
        isPrivateKey.value = true;
    }
});

function onFileChange(e: Event, field: 'certificate' | 'privateKey') {
    const target = e.target as HTMLInputElement;

    form[field] = target.files?.[0] || null;
}

function validate() {
    if (!form.identifier) {
        form.errors.identifier = 'Identifier is required.';
    }

    if (!/[1-9]((\d[1-9])|([1-9]\d))\d{7}/.test(form.identifier)) {
        form.errors.identifier = 'Identifier is invalid.';
    }

    const keys: ('certificate' | 'privateKey')[] = [
        'certificate',
        'privateKey',
    ];

    for (const key of keys) {
        if (!form[key]) {
            form.errors[key] = 'Private key is required.';

            continue;
        }

        if (!form[key].name.endsWith('.pem')) {
            form.errors[key] = 'Only .pem files are allowed.';
        }
    }

    return Object.keys(form.errors).length === 0;
}

async function submit() {
    form.processing = true;
    alert.clearErrors();
    form.clearErrors();

    if (!validate()) {
        form.processing = false;

        return;
    }

    try {
        const certificateToString = await convertFileToStringHandler.handle({
            file: form.certificate!,
        });

        const certificateAsDer = new ConvertPemToDerHandler().handle({
            pem: certificateToString,
        });

        await axios.request({
            ...UpdateController(),
            data: {
                identifier: form.identifier,
                certificate: base64Encode(certificateAsDer),
            },
        });
    } catch (err: any) {
        console.error(err);

        const errors = err.response?.data?.errors as Record<string, string[]>;

        if (errors) {
            Object.entries(errors).forEach(([key, value]) => {
                form.errors[key as 'identifier' | 'certificate'] = value[0];
            });
        }

        form.processing = false;

        return;
    }

    try {
        const privateKeyToString = await convertFileToStringHandler.handle({
            file: form.privateKey!,
        });

        const privateKeyType = new PrivateKeyType(form.privateKeyType);

        const privateKey = await cryptoRepository.importKey(
            privateKeyToString,
            privateKeyType.getAlgorithm(),
        );

        const indexedDbStore = await indexedDb.open(['keys']);

        const key = PRIVATE_KEY_NAMES.key.replace(
            '{USER_UUID}',
            user.uuid.toString(),
        );

        await indexedDbStore.set('keys', privateKey, key);
        await indexedDbStore.set(
            'keys',
            {
                userUuid: user.uuid,
                privateKeyType: form.privateKeyType,
                privateKey: key,
            },
            PRIVATE_KEY_NAMES.metadata.replace(
                '{USER_UUID}',
                user.uuid.toString(),
            ),
        );

        form.reset();

        isPrivateKey.value = true;
    } catch (err: any) {
        console.error(err);

        alert.errors.push(err.message);
    } finally {
        form.processing = false;
    }
}
</script>

<template>
    <AppLayout :breadcrumbs="breadcrumbItems">
        <Head title="KsEF settings" />

        <SettingsLayout>
            <div class="flex flex-col space-y-6">
                <template v-if="!isPrivateKey">
                    <HeadingSmall
                        title="KsEF information"
                        description="Set your KsEF certificate"
                    />

                    <AlertError
                        v-if="alert.errors.length"
                        :errors="alert.errors"
                    />

                    <form @submit.prevent="submit" class="space-y-6">
                        <div class="grid gap-2">
                            <Label for="identifier">NIP</Label>
                            <Input
                                id="identifier"
                                class="mt-1 block w-full"
                                name="identifier"
                                required
                                v-model="form.identifier"
                            />
                            <InputError
                                class="mt-2"
                                :message="form.errors.identifier"
                            />
                        </div>

                        <div class="grid gap-2">
                            <Label for="certificate">Certificate</Label>

                            <div
                                class="space-y-4 rounded-lg border border-blue-100 bg-blue-50 p-4 dark:border-blue-200/10 dark:bg-blue-700/10"
                            >
                                <div
                                    class="relative space-y-0.5 text-blue-600 dark:text-blue-100"
                                >
                                    <p class="font-medium">Information</p>
                                    <p class="text-sm">
                                        Your certificate will be stored in
                                        encrypted form in the server's database.
                                    </p>
                                </div>
                            </div>

                            <Input
                                id="certificate"
                                class="mt-1 block w-full"
                                name="certificate"
                                required
                                type="file"
                                accept=".pem"
                                @change="
                                    (e: Event) => onFileChange(e, 'certificate')
                                "
                            />
                            <InputError
                                class="mt-2"
                                :message="form.errors.certificate"
                            />
                        </div>

                        <div class="grid gap-2">
                            <Label for="private-key-type">
                                Private Key Type
                            </Label>

                            <Select
                                id="private-key-type"
                                name="private-key-type"
                                v-model="form.privateKeyType"
                                required
                            >
                                <SelectTrigger>
                                    <SelectValue
                                        placeholder="Select a private key type"
                                    />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <template
                                            v-for="type in privateKeyTypes"
                                            :key="type"
                                        >
                                            <SelectItem :value="type">
                                                {{ type }}
                                            </SelectItem>
                                        </template>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                            <InputError
                                class="mt-2"
                                :message="form.errors.privateKeyType"
                            />
                        </div>

                        <div class="grid gap-2">
                            <Label for="private-key">Private Key</Label>

                            <div
                                class="space-y-4 rounded-lg border border-blue-100 bg-blue-50 p-4 dark:border-blue-200/10 dark:bg-blue-700/10"
                            >
                                <div
                                    class="relative space-y-0.5 text-blue-600 dark:text-blue-100"
                                >
                                    <p class="font-medium">Information</p>
                                    <p class="text-sm">
                                        Your private key will be stored as
                                        non-exportable, encrypted by Web Crypto
                                        in the browser's IndexedDB.
                                    </p>
                                </div>
                            </div>

                            <Input
                                id="private-key"
                                class="mt-1 block w-full"
                                name="private-key"
                                required
                                type="file"
                                accept=".pem"
                                @change="
                                    (e: Event) => onFileChange(e, 'privateKey')
                                "
                            />
                            <InputError
                                class="mt-2"
                                :message="form.errors.privateKey"
                            />
                        </div>

                        <div class="flex items-center gap-4">
                            <Button
                                :disabled="form.processing"
                                data-test="update-ksef-button"
                                >Save</Button
                            >
                        </div>
                    </form>
                </template>
                <template v-else>
                    <DeleteCertificate />
                </template>
            </div>
        </SettingsLayout>
    </AppLayout>
</template>
