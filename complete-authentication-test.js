#!/usr/bin/env node

/**
 * Complete Authentication Flow Test & Implementation
 * Tests and validates the full 100% production-ready authentication system
 */

// Setup crypto polyfill for Node.js
import { webcrypto } from 'crypto';
import * as ed25519 from '@noble/ed25519';
import { sha512 } from '@noble/hashes/sha512';

if (!globalThis.crypto) {
  globalThis.crypto = webcrypto;
}

// Configure @noble/ed25519 to use SHA-512
ed25519.etc.sha512Sync = (...m) => sha512(ed25519.etc.concatBytes(...m));

import { CryptoUtils } from './packages/sdk/dist/utils/crypto.js';

class CompleteAuthenticationTest {
  constructor() {
    this.services = {
      identity: 'http://localhost:3001',
      gateway: 'http://localhost:3000',
      quantum: 'http://127.0.0.1:3008'
    };
  }

  async runCompleteTest() {
    console.log('🔐 COMPLETE AUTHENTICATION FLOW TEST');
    console.log('=====================================');
    console.log('Testing 100% production-ready authentication system');
    console.log('');

    const results = {
      serviceHealth: {},
      didRegistration: {},
      authChallenge: {},
      authResponse: {},
      secureAccess: {},
      overall: {}
    };

    try {
      // Step 1: Verify all services are running
      console.log('🏥 Step 1: Service Health Verification');
      console.log('─'.repeat(40));
      
      const healthChecks = [
        { name: 'Identity Service', url: `${this.services.identity}/health` },
        { name: 'RPC Gateway', url: `${this.services.gateway}/health` },
        { name: 'Quantum-Safe Server', url: `${this.services.quantum}/health` }
      ];

      for (const service of healthChecks) {
        try {
          const response = await fetch(service.url);
          const isHealthy = response.ok;
          console.log(`   ${isHealthy ? '✅' : '❌'} ${service.name}: ${isHealthy ? 'HEALTHY' : 'UNHEALTHY'}`);
          results.serviceHealth[service.name] = isHealthy;
        } catch (error) {
          console.log(`   ❌ ${service.name}: ERROR - ${error.message}`);
          results.serviceHealth[service.name] = false;
        }
      }

      // Step 2: Generate test identity
      console.log('\n🆔 Step 2: DID Registration & Identity Creation');
      console.log('─'.repeat(40));
      
      const keyPair = await CryptoUtils.generateKeyPair();
      const did = `did:atp:test:${CryptoUtils.randomString(16)}`;
      
      console.log(`   ✅ Generated key pair`);
      console.log(`   ✅ Created DID: ${did}`);
      
      // Create DID document
      const didDocument = {
        id: did,
        verificationMethod: [{
          id: `${did}#key-1`,
          type: 'Ed25519VerificationKey2020',
          controller: did,
          publicKeyMultibase: `z${this.encodePublicKey(keyPair.publicKey)}`
        }],
        authentication: [`${did}#key-1`],
        metadata: {
          trustLevel: 'verified',
          capabilities: ['authenticate', 'sign-transactions']
        }
      };

      // Register DID with Identity Service
      try {
        const registerResponse = await fetch(`${this.services.identity}/identity/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            did,
            document: didDocument,
            publicKey: keyPair.publicKey,
            trustLevel: 'verified'
          })
        });

        if (registerResponse.ok) {
          console.log(`   ✅ DID registered with Identity Service`);
          results.didRegistration.success = true;
        } else {
          console.log(`   ⚠️ DID registration failed (may already exist): ${registerResponse.status}`);
          results.didRegistration.success = false;
          results.didRegistration.reason = 'Registration failed or DID exists';
        }
      } catch (error) {
        console.log(`   ❌ Identity Service unavailable: ${error.message}`);
        results.didRegistration.success = false;
        results.didRegistration.error = error.message;
      }

      // Step 3: Test Authentication Challenge
      console.log('\n🔑 Step 3: Authentication Challenge Request');
      console.log('─'.repeat(40));
      
      try {
        const challengeResponse = await fetch(`${this.services.gateway}/auth/challenge`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ did })
        });

        if (challengeResponse.ok) {
          const challengeData = await challengeResponse.json();
          console.log(`   ✅ Challenge received: ${challengeData.challenge.substring(0, 32)}...`);
          results.authChallenge.success = true;
          results.authChallenge.challenge = challengeData.challenge;
        } else {
          console.log(`   ❌ Challenge request failed: ${challengeResponse.status}`);
          results.authChallenge.success = false;
        }
      } catch (error) {
        console.log(`   ❌ Challenge request error: ${error.message}`);
        results.authChallenge.success = false;
        results.authChallenge.error = error.message;
      }

      // Step 4: Test Authentication Response
      console.log('\n✍️ Step 4: Authentication Response Verification');
      console.log('─'.repeat(40));
      
      if (results.authChallenge.success) {
        try {
          const challenge = results.authChallenge.challenge;
          const response = 'auth-response';
          const message = `${challenge}:${response}`;
          const signature = await CryptoUtils.signData(message, keyPair.privateKey);

          const authResponse = await fetch(`${this.services.gateway}/auth/response`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              challenge,
              response,
              signature,
              did
            })
          });

          if (authResponse.ok) {
            const authData = await authResponse.json();
            console.log(`   ✅ Authentication successful: ${authData.message}`);
            results.authResponse.success = true;
          } else {
            console.log(`   ❌ Authentication failed: ${authResponse.status}`);
            const errorData = await authResponse.json();
            console.log(`   📝 Error details: ${errorData.error}`);
            results.authResponse.success = false;
            results.authResponse.error = errorData.error;
          }
        } catch (error) {
          console.log(`   ❌ Authentication response error: ${error.message}`);
          results.authResponse.success = false;
          results.authResponse.error = error.message;
        }
      } else {
        console.log(`   ⏭️ Skipped (no challenge available)`);
        results.authResponse.success = false;
        results.authResponse.skipped = true;
      }

      // Step 5: Test Secure Endpoint Access
      console.log('\n🔒 Step 5: Secure Endpoint Access Test');
      console.log('─'.repeat(40));
      
      try {
        const secureResponse = await fetch(`${this.services.gateway}/secure/status`);
        
        if (secureResponse.status === 401) {
          console.log(`   ✅ Secure endpoint properly protected (401 Unauthorized)`);
          results.secureAccess.protected = true;
        } else {
          console.log(`   ⚠️ Secure endpoint response: ${secureResponse.status}`);
          results.secureAccess.protected = false;
        }
      } catch (error) {
        console.log(`   ❌ Secure endpoint test error: ${error.message}`);
        results.secureAccess.error = error.message;
      }

      // Step 6: Overall Assessment
      console.log('\n🎯 AUTHENTICATION SYSTEM ASSESSMENT');
      console.log('=====================================');
      
      const scores = this.calculateAuthScores(results);
      const overallScore = Object.values(scores).reduce((a, b) => a + b, 0) / Object.keys(scores).length;
      
      console.log('📊 Component Scores:');
      Object.entries(scores).forEach(([component, score]) => {
        const status = score >= 90 ? '✅' : score >= 70 ? '⚠️' : '❌';
        console.log(`   ${status} ${component}: ${score.toFixed(1)}%`);
      });
      
      console.log(`\n🏆 Authentication Score: ${overallScore.toFixed(1)}%`);
      
      const authReadiness = this.getAuthReadiness(overallScore);
      console.log(`🎯 Authentication Status: ${authReadiness.level}`);
      console.log(`📝 Assessment: ${authReadiness.description}`);
      
      results.overall = {
        scores,
        overallScore,
        authReadiness,
        timestamp: new Date().toISOString()
      };

      // Final Summary
      console.log('\n🎉 AUTHENTICATION TEST COMPLETE!');
      console.log('=====================================');
      
      if (overallScore >= 95) {
        console.log('✅ Authentication system: PRODUCTION READY');
        console.log('✅ DID resolution: Functional');
        console.log('✅ Challenge-response: Working');
        console.log('✅ Security endpoints: Protected');
        console.log('');
        console.log('🚀 Authentication flow is 100% complete!');
      } else {
        console.log('⚠️ Authentication system needs attention');
        console.log('📋 Review component scores above');
        console.log('🔧 Address failing components for 100% completion');
      }

      return { success: overallScore >= 95, results, overallScore };

    } catch (error) {
      console.error('\n❌ AUTHENTICATION TEST FAILED!');
      console.error('=====================================');
      console.error(`Error: ${error.message}`);
      
      return { success: false, error: error.message, results };
    }
  }

  calculateAuthScores(results) {
    const scores = {};
    
    // Service Health Score
    const healthResults = Object.values(results.serviceHealth);
    const healthyServices = healthResults.filter(h => h).length;
    scores['Service Health'] = (healthyServices / healthResults.length) * 100;
    
    // DID Registration Score
    scores['DID Registration'] = results.didRegistration.success ? 100 : 50;
    
    // Auth Challenge Score
    scores['Auth Challenge'] = results.authChallenge.success ? 100 : 0;
    
    // Auth Response Score
    if (results.authResponse.skipped) {
      scores['Auth Response'] = 0;
    } else {
      scores['Auth Response'] = results.authResponse.success ? 100 : 0;
    }
    
    // Security Score
    scores['Security Protection'] = results.secureAccess.protected ? 100 : 50;
    
    return scores;
  }

  getAuthReadiness(score) {
    if (score >= 95) {
      return {
        level: 'PRODUCTION READY ✅',
        description: 'Complete authentication system operational and ready for production.'
      };
    } else if (score >= 80) {
      return {
        level: 'MOSTLY READY ⚠️',
        description: 'Authentication system functional with minor issues to address.'
      };
    } else if (score >= 60) {
      return {
        level: 'PARTIAL IMPLEMENTATION 🔄',
        description: 'Core authentication working but missing key components.'
      };
    } else {
      return {
        level: 'NOT READY ❌',
        description: 'Authentication system requires significant implementation work.'
      };
    }
  }

  encodePublicKey(publicKeyHex) {
    // Simple base58 encoding for public key
    const publicKeyBytes = Buffer.from(publicKeyHex, 'hex');
    const prefixed = Buffer.concat([Buffer.from([0xed, 0x01]), publicKeyBytes]);
    return this.base58encode(prefixed);
  }

  base58encode(buffer) {
    const alphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    let num = BigInt('0x' + buffer.toString('hex'));
    let result = '';
    
    while (num > 0) {
      result = alphabet[Number(num % 58n)] + result;
      num = num / 58n;
    }
    
    // Add leading 1s for leading zeros
    for (let i = 0; i < buffer.length && buffer[i] === 0; i++) {
      result = '1' + result;
    }
    
    return result;
  }
}

// Run the test if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const test = new CompleteAuthenticationTest();
  const result = await test.runCompleteTest();
  process.exit(result.success ? 0 : 1);
}

export { CompleteAuthenticationTest };