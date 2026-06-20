import { randomUUID } from "node:crypto";
import { isHederaConfigured, policyConfig } from "./config";
import { type ClearanceRequest, type LifecycleEvent } from "./domain";
import { parseIntent } from "./intent";
import { evaluatePolicies } from "./policy-evaluator";
import { event } from "./security";
import { store } from "./store";
import { createContext, createHederaClient, executeWithAgentToolkit } from "./hedera/clearance-tool";
import { scanRepository } from "./github-scan";
import { publishDecisionAudit } from "./audit";

export async function createRequest(prompt: string, sessionHash: string, ipHash: string) {
  const parsed = await parseIntent(prompt);
  const spentTodayTinybars = await store.spentToday();
  const evaluation = evaluatePolicies(parsed.intent, { approved: false, elevatedApproved: false, spentTodayTinybars });
  const now = new Date();
  const request: ClearanceRequest = {
    id: randomUUID(), sessionHash, ipHash, prompt, parser: parsed.parser, intent: parsed.intent,
    decision: evaluation.decision, policyChecks: [], elevated: evaluation.elevated,
    state: evaluation.decision === "BLOCKED" ? "BLOCKED" : evaluation.elevated ? "AWAITING_ELEVATED_APPROVAL" : "AWAITING_APPROVAL",
    createdAt: now.toISOString(), expiresAt: new Date(now.getTime() + 15 * 60_000).toISOString(),
    events: [event("intent", "Intent detected", "complete", `${parsed.parser === "gemini" ? "Gemini" : "Deterministic fallback"} produced a validated purchase intent.`), event("normalization", "Parameters normalized", "complete")]
  };
  const traces: LifecycleEvent[] = [];
  const client = createHederaClient();
  try {
    await executeWithAgentToolkit(client, createContext({
      requestId: request.id, approved: false, elevatedApproved: false, spentTodayTinybars,
      sourceAccountId: process.env.HEDERA_OPERATOR_ID || "0.0.1001", policyChecks: request.policyChecks,
      trace: entry => { traces.push(event(entry.stage, entry.label, entry.status, entry.detail)); }
    }), parsed.intent);
  } finally { client.close(); }
  request.events.push(...traces);
  request.policyChecks = evaluation.checks;
  request.events.push(event("decision", evaluation.decision === "BLOCKED" ? "Blocked before transaction creation" : evaluation.elevated ? "Elevated approval required" : "Human approval required", evaluation.decision === "BLOCKED" ? "blocked" : "pending"));
  await store.save(request);
  if (request.state === "BLOCKED" && isHederaConfigured() && process.env.HEDERA_HCS_TOPIC_ID) {
    try { request.auditTransactionId = await publishDecisionAudit(request); request.auditStatus = "CONFIRMED"; }
    catch { request.auditStatus = "FAILED"; }
    await store.save(request);
  }
  return request;
}

export async function approveRequest(id: string, sessionHash: string, confirmation?: string) {
  const preview = await store.get(id);
  if (!preview || preview.sessionHash !== sessionHash || !["AWAITING_APPROVAL", "AWAITING_ELEVATED_APPROVAL"].includes(preview.state)) throw new Error("Request is missing, belongs to another session, or was already executed");
  if (new Date(preview.expiresAt) < new Date()) throw new Error("Approval window expired");
  if (preview.elevated && confirmation?.trim() !== `APPROVE ${preview.intent.amountHbar} HBAR`) throw new Error(`Type APPROVE ${preview.intent.amountHbar} HBAR to authorize this elevated request`);
  if ((await store.successfulCountForIp(preview.ipHash)) >= 2) throw new Error("Public demo limit reached for today");
  const claimed = await store.claimForExecution(id, sessionHash);
  if (!claimed) throw new Error("This request was already claimed for execution");
  const request = claimed.request;
  const evaluation = evaluatePolicies(request.intent, { approved: true, elevatedApproved: request.elevated, spentTodayTinybars: claimed.spentTodayTinybars });
  request.policyChecks = evaluation.checks;
  if (evaluation.decision !== "APPROVED") { request.state = "BLOCKED"; request.decision = evaluation.decision; await store.save(request); return request; }
  if (!isHederaConfigured()) { request.state = "PAYMENT_FAILED"; request.error = "Live Hedera credentials are not configured. Policy enforcement completed; no transaction was created."; request.events.push(event("execution", "Payment unavailable", "error", request.error)); await store.save(request); return request; }
  request.events.push(event("approval", request.elevated ? "Elevated approval granted" : "Human approval granted", "complete"));
  const traces: LifecycleEvent[] = [];
  const client = createHederaClient();
  try {
    const result = await executeWithAgentToolkit(client, createContext({
      requestId: request.id, approved: true, elevatedApproved: request.elevated, spentTodayTinybars: claimed.spentTodayTinybars,
      sourceAccountId: process.env.HEDERA_OPERATOR_ID!, policyChecks: request.policyChecks,
      trace: entry => { traces.push(event(entry.stage, entry.label, entry.status, entry.detail)); }
    }), request.intent) as { raw?: { transactionId?: string; error?: string } };
    request.events.push(...traces);
    if (result.raw?.error || !result.raw?.transactionId) throw new Error(result.raw?.error || "Hedera did not return a transaction ID");
    request.transactionId = result.raw.transactionId;
    request.state = "PAID"; request.decision = "APPROVED";
    request.events.push(event("receipt", "Hedera receipt confirmed", "complete", request.transactionId));
    await store.save(request);
    request.state = "SCANNING"; await store.save(request);
    request.scan = await scanRepository(request.intent.repository || "shobhit1kapoor/signalops-demo");
    request.state = "COMPLETED"; request.events.push(event("service", "Security assessment delivered", "complete", "Live GitHub evidence collected after payment."));
  } catch (error) {
    request.state = "PAYMENT_FAILED"; request.error = error instanceof Error ? error.message : "Payment failed";
    request.events.push(event("execution", "Payment failed", "error", request.error));
  } finally { client.close(); }
  await store.save(request);
  return request;
}

export async function retryAudit(id: string, sessionHash: string) {
  const request = await store.get(id);
  if (!request || request.sessionHash !== sessionHash) throw new Error("Request not found");
  request.auditStatus = "PENDING"; await store.save(request);
  try { request.auditTransactionId = await publishDecisionAudit(request); request.auditStatus = "CONFIRMED"; }
  catch (error) { request.auditStatus = "FAILED"; request.error = error instanceof Error ? error.message : "Audit failed"; }
  await store.save(request); return request;
}
