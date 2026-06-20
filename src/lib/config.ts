export const policyConfig = {
  maxSpendTinybars: 500_000_000n,
  dailyBudgetTinybars: 2_000_000_000n,
  token: "HBAR" as const,
  purposes: new Set(["security_scan", "audit_report", "api_service", "data_lookup"]),
  vendor: {
    id: "secure-scan-labs",
    name: "SecureScan Labs",
    aliases: ["securescan labs", "secure scan labs", "securescan"],
    accountId: process.env.HEDERA_VENDOR_ACCOUNT_ID || "0.0.800"
  }
};

export function isHederaConfigured() {
  return Boolean(process.env.HEDERA_OPERATOR_ID && process.env.HEDERA_OPERATOR_PRIVATE_KEY && process.env.HEDERA_VENDOR_ACCOUNT_ID);
}
