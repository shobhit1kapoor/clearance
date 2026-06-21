"use client";

import { motion } from "framer-motion";
import {
  FileSearch,
  Fingerprint,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

const STEPS = [
  {
    num: "01",
    title: "Intent",
    icon: Sparkles,
    copy: "Gemini converts natural language into a constrained, validated purchase schema. No free-form values reach the policy layer.",
  },
  {
    num: "02",
    title: "Policy",
    icon: ShieldCheck,
    copy: "Agent Kit hooks evaluate every normalized field against deterministic rules. Violations are hard-blocked before execution begins.",
  },
  {
    num: "03",
    title: "Approval",
    icon: Fingerprint,
    copy: "A human-signed authorization is required before funds move. The model cannot fabricate, replay, or bypass this step.",
  },
  {
    num: "04",
    title: "Evidence",
    icon: FileSearch,
    copy: "Hedera receipts, HCS topic records, and GitHub scan results form an immutable audit trail tied to every payment.",
  },
];

export function ArchitectureSection() {
  return (
    <section
      id="architecture"
      className="relative py-28 px-6 lg:px-12"
      style={{
        background:
          "linear-gradient(to bottom, var(--color-background), var(--color-surface))",
      }}
    >
      <div className="mx-auto max-w-7xl">
        {/* Heading */}
        <div className="mb-16 max-w-2xl">
          <span className="badge badge-muted font-mono text-[10px] tracking-widest mb-4 inline-flex">
            WHY HEDERA
          </span>
          <h2
            className="text-[clamp(2rem,4vw,3.25rem)] font-semibold tracking-[-0.04em] leading-[1.08] text-balance"
          >
            Policy is part of execution.{" "}
            <span style={{ color: "var(--color-muted)" }}>
              Not a promise in the interface.
            </span>
          </h2>
        </div>

        {/* Steps grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px"
          style={{ background: "var(--color-border)" }}
        >
          {STEPS.map(({ num, title, icon: Icon, copy }, i) => (
            <motion.div
              key={num}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className="p-8 flex flex-col gap-5"
              style={{ background: "var(--color-surface)" }}
            >
              <div className="flex items-start justify-between">
                <span
                  className="font-mono text-xs font-semibold"
                  style={{ color: "var(--color-subtle)" }}
                >
                  {num}
                </span>
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{
                    background: "var(--color-accent-dim)",
                    color: "var(--color-accent)",
                  }}
                >
                  <Icon size={16} />
                </div>
              </div>
              <h3
                className="text-lg font-semibold tracking-[-0.02em]"
                style={{ color: "var(--color-foreground)" }}
              >
                {title}
              </h3>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "var(--color-muted)" }}
              >
                {copy}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA strip */}
        <div
          className="mt-px p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderTop: "none",
          }}
        >
          <div>
            <p
              className="text-sm font-medium"
              style={{ color: "var(--color-foreground)" }}
            >
              Every check runs deterministically — no LLM in the policy layer.
            </p>
            <p className="text-sm mt-1" style={{ color: "var(--color-muted)" }}>
              Policies are evaluated against validated, typed values. Prompt
              injection cannot change outcomes.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div
              className="px-3 py-1.5 rounded-md font-mono text-[11px] font-semibold"
              style={{
                background: "var(--color-accent-dim)",
                color: "var(--color-accent)",
              }}
            >
              TESTNET LIVE
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
