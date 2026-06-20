import { z } from "zod";
import {
  AbstractHook,
  AbstractPolicy,
  AgentMode,
  BaseTool,
  handleTransaction,
  transactionToolOutputParser,
  type Context,
  type Plugin,
  type PostCoreActionParams,
  type PostParamsNormalizationParams,
  type PostSecondaryActionParams,
  type PreToolExecutionParams
} from "@hashgraph/hedera-agent-kit";
import { HcsAuditTrailHook } from "@hashgraph/hedera-agent-kit/hooks";
import { HederaAIToolkit } from "@hashgraph/hedera-agent-kit-ai-sdk";
import { AccountId, Client, Hbar, PrivateKey, TransferTransaction } from "@hiero-ledger/sdk";
import { policyConfig } from "../config";
import { evaluatePolicies } from "../policy-evaluator";
import { canonicalHash } from "../security";
import { hbarToTinybars, spendIntentSchema, type LifecycleEvent, type PolicyCheck, type SpendIntent } from "../domain";

export const CLEARANCE_TOOL = "clearance_purchase_service";

export type SpendToolParams = SpendIntent;
export interface NormalizedSpendParams extends SpendIntent {
  vendorId: string | null;
  vendorAccountId: string | null;
  amountTinybars: bigint;
  requestHash: string;
}

export interface ClearanceRuntime {
  requestId: string;
  approved: boolean;
  elevatedApproved: boolean;
  spentTodayTinybars: bigint;
  sourceAccountId: string;
  policyChecks: PolicyCheck[];
  trace: (event: Omit<LifecycleEvent, "id" | "at">) => void | Promise<void>;
}

export type ClearanceContext = Context & { clearance: ClearanceRuntime };
const transactionIntent = new WeakMap<object, NormalizedSpendParams>();

function runtime(params: { context: Context }): ClearanceRuntime {
  const value = (params.context as ClearanceContext).clearance;
  if (!value?.requestId) throw new Error("Clearance trusted request context is required");
  return value;
}

export class PolicyDecisionTraceHook extends AbstractHook {
  name = "Clearance policy decision trace";
  description = "Records every deterministic policy verdict before blocking policies run.";
  relevantTools = [CLEARANCE_TOOL];

  async preToolExecutionHook(params: PreToolExecutionParams, method: string) {
    if (!this.relevantTools.includes(method)) return;
    await runtime(params).trace({ stage: "pre-tool", label: "Intent captured", status: "complete", detail: "Trusted request context attached; model has no signing authority." });
  }

  async postParamsNormalizationHook(params: PostParamsNormalizationParams, method: string) {
    if (!this.relevantTools.includes(method)) return;
    const rt = runtime(params);
    const normalized = params.normalisedParams as NormalizedSpendParams;
    const evaluation = evaluatePolicies(normalized, rt);
    rt.policyChecks.splice(0, rt.policyChecks.length, ...evaluation.checks);
    await rt.trace({ stage: "post-normalization", label: "Policies evaluated", status: evaluation.decision === "BLOCKED" ? "blocked" : "complete", detail: `${evaluation.checks.length} runtime controls evaluated.` });
  }

  async postCoreActionHook(params: PostCoreActionParams, method: string) {
    if (!this.relevantTools.includes(method)) return;
    await runtime(params).trace({ stage: "post-core", label: "Transaction prepared", status: "complete", detail: "Unsigned transaction matches the approved intent." });
  }

  async postToolExecutionHook(params: PostSecondaryActionParams, method: string) {
    if (!this.relevantTools.includes(method)) return;
    await runtime(params).trace({ stage: "post-tool", label: "Payment submitted", status: "complete", detail: "Hedera returned a transaction receipt." });
  }
}

abstract class ClearancePolicy extends AbstractPolicy {
  relevantTools = [CLEARANCE_TOOL];
  abstract name: string;
  abstract description: string;
  protected normalized(params: PostParamsNormalizationParams) { return params.normalisedParams as NormalizedSpendParams; }
}

export class MaxSpendPolicy extends ClearancePolicy {
  name = "Max spend policy"; description = "Blocks purchases above 5 HBAR.";
  protected shouldBlockPostParamsNormalization(params: PostParamsNormalizationParams) { return this.normalized(params).amountTinybars > policyConfig.maxSpendTinybars; }
}
export class DailyBudgetPolicy extends ClearancePolicy {
  name = "Daily budget policy"; description = "Blocks projected daily spend above 20 HBAR.";
  protected shouldBlockPostParamsNormalization(params: PostParamsNormalizationParams) { const rt = runtime(params); return rt.spentTodayTinybars + this.normalized(params).amountTinybars > policyConfig.dailyBudgetTinybars; }
}
export class VendorAllowlistPolicy extends ClearancePolicy {
  name = "Vendor allowlist policy"; description = "Only approved counterparties can receive funds.";
  protected shouldBlockPostParamsNormalization(params: PostParamsNormalizationParams) { return !this.normalized(params).vendorAccountId; }
}
export class PurposePolicy extends ClearancePolicy {
  name = "Purpose policy"; description = "Only approved service categories can be purchased.";
  protected shouldBlockPostParamsNormalization(params: PostParamsNormalizationParams) { return !policyConfig.purposes.has(this.normalized(params).purpose); }
}
export class TokenPolicy extends ClearancePolicy {
  name = "Token policy"; description = "HBAR is the only enabled settlement token.";
  protected shouldBlockPostParamsNormalization(params: PostParamsNormalizationParams) { return this.normalized(params).token !== "HBAR"; }
}
export class RiskPolicy extends ClearancePolicy {
  name = "Contextual risk policy"; description = "Production and audit requests require elevated confirmation.";
  protected shouldBlockPostParamsNormalization(params: PostParamsNormalizationParams) { const n = this.normalized(params); return (n.production || n.purpose === "audit_report") && !runtime(params).elevatedApproved; }
}
export class HumanApprovalPolicy extends ClearancePolicy {
  name = "Human approval policy"; description = "Every transfer requires explicit prior human authorization.";
  protected shouldBlockPostParamsNormalization(params: PostParamsNormalizationParams) { return !runtime(params).approved; }
}
export class TransactionIntegrityPolicy extends ClearancePolicy {
  name = "Transaction integrity policy"; description = "Constructed payment must match the approved intent.";
  protected shouldBlockPostCoreAction(params: PostCoreActionParams) {
    const expected = params.normalisedParams as NormalizedSpendParams;
    const actual = transactionIntent.get(params.coreActionResult as object);
    return !actual || actual.requestHash !== expected.requestHash || actual.vendorAccountId !== expected.vendorAccountId || actual.amountTinybars !== expected.amountTinybars;
  }
}

