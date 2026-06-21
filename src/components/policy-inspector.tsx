"use client";

import { motion } from "framer-motion";
import { Check, Clock3, Gauge, RefreshCw, TriangleAlert, X } from "lucide-react";
import type { ClearanceRequest, PolicyCheck } from "@/lib/domain";

interface PolicyInspectorProps {
  request: ClearanceRequest | null;
  replay: number | null;
  onStartReplay: () => void;
}

export function PolicyInspector({ request, replay, onStartReplay }: PolicyInspectorProps) {
  return (
    <aside
      className="w-[280px] flex flex-col shrink-0 overflow-y-auto"
      style={{ background: "var(--color-surface)" }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 sticky top-0 z-10"
        style={{
          borderBottom: "1px solid var(--color-border)",
          background: "var(--color-surface)",
        }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-5 h-5 rounded flex items-center justify-center"
            style={{ background: "var(--color-accent-dim)", color: "var(--color-accent)" }}
          >
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
              <path d="M6 1L10.5 3.5V8.5L6 11L1.5 8.5V3.5L6 1Z" stroke="currentColor" strokeWidth="1.2" fill="none"/>
              <path d="M6 4.5V7.5M4.5 6H7.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="text-[12px] font-semibold" style={{ color: "var(--color-foreground)" }}>
            Policy inspector
          </span>
        </div>
        {request && (
          <button
            onClick={onStartReplay}
            className="flex items-center gap-1.5 h-6 px-2.5 rounded text-[10px] font-semibold"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid var(--color-border)",
              color: "var(--color-muted)",
            }}
          >
            <RefreshCw size={10} />
            Replay
          </button>
        )}
      </div>

      {/* Empty state */}
      {!request && (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 p-6 text-center">
          <Gauge size={28} style={{ color: "var(--color-subtle)" }} />
          <p className="text-[13px] font-semibold" style={{ color: "var(--color-muted)" }}>
            Awaiting intent
          </p>
          <p className="text-[11px] leading-relaxed" style={{ color: "var(--color-subtle)" }}>
            Submit a request to see policies execute across the tool lifecycle.
          </p>
        </div>
      )}

      {request && (
        <>
          {/* Risk score */}
          <RiskSummary request={request} />

          {/* Policy checks */}
          <div style={{ borderBottom: "1px solid var(--color-border)" }}>
            <div className="px-4 py-2">
              <p className="text-[10px] font-semibold font-mono tracking-widest" style={{ color: "var(--color-subtle)" }}>
                POLICY CHECKS
              </p>
            </div>
            <div className="flex flex-col gap-px pb-2">
              {request.policyChecks.map((check, i) => (
                <motion.div
                  key={check.key}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.3 }}
                >
                  <PolicyCheckRow check={check} />
                </motion.div>
              ))}
            </div>
          </div>

          {/* Timeline */}
          <LifecycleTimeline request={request} replay={replay} />
        </>
      )}
    </aside>
  );
}

function RiskSummary({ request }: { request: ClearanceRequest }) {
  const score = request.decision === "BLOCKED" ? 92 : request.elevated ? 68 : 18;
  const level = request.decision === "BLOCKED" ? "blocked" : request.elevated ? "elevated" : "low";
  const color =
    level === "blocked"
      ? "var(--color-red)"
      : level === "elevated"
      ? "var(--color-amber)"
      : "var(--color-accent)";

  return (
    <div className="px-4 py-3" style={{ borderBottom: "1px solid var(--color-border)" }}>
      <div className="flex items-end justify-between mb-2">
        <p className="text-[10px] font-semibold font-mono tracking-widest" style={{ color: "var(--color-subtle)" }}>
          RISK SCORE
        </p>
        <div className="flex items-baseline gap-0.5">
          <span className="text-2xl font-semibold font-mono" style={{ color }}>
            {score}
          </span>
          <span className="text-[11px]" style={{ color: "var(--color-subtle)" }}>
            /100
          </span>
        </div>
      </div>
      <div className="risk-bar-track">
        <motion.div
          className={`risk-bar-fill ${level}`}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        />
      </div>
      <div className="flex items-center justify-between mt-2">
        <p className="text-[9px] font-mono" style={{ color: "var(--color-subtle)" }}>
          Composite policy evaluation score
        </p>
        <span
          className="text-[9px] font-semibold font-mono px-1.5 py-0.5 rounded"
          style={{ color, background: `color-mix(in srgb, ${color} 15%, transparent)` }}
        >
          {level.toUpperCase()}
        </span>
      </div>
    </div>
  );
}

