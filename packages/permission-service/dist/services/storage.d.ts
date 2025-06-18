import { PermissionGrant, PolicyRule } from '../models/permission.js';
export declare class StorageService {
    private db;
    constructor(dbPath?: string);
    private initTables;
    storeGrant(grant: PermissionGrant): Promise<void>;
    getGrant(grantId: string): Promise<PermissionGrant | null>;
    getGrantsForSubject(subject: string): Promise<PermissionGrant[]>;
    getGrantsByGrantor(grantor: string): Promise<PermissionGrant[]>;
    revokeGrant(grantId: string): Promise<void>;
    storePolicyRule(rule: PolicyRule): Promise<void>;
    removePolicyRule(ruleId: string): Promise<void>;
    listPolicyRules(): Promise<PolicyRule[]>;
    private rowToGrant;
    close(): void;
}
