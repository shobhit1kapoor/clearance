"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BadgeCheck, Ban, Check, ChevronLeft, ChevronRight, CircleDollarSign, Clock3, ExternalLink,
  Fingerprint, Gauge, Github, Loader2, LockKeyhole, RefreshCw,
  ScanLine, Send, ShieldCheck, TerminalSquare, TriangleAlert, X
} from "lucide-react";
import type { ClearanceRequest, PolicyCheck } from "@/lib/domain";
import { scenarios } from "@/lib/domain";

const scenarioList = [
  { key: "approved", label: "Approved vendor", sub: "1 HBAR · dependency scan", icon: ShieldCheck },
  { key: "blocked", label: "Unknown counterparty", sub: "25 HBAR · hard block", icon: Ban },
  { key: "escalated", label: "Production audit", sub: "4 HBAR · elevated review", icon: TriangleAlert }
] as const;

export function ClearanceApp() {
  const [prompt, setPrompt] = useState<string>(scenarios.approved);
  const [request, setRequest] = useState<ClearanceRequest | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [replay, setReplay] = useState<number | null>(null);

  async function evaluate(value = prompt) {
    setPrompt(value); setLoading(true); setError(""); setRequest(null); setReplay(null);
    try {
      const response = await fetch("/api/requests", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ prompt: value }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setRequest(data.request);
    } catch (e) { setError(e instanceof Error ? e.message : "Evaluation failed"); }
    finally { setLoading(false); }
  }

  async function approve() {
    if (!request) return;
    setLoading(true); setError("");
    try {
      const response = await fetch(`/api/requests/${request.id}/approve`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ confirmation }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setRequest(data.request);
    } catch (e) { setError(e instanceof Error ? e.message : "Approval failed"); }
    finally { setLoading(false); }
  }

  async function retryAudit() {
    if (!request) return;
    setLoading(true); setError("");
    try {
      const response = await fetch(`/api/requests/${request.id}/audit/retry`, { method: "POST" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setRequest(data.request);
    } catch (e) { setError(e instanceof Error ? e.message : "Audit retry failed"); }
    finally { setLoading(false); }
  }

  function startReplay() { if (request) setReplay(0); }
  useEffect(() => {
    if (replay === null || !request || replay >= request.events.length - 1) return;
    const timer = setTimeout(() => setReplay(replay + 1), 650);
    return () => clearTimeout(timer);
  }, [replay, request]);

  return (
    <main className="dashboard-page">
      <header className="dashboard-nav">
        <a className="brand" href="/" aria-label="Clearance home"><Logo /> <span>Clearance</span></a>
        <div className="dashboard-nav-actions">
          <div className="network-pill"><span /> HEDERA TESTNET</div>
          <a className="github-link" href="https://github.com/shobhit1kapoor/clearance" target="_blank" rel="noreferrer"><Github size={15} /> Source</a>
        </div>
      </header>

      <section className="dashboard-shell">
        <div className="dashboard-heading">
          <div>
            <a href="/" className="dashboard-back"><ChevronLeft size={14}/> Overview</a>
            <h1>Spend control plane</h1>
            <p>Review, enforce, and authorize agent purchase requests.</p>
          </div>
        </div>
        <div className="workspace glass">
          <aside className="rail">
            <div className="rail-title"><span>Request inbox</span><b>3</b></div>
            {scenarioList.map(item => <button key={item.key} className={`scenario ${prompt === scenarios[item.key] ? "active" : ""}`} onClick={() => { setPrompt(scenarios[item.key]); setRequest(null); }}><item.icon size={17}/><span><strong>{item.label}</strong><small>{item.sub}</small></span><ChevronRight size={15}/></button>)}
            <div className="rail-rule" />
            <p className="rail-label">WORKSPACE</p>
            <div className="workspace-name"><div>N</div><span><strong>Northstar Labs</strong><small>Demo treasury</small></span></div>
            <div className="budget"><div><span>Daily budget</span><strong>20 HBAR</strong></div><div className="budget-bar"><i /></div><small>Runtime-enforced · resets UTC</small></div>
          </aside>

          <div className="center-panel">
            <div className="panel-top"><div><ShieldCheck size={16}/><span>Request console</span></div><span className="model">GEMINI · STRUCTURED INTENT</span></div>
            <div className="conversation">
              <div className="agent-intro"><div className="agent-mark"><Logo/></div><div><strong>Create a purchase request</strong><p>Describe the service. Runtime policies verify the vendor, amount, purpose, risk, and authorization.</p></div></div>
              <div className="prompt-box">
                <textarea aria-label="Purchase request" value={prompt} onChange={e => setPrompt(e.target.value)} rows={3} />
                <div><span><TerminalSquare size={14}/> Natural-language intent</span><button onClick={() => evaluate()} disabled={loading}>{loading ? <Loader2 className="spin" size={17}/> : <Send size={16}/>} Evaluate request</button></div>
              </div>
              {error && <div className="error-banner"><X size={16}/>{error}</div>}
              <AnimatePresence mode="wait">
                {request && <motion.div key={request.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="intent-card">
                  <div className="intent-head"><div><CircleDollarSign size={19}/><span><small>PAYMENT INTENT</small><strong>{request.intent.purpose.replaceAll("_", " ")}</strong></span></div><DecisionBadge request={request}/></div>
                  <div className="intent-grid"><Data label="Vendor" value={request.intent.vendor}/><Data label="Amount" value={`${request.intent.amountHbar} HBAR`}/><Data label="Asset" value={request.intent.repository || "General service"}/><Data label="Parser" value={request.parser === "gemini" ? "Gemini structured output" : "Deterministic fallback"}/></div>
                  {request.state === "BLOCKED" && <div className="blocked-copy"><Ban size={18}/><div><strong>Blocked before transaction creation</strong><p>Core action, signing, and submission were never reached.</p></div></div>}
                  {["AWAITING_APPROVAL","AWAITING_ELEVATED_APPROVAL"].includes(request.state) && <div className="approval-box"><div><LockKeyhole size={18}/><span><strong>{request.elevated ? "Elevated confirmation required" : "Explicit approval required"}</strong><small>The model cannot set or access this authorization.</small></span></div>{request.elevated && <input value={confirmation} onChange={e => setConfirmation(e.target.value)} placeholder={`Type APPROVE ${request.intent.amountHbar} HBAR`}/>}<button onClick={approve} disabled={loading}>{loading ? <Loader2 className="spin" size={16}/> : <Fingerprint size={16}/>} {request.elevated ? "Approve elevated request" : `Approve ${request.intent.amountHbar} HBAR`}</button></div>}
                  {request.transactionId && <div className="success-box"><BadgeCheck size={21}/><div><strong>Payment confirmed on Hedera</strong><a href={hashscanTransaction(request.transactionId)} target="_blank" rel="noreferrer">{request.transactionId}<ExternalLink size={13}/></a></div></div>}
                  {request.auditTransactionId && <div className="audit-box"><Fingerprint size={18}/><div><strong>HCS policy proof confirmed</strong><a href={hashscanTransaction(request.auditTransactionId)} target="_blank" rel="noreferrer">{request.auditTransactionId}<ExternalLink size={13}/></a></div></div>}
                  {request.auditStatus === "FAILED" && <div className="audit-box failed"><TriangleAlert size={18}/><div><strong>HCS proof needs retry</strong><small>Payment remains confirmed; audit state is reported separately.</small></div><button onClick={retryAudit} disabled={loading}><RefreshCw size={13}/> Retry</button></div>}
                </motion.div>}
              </AnimatePresence>
              {request?.scan && <ScanReport request={request}/>} 
            </div>
          </div>

          <aside className="inspector">
            <div className="inspector-head"><div><ShieldCheck size={17}/>Policy inspector</div>{request && <button onClick={startReplay}><RefreshCw size={13}/> Replay</button>}</div>
            {!request ? <div className="empty-inspector"><Gauge/><strong>Awaiting intent</strong><p>Submit a request to see policies execute across the tool lifecycle.</p></div> : <>
              <div className="risk-summary"><span>RISK SCORE</span><strong>{riskScore(request)}<small>/100</small></strong><div className={`risk-line ${request.decision === "BLOCKED" ? "blocked" : request.elevated ? "elevated" : "low"}`}><i style={{ width: `${riskScore(request)}%` }}/></div></div>
              <div className="checks">{request.policyChecks.map(check => <PolicyRow key={check.key} check={check}/>)}</div>
              <div className="timeline-title"><span>LIFECYCLE TRACE</span><small>{request.events.length} events</small></div>
              <div className="timeline">{request.events.map((entry, index) => { const shown = replay === null || index <= replay; return <div className={`timeline-row ${shown ? entry.status : "muted"}`} key={entry.id}><span>{entry.status === "blocked" ? <X/> : entry.status === "error" ? <TriangleAlert/> : <Check/>}</span><div><strong>{entry.label}</strong><small>{entry.stage} · {new Date(entry.at).toLocaleTimeString([], {hour:"2-digit",minute:"2-digit",second:"2-digit"})}</small></div></div>})}</div>
            </>}
          </aside>
        </div>
        <footer className="dashboard-footer"><span>Clearance control plane</span><span>Hedera Agent Kit v4 · Testnet</span></footer>
      </section>
    </main>
  );
}

function Logo() { return <svg viewBox="0 0 32 32" role="img" aria-label="Clearance"><rect x="2" y="2" width="28" height="28" rx="9" fill="currentColor" opacity=".12"/><path d="M21.8 11.2a8 8 0 1 0 0 9.6M13 16l2.2 2.2L23 10.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg> }
function hashscanTransaction(transactionId: string) { return `https://hashscan.io/testnet/transaction/${encodeURIComponent(transactionId)}`; }
function riskScore(request: ClearanceRequest) { return request.decision === "BLOCKED" ? 92 : request.elevated ? 68 : 18; }
function Data({label,value}:{label:string;value:string}) { return <div className="data"><small>{label}</small><strong>{value}</strong></div> }
function DecisionBadge({request}:{request:ClearanceRequest}) { const blocked=request.decision==="BLOCKED", done=request.transactionId; return <span className={`decision ${blocked?"blocked":done?"approved":"review"}`}>{blocked?<Ban/>:done?<Check/>:<Clock3/>}{blocked?"BLOCKED":done?"APPROVED":"REQUIRES APPROVAL"}</span> }
function PolicyRow({check}:{check:PolicyCheck}) { return <div className="policy-row"><span className={check.verdict.toLowerCase()}>{check.verdict==="PASS"?<Check/>:check.verdict==="FAIL"?<X/>:<Clock3/>}</span><div><strong>{check.label}</strong><small>{check.observed}</small></div><button title={check.reason}>i</button></div> }
function ScanReport({request}:{request:ClearanceRequest}) { const scan=request.scan!; return <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} className="scan-report"><div className="scan-head"><div><ScanLine/><span><small>PAID SERVICE DELIVERED</small><strong>Repository posture assessment</strong></span></div><b>{scan.riskScore}<small>/100</small></b></div><p>{scan.summary} Evidence observed {new Date(scan.observedAt).toLocaleString()}.</p><div className="findings">{scan.findings.map(f=><a href={f.sourceUrl} target="_blank" rel="noreferrer" key={f.key}><span className={f.status}>{f.status==="pass"?<Check/>:<TriangleAlert/>}</span><div><strong>{f.label}</strong><small>{f.evidence}</small></div><ExternalLink/></a>)}</div></motion.div> }
