"use client";

import { useEffect, useRef, useState } from "react";
import type { ClearanceRequest } from "@/lib/domain";
import { scenarios } from "@/lib/domain";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { CenterPanel } from "@/components/center-panel";
import { PolicyInspector } from "@/components/policy-inspector";
import { ScanReport } from "@/components/scan-report";

export function DashboardSection() {
  const [prompt, setPrompt] = useState<string>(scenarios.approved);
  const [request, setRequest] = useState<ClearanceRequest | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [replay, setReplay] = useState<number | null>(null);

  async function evaluate(value = prompt) {
    setPrompt(value);
    setLoading(true);
    setError("");
    setRequest(null);
    setReplay(null);
    try {
      const response = await fetch("/api/requests", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ prompt: value }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setRequest(data.request);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Evaluation failed");
    } finally {
      setLoading(false);
    }
  }

  async function approve() {
    if (!request) return;
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/requests/${request.id}/approve`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ confirmation }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setRequest(data.request);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Approval failed");
    } finally {
      setLoading(false);
    }
  }

  async function retryAudit() {
    if (!request) return;
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/requests/${request.id}/audit/retry`, { method: "POST" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setRequest(data.request);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Audit retry failed");
    } finally {
      setLoading(false);
    }
  }

  function startReplay() {
    if (request) setReplay(0);
  }

  useEffect(() => {
    if (replay === null || !request || replay >= request.events.length - 1) return;
    const timer = setTimeout(() => setReplay((r) => (r !== null ? r + 1 : null)), 650);
    return () => clearTimeout(timer);
  }, [replay, request]);

  function handleSelectScenario(p: string) {
    setPrompt(p);
    setRequest(null);
    setError("");
    setReplay(null);
  }

  return (
    <section id="demo" className="py-20 px-6 lg:px-12">
      <div className="mx-auto max-w-7xl">
        {/* Section heading */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="badge badge-muted font-mono text-[10px] tracking-widest mb-3 inline-flex">
              LIVE CONTROL PLANE
            </span>
            <h2
              className="text-[clamp(1.75rem,3vw,2.5rem)] font-semibold tracking-[-0.04em] leading-[1.1]"
            >
              Every payment earns clearance.
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <div className="pulse-dot" />
            <span className="text-[11px] font-semibold font-mono" style={{ color: "var(--color-subtle)" }}>
              TESTNET · LIVE WHEN CONFIGURED
            </span>
          </div>
        </div>

        {/* Workspace shell */}
        <div
          className="rounded-xl overflow-hidden flex flex-col"
          style={{
            border: "1px solid var(--color-border)",
            background: "var(--color-surface-2)",
            minHeight: 640,
          }}
        >
          {/* Top chrome bar */}
          <div
            className="flex items-center gap-2 px-4 py-3"
            style={{
              borderBottom: "1px solid var(--color-border)",
              background: "var(--color-surface)",
            }}
          >
            <div className="flex gap-1.5" aria-hidden="true">
              <div className="w-3 h-3 rounded-full" style={{ background: "rgba(255,255,255,0.1)" }} />
              <div className="w-3 h-3 rounded-full" style={{ background: "rgba(255,255,255,0.1)" }} />
              <div className="w-3 h-3 rounded-full" style={{ background: "rgba(255,255,255,0.1)" }} />
            </div>
            <div className="flex-1 flex items-center justify-center">
              <div
                className="flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-mono"
                style={{
                  background: "var(--color-surface-3)",
                  border: "1px solid var(--color-border)",
                  color: "var(--color-subtle)",
                }}
              >
                clearance.app / control-plane
              </div>
            </div>
          </div>

          {/* Main 3-column layout */}
          <div className="flex flex-1 overflow-hidden min-h-[580px]">
            {/* Sidebar */}
            <DashboardSidebar
              activePrompt={prompt}
              onSelect={handleSelectScenario}
            />

            {/* Center panel */}
            <CenterPanel
              prompt={prompt}
              setPrompt={setPrompt}
              loading={loading}
              error={error}
              request={request}
              confirmation={confirmation}
              setConfirmation={setConfirmation}
              onEvaluate={() => evaluate()}
              onApprove={approve}
              onRetryAudit={retryAudit}
            />

            {/* Policy inspector */}
            <PolicyInspector
              request={request}
              replay={replay}
              onStartReplay={startReplay}
            />
          </div>

          {/* Scan report — full width below the columns when present */}
          {request?.scan && (
            <div
              className="px-6 pb-6"
              style={{ borderTop: "1px solid var(--color-border)", paddingTop: 20 }}
            >
              <p className="text-[10px] font-mono tracking-widest mb-3" style={{ color: "var(--color-subtle)" }}>
                GITHUB SECURITY SCAN RESULT
              </p>
              <ScanReport request={request} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