export class ClearancePaymentTool extends BaseTool<SpendToolParams, NormalizedSpendParams> {
  method = CLEARANCE_TOOL;
  name = "Purchase approved service with HBAR";
  description = "Requests an HBAR payment for a security scan, audit report, API service, or data lookup. Clearance policies always enforce counterparty, amount, purpose, risk, budget, and explicit human approval before transaction construction.";
  parameters = spendIntentSchema;
  outputParser = transactionToolOutputParser;

  async normalizeParams(params: SpendToolParams, context: Context) {
    runtime({ context });
    const intent = spendIntentSchema.parse(params);
    const allowed = policyConfig.vendor.aliases.includes(intent.vendor.toLowerCase());
    const normalized = {
      ...intent,
      vendorId: allowed ? policyConfig.vendor.id : null,
      vendorAccountId: allowed ? policyConfig.vendor.accountId : null,
      amountTinybars: hbarToTinybars(intent.amountHbar),
      requestHash: canonicalHash({ ...intent, vendorAccountId: allowed ? policyConfig.vendor.accountId : null })
    } satisfies NormalizedSpendParams;
    return normalized;
  }

  async coreAction(params: NormalizedSpendParams, context: Context) {
    if (!params.vendorAccountId) throw new Error("Approved vendor account is required");
    const rt = runtime({ context });
    const tx = new TransferTransaction()
      .addHbarTransfer(AccountId.fromString(rt.sourceAccountId), Hbar.fromTinybars(-Number(params.amountTinybars)))
      .addHbarTransfer(AccountId.fromString(params.vendorAccountId), Hbar.fromTinybars(Number(params.amountTinybars)))
      .setTransactionMemo((params.memo || `Clearance ${rt.requestId}`).slice(0, 100));
    transactionIntent.set(tx, params);
    return tx;
  }

  async secondaryAction(transaction: TransferTransaction, client: Client, context: Context) {
    return handleTransaction(transaction, client, context);
  }

  async handleError(error: unknown, context: Context) {
    const rt = (context as ClearanceContext).clearance;
    const message = error instanceof Error ? error.message : "Unknown policy enforcement error";
    return { raw: { error: message, requestId: rt?.requestId, policyChecks: rt?.policyChecks ?? [] }, humanMessage: message };
  }
}

export const clearancePlugin: Plugin = {
  name: "clearance-policy-payments",
  version: "1.0.0",
  description: "A least-privilege HBAR purchase tool protected by finance-grade runtime policies.",
  tools: () => [new ClearancePaymentTool()]
};

export function createHederaClient() {
  const id = process.env.HEDERA_OPERATOR_ID;
  const key = process.env.HEDERA_OPERATOR_PRIVATE_KEY;
  const client = Client.forTestnet();
  if (id && key) client.setOperator(id, PrivateKey.fromString(key));
  return client;
}

export function createHooks(includeHcs = true): AbstractHook[] {
  const hooks: AbstractHook[] = [
    new PolicyDecisionTraceHook(),
    new MaxSpendPolicy(), new DailyBudgetPolicy(), new VendorAllowlistPolicy(), new PurposePolicy(),
    new TokenPolicy(), new RiskPolicy(), new HumanApprovalPolicy(), new TransactionIntegrityPolicy()
  ];
  if (includeHcs && process.env.HEDERA_HCS_TOPIC_ID) hooks.push(new HcsAuditTrailHook([CLEARANCE_TOOL], process.env.HEDERA_HCS_TOPIC_ID));
  return hooks;
}

export function createContext(clearance: ClearanceRuntime): ClearanceContext {
  return { mode: AgentMode.AUTONOMOUS, accountId: clearance.sourceAccountId, hooks: createHooks(clearance.approved), clearance };
}

export async function executeWithAgentToolkit(client: Client, context: ClearanceContext, intent: SpendToolParams) {
  const toolkit = new HederaAIToolkit({
    client,
    configuration: { plugins: [clearancePlugin], tools: [CLEARANCE_TOOL], context }
  });
  const tool = toolkit.getTools()[CLEARANCE_TOOL] as { execute?: (input: SpendToolParams, options: unknown) => Promise<unknown> };
  if (!tool?.execute) throw new Error("Clearance plugin tool was not registered with HederaAIToolkit");
  return tool.execute(intent, { toolCallId: `clearance-${context.clearance.requestId}`, messages: [] });
}
