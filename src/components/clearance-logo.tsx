export function ClearanceLogo({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      role="img"
      aria-label="Clearance"
    >
      <rect
        x="2"
        y="2"
        width="28"
        height="28"
        rx="8"
        fill="currentColor"
        opacity="0.1"
      />
      <path
        d="M21.5 11.5a7.5 7.5 0 1 0 0 9M13 16l2.5 2.5 7.5-7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
