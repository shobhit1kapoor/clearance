import { describe, expect, it } from "vitest";
import { deterministicIntent } from "@/lib/intent";
import { scenarios } from "@/lib/domain";

describe("deterministic showcase parser", () => {
  it("extracts the approved scenario", () => expect(deterministicIntent(scenarios.approved)).toMatchObject({ vendor: "SecureScan Labs", amountHbar: "1", purpose: "security_scan" }));
  it("preserves unknown counterparties for policy rejection", () => expect(deterministicIntent(scenarios.blocked)).toMatchObject({ vendor: "UnknownVendor", amountHbar: "25" }));
  it("marks production audit context as elevated", () => expect(deterministicIntent(scenarios.escalated)).toMatchObject({ production: true, purpose: "audit_report", amountHbar: "4" }));
});
