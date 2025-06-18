import { VerifiableCredential, CredentialSchema } from '../models/credential.js';
export declare class StorageService {
    private db;
    constructor(dbPath?: string);
    private initTables;
    storeCredential(credential: VerifiableCredential): Promise<void>;
    getCredential(credentialId: string): Promise<VerifiableCredential | null>;
    revokeCredential(credentialId: string): Promise<void>;
    isCredentialRevoked(credentialId: string): Promise<boolean>;
    storeSchema(schema: CredentialSchema): Promise<void>;
    getSchema(schemaId: string): Promise<CredentialSchema | null>;
    getSchemaByName(name: string): Promise<CredentialSchema | null>;
    listSchemas(): Promise<CredentialSchema[]>;
    close(): void;
}
