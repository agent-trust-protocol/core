import { z } from 'zod';
export declare const VerificationMethodSchema: z.ZodObject<{
    id: z.ZodString;
    type: z.ZodString;
    controller: z.ZodString;
    publicKeyMultibase: z.ZodOptional<z.ZodString>;
    publicKeyJwk: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    id: string;
    type: string;
    controller: string;
    publicKeyMultibase?: string | undefined;
    publicKeyJwk?: Record<string, any> | undefined;
}, {
    id: string;
    type: string;
    controller: string;
    publicKeyMultibase?: string | undefined;
    publicKeyJwk?: Record<string, any> | undefined;
}>;
export declare const ServiceSchema: z.ZodObject<{
    id: z.ZodString;
    type: z.ZodString;
    serviceEndpoint: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    type: string;
    serviceEndpoint: string;
}, {
    id: string;
    type: string;
    serviceEndpoint: string;
}>;
export declare const DIDDocumentSchema: z.ZodObject<{
    '@context': z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    id: z.ZodString;
    verificationMethod: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        type: z.ZodString;
        controller: z.ZodString;
        publicKeyMultibase: z.ZodOptional<z.ZodString>;
        publicKeyJwk: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        type: string;
        controller: string;
        publicKeyMultibase?: string | undefined;
        publicKeyJwk?: Record<string, any> | undefined;
    }, {
        id: string;
        type: string;
        controller: string;
        publicKeyMultibase?: string | undefined;
        publicKeyJwk?: Record<string, any> | undefined;
    }>, "many">>;
    authentication: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    assertionMethod: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    keyAgreement: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    capabilityInvocation: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    capabilityDelegation: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    service: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        type: z.ZodString;
        serviceEndpoint: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
        type: string;
        serviceEndpoint: string;
    }, {
        id: string;
        type: string;
        serviceEndpoint: string;
    }>, "many">>;
    created: z.ZodString;
    updated: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    '@context': string[];
    verificationMethod: {
        id: string;
        type: string;
        controller: string;
        publicKeyMultibase?: string | undefined;
        publicKeyJwk?: Record<string, any> | undefined;
    }[];
    authentication: string[];
    assertionMethod: string[];
    keyAgreement: string[];
    capabilityInvocation: string[];
    capabilityDelegation: string[];
    service: {
        id: string;
        type: string;
        serviceEndpoint: string;
    }[];
    created: string;
    updated: string;
}, {
    id: string;
    created: string;
    updated: string;
    '@context'?: string[] | undefined;
    verificationMethod?: {
        id: string;
        type: string;
        controller: string;
        publicKeyMultibase?: string | undefined;
        publicKeyJwk?: Record<string, any> | undefined;
    }[] | undefined;
    authentication?: string[] | undefined;
    assertionMethod?: string[] | undefined;
    keyAgreement?: string[] | undefined;
    capabilityInvocation?: string[] | undefined;
    capabilityDelegation?: string[] | undefined;
    service?: {
        id: string;
        type: string;
        serviceEndpoint: string;
    }[] | undefined;
}>;
export declare const KeyPairSchema: z.ZodObject<{
    did: z.ZodString;
    publicKey: z.ZodString;
    privateKey: z.ZodString;
    created: z.ZodString;
    rotated: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    created: string;
    did: string;
    publicKey: string;
    privateKey: string;
    rotated?: string | undefined;
}, {
    created: string;
    did: string;
    publicKey: string;
    privateKey: string;
    rotated?: string | undefined;
}>;
export type VerificationMethod = z.infer<typeof VerificationMethodSchema>;
export type Service = z.infer<typeof ServiceSchema>;
export type DIDDocument = z.infer<typeof DIDDocumentSchema>;
export type KeyPair = z.infer<typeof KeyPairSchema>;
export interface DIDRegistrationRequest {
    publicKey?: string;
    services?: Service[];
}
export interface DIDRegistrationResponse {
    did: string;
    document: DIDDocument;
    privateKey?: string;
}
