import { Container } from 'inversify';
import { ConvertFileToStringHandler } from './actions/convertFileToStringHandler';
import { ConvertPemToDerHandler } from './actions/convertPemToDerHandler';
import { SignDocumentHandler } from './actions/signDocumentHandler';
import {
    IndexedDbConnection,
    type IIndexedDbConnection,
} from './indexeddb/indexedDbConnection';
import { CryptoRepository } from './repositories/cryptoRepository';

export const TYPES = {
    KsefIIndexedDbConnection: Symbol.for('KsefIIndexedDbConnection'),
};

export const container: Container = new Container();

container.bind(SignDocumentHandler).toSelf();
container.bind(ConvertPemToDerHandler).toSelf();
container.bind(ConvertFileToStringHandler).toSelf();
container.bind(CryptoRepository).toSelf();
container
    .bind<IIndexedDbConnection>(TYPES.KsefIIndexedDbConnection)
    .toDynamicValue(() => new IndexedDbConnection('ksef'));
