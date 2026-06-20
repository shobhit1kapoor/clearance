import { describe, expect, it } from "vitest";
import { evaluatePolicies } from "@/lib/policy-evaluator";
import type { SpendIntent } from "@/lib/domain";

const base: SpendIntent = { vendor: "SecureScan Labs", amountHbar: "1", token: "HBAR", purpose: "security_scan", repository: "shobhit1kapoor/signalops-demo", production: false };

describe("policy evaluator", () => {
  it("requires human approval for an otherwise valid purchase", () => {
    const result = evaluatePolicies(base, { approved: false, elevatedApproved: false, spentTodayTinybars: 0n });
    expect(result.decision).toBe("REQUIRES_APPROVAL");
    expect(result.checks).toHaveLength(7);
    expect(result.checks.find(c => c.key === "human_approval")?.verdict).toBe("REVIEW");
  });

  it("approves exactly the 5 HBAR boundary after authorization", () => {
    const result = evaluatePolicies({ ...base, amountHbar: "5" }, { approved: true, elevatedApproved: false, spentTodayTinybars: 0n });
    expect(result.decision).toBe("APPROVED");
  });

  it("blocks an amount above the maximum and an unknown vendor", () => {
    const result = evaluatePolicies({ ...base, vendor: "UnknownVendor", amountHbar: "25" }, { approved: false, elevatedApproved: false, spentTodayTinybars: 0n });
    expect(result.decision).toBe("BLOCKED");
    expect(result.checks.filter(c => c.verdict === "FAIL").map(c => c.key)).toEqual(expect.arrayContaining(["max_spend", "daily_budget", "vendor_allowlist"]));
  });

  it("requires elevated confirmation for production context", () => {
    const waiting = evaluatePolicies({ ...base, amountHbar: "4", purpose: "audit_report", production: true }, { approved: true, elevatedApproved: false, spentTodayTinybars: 0n });
    expect(waiting.decision).toBe("REQUIRES_APPROVAL");
    const approved = evaluatePolicies({ ...base, amountHbar: "4", purpose: "audit_report", production: true }, { approved: true, elevatedApproved: true, spentTodayTinybars: 0n });
    expect(approved.decision).toBe("APPROVED");
  });

  it("blocks a projected daily budget overage", () => {
    const result = evaluatePolicies(base, { approved: true, elevatedApproved: false, spentTodayTinybars: 1_950_000_000n });
    expect(result.decision).toBe("BLOCKED");
    expect(result.checks.find(c => c.key === "daily_budget")?.verdict).toBe("FAIL");
  });
});
