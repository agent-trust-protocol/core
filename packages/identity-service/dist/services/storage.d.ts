import { DIDDocument, KeyPair } from '../models/did.js';
export declare class StorageService {
    private db;
    constructor(dbPath?: string);
    private initTables;
    storeDIDDocument(document: DIDDocument): Promise<void>;
    getDIDDocument(did: string): Promise<DIDDocument | null>;
    storeKeyPair(keyPair: KeyPair): Promise<void>;
    getKeyPair(did: string): Promise<KeyPair | null>;
    rotateKey(did: string): Promise<{
        publicKey: string;
        privateKey: string;
    }>;
    listDIDs(): Promise<string[]>;
    close(): void;
}
