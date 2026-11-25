// Giftify gift-box mark (same artwork as the Team Mark logo) + wordmark
export function LogoMark({ size = 36 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="gm" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#7C3AED" />
          <stop offset="1" stopColor="#DB2777" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="16" fill="url(#gm)" />
      <path d="M24 20c-3-3 1-7 5-4l3 4 3-4c4-3 8 1 5 4-2 2-6 2-8 2s-6 0-8-2z" fill="#fff" />
      <rect x="14" y="22" width="36" height="8" rx="2.5" fill="#fff" />
      <rect x="17" y="29" width="30" height="21" rx="2.5" fill="#fff" />
      <rect x="29.5" y="22" width="5" height="28" fill="#F9A8D4" />
    </svg>
  )
}

export default function Logo({ size = 36 }) {
  return (
    <span className="logo">
      <LogoMark size={size} />
      <span className="logo-text">Giftify</span>
    </span>
  )
}
