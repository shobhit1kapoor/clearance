import { createHash, createHmac, randomUUID } from "node:crypto";

export function opaqueHash(value: string) {
  const secret = process.env.SESSION_SECRET || "local-development-only-clearance-secret";
  return createHmac("sha256", secret).update(value).digest("hex");
}

export function canonicalHash(value: unknown) {
  return createHash("sha256").update(stableStringify(value)).digest("hex");
}

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  const object = value as Record<string, unknown>;
  return `{${Object.keys(object).sort().map(key => `${JSON.stringify(key)}:${stableStringify(object[key])}`).join(",")}}`;
}

export function event(stage: string, label: string, status: "complete" | "blocked" | "pending" | "error", detail?: string) {
  return { id: randomUUID(), stage, label, status, at: new Date().toISOString(), detail };
}

export function hashscanTransaction(transactionId?: string) {
  if (!transactionId) return undefined;
  return `https://hashscan.io/testnet/transaction/${encodeURIComponent(transactionId)}`;
}
