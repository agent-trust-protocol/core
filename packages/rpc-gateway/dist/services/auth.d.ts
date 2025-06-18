import { AuthMessage } from '../models/rpc.js';
export declare class AuthService {
    constructor();
    verifyAuth(authData: AuthMessage): Promise<boolean>;
    private resolveDID;
    private extractPublicKey;
    private verifySignature;
    private base58decode;
}
