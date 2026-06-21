import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

interface GridBackgroundProps {
  className?: string;
}

export function GridBackground({ className }: GridBackgroundProps) {
  const style: CSSProperties = {
    background: "#090b10",
    backgroundImage: `
      linear-gradient(to right, rgba(128, 112, 168, 0.1) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(128, 112, 168, 0.1) 1px, transparent 1px),
      radial-gradient(circle at 92% 2%, rgba(180, 122, 255, 0.18) 0%, rgba(79, 96, 224, 0.07) 38%, transparent 68%)
    `,
    backgroundSize: "40px 40px, 40px 40px, 100% 100%"
  };

  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 z-0", className)}
      style={style}
    />
  );
}

export const Component = GridBackground;
export default GridBackground;
