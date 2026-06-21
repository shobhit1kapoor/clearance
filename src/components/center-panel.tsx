"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  BadgeCheck,
  Ban,
  Check,
  CircleDollarSign,
  Clock3,
  ExternalLink,
  Fingerprint,
  Loader2,
  RefreshCw,
  Send,
  Sparkles,
  TerminalSquare,
  TriangleAlert,
  X,
} from "lucide-react";
import type { ClearanceRequest } from "@/lib/domain";
import { ClearanceLogo } from "@/components/clearance-logo";

interface CenterPanelProps {
  prompt: string;
  setPrompt: (v: string) => void;
  loading: boolean;
  error: string;
  request: ClearanceRequest | null;
  confirmation: string;
  setConfirmation: (v: string) => void;
  onEvaluate: () => void;
  onApprove: () => void;
  onRetryAudit: () => void;
}

export function CenterPanel({
  prompt,
  setPrompt,
  loading,
  error,
  request,
  confirmation,
  setConfirmation,
  onEvaluate,
  onApprove,
  onRetryAudit,
}: CenterPanelProps) {
  return (
    <div className="flex-1 flex flex-col min-w-0" style={{ borderRight: "1px solid var(--color-border)" }}>
      {/* Panel top bar */}
      <div
        className="flex items-center justify-between px-5 py-3"
        style={{ borderBottom: "1px solid var(--color-border)" }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-6 h-6 rounded-md flex items-center justify-center"
            style={{ background: "var(--color-accent-dim)", color: "var(--color-accent)" }}
          >
            <Sparkles size={12} />
          </div>
          <span className="text-[13px] font-medium" style={{ color: "var(--color-foreground)" }}>
            Clearance agent
          </span>
        </div>
        <span className="text-[10px] font-semibold font-mono px-2 py-1 rounded"
          style={{ background: "var(--color-surface-3)", color: "var(--color-subtle)" }}>
          GEMINI 2.5 FLASH
        </span>
      </div>

      {/* Conversation area */}
      <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">

        {/* Agent intro message */}
        <div className="flex gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
            style={{ background: "var(--color-surface-3)", border: "1px solid var(--color-border)", color: "var(--color-accent)" }}
          >
            <ClearanceLogo size={16} />
          </div>
          <div
            className="rounded-xl rounded-tl-sm px-4 py-3 max-w-[80%]"
            style={{ background: "var(--color-surface-3)", border: "1px solid var(--color-border)" }}
          >
            <p className="text-[13px] font-semibold mb-1" style={{ color: "var(--color-foreground)" }}>
              What should I purchase?
            </p>
            <p className="text-[12px] leading-relaxed" style={{ color: "var(--color-muted)" }}>
              I can arrange approved security services, audits, and data lookups.
              Every payment request is evaluated against deterministic policies before HBAR moves.
            </p>
          </div>
        </div>

        {/* Prompt input */}
        <div
          className="rounded-xl p-4 flex flex-col gap-3"
          style={{ background: "var(--color-surface-3)", border: "1px solid var(--color-border)" }}
        >
          <textarea
            aria-label="Purchase request prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
            className="w-full resize-none bg-transparent text-[13px] leading-relaxed outline-none placeholder:text-[var(--color-subtle)]"
            style={{ color: "var(--color-foreground)" }}
            placeholder="Describe a purchase request..."
          />
          <div
            className="flex items-center justify-between pt-3"
            style={{ borderTop: "1px solid var(--color-border)" }}
          >
            <span className="flex items-center gap-1.5 text-[10px] font-mono" style={{ color: "var(--color-subtle)" }}>
              <TerminalSquare size={11} />
              Natural-language intent parsing
            </span>
            <button
              onClick={onEvaluate}
              disabled={loading}
              className="flex items-center gap-2 h-8 px-4 rounded-lg text-[12px] font-semibold transition-opacity"
              style={{
                background: "var(--color-accent)",
                color: "#051809",
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? <Loader2 size={13} className="spin" /> : <Send size={13} />}
              Evaluate request
            </button>
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div
            className="flex items-center gap-2.5 px-4 py-3 rounded-lg text-[12px]"
            style={{ background: "var(--color-red-dim)", border: "1px solid rgba(244,63,94,0.2)", color: "var(--color-red)" }}
          >
            <X size={14} />
            {error}
          </div>
        )}

        {/* Result card */}
        <AnimatePresence mode="wait">
          {request && (
            <motion.div
              key={request.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="rounded-xl overflow-hidden"
              style={{ border: "1px solid var(--color-border)" }}
            >
              {/* Intent header */}
              <div
                className="px-4 py-3 flex items-center justify-between gap-3"
                style={{ background: "var(--color-surface-3)", borderBottom: "1px solid var(--color-border)" }}
              >
                <div className="flex items-center gap-2.5">
                  <CircleDollarSign size={16} style={{ color: "var(--color-accent)" }} />
                  <div>
                    <p className="text-[10px] font-mono tracking-widest" style={{ color: "var(--color-subtle)" }}>
                      PAYMENT INTENT
                    </p>
                    <p className="text-[13px] font-semibold capitalize" style={{ color: "var(--color-foreground)" }}>
                      {request.intent.purpose.replaceAll("_", " ")}
                    </p>
                  </div>
                </div>
                <DecisionBadge request={request} />
              </div>

              {/* Intent data grid */}
              <div
                className="grid grid-cols-2 gap-px p-px"
                style={{ background: "var(--color-border)" }}
              >
                {[
                  ["Vendor", request.intent.vendor],
                  ["Amount", `${request.intent.amountHbar} HBAR`],
                  ["Asset", request.intent.repository || "General service"],
                  ["Parser", request.parser === "gemini" ? "Gemini structured output" : "Deterministic fallback"],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="px-4 py-3"
                    style={{ background: "var(--color-surface-2)" }}
                  >
                    <p className="text-[10px] font-mono mb-0.5" style={{ color: "var(--color-subtle)" }}>
                      {label}
                    </p>
                    <p className="text-[12px] font-semibold truncate" style={{ color: "var(--color-foreground)" }}>
                      {value}
                    </p>
                  </div>
                ))}
              </div>

              {/* State-specific panels */}
              <div className="p-4 flex flex-col gap-3" style={{ background: "var(--color-surface-2)" }}>
                {/* Blocked state */}
                {request.state === "BLOCKED" && (
                  <BlockedState />
                )}

                {/* Approval required */}
                {["AWAITING_APPROVAL", "AWAITING_ELEVATED_APPROVAL"].includes(request.state) && (
                  <ApprovalPanel
                    request={request}
                    confirmation={confirmation}
                    setConfirmation={setConfirmation}
                    loading={loading}
                    onApprove={onApprove}
                  />
                )}

                {/* Transaction confirmed */}
                {request.transactionId && (
                  <TransactionSuccess transactionId={request.transactionId} />
                )}

                {/* Audit confirmed */}
                {request.auditTransactionId && request.auditStatus !== "FAILED" && (
                  <AuditSuccess auditTransactionId={request.auditTransactionId} />
                )}

                {/* Audit failed */}
                {request.auditStatus === "FAILED" && (
                  <AuditFailed loading={loading} onRetry={onRetryAudit} />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function BlockedState() {
  return (
    <div
      className="flex items-start gap-3 px-4 py-3 rounded-lg"
      style={{ background: "var(--color-red-dim)", border: "1px solid rgba(244,63,94,0.18)" }}
    >
      <Ban size={16} style={{ color: "var(--color-red)", marginTop: 1, flexShrink: 0 }} />
      <div>
        <p className="text-[12px] font-semibold" style={{ color: "var(--color-red)" }}>
          Blocked before transaction creation
        </p>
        <p className="text-[11px] mt-0.5" style={{ color: "rgba(244,63,94,0.7)" }}>
          Core action, signing, and submission were never reached. No transaction ID exists.
        </p>
      </div>
    </div>
  );
}

function ApprovalPanel({
  request,
  confirmation,
  setConfirmation,
  loading,
  onApprove,
}: {
  request: ClearanceRequest;
  confirmation: string;
  setConfirmation: (v: string) => void;
  loading: boolean;
  onApprove: () => void;
}) {
  return (
    <div
      className="rounded-lg overflow-hidden"
      style={{ border: "1px solid rgba(245,158,11,0.2)" }}
    >
      <div
        className="flex items-center gap-2.5 px-4 py-3"
        style={{ background: "var(--color-amber-dim)", borderBottom: "1px solid rgba(245,158,11,0.15)" }}
      >
        <Fingerprint size={15} style={{ color: "var(--color-amber)" }} />
        <div>
          <p className="text-[12px] font-semibold" style={{ color: "var(--color-amber)" }}>
            {request.elevated ? "Elevated confirmation required" : "Explicit approval required"}
          </p>
          <p className="text-[10px]" style={{ color: "rgba(245,158,11,0.65)" }}>
            The model cannot set or access this authorization.
          </p>
        </div>
      </div>
      <div
        className="px-4 py-3 flex flex-col gap-3"
        style={{ background: "var(--color-surface-2)" }}
      >
        {request.elevated && (
          <input
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            placeholder={`Type APPROVE ${request.intent.amountHbar} HBAR`}
            className="w-full h-9 px-3 rounded-lg text-[12px] bg-transparent outline-none font-mono"
            style={{
              border: "1px solid var(--color-border-strong)",
              color: "var(--color-foreground)",
            }}
          />
        )}
        <button
          onClick={onApprove}
          disabled={loading}
          className="flex items-center justify-center gap-2 h-9 px-4 rounded-lg text-[12px] font-semibold w-full"
          style={{
            background: "var(--color-amber)",
            color: "#1a0e00",
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? <Loader2 size={13} className="spin" /> : <Fingerprint size={13} />}
          {request.elevated
            ? "Approve elevated request"
            : `Approve ${request.intent.amountHbar} HBAR`}
        </button>
      </div>
    </div>
  );
}

function TransactionSuccess({ transactionId }: { transactionId: string }) {
  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-lg"
      style={{ background: "var(--color-accent-dim)", border: "1px solid rgba(74,222,128,0.2)" }}
    >
      <BadgeCheck size={16} style={{ color: "var(--color-accent)", flexShrink: 0 }} />
      <div className="min-w-0 flex-1">
        <p className="text-[12px] font-semibold" style={{ color: "var(--color-accent)" }}>
          Payment confirmed on Hedera
        </p>
        <a
          href={`https://hashscan.io/testnet/transaction/${encodeURIComponent(transactionId)}`}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1 text-[10px] font-mono mt-0.5 truncate hover:underline"
          style={{ color: "rgba(74,222,128,0.7)" }}
        >
          {transactionId}
          <ExternalLink size={10} style={{ flexShrink: 0 }} />
        </a>
      </div>
    </div>
  );
}

function AuditSuccess({ auditTransactionId }: { auditTransactionId: string }) {
  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-lg"
      style={{ background: "var(--color-blue-dim)", border: "1px solid rgba(96,165,250,0.2)" }}
    >
      <Fingerprint size={16} style={{ color: "var(--color-blue)", flexShrink: 0 }} />
      <div className="min-w-0 flex-1">
        <p className="text-[12px] font-semibold" style={{ color: "var(--color-blue)" }}>
          HCS policy proof confirmed
        </p>
        <a
          href={`https://hashscan.io/testnet/transaction/${encodeURIComponent(auditTransactionId)}`}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1 text-[10px] font-mono mt-0.5 truncate hover:underline"
          style={{ color: "rgba(96,165,250,0.7)" }}
        >
          {auditTransactionId}
          <ExternalLink size={10} style={{ flexShrink: 0 }} />
        </a>
      </div>
    </div>
  );
}

function AuditFailed({ loading, onRetry }: { loading: boolean; onRetry: () => void }) {
  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-lg"
      style={{ background: "var(--color-amber-dim)", border: "1px solid rgba(245,158,11,0.2)" }}
    >
      <TriangleAlert size={15} style={{ color: "var(--color-amber)", flexShrink: 0 }} />
      <div className="flex-1">
        <p className="text-[12px] font-semibold" style={{ color: "var(--color-amber)" }}>
          HCS proof needs retry
        </p>
        <p className="text-[10px] mt-0.5" style={{ color: "rgba(245,158,11,0.65)" }}>
          Payment remains confirmed; audit state is reported separately.
        </p>
      </div>
      <button
        onClick={onRetry}
        disabled={loading}
        className="flex items-center gap-1.5 h-7 px-3 rounded text-[11px] font-semibold shrink-0"
        style={{
          background: "rgba(245,158,11,0.15)",
          border: "1px solid rgba(245,158,11,0.3)",
          color: "var(--color-amber)",
          opacity: loading ? 0.6 : 1,
        }}
      >
        <RefreshCw size={11} />
        Retry
      </button>
    </div>
  );
}

function DecisionBadge({ request }: { request: ClearanceRequest }) {
  const blocked = request.decision === "BLOCKED";
  const done = !!request.transactionId;
  let cls = "decision-badge review";
  let Icon = Clock3;
  let label = "REQUIRES APPROVAL";

  if (blocked) { cls = "decision-badge blocked"; Icon = Ban; label = "BLOCKED"; }
  else if (done) { cls = "decision-badge approved"; Icon = Check; label = "APPROVED"; }

  return (
    <span className={cls}>
      <Icon size={10} />
      {label}
    </span>
  );
}
