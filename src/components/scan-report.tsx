"use client";

import { motion } from "framer-motion";
import { Check, ExternalLink, ScanLine, TriangleAlert } from "lucide-react";
import type { ClearanceRequest } from "@/lib/domain";

export function ScanReport({ request }: { request: ClearanceRequest }) {
  const scan = request.scan!;
  const scoreColor =
    scan.riskScore < 30
      ? "var(--color-accent)"
      : scan.riskScore < 65
      ? "var(--color-amber)"
      : "var(--color-red)";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-xl overflow-hidden mt-2"
      style={{ border: "1px solid var(--color-border)" }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{
          background: "var(--color-surface-3)",
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-6 h-6 rounded flex items-center justify-center"
            style={{ background: "var(--color-blue-dim)", color: "var(--color-blue)" }}
          >
            <ScanLine size={13} />
          </div>
          <div>
            <p className="text-[10px] font-mono tracking-widest" style={{ color: "var(--color-subtle)" }}>
              PAID SERVICE DELIVERED
            </p>
            <p className="text-[12px] font-semibold" style={{ color: "var(--color-foreground)" }}>
              Repository posture assessment
            </p>
          </div>
        </div>
        <div className="flex items-baseline gap-0.5">
          <span className="text-xl font-semibold font-mono" style={{ color: scoreColor }}>
            {scan.riskScore}
          </span>
          <span className="text-[11px]" style={{ color: "var(--color-subtle)" }}>
            /100
          </span>
        </div>
      </div>

      {/* Summary */}
      <div
        className="px-4 py-3"
        style={{ background: "var(--color-surface-2)", borderBottom: "1px solid var(--color-border)" }}
      >
        <p className="text-[12px] leading-relaxed" style={{ color: "var(--color-muted)" }}>
          {scan.summary}{" "}
          <span className="font-mono text-[10px]" style={{ color: "var(--color-subtle)" }}>
            Observed {new Date(scan.observedAt).toLocaleString()}.
          </span>
        </p>
      </div>

      {/* Findings */}
      <div
        className="flex flex-col gap-px"
        style={{ background: "var(--color-border)" }}
      >
        {scan.findings.map((finding, i) => {
          const isPass = finding.status === "pass";
          const isWarn = finding.status === "warn";
          const statusColor = isPass
            ? "var(--color-accent)"
            : isWarn
            ? "var(--color-amber)"
            : "var(--color-red)";
          const statusBg = isPass
            ? "var(--color-accent-dim)"
            : isWarn
            ? "var(--color-amber-dim)"
            : "var(--color-red-dim)";

          return (
            <motion.a
              key={finding.key}
              href={finding.sourceUrl}
              target="_blank"
              rel="noreferrer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.06 }}
              className="flex items-center gap-3 px-4 py-3 group"
              style={{ background: "var(--color-surface-2)" }}
            >
              <div
                className="w-6 h-6 rounded flex items-center justify-center shrink-0"
                style={{ background: statusBg, color: statusColor }}
              >
                {isPass ? <Check size={11} /> : <TriangleAlert size={11} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold truncate" style={{ color: "var(--color-foreground)" }}>
                  {finding.label}
                </p>
                <p className="text-[10px] font-mono truncate mt-0.5" style={{ color: "var(--color-subtle)" }}>
                  {finding.evidence}
                </p>
              </div>
              <ExternalLink
                size={12}
                className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ color: "var(--color-muted)" }}
              />
            </motion.a>
          );
        })}
      </div>
    </motion.div>
  );
}
