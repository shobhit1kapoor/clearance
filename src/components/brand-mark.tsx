import Image from "next/image";

export function BrandMark({ priority = false }: { priority?: boolean }) {
  return (
    <span className="brand-mark" aria-hidden="true">
      <Image
        className="brand-mark-art"
        src="/clearance-mark.png"
        alt=""
        width={64}
        height={64}
        priority={priority}
      />
    </span>
  );
}
