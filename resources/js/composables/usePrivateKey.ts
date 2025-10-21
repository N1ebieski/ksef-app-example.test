import { ref } from 'vue';
import { PrivateKeyTypeType } from '../types';

export const isPrivateKey = ref(false);

export const PRIVATE_KEY_NAMES = {
    key: `user-{USER_UUID}-privateKey`,
    metadata: `user-{USER_UUID}-privateKey-metadata`,
};

export class PrivateKeyType {
    constructor(public value: PrivateKeyTypeType) {}

    public getAlgorithm(): RsaHashedImportParams | EcKeyImportParams {
        switch (this.value) {
            case 'RSA':
                return {
                    name: 'RSASSA-PKCS1-v1_5',
                    hash: 'SHA-256',
                };
            case 'ECDSA':
                return {
                    name: 'ECDSA',
                    hash: 'SHA-256',
                };
        }
    }
}
