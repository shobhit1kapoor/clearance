"use client";

import { Ban, ChevronRight, ShieldCheck, TriangleAlert } from "lucide-react";
import { scenarios } from "@/lib/domain";

const SCENARIOS = [
  {
    key: "approved" as const,
    label: "Approved vendor",
    sub: "1 HBAR · dependency scan",
    icon: ShieldCheck,
    color: "var(--color-accent)",
    bg: "var(--color-accent-dim)",
  },
  {
    key: "blocked" as const,
    label: "Unknown counterparty",
    sub: "25 HBAR · hard block",
    icon: Ban,
    color: "var(--color-red)",
    bg: "var(--color-red-dim)",
  },
  {
    key: "escalated" as const,
    label: "Production audit",
    sub: "4 HBAR · elevated review",
    icon: TriangleAlert,
    color: "var(--color-amber)",
    bg: "var(--color-amber-dim)",
  },
];

interface DashboardSidebarProps {
  activePrompt: string;
  onSelect: (prompt: string) => void;
}

export function DashboardSidebar({ activePrompt, onSelect }: DashboardSidebarProps) {
  return (
    <aside
      className="w-[220px] flex flex-col shrink-0"
      style={{ borderRight: "1px solid var(--color-border)" }}
    >
      {/* Header */}
      <div
        className="px-4 py-3 flex items-center justify-between"
        style={{ borderBottom: "1px solid var(--color-border)" }}
      >
        <span className="text-[11px] font-semibold tracking-widest font-mono" style={{ color: "var(--color-subtle)" }}>
          REQUEST INBOX
        </span>
        <span
          className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
          style={{
            background: "var(--color-accent-dim)",
            color: "var(--color-accent)",
          }}
        >
          3
        </span>
      </div>

      {/* Scenario list */}
      <div className="flex flex-col gap-px py-1">
        {SCENARIOS.map(({ key, label, sub, icon: Icon, color, bg }) => {
          const isActive = activePrompt === scenarios[key];
          return (
            <button
              key={key}
              onClick={() => onSelect(scenarios[key])}
              className="flex items-center gap-3 px-4 py-3 text-left transition-colors duration-150"
              style={{
                background: isActive ? "rgba(255,255,255,0.04)" : "transparent",
                borderLeft: isActive
                  ? `2px solid ${color}`
                  : "2px solid transparent",
              }}
            >
              <div
                className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
                style={{ background: isActive ? bg : "rgba(255,255,255,0.04)", color }}
              >
                <Icon size={13} />
              </div>
              <span className="flex-1 min-w-0">
                <strong
                  className="block text-[12px] font-semibold truncate"
                  style={{ color: isActive ? "var(--color-foreground)" : "var(--color-muted)" }}
                >
                  {label}
                </strong>
                <small
                  className="block text-[10px] truncate mt-0.5 font-mono"
                  style={{ color: "var(--color-subtle)" }}
                >
                  {sub}
                </small>
              </span>
              <ChevronRight size={13} style={{ color: "var(--color-subtle)", flexShrink: 0 }} />
            </button>
          );
        })}
      </div>

      {/* Divider */}
      <div style={{ borderTop: "1px solid var(--color-border)", margin: "8px 0" }} />

      {/* Workspace info */}
      <div className="px-4 py-2">
        <p className="text-[10px] font-semibold tracking-widest font-mono mb-3" style={{ color: "var(--color-subtle)" }}>
          WORKSPACE
        </p>
        <div className="flex items-center gap-2.5 mb-4">
          <div
            className="w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold shrink-0"
            style={{ background: "var(--color-accent-dim)", color: "var(--color-accent)" }}
          >
            N
          </div>
          <div>
            <p className="text-[12px] font-semibold" style={{ color: "var(--color-foreground)" }}>
              Northstar Labs
            </p>
            <p className="text-[10px] font-mono" style={{ color: "var(--color-subtle)" }}>
              Demo treasury
            </p>
          </div>
        </div>

        {/* Budget bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px]" style={{ color: "var(--color-subtle)" }}>
              Daily budget
            </span>
            <span className="text-[11px] font-semibold font-mono" style={{ color: "var(--color-foreground)" }}>
              20 HBAR
            </span>
          </div>
          <div className="risk-bar-track">
            <div className="risk-bar-fill low" style={{ width: "25%" }} />
          </div>
          <p className="text-[9px] font-mono" style={{ color: "var(--color-subtle)" }}>
            Runtime-enforced · resets UTC 00:00
          </p>
        </div>
      </div>
    </aside>
  );
}
