import { Pool, type PoolClient } from "pg";
import type { ClearanceRequest } from "./domain";

export interface RequestStore {
  save(request: ClearanceRequest): Promise<void>;
  get(id: string): Promise<ClearanceRequest | null>;
  claimForExecution(id: string, sessionHash: string): Promise<{ request: ClearanceRequest; spentTodayTinybars: bigint } | null>;
  spentToday(): Promise<bigint>;
  successfulCountForIp(ipHash: string): Promise<number>;
}

const memory = new Map<string, ClearanceRequest>();

class MemoryStore implements RequestStore {
  async save(request: ClearanceRequest) { memory.set(request.id, structuredClone(request)); }
  async get(id: string) { const value = memory.get(id); return value ? structuredClone(value) : null; }
  async spentToday() {
    const today = new Date().toISOString().slice(0, 10);
    return [...memory.values()].filter(r => r.createdAt.startsWith(today) && ["EXECUTING", "PAID", "SCANNING", "COMPLETED", "AUDIT_FAILED"].includes(r.state))
      .reduce((sum, r) => sum + toTinybars(r.intent.amountHbar), 0n);
  }
  async successfulCountForIp(ipHash: string) {
    const today = new Date().toISOString().slice(0, 10);
    return [...memory.values()].filter(r => r.ipHash === ipHash && r.createdAt.startsWith(today) && ["PAID", "SCANNING", "COMPLETED", "AUDIT_FAILED"].includes(r.state)).length;
  }
  async claimForExecution(id: string, sessionHash: string) {
    const request = memory.get(id);
    if (!request || request.sessionHash !== sessionHash || !["AWAITING_APPROVAL", "AWAITING_ELEVATED_APPROVAL"].includes(request.state)) return null;
    const spentTodayTinybars = await this.spentToday();
    request.state = "EXECUTING";
    memory.set(id, request);
    return { request: structuredClone(request), spentTodayTinybars };
  }
}

class PostgresStore implements RequestStore {
  private pool: Pool;
  private ready: Promise<void>;
  constructor(url: string) {
    this.pool = new Pool({ connectionString: url, ssl: url.includes("localhost") ? undefined : { rejectUnauthorized: true }, max: 4 });
    this.ready = this.bootstrap();
  }
  private async bootstrap() {
    await this.pool.query(`CREATE TABLE IF NOT EXISTS clearance_requests (
      id uuid PRIMARY KEY,
      session_hash text NOT NULL,
      ip_hash text NOT NULL,
      state text NOT NULL,
      amount_tinybars numeric(30,0) NOT NULL,
      created_at timestamptz NOT NULL,
      payload jsonb NOT NULL
    ); CREATE INDEX IF NOT EXISTS clearance_requests_created_idx ON clearance_requests(created_at);
       CREATE INDEX IF NOT EXISTS clearance_requests_ip_idx ON clearance_requests(ip_hash, created_at);`);
  }
  async save(request: ClearanceRequest) {
    await this.ready;
    await this.pool.query(`INSERT INTO clearance_requests(id,session_hash,ip_hash,state,amount_tinybars,created_at,payload)
      VALUES($1,$2,$3,$4,$5,$6,$7) ON CONFLICT(id) DO UPDATE SET state=excluded.state,payload=excluded.payload`,
      [request.id, request.sessionHash, request.ipHash, request.state, toTinybars(request.intent.amountHbar).toString(), request.createdAt, request]);
  }
  async get(id: string) {
    await this.ready;
    const result = await this.pool.query("SELECT payload FROM clearance_requests WHERE id=$1", [id]);
    return (result.rows[0]?.payload as ClearanceRequest | undefined) ?? null;
  }
  private async sum(client: PoolClient) {
    const result = await client.query(`SELECT COALESCE(SUM(amount_tinybars),0)::text AS total FROM clearance_requests
      WHERE created_at >= date_trunc('day', now()) AND state IN ('EXECUTING','PAID','SCANNING','COMPLETED','AUDIT_FAILED')`);
    return BigInt(result.rows[0].total);
  }
  async spentToday() { await this.ready; const client = await this.pool.connect(); try { return await this.sum(client); } finally { client.release(); } }
  async successfulCountForIp(ipHash: string) {
    await this.ready;
    const result = await this.pool.query(`SELECT COUNT(*)::int AS count FROM clearance_requests WHERE ip_hash=$1 AND created_at >= date_trunc('day',now()) AND state IN ('PAID','SCANNING','COMPLETED','AUDIT_FAILED')`, [ipHash]);
    return result.rows[0].count;
  }
  async claimForExecution(id: string, sessionHash: string) {
    await this.ready;
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      await client.query("SELECT pg_advisory_xact_lock(11223344)");
      const row = await client.query("SELECT payload,state FROM clearance_requests WHERE id=$1 AND session_hash=$2 FOR UPDATE", [id, sessionHash]);
      if (!row.rows[0] || !["AWAITING_APPROVAL", "AWAITING_ELEVATED_APPROVAL"].includes(row.rows[0].state)) { await client.query("ROLLBACK"); return null; }
      const spentTodayTinybars = await this.sum(client);
      const request = row.rows[0].payload as ClearanceRequest;
      request.state = "EXECUTING";
      await client.query("UPDATE clearance_requests SET state='EXECUTING',payload=$2 WHERE id=$1", [id, request]);
      await client.query("COMMIT");
      return { request, spentTodayTinybars };
    } catch (error) { await client.query("ROLLBACK"); throw error; } finally { client.release(); }
  }
}

function toTinybars(amount: string) {
  const [whole, fraction = ""] = amount.split(".");
  return BigInt(whole) * 100_000_000n + BigInt(fraction.padEnd(8, "0"));
}

const globalStore = globalThis as typeof globalThis & { __clearanceStore?: RequestStore };
export const store = globalStore.__clearanceStore ?? (process.env.DATABASE_URL ? new PostgresStore(process.env.DATABASE_URL) : new MemoryStore());
globalStore.__clearanceStore = store;
