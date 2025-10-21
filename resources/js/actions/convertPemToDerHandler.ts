import { base64Decode } from '@/lib/utils';
import { injectable } from 'inversify';
import { AbstractHandler } from './abstractHandler';

interface ConvertPemToDerAction {
    pem: string;
}

@injectable()
export class ConvertPemToDerHandler extends AbstractHandler {
    public handle(action: ConvertPemToDerAction): Uint8Array {
        const der = action.pem.replace(
            /-+BEGIN [^-]+-+|-+END [^-]+-+|\s+/g,
            '',
        );

        return base64Decode(der) as Uint8Array;
    }
}
