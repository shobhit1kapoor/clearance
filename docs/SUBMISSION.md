# Submission Copy

## Submission links

- Live agent: https://clearance-lovat.vercel.app
- Public repository: https://github.com/shobhit1kapoor/clearance
- Agent Kit feedback: https://github.com/hashgraph/hedera-agent-kit-js/issues/947

## Project description

Finance-grade approvals for AI agents that spend money: deterministic Hedera Agent Kit policies constrain HBAR purchases before transaction construction, with human authorization, HCS audit evidence, and a real paid GitHub security assessment.

## Project summary

Clearance is the policy control plane between AI agents and money. Gemini can propose a purchase, but it cannot approve itself, select a Hedera account, or bypass spend limits. A custom Agent Kit v4 BaseTool runs vendor, amount, daily budget, purpose, token, contextual risk, human approval, and transaction-integrity policies across the official seven-stage lifecycle.

The live demo includes an approved 1 HBAR scan, a 25 HBAR unknown-vendor block that never reaches transaction construction, and an elevated production audit. Successful payments produce real Hedera testnet receipts, HCS audit evidence, and a post-payment GitHub security assessment.

Verified hosted-flow evidence: testnet payment `0.0.9295451@1782021474.394770530`, HCS topic `0.0.9295569`, and compact decision proof `0.0.9295451@1782021479.141371116`.

## Implementation details

Clearance uses `@hashgraph/hedera-agent-kit@4.0.0` and the Vercel AI SDK adapter. Only a custom `clearancePlugin` is registered. Its `ClearancePaymentTool` extends `BaseTool`; `coreAction` constructs the transfer and `secondaryAction` calls `handleTransaction` only after trusted approval context passes custom `AbstractPolicy` implementations. A custom trace hook records all verdicts, and the official `HcsAuditTrailHook` records successful tool execution.
