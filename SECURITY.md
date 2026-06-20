# Security Policy

## Supported environment

Clearance is a time-bounded Hedera **testnet** demonstration. It is not production financial software and must never be configured with mainnet credentials or customer funds.

## Reporting a vulnerability

Please report vulnerabilities privately to the repository owner rather than opening a public issue. Include the affected route, reproduction steps, impact, and any suggested mitigation. Do not access data belonging to other users or submit transactions while testing.

## Key-management requirements

- Store credentials only in local or Vercel encrypted environment variables.
- Never prefix server secrets with `NEXT_PUBLIC_`.
- Use a dedicated, capped testnet treasury account.
- Rotate any credential that appears in logs, screenshots, commits, or chat.
- Maintain a treasury reserve floor and fund only the amount needed for the public demo.

## Controls

- Same-site, HTTP-only session cookies
- Same-origin mutation checks
- Hashed network identifiers, no raw IP persistence
- Zod validation and strict purchase schemas
- Server-side counterparty resolution
- Atomic one-time execution claims
- Per-request, daily-budget, and public-demo limits
- Post-construction transaction integrity policy
- Fail-closed behavior for missing credentials and evidence

See [docs/THREAT_MODEL.md](docs/THREAT_MODEL.md) for trust boundaries and abuse cases.
