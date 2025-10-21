import { injectable } from 'inversify';

export interface IIndexedDbConnection {
    open(storeNames: string[]): Promise<this>;
    set(storeName: string, value: any, key?: string | undefined): Promise<void>;
    get(storeName: string, key: string): Promise<any>;
    delete(storeName: string, key: string): Promise<void>;
}

@injectable()
export class IndexedDbConnection implements IIndexedDbConnection {
    private dbName: string;
    private dbVersion: number;
    private db: IDBDatabase | null = null;

    constructor(dbName: string, dbVersion: number = 1) {
        this.dbName = dbName;
        this.dbVersion = dbVersion;
    }

    public open(storeNames: string[]): Promise<this> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;

                for (const storeName of storeNames) {
                    if (!db.objectStoreNames.contains(storeName)) {
                        db.createObjectStore(storeName);
                    }
                }
            };

            request.onsuccess = (event) => {
                this.db = (event.target as IDBOpenDBRequest).result;
                resolve(this);
            };

            request.onerror = (event) => {
                reject((event.target as IDBOpenDBRequest).error);
            };
        });
    }

    public set(
        storeName: string,
        value: any,
        key: string | undefined = undefined,
    ): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                return reject('Database not opened');
            }

            const tx = this.db.transaction(storeName, 'readwrite');
            const store = tx.objectStore(storeName);

            const request = store.put(value, key);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    public get(storeName: string, key: string): Promise<any> {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                return reject('Database not opened');
            }

            const tx = this.db.transaction(storeName, 'readonly');
            const store = tx.objectStore(storeName);

            const request = store.get(key);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    public delete(storeName: string, key: string): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                return reject('Database not opened');
            }

            const tx = this.db.transaction(storeName, 'readwrite');
            const store = tx.objectStore(storeName);

            const request = store.delete(key);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }
}
