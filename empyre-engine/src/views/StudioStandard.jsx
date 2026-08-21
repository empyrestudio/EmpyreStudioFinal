import { TIER_LIST, SIGNATURE } from '../lib/constants.js'

export default function StudioStandard() {
  return (
    <div className="page">
      <div className="kicker">Empyré Studio</div>
      <h1 className="display">The standard, made visible.</h1>
      <p className="lede">
        Empyré does not create decorative branding in isolation. It creates strategically grounded, visually precise, verbally consistent brand systems that elevate how a business is understood, trusted, remembered, and chosen.
      </p>

      <h2 className="display" style={{ margin: '36px 0 14px' }}>Service tiers</h2>
      <div className="std-grid">
        {TIER_LIST.map((t) => (
          <article className="tier-card" key={t.id}>
            <div className="kicker">{t.code} · {t.category}</div>
            <h3 className="display" style={{ fontSize: 28, margin: '6px 0' }}>{t.name}</h3>
            <p>{t.line}</p>
            <ul>
              {t.deliverables.map((d) => <li key={d}>{d}</li>)}
            </ul>
          </article>
        ))}
      </div>

      <h2 className="display" style={{ margin: '48px 0 14px' }}>The Empyré Signature</h2>
      <div className="sig-list">
        {SIGNATURE.map((s) => (
          <div className="sig-item" key={s.n}>
            <div className="kicker">{s.n}</div>
            <strong>{s.name}</strong>
            <p style={{ color: 'var(--mist)', margin: '6px 0 0', fontWeight: 300 }}>{s.body}</p>
          </div>
        ))}
      </div>

      <h2 className="display" style={{ margin: '48px 0 14px' }}>Operating rules for this engine</h2>
      <div className="block">
        <ul>
          <li>Never begin with a logo. Begin with business context, customer insight, positioning, and market opportunity.</li>
          <li>Never recommend a visual trend merely because it is popular.</li>
          <li>Do not use “clean,” “modern,” “professional,” “elevated,” or “luxury” unless execution is defined.</li>
          <li>Do not invent brand facts, customer data, SEO rankings, competitor performance, conversion rates, legal availability, or trademark clearance.</li>
          <li>Mark every assumption as a strategic hypothesis — validate with research, client input, analytics, or testing.</li>
          <li>Recommend formal trademark search and legal counsel before finalizing a name, logo, or tagline.</li>
          <li>Three directions must differ in positioning and behavior, not merely in color.</li>
          <li>Accessibility target: WCAG AA. Do not rely on color alone.</li>
          <li>SEO recommendations prioritize useful content. Do not promise rankings.</li>
          <li>This engine produces a high-quality strategic first draft. It does not replace the creative director.</li>
        </ul>
      </div>
    </div>
  )
}
