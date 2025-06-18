import { AuthMessage } from '../models/rpc.js';

export class AuthService {
  constructor() {}

  async verifyAuth(authData: AuthMessage): Promise<boolean> {
    try {
      // Verify timestamp (within 5 minutes)
      const now = Date.now();
      const timestampDiff = Math.abs(now - authData.timestamp);
      if (timestampDiff > 5 * 60 * 1000) {
        console.warn('Authentication timestamp too old');
        return false;
      }

      // Create challenge message
      const challenge = `${authData.did}:${authData.timestamp}`;
      
      // Verify signature against DID document
      const didDocument = await this.resolveDID(authData.did);
      if (!didDocument) {
        console.warn('Could not resolve DID document');
        return false;
      }

      const publicKey = this.extractPublicKey(didDocument);
      if (!publicKey) {
        console.warn('Could not extract public key from DID document');
        return false;
      }

      const isValid = await this.verifySignature(challenge, authData.proof, publicKey);
      return isValid;
    } catch (error) {
      console.error('Authentication verification failed:', error);
      return false;
    }
  }

  private async resolveDID(did: string): Promise<any> {
    try {
      // Call identity service to resolve DID
      const response = await fetch(`http://localhost:3001/identity/${encodeURIComponent(did)}`);
      if (!response.ok) {
        return null;
      }
      
      const result = await response.json() as any;
      return (result as any).success ? (result as any).data : null;
    } catch (error) {
      console.error('Failed to resolve DID:', error);
      return null;
    }
  }

  private extractPublicKey(didDocument: any): string | null {
    try {
      const verificationMethod = didDocument.verificationMethod?.[0];
      if (!verificationMethod) {
        return null;
      }

      // Extract public key from multibase encoding
      const multibase = verificationMethod.publicKeyMultibase;
      if (!multibase || !multibase.startsWith('z')) {
        return null;
      }

      // Decode base58 and remove ed25519 prefix
      const decoded = this.base58decode(multibase.slice(1));
      if (decoded.length < 2) {
        return null;
      }

      // Remove ed25519 prefix (0xed, 0x01)
      const publicKeyBytes = decoded.slice(2);
      return Buffer.from(publicKeyBytes).toString('hex');
    } catch (error) {
      console.error('Failed to extract public key:', error);
      return null;
    }
  }

  private async verifySignature(message: string, signatureHex: string, publicKeyHex: string): Promise<boolean> {
    try {
      // Import crypto setup
      const { initializeCrypto } = await import('@atp/shared');
      initializeCrypto();
      
      const crypto = await import('@noble/ed25519');
      
      const messageBytes = Buffer.from(message, 'utf8');
      const signatureBytes = Buffer.from(signatureHex, 'hex');
      const publicKeyBytes = Buffer.from(publicKeyHex, 'hex');
      
      return await crypto.verify(signatureBytes, messageBytes, publicKeyBytes);
    } catch (error) {
      console.error('Signature verification failed:', error);
      return false;
    }
  }

  private base58decode(str: string): Uint8Array {
    const alphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    let num = BigInt(0);
    let multi = BigInt(1);
    
    for (let i = str.length - 1; i >= 0; i--) {
      const char = str[i];
      const charIndex = alphabet.indexOf(char);
      if (charIndex === -1) {
        throw new Error('Invalid base58 character');
      }
      num += BigInt(charIndex) * multi;
      multi *= 58n;
    }
    
    // Convert to bytes
    const bytes: number[] = [];
    while (num > 0) {
      bytes.unshift(Number(num % 256n));
      num = num / 256n;
    }
    
    // Add leading zeros
    for (let i = 0; i < str.length && str[i] === '1'; i++) {
      bytes.unshift(0);
    }
    
    return new Uint8Array(bytes);
  }
}