import { GridBackground } from "@/components/ui/grid-background";

export default function GridBackgroundDemo() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black">
      <GridBackground />
      <div className="relative z-10" />
    </div>
  );
}
