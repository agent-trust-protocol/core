# Claude Integration with Agent Trust Protocol™

## Overview

This guide shows how to connect Claude (or any AI system) to the Agent Trust Protocol network for secure, trust-based tool access and agent-to-agent communication.

## Quick Start

### 1. Start ATP Services

```bash
# Start the ATP MCP server
cd packages/protocol-integrations
npm start
```

The server will run on:
- **MCP WebSocket**: `ws://localhost:3007`
- **HTTP API**: `http://localhost:3006`
- **A2A Bridge**: `http://localhost:3008`

### 2. Connect Claude

#### Option A: Direct WebSocket Connection

```javascript
import WebSocket from 'ws';

const ws = new WebSocket('ws://localhost:3007', {
  headers: {
    'x-atp-did': 'did:atp:your-claude-instance',
    'x-atp-trust-level': 'verified',
    'x-atp-auth-method': 'did-signature',
    'x-atp-session-id': 'claude-session-123'
  }
});
```

#### Option B: Use the ATP Client

```bash
node claude-atp-client.js
```

#### Option C: Claude Desktop Configuration

Add to Claude Desktop MCP settings:

```json
{
  "mcpServers": {
    "agent-trust-protocol": {
      "command": "node",
      "args": ["/path/to/claude-atp-client.js"]
    }
  }
}
```

## Available Tools by Trust Level

### Public (Untrusted)
- `weather_info` - Get weather information

### Basic Trust Required
- `file_read` - Read file contents
- `atp_identity_lookup` - Look up agent identities

### Verified Trust Required  
- `database_query` - Execute database queries
- `atp_audit_query` - Query audit logs

### Premium Trust Required
- `system_command` - Execute system commands

### Enterprise Trust Required
- `admin_user_management` - Manage users and permissions

## Trust Level Configuration

Claude's trust level determines which tools it can access:

```javascript
const client = new ClaudeATPClient({
  trustLevel: 'verified',  // Options: untrusted, basic, verified, premium, enterprise
  clientDID: 'did:atp:claude-instance-1'
});
```

## Agent Discovery

Find other agents in the ATP network:

```javascript
const agents = await client.discoverAgents(['weather-current'], 'basic');
console.log(`Found ${agents.length} weather agents`);
```

## Security Features

### 1. Trust-Based Access Control
- Tools are filtered based on Claude's trust level
- Higher trust levels unlock more powerful tools

### 2. Audit Logging
- All tool executions are logged
- Includes actor, action, timestamp, and results

### 3. Rate Limiting
- Different tools have different rate limits
- Prevents abuse and ensures fair usage

### 4. DID-Based Authentication
- Each Claude instance has a unique DID
- Cryptographic identity verification

## Example Integration

```javascript
import { ClaudeATPClient } from './claude-atp-client.js';

async function integrateClaudeWithATP() {
  const client = new ClaudeATPClient({
    trustLevel: 'verified',
    clientDID: 'did:atp:claude-production'
  });

  // Connect to ATP network
  await client.connect();

  // List available tools
  const tools = await client.listTools();

  // Execute a tool
  const result = await client.callTool('weather_info', {
    location: 'New York',
    units: 'fahrenheit'
  });

  console.log('Weather result:', result);
}
```

## Production Deployment

### 1. Environment Variables

```bash
export ATP_WEBSOCKET_URL=wss://your-atp-server.com:3007
export ATP_CLIENT_DID=did:atp:claude-production
export ATP_TRUST_LEVEL=verified
export ATP_AUTH_METHOD=did-signature
```

### 2. SSL/TLS Configuration

For production, use secure WebSocket connections:

```javascript
const client = new ClaudeATPClient({
  wsUrl: 'wss://your-atp-server.com:3007',
  // ... other options
});
```

### 3. Error Handling

```javascript
try {
  await client.connect();
} catch (error) {
  console.error('Failed to connect to ATP:', error);
  // Implement fallback or retry logic
}
```

## Monitoring and Debugging

### 1. Check ATP Server Status

```bash
curl http://localhost:3006/health
```

### 2. View Available Tools

```bash
curl http://localhost:3006/mcp/tools
```

### 3. Monitor Audit Logs

All Claude interactions are logged in the ATP audit system for security and compliance.

## Benefits for Claude

1. **Secure Tool Access** - Trust-based permissions
2. **Agent Discovery** - Find and interact with other AI agents
3. **Audit Trail** - Complete logging of all actions
4. **Rate Limiting** - Fair usage and abuse prevention
5. **Scalable Architecture** - Production-ready infrastructure

## Next Steps

1. **Test the Integration** - Run the demo client
2. **Configure Trust Level** - Set appropriate permissions
3. **Deploy to Production** - Use secure endpoints
4. **Monitor Usage** - Track tool usage and performance
5. **Scale Up** - Add more tools and agents as needed

## Support

For issues or questions:
- Check the ATP server logs
- Verify WebSocket connectivity
- Ensure proper authentication headers
- Review trust level requirements

The Agent Trust Protocol provides a secure, scalable foundation for AI agent interactions with comprehensive security, trust management, and audit capabilities.