"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight, BadgeCheck, Ban, Check, ChevronRight, CircleDollarSign, Clock3, ExternalLink,
  FileSearch, Fingerprint, Gauge, Github, KeyRound, Loader2, LockKeyhole, Play, RefreshCw,
  ScanLine, Send, ShieldCheck, Sparkles, TerminalSquare, TriangleAlert, WalletCards, X
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
  const workspaceRef = useRef<HTMLElement>(null);

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
    <main>
      <header className="nav">
        <a className="brand" href="#top" aria-label="Clearance home"><Logo /> <span>Clearance</span></a>
        <div className="nav-center"><span className="live-dot" /> Hedera testnet</div>
        <a className="github-link" href="https://github.com/shobhit1kapoor/clearance" target="_blank" rel="noreferrer"><Github size={16} /> GitHub</a>
      </header>

      <section className="hero grid-bg" id="top">
        <div className="eyebrow"><span>POLICY INFRASTRUCTURE</span><i /> Built on Hedera Agent Kit v4</div>
        <motion.h1 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>Let AI agents spend.<br/><em>Keep the final say.</em></motion.h1>
        <p className="hero-copy">Finance-grade spend limits, approved counterparties, contextual review, and human authorization—enforced in the tool lifecycle before HBAR moves.</p>
        <div className="hero-actions">
          <button className="primary" onClick={() => workspaceRef.current?.scrollIntoView()}><Play size={16} fill="currentColor" /> Launch live demo</button>
          <a className="secondary" href="#architecture">See how it works <ArrowRight size={16} /></a>
        </div>
        <div className="trust-row">
          <span><ShieldCheck size={16} /> Runtime enforcement</span><span><Fingerprint size={16} /> HCS audit evidence</span><span><KeyRound size={16} /> Human-in-the-loop</span>
        </div>
        <div className="hero-orbit" aria-hidden="true"><div className="orbit-card a"><LockKeyhole/>Policy check</div><div className="orbit-card b"><WalletCards/>HBAR</div><div className="orbit-card c"><BadgeCheck/>Cleared</div><div className="orbit-core"><Logo/></div></div>
      </section>

      <section className="workspace-section" ref={workspaceRef}>
        <div className="section-heading">
          <div><span className="kicker">LIVE CONTROL PLANE</span><h2>Every payment earns clearance.</h2></div>
          <div className="network-pill"><span /> TESTNET · LIVE WHEN CONFIGURED</div>
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
            <div className="panel-top"><div><Sparkles size={16}/><span>Clearance agent</span></div><span className="model">GEMINI 2.5 FLASH</span></div>
            <div className="conversation">
              <div className="agent-intro"><div className="agent-mark"><Logo/></div><div><strong>What should I purchase?</strong><p>I can arrange approved security services. Every payment is checked by deterministic Hedera Agent Kit policies.</p></div></div>
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
      </section>

      <section className="architecture" id="architecture"><span className="kicker">WHY HEDERA</span><h2>Policy is part of execution.<br/>Not a promise in the interface.</h2><div className="architecture-grid">{[
        ["01","Intent",Sparkles,"Gemini converts language into a constrained, validated purchase schema."],
        ["02","Policy",ShieldCheck,"Agent Kit hooks and policies inspect normalized values and block deterministically."],
        ["03","Approval",Fingerprint,"A trusted server context exists only after an explicit, one-time human action."],
        ["04","Evidence",FileSearch,"Hedera receipts, HCS records, and GitHub evidence make the outcome inspectable."]
      ].map(([n,title,Icon,copy]) => { const I = Icon as typeof Sparkles; return <div className="architecture-card" key={title as string}><span>{n as string}</span><I/><h3>{title as string}</h3><p>{copy as string}</p></div>})}</div></section>
      <footer><div className="brand"><Logo/><span>Clearance</span></div><p>Finance-grade approvals for AI agents that spend money.</p><span className="mono">HEDERA TESTNET · WEEK 5</span></footer>
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
