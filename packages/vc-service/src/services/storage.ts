import Database from 'better-sqlite3';
import { VerifiableCredential, CredentialSchema } from '../models/credential.js';

export class StorageService {
  private db: Database.Database;

  constructor(dbPath: string = ':memory:') {
    this.db = new Database(dbPath);
    this.initTables();
  }

  private initTables(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS credentials (
        id TEXT PRIMARY KEY,
        credential TEXT NOT NULL,
        issuer TEXT NOT NULL,
        subject TEXT NOT NULL,
        type TEXT NOT NULL,
        created_at TEXT NOT NULL,
        expires_at TEXT,
        revoked BOOLEAN DEFAULT FALSE
      );

      CREATE TABLE IF NOT EXISTS schemas (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        schema TEXT NOT NULL,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS revocation_list (
        credential_id TEXT PRIMARY KEY,
        revoked_at TEXT NOT NULL,
        reason TEXT,
        FOREIGN KEY (credential_id) REFERENCES credentials (id)
      );

      CREATE INDEX IF NOT EXISTS idx_credentials_issuer ON credentials(issuer);
      CREATE INDEX IF NOT EXISTS idx_credentials_subject ON credentials(subject);
      CREATE INDEX IF NOT EXISTS idx_credentials_type ON credentials(type);
      CREATE INDEX IF NOT EXISTS idx_schemas_name ON schemas(name);
    `);
  }

  async storeCredential(credential: VerifiableCredential): Promise<void> {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO credentials 
      (id, credential, issuer, subject, type, created_at, expires_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    const issuer = typeof credential.issuer === 'string' ? credential.issuer : credential.issuer.id;
    const type = credential.type.find(t => t !== 'VerifiableCredential') || 'VerifiableCredential';
    
    stmt.run(
      credential.id,
      JSON.stringify(credential),
      issuer,
      credential.credentialSubject.id || '',
      type,
      credential.issuanceDate,
      credential.expirationDate || null
    );
  }

  async getCredential(credentialId: string): Promise<VerifiableCredential | null> {
    const stmt = this.db.prepare('SELECT credential FROM credentials WHERE id = ?');
    const row = stmt.get(credentialId) as { credential: string } | undefined;
    
    if (!row) {
      return null;
    }
    
    return JSON.parse(row.credential) as VerifiableCredential;
  }

  async revokeCredential(credentialId: string): Promise<void> {
    const transaction = this.db.transaction(() => {
      const updateStmt = this.db.prepare('UPDATE credentials SET revoked = TRUE WHERE id = ?');
      updateStmt.run(credentialId);
      
      const insertStmt = this.db.prepare(`
        INSERT OR REPLACE INTO revocation_list (credential_id, revoked_at)
        VALUES (?, ?)
      `);
      insertStmt.run(credentialId, new Date().toISOString());
    });
    
    transaction();
  }

  async isCredentialRevoked(credentialId: string): Promise<boolean> {
    const stmt = this.db.prepare('SELECT 1 FROM revocation_list WHERE credential_id = ?');
    return !!stmt.get(credentialId);
  }

  async storeSchema(schema: CredentialSchema): Promise<void> {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO schemas (id, name, schema, created_at)
      VALUES (?, ?, ?, ?)
    `);
    
    stmt.run(
      schema.id,
      schema.name,
      JSON.stringify(schema),
      new Date().toISOString()
    );
  }

  async getSchema(schemaId: string): Promise<CredentialSchema | null> {
    const stmt = this.db.prepare('SELECT schema FROM schemas WHERE id = ?');
    const row = stmt.get(schemaId) as { schema: string } | undefined;
    
    if (!row) {
      return null;
    }
    
    return JSON.parse(row.schema) as CredentialSchema;
  }

  async getSchemaByName(name: string): Promise<CredentialSchema | null> {
    const stmt = this.db.prepare('SELECT schema FROM schemas WHERE name = ?');
    const row = stmt.get(name) as { schema: string } | undefined;
    
    if (!row) {
      return null;
    }
    
    return JSON.parse(row.schema) as CredentialSchema;
  }

  async listSchemas(): Promise<CredentialSchema[]> {
    const stmt = this.db.prepare('SELECT schema FROM schemas ORDER BY created_at DESC');
    const rows = stmt.all() as { schema: string }[];
    return rows.map(row => JSON.parse(row.schema) as CredentialSchema);
  }

  close(): void {
    this.db.close();
  }
}