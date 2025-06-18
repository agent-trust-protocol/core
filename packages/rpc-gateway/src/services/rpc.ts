import { RPCRequest, RPCResponse, ServiceProxy } from '../models/rpc.js';

export class RPCService {
  private services: Map<string, ServiceProxy> = new Map();

  constructor() {
    // Register default ATP services
    this.registerService({
      name: 'identity',
      endpoint: 'http://localhost:3001',
      methods: ['identity.register', 'identity.resolve', 'identity.rotateKeys'],
      description: 'Identity management service',
    });

    this.registerService({
      name: 'vc',
      endpoint: 'http://localhost:3002',
      methods: ['vc.issue', 'vc.verify', 'vc.revoke'],
      description: 'Verifiable Credentials service',
    });

    this.registerService({
      name: 'permission',
      endpoint: 'http://localhost:3003',
      methods: ['perm.grant', 'perm.check', 'perm.revoke'],
      description: 'Permission management service',
    });
  }

  public registerService(config: { name: string; endpoint: string; methods: string[]; description: string }): void {
    const service: ServiceProxy = {
      name: config.name,
      endpoint: config.endpoint,
      methods: new Set(config.methods),
      healthy: true,
      lastHealthCheck: Date.now(),
    };

    this.services.set(config.name, service);
    console.log(`Registered service: ${config.name} at ${config.endpoint}`);
  }

  public async handleRequest(request: RPCRequest, clientDid: string): Promise<RPCResponse> {
    const [serviceName, methodName] = request.method.split('.', 2);
    
    if (!serviceName || !methodName) {
      return {
        jsonrpc: '2.0',
        error: {
          code: -32601,
          message: 'Method not found',
          data: `Invalid method format: ${request.method}`,
        },
        id: request.id,
      };
    }

    const service = this.services.get(serviceName);
    if (!service) {
      return {
        jsonrpc: '2.0',
        error: {
          code: -32601,
          message: 'Service not found',
          data: `Unknown service: ${serviceName}`,
        },
        id: request.id,
      };
    }

    if (!service.methods.has(request.method)) {
      return {
        jsonrpc: '2.0',
        error: {
          code: -32601,
          message: 'Method not found',
          data: `Method ${request.method} not available in service ${serviceName}`,
        },
        id: request.id,
      };
    }

    try {
      const response = await this.proxyRequest(service, request, clientDid);
      return response;
    } catch (error) {
      return {
        jsonrpc: '2.0',
        error: {
          code: -32603,
          message: 'Internal error',
          data: error instanceof Error ? error.message : 'Unknown error',
        },
        id: request.id,
      };
    }
  }

  private async proxyRequest(service: ServiceProxy, request: RPCRequest, clientDid: string): Promise<RPCResponse> {
    const [serviceName, methodName] = request.method.split('.', 2);
    
    // Map RPC methods to HTTP endpoints
    const httpMethod = this.getHttpMethod(methodName);
    const endpoint = this.getServiceEndpoint(serviceName, methodName);
    
    const url = `${service.endpoint}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        method: httpMethod,
        headers: {
          'Content-Type': 'application/json',
          'X-Client-DID': clientDid,
        },
        body: httpMethod !== 'GET' ? JSON.stringify(request.params || {}) : undefined,
      } as RequestInit);

      const data = await response.json() as any;
      
      if (!response.ok) {
        return {
          jsonrpc: '2.0',
          error: {
            code: response.status === 404 ? -32601 : -32603,
            message: (data as any).error || 'Service error',
            data: data,
          },
          id: request.id,
        };
      }

      return {
        jsonrpc: '2.0',
        result: data,
        id: request.id,
      };
    } catch (error) {
      service.healthy = false;
      throw error;
    }
  }

  private getHttpMethod(methodName: string): string {
    const methodMap: Record<string, string> = {
      'register': 'POST',
      'issue': 'POST',
      'grant': 'POST',
      'verify': 'POST',
      'check': 'POST',
      'resolve': 'GET',
      'list': 'GET',
      'revoke': 'DELETE',
      'rotateKeys': 'POST',
    };

    return methodMap[methodName] || 'POST';
  }

  private getServiceEndpoint(serviceName: string, methodName: string): string {
    const endpointMap: Record<string, Record<string, string>> = {
      'identity': {
        'register': '/identity/register',
        'resolve': '/identity', // Will append DID as param
        'rotateKeys': '/identity', // Will append DID and action
        'list': '/identity',
      },
      'vc': {
        'issue': '/vc/issue',
        'verify': '/vc/verify',
        'revoke': '/vc/revoke',
        'schemas': '/vc/schemas',
      },
      'permission': {
        'grant': '/perm/grant',
        'check': '/perm/check',
        'revoke': '/perm/revoke',
        'list': '/perm/list',
      },
    };

    return endpointMap[serviceName]?.[methodName] || `/${serviceName}/${methodName}`;
  }

  public async healthCheck(): Promise<void> {
    for (const [name, service] of this.services.entries()) {
      try {
        const response = await fetch(`${service.endpoint}/health`, {
          method: 'GET',
        });
        
        service.healthy = response.ok;
        service.lastHealthCheck = Date.now();
        
        if (!response.ok) {
          console.warn(`Service ${name} health check failed`);
        }
      } catch (error) {
        service.healthy = false;
        service.lastHealthCheck = Date.now();
        console.error(`Service ${name} health check error:`, error);
      }
    }
  }

  public getServiceStatus(): Record<string, { healthy: boolean; lastCheck: number }> {
    const status: Record<string, { healthy: boolean; lastCheck: number }> = {};
    
    for (const [name, service] of this.services.entries()) {
      status[name] = {
        healthy: service.healthy,
        lastCheck: service.lastHealthCheck,
      };
    }
    
    return status;
  }
}