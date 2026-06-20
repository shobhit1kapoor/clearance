import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { scenarios, spendIntentSchema, type SpendIntent } from "./domain";

export async function parseIntent(prompt: string): Promise<{ intent: SpendIntent; parser: "gemini" | "deterministic" }> {
  if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    try {
      const result = await generateObject({
        model: google("gemini-2.5-flash"),
        schema: spendIntentSchema,
        system: "Extract a purchase intent. Never invent approval, account IDs, or policy results. Normalize SecureScan spelling to 'SecureScan Labs'. If production is stated, set production true. Map dependency/security scans to security_scan and smart-contract audits to audit_report.",
        prompt
      });
      return { intent: result.object, parser: "gemini" };
    } catch (error) {
      console.warn("[intent] Gemini unavailable; using deterministic parser", error instanceof Error ? error.message : error);
    }
  }
  return { intent: deterministicIntent(prompt), parser: "deterministic" };
}

export function deterministicIntent(prompt: string): SpendIntent {
  const lower = prompt.toLowerCase();
  const amount = prompt.match(/(\d+(?:\.\d+)?)\s*hbar/i)?.[1] ?? "1";
  const repo = prompt.match(/([\w.-]+\/[\w.-]+)/)?.[1]?.replace(/[.,;:!?]+$/, "");
  const unknown = lower.includes("unknownvendor") || lower.includes("unknown vendor");
  const audit = lower.includes("audit");
  const purpose = audit ? "audit_report" : lower.includes("api") ? "api_service" : lower.includes("data") ? "data_lookup" : "security_scan";
  return spendIntentSchema.parse({
    vendor: unknown ? "UnknownVendor" : "SecureScan Labs",
    amountHbar: amount,
    token: "HBAR",
    purpose,
    repository: repo,
    memo: audit ? "Clearance production audit" : "Clearance dependency scan",
    production: lower.includes("production")
  });
}

export { scenarios };
