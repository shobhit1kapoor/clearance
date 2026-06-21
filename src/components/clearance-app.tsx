"use client";

import { useRef } from "react";
import { SiteNav, SiteFooter } from "@/components/site-nav";
import { Hero } from "@/components/hero";
import { DashboardSection } from "@/components/dashboard-section";
import { ArchitectureSection } from "@/components/architecture-section";

export function ClearanceApp() {
  const demoRef = useRef<HTMLDivElement>(null);

  function scrollToDemo() {
    demoRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <div className="min-h-dvh flex flex-col" style={{ background: "var(--color-background)" }}>
      <SiteNav />

      {/* Offset for fixed nav */}
      <div className="pt-[60px]">
        <Hero onLaunchDemo={scrollToDemo} />

        <div ref={demoRef}>
          <DashboardSection />
        </div>

        <ArchitectureSection />
      </div>

      <SiteFooter />
    </div>
  );
}
