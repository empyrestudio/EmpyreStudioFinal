export default function Mark({ className = '', light = true }) {
  const fill = light ? '#F4EFE6' : '#111111'
  return (
    <svg className={className} viewBox="0 0 520 400" role="img" aria-label="Empyré Studio">
      <g fill="none" stroke={fill} strokeLinecap="round" strokeLinejoin="round">
        <path d="M168 86c62-38 128-18 148 42 14 42-8 86-54 118" strokeWidth="10" />
        <path d="M148 128c-10 70 18 128 88 148 48 14 96-8 118-54" strokeWidth="10" />
        <path d="M214 96c48-8 86 22 96 70 8 40-10 78-48 98" strokeWidth="6" opacity="0.85" />
        <path d="M250 78c40 8 70 46 74 96" strokeWidth="3.5" opacity="0.7" />
        <path d="M268 70c44 14 72 52 76 102" strokeWidth="3" opacity="0.5" />
        <path d="M286 66c46 18 74 56 78 108" strokeWidth="2.5" opacity="0.35" />
        <path d="M302 64c48 22 76 60 80 114" strokeWidth="2" opacity="0.22" />
        <ellipse cx="188" cy="168" rx="78" ry="70" transform="rotate(-28 188 168)" strokeWidth="10" />
        <ellipse cx="318" cy="188" rx="86" ry="64" transform="rotate(22 318 188)" strokeWidth="10" />
      </g>
      <text
        x="260"
        y="330"
        textAnchor="middle"
        fill={fill}
        fontFamily="system-ui, sans-serif"
        fontSize="54"
        fontWeight="500"
        letterSpacing="14"
      >
        EMPYRÉ
      </text>
      <line x1="36" y1="348" x2="484" y2="348" stroke={fill} strokeWidth="2" />
      <text
        x="260"
        y="378"
        textAnchor="middle"
        fill={fill}
        fontFamily="system-ui, sans-serif"
        fontSize="18"
        fontWeight="400"
        letterSpacing="16"
      >
        STUDIO
      </text>
    </svg>
  )
}
