"use client";

import { Github } from "lucide-react";
import { ClearanceLogo } from "@/components/clearance-logo";

export function SiteNav() {
  return (
    <header
      className="fixed top-0 inset-x-0 z-50 h-[60px] flex items-center px-6 lg:px-12"
      style={{
        borderBottom: "1px solid var(--color-border)",
        background: "rgba(5,7,10,0.85)",
        backdropFilter: "blur(16px)",
      }}
    >
      {/* Brand */}
      <a
        href="#top"
        className="flex items-center gap-2.5 mr-auto font-semibold text-[15px] tracking-[-0.02em]"
        style={{ color: "var(--color-foreground)" }}
        aria-label="Clearance home"
      >
        <span style={{ color: "var(--color-accent)" }}>
          <ClearanceLogo size={26} />
        </span>
        Clearance
      </a>

      {/* Nav center */}
      <nav className="hidden md:flex items-center gap-6 text-[13px]" style={{ color: "var(--color-muted)" }}>
        <a href="#architecture" className="hover:text-[var(--color-foreground)] transition-colors">
          How it works
        </a>
        <a href="#demo" className="hover:text-[var(--color-foreground)] transition-colors">
          Live demo
        </a>
        <span className="flex items-center gap-1.5">
          <span className="pulse-dot" style={{ width: 6, height: 6 }} />
          <span className="font-mono text-[11px]" style={{ color: "var(--color-subtle)" }}>
            Hedera testnet
          </span>
        </span>
      </nav>

      {/* GitHub */}
      <a
        href="https://github.com/shobhit1kapoor/clearance"
        target="_blank"
        rel="noreferrer"
        className="ml-6 flex items-center gap-2 h-8 px-3.5 rounded-lg text-[12px] font-medium"
        style={{
          border: "1px solid var(--color-border-strong)",
          background: "rgba(255,255,255,0.03)",
          color: "var(--color-muted)",
        }}
      >
        <Github size={14} />
        GitHub
      </a>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer
      className="px-6 lg:px-12 py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      style={{ borderTop: "1px solid var(--color-border)" }}
    >
      <a
        href="#top"
        className="flex items-center gap-2.5 font-semibold text-[14px]"
        style={{ color: "var(--color-foreground)" }}
      >
        <span style={{ color: "var(--color-accent)" }}>
          <ClearanceLogo size={22} />
        </span>
        Clearance
      </a>
      <p className="text-[12px]" style={{ color: "var(--color-subtle)" }}>
        Finance-grade approvals for AI agents that spend money.
      </p>
      <span className="font-mono text-[10px]" style={{ color: "var(--color-subtle)" }}>
        HEDERA TESTNET
      </span>
    </footer>
  );
}
