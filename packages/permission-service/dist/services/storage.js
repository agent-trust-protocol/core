import Database from 'better-sqlite3';
export class StorageService {
    db;
    constructor(dbPath = ':memory:') {
        this.db = new Database(dbPath);
        this.initTables();
    }
    initTables() {
        this.db.exec(`
      CREATE TABLE IF NOT EXISTS permission_grants (
        id TEXT PRIMARY KEY,
        grantor TEXT NOT NULL,
        grantee TEXT NOT NULL,
        scopes TEXT NOT NULL,
        resource TEXT,
        conditions TEXT,
        expires_at INTEGER,
        created_at INTEGER NOT NULL,
        revoked_at INTEGER
      );

      CREATE TABLE IF NOT EXISTS policy_rules (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        condition TEXT NOT NULL,
        effect TEXT NOT NULL CHECK (effect IN ('allow', 'deny')),
        priority INTEGER NOT NULL,
        active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at INTEGER NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_grants_grantee ON permission_grants(grantee);
      CREATE INDEX IF NOT EXISTS idx_grants_grantor ON permission_grants(grantor);
      CREATE INDEX IF NOT EXISTS idx_grants_expires ON permission_grants(expires_at);
      CREATE INDEX IF NOT EXISTS idx_policy_priority ON policy_rules(priority DESC);
    `);
    }
    async storeGrant(grant) {
        const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO permission_grants 
      (id, grantor, grantee, scopes, resource, conditions, expires_at, created_at, revoked_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
        stmt.run(grant.id, grant.grantor, grant.grantee, JSON.stringify(grant.scopes), grant.resource || null, grant.conditions ? JSON.stringify(grant.conditions) : null, grant.expiresAt || null, grant.createdAt, grant.revokedAt || null);
    }
    async getGrant(grantId) {
        const stmt = this.db.prepare(`
      SELECT id, grantor, grantee, scopes, resource, conditions, expires_at, created_at, revoked_at
      FROM permission_grants WHERE id = ?
    `);
        const row = stmt.get(grantId);
        if (!row) {
            return null;
        }
        return this.rowToGrant(row);
    }
    async getGrantsForSubject(subject) {
        const stmt = this.db.prepare(`
      SELECT id, grantor, grantee, scopes, resource, conditions, expires_at, created_at, revoked_at
      FROM permission_grants WHERE grantee = ? AND revoked_at IS NULL
      ORDER BY created_at DESC
    `);
        const rows = stmt.all(subject);
        return rows.map(row => this.rowToGrant(row));
    }
    async getGrantsByGrantor(grantor) {
        const stmt = this.db.prepare(`
      SELECT id, grantor, grantee, scopes, resource, conditions, expires_at, created_at, revoked_at
      FROM permission_grants WHERE grantor = ?
      ORDER BY created_at DESC
    `);
        const rows = stmt.all(grantor);
        return rows.map(row => this.rowToGrant(row));
    }
    async revokeGrant(grantId) {
        const stmt = this.db.prepare(`
      UPDATE permission_grants SET revoked_at = ? WHERE id = ?
    `);
        stmt.run(Date.now(), grantId);
    }
    async storePolicyRule(rule) {
        const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO policy_rules 
      (id, name, condition, effect, priority, active, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
        stmt.run(rule.id, rule.name, rule.condition, rule.effect, rule.priority, rule.active, Date.now());
    }
    async removePolicyRule(ruleId) {
        const stmt = this.db.prepare('DELETE FROM policy_rules WHERE id = ?');
        stmt.run(ruleId);
    }
    async listPolicyRules() {
        const stmt = this.db.prepare(`
      SELECT id, name, condition, effect, priority, active
      FROM policy_rules ORDER BY priority DESC
    `);
        const rows = stmt.all();
        return rows.map(row => ({
            id: row.id,
            name: row.name,
            condition: row.condition,
            effect: row.effect,
            priority: row.priority,
            active: Boolean(row.active),
        }));
    }
    rowToGrant(row) {
        return {
            id: row.id,
            grantor: row.grantor,
            grantee: row.grantee,
            scopes: JSON.parse(row.scopes),
            resource: row.resource,
            conditions: row.conditions ? JSON.parse(row.conditions) : undefined,
            expiresAt: row.expires_at,
            createdAt: row.created_at,
            revokedAt: row.revoked_at,
        };
    }
    close() {
        this.db.close();
    }
}
