export function LogoMark({ size = 30, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="silentrfq-mark-grad" x1="2" y1="2" x2="30" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FF8A4C" />
          <stop offset="100%" stopColor="#FF4D6D" />
        </linearGradient>
      </defs>
      <path
        d="M16 1.6 L29.2 8.8 V23.2 L16 30.4 L2.8 23.2 V8.8 Z"
        stroke="url(#silentrfq-mark-grad)"
        strokeWidth="1.5"
        fill="url(#silentrfq-mark-grad)"
        fillOpacity="0.08"
      />
      <path
        d="M13 14.5 V11.6 a3 3 0 0 1 6 0 V14.5"
        stroke="url(#silentrfq-mark-grad)"
        strokeWidth="1.8"
        fill="none"
        strokeLinecap="round"
      />
      <rect x="10.5" y="14.5" width="11" height="8.5" rx="2.2" fill="url(#silentrfq-mark-grad)" />
      <circle cx="16" cy="18.4" r="1.15" fill="#0B0B0F" />
      <rect x="15.5" y="19" width="1" height="2" fill="#0B0B0F" />
    </svg>
  );
}
