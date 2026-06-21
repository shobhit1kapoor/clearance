"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  Fingerprint,
  Github,
  KeyRound,
  ShieldCheck,
} from "lucide-react";
import { ClearanceLogo } from "@/components/clearance-logo";

interface HeroProps {
  onLaunchDemo: () => void;
}

const TRUST_ITEMS = [
  { icon: ShieldCheck, label: "Runtime enforcement" },
  { icon: Fingerprint, label: "HCS audit evidence" },
  { icon: KeyRound, label: "Human-in-the-loop" },
];

export function Hero({ onLaunchDemo }: HeroProps) {
  return (
    <section
      className="grid-lines relative min-h-[90dvh] flex flex-col justify-center overflow-hidden"
      id="top"
    >
      {/* Radial glow effects */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 800px 600px at 60% -10%, rgba(74,222,128,0.07) 0%, transparent 70%), radial-gradient(ellipse 600px 500px at -5% 50%, rgba(96,165,250,0.05) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 py-32 md:py-36 lg:px-12">
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3 mb-8"
        >
          <span
            className="badge badge-green font-mono tracking-widest text-[10px]"
          >
            POLICY INFRASTRUCTURE
          </span>
          <span className="text-[var(--color-subtle)] text-xs font-mono">
            Built on Hedera Agent Kit v4
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.08 }}
          className="font-sans text-[clamp(3rem,7vw,6.5rem)] font-semibold leading-[0.96] tracking-[-0.055em] text-balance mb-8 max-w-4xl"
        >
          Let AI agents spend.{" "}
          <span style={{ color: "var(--color-muted)" }}>
            Keep the final say.
          </span>
        </motion.h1>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="text-[var(--color-muted)] text-lg leading-relaxed max-w-2xl mb-10 text-pretty"
        >
          Finance-grade spend limits, approved counterparties, contextual
          review, and human authorization — enforced in the tool lifecycle
          before HBAR moves.
        </motion.p>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.22 }}
          className="flex flex-wrap gap-3 mb-12"
        >
          <button
            onClick={onLaunchDemo}
            className="flex items-center gap-2 h-11 px-6 rounded-lg font-semibold text-sm"
            style={{
              background: "var(--color-accent)",
              color: "#051809",
              boxShadow: "0 0 32px var(--color-accent-glow)",
            }}
          >
            Launch live demo
            <ArrowRight size={16} />
          </button>
          <a
            href="#architecture"
            className="flex items-center gap-2 h-11 px-6 rounded-lg font-semibold text-sm border text-[var(--color-foreground)]"
            style={{
              borderColor: "var(--color-border-strong)",
              background: "rgba(255,255,255,0.03)",
            }}
          >
            How it works
            <ArrowRight size={14} style={{ color: "var(--color-muted)" }} />
          </a>
          <a
            href="https://github.com/shobhit1kapoor/clearance"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 h-11 px-5 rounded-lg text-sm border text-[var(--color-muted)]"
            style={{
              borderColor: "var(--color-border)",
              background: "rgba(255,255,255,0.02)",
            }}
          >
            <Github size={15} />
            GitHub
          </a>
        </motion.div>

        {/* Trust row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.38 }}
          className="flex flex-wrap gap-5"
        >
          {TRUST_ITEMS.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-2 text-xs"
              style={{ color: "var(--color-subtle)" }}
            >
              <Icon size={13} style={{ color: "var(--color-accent)" }} />
              {label}
            </div>
          ))}
        </motion.div>

        {/* Floating agent diagram */}
        <AgentDiagram />
      </div>

      {/* Bottom fade */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 inset-x-0 h-32"
        style={{
          background:
            "linear-gradient(to bottom, transparent, var(--color-background))",
        }}
      />
    </section>
  );
}

function AgentDiagram() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, delay: 0.35 }}
      aria-hidden="true"
      className="hidden lg:block absolute right-12 top-1/2 -translate-y-1/2 w-[380px]"
    >
      {/* Outer ring */}
      <div
        className="relative w-[380px] h-[380px] rounded-full"
        style={{ border: "1px solid var(--color-border)" }}
      >
        {/* Middle ring */}
        <div
          className="absolute inset-[60px] rounded-full"
          style={{ border: "1px solid rgba(74,222,128,0.12)" }}
        />
        {/* Core */}
        <div
          className="absolute inset-[120px] rounded-full flex items-center justify-center"
          style={{
            background:
              "radial-gradient(circle, rgba(74,222,128,0.1), rgba(5,7,10,0))",
            border: "1px solid rgba(74,222,128,0.2)",
          }}
        >
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center"
            style={{
              background: "var(--color-surface-2)",
              border: "1px solid var(--color-border-strong)",
            }}
          >
            <ClearanceLogo size={28} />
          </div>
        </div>

        {/* Floating cards */}
        <FloatingCard top="10%" left="72%" icon={<ShieldCheck size={14} />} label="Policy check" />
        <FloatingCard top="75%" left="72%" icon={<Fingerprint size={14} />} label="HCS proof" />
        <FloatingCard top="42%" left="-18%" icon={<KeyRound size={14} />} label="Approved" />
      </div>
    </motion.div>
  );
}

function FloatingCard({
  top,
  left,
  icon,
  label,
}: {
  top: string;
  left: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <div
      className="absolute flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium"
      style={{
        top,
        left,
        background: "var(--color-surface-2)",
        border: "1px solid var(--color-border-strong)",
        color: "var(--color-foreground)",
        boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
        backdropFilter: "blur(8px)",
      }}
    >
      <span style={{ color: "var(--color-accent)" }}>{icon}</span>
      {label}
    </div>
  );
}
