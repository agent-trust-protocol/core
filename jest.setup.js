/**
 * Jest Setup File - Enhanced Configuration
 * Configures global environment for all tests with proper cleanup
 */

// Jest setup file to polyfill Web Crypto API for Node.js
import { webcrypto } from 'crypto';
import * as ed25519 from '@noble/ed25519';
import { sha512 } from '@noble/hashes/sha512';

// Polyfill Web Crypto API for @noble/ed25519
if (!globalThis.crypto) {
  globalThis.crypto = webcrypto;
}

// Ensure getRandomValues is available
if (!globalThis.crypto.getRandomValues) {
  globalThis.crypto.getRandomValues = webcrypto.getRandomValues.bind(webcrypto);
}

// Configure @noble/ed25519 to use SHA-512
ed25519.etc.sha512Sync = (...m) => sha512(ed25519.etc.concatBytes(...m));

// Global test timeout
jest.setTimeout(10000);

// Store original console methods
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

// Setup before each test
beforeEach(() => {
  // Suppress expected warnings and experimental messages
  console.error = jest.fn((message) => {
    if (
      typeof message === 'string' && 
      (message.includes('ExperimentalWarning:') || 
       message.includes('DeprecationWarning:') ||
       message.includes('Warning:'))
    ) {
      return; // Suppress these warnings
    }
    originalConsoleError(message);
  });
  
  console.warn = jest.fn((message) => {
    if (typeof message === 'string' && message.includes('Warning:')) {
      return; // Suppress warnings
    }
    originalConsoleWarn(message);
  });
});

// Cleanup after each test
afterEach(() => {
  // Restore console methods
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
  
  // Clear all timers and mocks
  jest.clearAllTimers();
  jest.clearAllMocks();
});

// Global cleanup after all tests
afterAll(async () => {
  // Force garbage collection if available
  if (global.gc) {
    global.gc();
  }
  
  // Small delay to allow async operations to complete
  await new Promise(resolve => setTimeout(resolve, 100));
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Export test configuration
export const testConfig = {
  timeout: 10000,
  cryptoAvailable: !!globalThis.crypto,
  ed25519Configured: !!ed25519.etc.sha512Sync
};