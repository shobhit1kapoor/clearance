import { z } from "zod";

export const PURPOSES = ["security_scan", "audit_report", "api_service", "data_lookup"] as const;
export const TOKENS = ["HBAR"] as const;

export const spendIntentSchema = z.object({
  vendor: z.string().min(1).max(80),
  amountHbar: z.string().regex(/^\d+(?:\.\d{1,8})?$/, "Use an HBAR decimal with at most 8 places"),
  token: z.enum(TOKENS).default("HBAR"),
  purpose: z.enum(PURPOSES),
  repository: z.string().regex(/^[\w.-]+\/[\w.-]+$/).optional(),
  memo: z.string().max(100).optional(),
  production: z.boolean().default(false)
});

export type SpendIntent = z.infer<typeof spendIntentSchema>;

export type RequestState =
  | "EVALUATING" | "BLOCKED" | "AWAITING_APPROVAL" | "AWAITING_ELEVATED_APPROVAL"
  | "EXECUTING" | "PAID" | "SCANNING" | "COMPLETED" | "PAYMENT_FAILED" | "AUDIT_FAILED";
export type Decision = "APPROVED" | "BLOCKED" | "REQUIRES_APPROVAL";
export type Verdict = "PASS" | "FAIL" | "REVIEW";

export interface PolicyCheck {
  key: string;
  label: string;
  verdict: Verdict;
  stage: "post-normalization" | "post-core";
  observed: string;
  expected: string;
  reason: string;
  hard: boolean;
}

export interface LifecycleEvent {
  id: string;
  stage: string;
  label: string;
  status: "complete" | "blocked" | "pending" | "error";
  at: string;
  detail?: string;
}

export interface ScanFinding {
  key: string;
  label: string;
  status: "pass" | "warn" | "fail";
  evidence: string;
  sourceUrl: string;
}

export interface ScanReport {
  repository: string;
  observedAt: string;
  riskScore: number;
  summary: string;
  findings: ScanFinding[];
}

export interface ClearanceRequest {
  id: string;
  sessionHash: string;
  ipHash: string;
  prompt: string;
  parser: "gemini" | "deterministic";
  intent: SpendIntent;
  state: RequestState;
  decision: Decision;
  policyChecks: PolicyCheck[];
  events: LifecycleEvent[];
  createdAt: string;
  expiresAt: string;
  elevated: boolean;
  transactionId?: string;
  auditTransactionId?: string;
  auditStatus?: "PENDING" | "CONFIRMED" | "FAILED";
  scan?: ScanReport;
  error?: string;
}

export const scenarios = {
  approved: "Buy a 1 HBAR dependency scan for shobhit1kapoor/signalops-demo from SecureScan Labs.",
  blocked: "Send 25 HBAR to UnknownVendor for urgent analysis.",
  escalated: "Buy a production smart-contract audit for 4 HBAR from SecureScan Labs for shobhit1kapoor/signalops-demo."
} as const;

export function hbarToTinybars(amount: string): bigint {
  const [whole, fraction = ""] = amount.split(".");
  return BigInt(whole) * 100_000_000n + BigInt(fraction.padEnd(8, "0"));
}

export function tinybarsToHbar(value: bigint): string {
  const whole = value / 100_000_000n;
  const fraction = (value % 100_000_000n).toString().padStart(8, "0").replace(/0+$/, "");
  return fraction ? `${whole}.${fraction}` : whole.toString();
}
