import { DIDDocument, DIDRegistrationRequest, DIDRegistrationResponse, Service } from '../models/did.js';
import { StorageService } from './storage.js';
export declare class IdentityService {
    private storage;
    constructor(storage: StorageService);
    registerDID(request?: DIDRegistrationRequest): Promise<DIDRegistrationResponse>;
    resolveDID(did: string): Promise<DIDDocument | null>;
    rotateKeys(did: string): Promise<DIDDocument | null>;
    addService(did: string, service: Service): Promise<DIDDocument | null>;
    listDIDs(): Promise<string[]>;
}
