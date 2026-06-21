import type { CSSProperties, ReactNode } from "react";
import { clsx } from "clsx";

interface NoiseBackgroundProps {
  children: ReactNode;
  containerClassName?: string;
  gradientColors?: string[];
}

export function NoiseBackground({
  children,
  containerClassName,
  gradientColors = ["#cc3366", "#8259ef", "#b47aff"]
}: NoiseBackgroundProps) {
  const colors = gradientColors.length > 1 ? gradientColors : [gradientColors[0] || "#b47aff", "#8259ef"];
  const style = {
    "--noise-gradient": `linear-gradient(115deg, ${colors.join(", ")})`
  } as CSSProperties;

  return (
    <div className={clsx("noise-background", containerClassName)} style={style}>
      <span className="noise-background-grain" aria-hidden="true" />
      <span className="noise-background-content">{children}</span>
    </div>
  );
}
