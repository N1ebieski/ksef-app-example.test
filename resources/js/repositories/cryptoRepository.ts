import { ConvertPemToDerHandler } from '@/actions/convertPemToDerHandler';
import { inject, injectable } from 'inversify';
import { AbstractRepository } from './abstractRepository';

@injectable()
export class CryptoRepository extends AbstractRepository {
    public constructor(
        @inject(ConvertPemToDerHandler)
        private readonly convertPemToDerHandler: ConvertPemToDerHandler,
    ) {
        super();
    }

    public async importKey(
        key: string,
        algo: RsaHashedImportParams | EcKeyImportParams,
    ): Promise<CryptoKey> {
        const data = this.convertPemToDerHandler.handle({
            pem: key,
        });

        const cryptoKey = await crypto.subtle.importKey(
            'pkcs8',
            data.buffer as ArrayBuffer,
            algo,
            false,
            ['sign'],
        );

        return cryptoKey;
    }
}
