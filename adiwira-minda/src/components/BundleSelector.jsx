import { BUNDLES } from '../data/questions'

export default function BundleSelector({ ageMeta, onPick, onBack, progress, selectedAge }) {
  // Count how many levels completed for each bundle
  const completedLevels = (bundleId) => {
    const key  = `${bundleId}_${selectedAge}`
    const data = (progress[key] || {})
    return Object.keys(data).length
  }

  return (
    <div style={{ padding: '32px 24px', position: 'relative', zIndex: 1 }}>
      {/* Back */}
      <button className="back-btn mb-24" onClick={onBack}>
        ← Balik
      </button>

      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: 36 }}>
        <div style={{ fontSize: '2rem', marginBottom: 6 }}>{ageMeta?.icon}</div>
        <h2 className="section-title">Pilih Topik</h2>
        <p className="section-sub">
          Peringkat: <strong style={{ color: 'var(--teal-dark)' }}>{ageMeta?.label}</strong> — {ageMeta?.sublabel}
        </p>
      </div>

      {/* Bundle grid */}
      <div className="bundle-grid">
        {BUNDLES.map((b, i) => {
          const done = completedLevels(b.id)
          return (
            <BundleCard
              key={b.id}
              bundle={b}
              completedLevels={done}
              delay={i * 60}
              onClick={() => onPick(b.id)}
            />
          )
        })}
      </div>
    </div>
  )
}

function BundleCard({ bundle, completedLevels, delay, onClick }) {
  const { id, label, icon, color, bg, desc } = bundle
  return (
    <div
      className="bundle-card"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick()}
      aria-label={`Topik ${label}`}
      style={{
        animationDelay: `${delay}ms`,
        animation: `pageEnter .45s ${delay}ms cubic-bezier(.34,1.56,.64,1) both`,
      }}
    >
      {/* Coloured top stripe */}
      <div className="bundle-top" style={{ background: color }} />

      <div className="bundle-body" style={{ background: bg }}>
        <div className="bundle-icon">{icon}</div>
        <div className="bundle-name">{label}</div>
        <div className="bundle-desc">{desc}</div>

        {/* Progress pill */}
        {completedLevels > 0 && (
          <div style={{
            marginTop: 10,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            background: color + '22',
            color,
            fontWeight: 700,
            fontSize: '.78rem',
            borderRadius: 50,
            padding: '3px 10px',
          }}>
            ✅ {completedLevels}/10 Level Selesai
          </div>
        )}
      </div>
    </div>
  )
}
