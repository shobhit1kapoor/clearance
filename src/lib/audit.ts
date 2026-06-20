import { TopicMessageSubmitTransaction } from "@hiero-ledger/sdk";
import { createHederaClient } from "./hedera/clearance-tool";
import { canonicalHash } from "./security";
import type { ClearanceRequest } from "./domain";

export async function publishDecisionAudit(request: ClearanceRequest) {
  const topicId = process.env.HEDERA_HCS_TOPIC_ID;
  if (!topicId || !process.env.HEDERA_OPERATOR_PRIVATE_KEY) throw new Error("HCS audit credentials are not configured");
  const client = createHederaClient();
  try {
    const payload = {
      v: 1,
      type: "clearance.policy.decision",
      requestId: request.id,
      decision: request.decision,
      intentHash: canonicalHash(request.intent),
      policyHash: canonicalHash(request.policyChecks),
      paymentTransactionId: request.transactionId ?? null,
      timestamp: new Date().toISOString()
    };
    const tx = await new TopicMessageSubmitTransaction().setTopicId(topicId).setMessage(JSON.stringify(payload)).execute(client);
    await tx.getReceipt(client);
    return tx.transactionId.toString();
  } finally { client.close(); }
}
