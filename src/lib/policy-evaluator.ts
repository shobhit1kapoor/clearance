import { policyConfig } from "./config";
import { hbarToTinybars, type Decision, type PolicyCheck, type SpendIntent } from "./domain";

export interface EvaluationContext {
  approved: boolean;
  elevatedApproved: boolean;
  spentTodayTinybars: bigint;
}

export function evaluatePolicies(intent: SpendIntent, context: EvaluationContext): { checks: PolicyCheck[]; decision: Decision; elevated: boolean } {
  const amount = hbarToTinybars(intent.amountHbar);
  const vendorAllowed = policyConfig.vendor.aliases.includes(intent.vendor.toLowerCase());
  const elevated = intent.production || intent.purpose === "audit_report";
  const checks: PolicyCheck[] = [
    check("max_spend", "Transaction limit", amount <= policyConfig.maxSpendTinybars, `${intent.amountHbar} HBAR`, "≤ 5 HBAR", "Amount is within the per-transaction limit."),
    check("daily_budget", "Daily budget", context.spentTodayTinybars + amount <= policyConfig.dailyBudgetTinybars, `${Number(context.spentTodayTinybars) / 1e8 + Number(intent.amountHbar)} HBAR projected`, "≤ 20 HBAR", "Projected workspace spend stays within today's budget."),
    check("vendor_allowlist", "Vendor allowlist", vendorAllowed, intent.vendor, policyConfig.vendor.name, vendorAllowed ? "Vendor resolves to the approved account." : "No approved counterparty matches this vendor."),
    check("purpose", "Purpose policy", policyConfig.purposes.has(intent.purpose), intent.purpose.replaceAll("_", " "), "Approved purchase category", "Purpose is evaluated against the workspace allowlist."),
    check("token", "Token policy", intent.token === policyConfig.token, intent.token, "HBAR only", "Only HBAR is enabled for this MVP."),
    {
      key: "risk", label: "Contextual risk", verdict: elevated ? (context.elevatedApproved ? "PASS" : "REVIEW") : "PASS",
      stage: "post-normalization", observed: elevated ? "Production or sensitive audit" : "Standard scope", expected: elevated ? "Elevated confirmation" : "Standard approval",
      reason: elevated ? "Sensitive context requires a typed, amount-bound confirmation." : "No elevated risk signal detected.", hard: false
    },
    {
      key: "human_approval", label: "Human approval", verdict: context.approved && (!elevated || context.elevatedApproved) ? "PASS" : "REVIEW",
      stage: "post-normalization", observed: context.approved ? "Approval present" : "Awaiting explicit approval", expected: elevated ? "Elevated approval" : "Explicit approval",
      reason: "Signing authority is never exposed to the model.", hard: false
    }
  ];
  const hardFailure = checks.some(item => item.hard && item.verdict === "FAIL");
  const approvalMissing = !context.approved || (elevated && !context.elevatedApproved);
  return { checks, elevated, decision: hardFailure ? "BLOCKED" : approvalMissing ? "REQUIRES_APPROVAL" : "APPROVED" };
}

function check(key: string, label: string, pass: boolean, observed: string, expected: string, reason: string): PolicyCheck {
  return { key, label, verdict: pass ? "PASS" : "FAIL", stage: "post-normalization", observed, expected, reason, hard: true };
}
