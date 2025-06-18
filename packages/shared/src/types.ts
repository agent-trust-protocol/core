import { z } from 'zod';

export const APIResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.string().optional(),
  timestamp: z.string().optional(),
});

export const AuditEventSchema = z.object({
  id: z.string(),
  type: z.enum(['DID_CREATED', 'DID_RESOLVED', 'VC_ISSUED', 'VC_VERIFIED', 'PERMISSION_GRANTED', 'PERMISSION_REVOKED', 'RPC_INVOKED']),
  actor: z.string(),
  target: z.string().optional(),
  metadata: z.record(z.any()).optional(),
  timestamp: z.string(),
  signature: z.string().optional(),
});

export const RPCRequestSchema = z.object({
  jsonrpc: z.literal('2.0'),
  method: z.string(),
  params: z.any().optional(),
  id: z.union([z.string(), z.number()]),
});

export const RPCResponseSchema = z.object({
  jsonrpc: z.literal('2.0'),
  result: z.any().optional(),
  error: z.object({
    code: z.number(),
    message: z.string(),
    data: z.any().optional(),
  }).optional(),
  id: z.union([z.string(), z.number()]),
});

export type APIResponse = z.infer<typeof APIResponseSchema>;
export type AuditEvent = z.infer<typeof AuditEventSchema>;
export type RPCRequest = z.infer<typeof RPCRequestSchema>;
export type RPCResponse = z.infer<typeof RPCResponseSchema>;

export interface ServiceConfig {
  port: number;
  host: string;
  dbPath?: string;
  corsOrigins?: string[];
}