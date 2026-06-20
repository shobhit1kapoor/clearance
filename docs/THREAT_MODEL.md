# Clearance Threat Model

## Assets

- Testnet treasury signing key
- Budget and allowlist policy configuration
- Human approval state
- Request, transaction, and HCS identifiers
- GitHub API credentials and evidence

## Trust boundaries

The browser and Gemini are untrusted proposal surfaces. The Next.js server owns validation and trusted context. Postgres owns one-time state and budget serialization. Hedera is the settlement and immutable-audit boundary.

## Primary threats and mitigations

| Threat | Mitigation |
| --- | --- |
| Prompt injection asks for another recipient | The model cannot provide account IDs; aliases resolve against the server registry |
| Model claims approval | Approval fields are absent from the tool schema and created only after a human endpoint succeeds |
| Amount changes after approval | Immutable stored intent plus post-core transaction integrity policy |
| Double click or replay | Atomic state transition from awaiting approval to executing |
| Concurrent requests exceed budget | Postgres transaction and advisory lock serialize spend reservations |
| CSRF triggers approval | Strict same-site cookie and expected-origin validation |
| Public demo drains treasury | 5 HBAR transaction cap, 20 HBAR daily budget, two payments per hashed IP, testnet-only account |
| Fake or stale evidence | Report is unlocked after receipt and includes source URLs and observation time |
| Audit failure hidden | Explicit `FAILED` state and idempotent retry; no proof claim without a transaction ID |
| Secret leakage | Server-only variables, redacted health endpoint, `.gitignore`, CodeQL and dependency scanning |

## Residual risk

IP-based limits can be bypassed by distributed clients, GitHub and Hedera availability are external dependencies, and a single demo operator remains a custody concentration. A production system would use an HSM or threshold signer, authenticated organizations, separate audit credentials, durable queues, and formal policy change approval.
