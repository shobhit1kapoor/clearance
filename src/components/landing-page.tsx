import Link from "next/link";
import { ArrowRight, Check, Github, LockKeyhole, ShieldCheck } from "lucide-react";

export function LandingPage() {
  return (
    <main className="landing-page">
      <header className="landing-nav">
        <Link className="landing-brand" href="/" aria-label="Clearance home">
          <Logo />
          <span>Clearance</span>
        </Link>
        <div className="landing-nav-actions">
          <a className="landing-source" href="https://github.com/shobhit1kapoor/clearance" target="_blank" rel="noreferrer">
            <Github size={15} /> Source
          </a>
          <Link className="landing-nav-cta" href="/dashboard">Open control plane</Link>
        </div>
      </header>

      <section className="landing-hero">
        <div className="landing-copy">
          <div className="landing-kicker"><span /> Policy infrastructure for agentic payments</div>
          <h1>The control layer between agents and money.</h1>
          <p>Clearance enforces who agents can pay, how much they can spend, and when a person must approve—before HBAR moves.</p>
          <Link className="landing-primary" href="/dashboard">
            Open live control plane <ArrowRight size={17} />
          </Link>
          <div className="landing-note"><span className="status-dot" /> Live on Hedera testnet</div>
        </div>

        <div className="product-preview" aria-label="Clearance policy decision preview">
          <div className="preview-bar">
            <div><Logo /><span>Purchase review</span></div>
            <span className="preview-status">Approval required</span>
          </div>
          <div className="preview-body">
            <div className="preview-title">
              <span>Security assessment</span>
              <strong>1 HBAR</strong>
            </div>
            <p>SecureScan Labs · shobhit1kapoor/signalops-demo</p>
            <div className="preview-rule" />
            <div className="preview-checks">
              <PreviewCheck label="Transaction limit" value="Within limit" />
              <PreviewCheck label="Vendor allowlist" value="Verified" />
              <PreviewCheck label="Human approval" value="Required" pending />
            </div>
            <div className="preview-action"><LockKeyhole size={16} /> Awaiting authorized reviewer</div>
          </div>
        </div>
      </section>

      <section className="landing-principles" aria-label="Clearance capabilities">
        <div><ShieldCheck /><span><strong>Runtime enforcement</strong><small>Policies execute before transaction construction.</small></span></div>
        <div><LockKeyhole /><span><strong>Human authorization</strong><small>Agents cannot grant themselves approval.</small></span></div>
        <div><Check /><span><strong>Verifiable evidence</strong><small>Payments and policy proofs settle on Hedera.</small></span></div>
      </section>

      <footer className="landing-footer">
        <span>Clearance</span>
        <span>Hedera Policy Agent · Week 5</span>
      </footer>
    </main>
  );
}

function PreviewCheck({ label, value, pending = false }: { label: string; value: string; pending?: boolean }) {
  return <div><span className={pending ? "pending" : "pass"}><Check size={12} /></span><strong>{label}</strong><small>{value}</small></div>;
}

function Logo() {
  return <svg viewBox="0 0 32 32" role="img" aria-label="Clearance"><rect x="2" y="2" width="28" height="28" rx="9" fill="currentColor" opacity=".1"/><path d="M21.8 11.2a8 8 0 1 0 0 9.6M13 16l2.2 2.2L23 10.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
