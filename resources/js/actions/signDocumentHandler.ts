import { Certificate } from '@/types';
import { DOMParser, XMLSerializer } from '@xmldom/xmldom';
import { injectable } from 'inversify';
import * as XAdES from 'xadesjs';
import { AbstractHandler } from './abstractHandler';

interface SignDocumentAction {
    certificate: Certificate;
    document: string;
}

@injectable()
export class SignDocumentHandler extends AbstractHandler {
    public async handle(action: SignDocumentAction): Promise<string> {
        const parser = new DOMParser();

        const document = parser.parseFromString(action.document, 'text/xml');

        const signer = new XAdES.SignedXml(document);

        await signer.Sign(
            action.certificate.privateKeyType.getAlgorithm(),
            action.certificate.privateKey,
            document.documentElement,
            {
                references: [
                    {
                        uri: '',
                        hash: 'SHA-256',
                        transforms: ['enveloped', 'c14n'],
                    },
                ],
                signingCertificate: action.certificate.raw,
                x509: [action.certificate.raw],
            },
        );

        const signedXml = signer.GetXml() as Element;

        const signedXmlToString = new XMLSerializer().serializeToString(
            signedXml,
        );
        const signatureDocument = parser.parseFromString(
            signedXmlToString,
            'text/xml',
        );

        document.documentElement.appendChild(signatureDocument);

        const documentToString = new XMLSerializer().serializeToString(
            document,
        );

        return documentToString;
    }
}
