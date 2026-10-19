// components/Website/NoServiceIllustration.jsx
// Cartoon "closed shop" illustration (inline SVG, no image file needed)

export default function NoServiceIllustration({ className = "w-40 h-32" }) {
  return (
    <svg viewBox="0 0 200 160" className={className} fill="none" aria-hidden="true">
      <ellipse cx="100" cy="148" rx="70" ry="7" fill="#e5e7eb" />

      {/* cloud */}
      <g fill="#e0f2fe">
        <circle cx="38" cy="30" r="12" />
        <circle cx="54" cy="25" r="16" />
        <circle cx="72" cy="31" r="12" />
        <rect x="34" y="30" width="46" height="13" rx="6.5" />
      </g>
      <g fill="#e0f2fe">
        <circle cx="152" cy="22" r="8" />
        <circle cx="164" cy="19" r="11" />
        <circle cx="177" cy="24" r="8" />
        <rect x="148" y="22" width="36" height="9" rx="4.5" />
      </g>

      {/* shop body */}
      <rect x="52" y="70" width="96" height="72" rx="6" fill="#fff7ed" stroke="#fdba74" strokeWidth="3" />

      {/* awning */}
      <path d="M44 70 L53 46 H147 L156 70 Z" fill="#fb923c" />
      <path d="M53 46 H71 L67 70 H44 Z" fill="#fff" opacity="0.9" />
      <path d="M89 46 H107 L106 70 H88 Z" fill="#fff" opacity="0.9" />
      <path d="M125 46 H143 L152 70 H131 Z" fill="#fff" opacity="0.9" />
      <path d="M44 70 Q55 80 66 70 Q77 80 88 70 Q99 80 110 70 Q121 80 132 70 Q143 80 156 70" fill="#fb923c" />

      {/* sad face */}
      <circle cx="84" cy="102" r="4" fill="#1f2937" />
      <circle cx="116" cy="102" r="4" fill="#1f2937" />
      <path d="M88 124 Q100 114 112 124" stroke="#1f2937" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M120 108 q3 5 0 8 q-3 -3 0 -8z" fill="#7dd3fc" />

      {/* closed sign */}
      <line x1="90" y1="70" x2="90" y2="80" stroke="#92400e" strokeWidth="1.5" />
      <line x1="110" y1="70" x2="110" y2="80" stroke="#92400e" strokeWidth="1.5" />
      <rect x="78" y="80" width="44" height="14" rx="3" fill="#fff" stroke="#ef4444" strokeWidth="1.5" />
      <text x="100" y="90.5" textAnchor="middle" fontSize="8" fontWeight="700" fill="#ef4444" fontFamily="sans-serif">
        CLOSED
      </text>
    </svg>
  )
}