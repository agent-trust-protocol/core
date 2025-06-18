import Database from 'better-sqlite3';
import { CryptoUtils } from '../utils/crypto.js';
export class StorageService {
    db;
    constructor(dbPath = ':memory:') {
        this.db = new Database(dbPath);
        this.initTables();
    }
    initTables() {
        this.db.exec(`
      CREATE TABLE IF NOT EXISTS did_documents (
        did TEXT PRIMARY KEY,
        document TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS key_pairs (
        did TEXT PRIMARY KEY,
        public_key TEXT NOT NULL,
        private_key TEXT NOT NULL,
        created_at TEXT NOT NULL,
        rotated_at TEXT,
        FOREIGN KEY (did) REFERENCES did_documents (did)
      );

      CREATE INDEX IF NOT EXISTS idx_did_created ON did_documents(created_at);
      CREATE INDEX IF NOT EXISTS idx_key_created ON key_pairs(created_at);
    `);
    }
    async storeDIDDocument(document) {
        const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO did_documents (did, document, created_at, updated_at)
      VALUES (?, ?, ?, ?)
    `);
        stmt.run(document.id, JSON.stringify(document), document.created, document.updated);
    }
    async getDIDDocument(did) {
        const stmt = this.db.prepare('SELECT document FROM did_documents WHERE did = ?');
        const row = stmt.get(did);
        if (!row) {
            return null;
        }
        return JSON.parse(row.document);
    }
    async storeKeyPair(keyPair) {
        const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO key_pairs (did, public_key, private_key, created_at, rotated_at)
      VALUES (?, ?, ?, ?, ?)
    `);
        stmt.run(keyPair.did, keyPair.publicKey, keyPair.privateKey, keyPair.created, keyPair.rotated || null);
    }
    async getKeyPair(did) {
        const stmt = this.db.prepare(`
      SELECT did, public_key, private_key, created_at, rotated_at
      FROM key_pairs WHERE did = ?
    `);
        const row = stmt.get(did);
        if (!row) {
            return null;
        }
        return {
            did: row.did,
            publicKey: row.public_key,
            privateKey: row.private_key,
            created: row.created_at,
            rotated: row.rotated_at,
        };
    }
    async rotateKey(did) {
        const keyPair = await CryptoUtils.generateKeyPair();
        const now = new Date().toISOString();
        const stmt = this.db.prepare(`
      UPDATE key_pairs 
      SET public_key = ?, private_key = ?, rotated_at = ?
      WHERE did = ?
    `);
        stmt.run(keyPair.publicKey, keyPair.privateKey, now, did);
        return keyPair;
    }
    async listDIDs() {
        const stmt = this.db.prepare('SELECT did FROM did_documents ORDER BY created_at DESC');
        const rows = stmt.all();
        return rows.map(row => row.did);
    }
    close() {
        this.db.close();
    }
}
