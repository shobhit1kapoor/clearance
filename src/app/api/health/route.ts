import { NextResponse } from "next/server";
import { isHederaConfigured, policyConfig } from "@/lib/config";

export async function GET() {
  const checks = {
    app: true,
    database: Boolean(process.env.DATABASE_URL),
    gemini: Boolean(process.env.GOOGLE_GENERATIVE_AI_API_KEY),
    hederaTestnet: isHederaConfigured(),
    hcsTopic: Boolean(process.env.HEDERA_HCS_TOPIC_ID),
    github: Boolean(process.env.GITHUB_TOKEN),
    vendor: process.env.HEDERA_VENDOR_ACCOUNT_ID ? policyConfig.vendor.name : "demo placeholder"
  };
  return NextResponse.json({ status: checks.hederaTestnet && checks.database ? "ready" : "degraded", network: "testnet", checks });
}