function PolicyCheckRow({ check }: { check: PolicyCheck }) {
  const isPass = check.verdict === "PASS";
  const isFail = check.verdict === "FAIL";
  const isReview = check.verdict === "REVIEW";

  const statusColor = isPass
    ? "var(--color-accent)"
    : isFail
    ? "var(--color-red)"
    : "var(--color-amber)";

  const bgColor = isPass
    ? "var(--color-accent-dim)"
    : isFail
    ? "var(--color-red-dim)"
    : "var(--color-amber-dim)";

  return (
    <div
      className="flex items-start gap-2.5 px-4 py-2.5 mx-2 rounded-lg"
      style={{ background: bgColor, marginBottom: 2 }}
    >
      <div
        className="w-5 h-5 rounded flex items-center justify-center shrink-0 mt-0.5"
        style={{ background: `color-mix(in srgb, ${statusColor} 20%, transparent)`, color: statusColor }}
      >
        {isPass ? <Check size={10} /> : isFail ? <X size={10} /> : <Clock3 size={10} />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-semibold truncate" style={{ color: "var(--color-foreground)" }}>
          {check.label}
        </p>
        <p className="text-[10px] font-mono truncate mt-0.5" style={{ color: "var(--color-muted)" }}>
          {check.observed}
        </p>
      </div>
      <div
        className="shrink-0 w-4 h-4 rounded flex items-center justify-center"
        style={{ background: "rgba(255,255,255,0.06)", color: "var(--color-subtle)" }}
        title={check.reason}
      >
        <span className="text-[9px] font-semibold">i</span>
      </div>
    </div>
  );
}

function LifecycleTimeline({
  request,
  replay,
}: {
  request: ClearanceRequest;
  replay: number | null;
}) {
  return (
    <div className="flex-1">
      <div className="px-4 py-2 flex items-center justify-between">
        <p className="text-[10px] font-semibold font-mono tracking-widest" style={{ color: "var(--color-subtle)" }}>
          LIFECYCLE TRACE
        </p>
        <span className="text-[10px] font-mono" style={{ color: "var(--color-subtle)" }}>
          {request.events.length} events
        </span>
      </div>

      <div className="flex flex-col px-4 pb-4">
        {/* Connector line */}
        <div className="relative">
          <div
            className="absolute left-[10px] top-0 bottom-0 w-px"
            style={{ background: "var(--color-border)" }}
          />
          <div className="flex flex-col gap-2">
            {request.events.map((entry, index) => {
              const shown = replay === null || index <= replay;
              const statusColor =
                entry.status === "complete"
                  ? "var(--color-accent)"
                  : entry.status === "blocked"
                  ? "var(--color-red)"
                  : entry.status === "error"
                  ? "var(--color-amber)"
                  : "var(--color-subtle)";

              return (
                <motion.div
                  key={entry.id}
                  initial={replay !== null ? { opacity: 0, x: -6 } : false}
                  animate={{ opacity: shown ? 1 : 0.2, x: 0 }}
                  transition={{ duration: 0.3, delay: replay !== null ? index * 0.05 : 0 }}
                  className="flex items-start gap-3 pl-6 relative"
                >
                  {/* Dot */}
                  <div
                    className="absolute left-[7px] top-[6px] w-[7px] h-[7px] rounded-full ring-2 ring-[var(--color-background)]"
                    style={{
                      background: shown ? statusColor : "var(--color-subtle)",
                    }}
                  />
                  <div className="flex-1 min-w-0 pb-1">
                    <p className="text-[11px] font-semibold truncate" style={{ color: shown ? "var(--color-foreground)" : "var(--color-subtle)" }}>
                      {entry.label}
                    </p>
                    <p className="text-[10px] font-mono mt-0.5" style={{ color: "var(--color-subtle)" }}>
                      {entry.stage} ·{" "}
                      {new Date(entry.at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </p>
                  </div>
                  <div
                    className="shrink-0 w-4 h-4 rounded flex items-center justify-center mt-0.5"
                    style={{ background: shown ? ("color-mix(in srgb, " + statusColor + " 18%, transparent)") : undefined, color: statusColor }}
                  >
                    {entry.status === "blocked" ? (
                      <X size={9} />
                    ) : entry.status === "error" ? (
                      <TriangleAlert size={9} />
                    ) : (
                      <Check size={9} />
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
