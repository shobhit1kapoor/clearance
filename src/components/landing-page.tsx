import Link from "next/link";
import { ArrowRight, Check, Github, LockKeyhole, ShieldCheck } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { NoiseBackground } from "@/components/ui/noise-background";

export function LandingPage() {
  return (
    <main className="landing-page">
      <div className="landing-media" aria-hidden="true">
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
        >
          <source src="/hero-liquid-metal.mp4" type="video/mp4" />
        </video>
        <div className="landing-media-shade" />
      </div>
      <header className="landing-nav">
        <Link className="landing-brand" href="/" aria-label="Clearance home">
          <BrandMark priority />
          <span>Clearance</span>
        </Link>
        <div className="landing-nav-actions">
          <a className="landing-source" href="https://github.com/shobhit1kapoor/clearance" target="_blank" rel="noreferrer">
            <Github size={15} /> Source
          </a>
        </div>
      </header>

      <section className="landing-hero">
        <div className="landing-copy">
          <h1 aria-label="The control layer between agents and money.">
            <span className="landing-line"><span aria-hidden="true">The control layer</span></span>
            <span className="landing-line"><span aria-hidden="true">between agents</span></span>
            <span className="landing-line"><span aria-hidden="true">and money.</span></span>
          </h1>
          <p className="landing-subcopy">Clearance enforces who agents can pay, how much they can spend, and when a person must approve—before HBAR moves.</p>
          <NoiseBackground
            containerClassName="landing-primary-noise landing-cta-reveal"
            gradientColors={["#cc3366", "#8259ef", "#b47aff"]}
          >
            <Link className="landing-primary" href="/dashboard">
              Open live control plane <ArrowRight size={17} />
            </Link>
          </NoiseBackground>
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
