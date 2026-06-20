import { describe, expect, it } from "vitest";
import { Client } from "@hiero-ledger/sdk";
import { ClearancePaymentTool, createContext } from "@/lib/hedera/clearance-tool";
import { scenarios } from "@/lib/domain";
import { deterministicIntent } from "@/lib/intent";

class ObservedTool extends ClearancePaymentTool {
  coreCalls = 0;
  secondaryCalls = 0;
  async coreAction(params: Parameters<ClearancePaymentTool["coreAction"]>[0], context: Parameters<ClearancePaymentTool["coreAction"]>[1]) {
    this.coreCalls++;
    return super.coreAction(params, context);
  }
  async secondaryAction(..._args: Parameters<ClearancePaymentTool["secondaryAction"]>): Promise<any> {
    this.secondaryCalls++;
    return { raw: { transactionId: "test-transaction" }, humanMessage: "test" };
  }
}

describe("BaseTool enforcement boundary", () => {
  it("never reaches coreAction when human approval is absent", async () => {
    const tool = new ObservedTool();
    const checks: any[] = []; const trace: any[] = [];
    const client = Client.forTestnet();
    const result = await tool.execute(client, createContext({ requestId: "req-test", approved: false, elevatedApproved: false, spentTodayTinybars: 0n, sourceAccountId: "0.0.1001", policyChecks: checks, trace: e => { trace.push(e); } }), deterministicIntent(scenarios.approved));
    expect(tool.coreCalls).toBe(0);
    expect(tool.secondaryCalls).toBe(0);
    expect((result as any).raw.error).toContain("Human approval policy");
    expect(trace.map(e => e.stage)).toEqual(expect.arrayContaining(["pre-tool", "post-normalization"]));
    client.close();
  });

  it("never reaches coreAction when hard policies reject the request", async () => {
    const tool = new ObservedTool(); const client = Client.forTestnet();
    const result = await tool.execute(client, createContext({ requestId: "req-block", approved: true, elevatedApproved: true, spentTodayTinybars: 0n, sourceAccountId: "0.0.1001", policyChecks: [], trace: () => {} }), deterministicIntent(scenarios.blocked));
    expect(tool.coreCalls).toBe(0);
    expect(tool.secondaryCalls).toBe(0);
    expect((result as any).raw.error).toContain("Max spend policy");
    client.close();
  });
});
