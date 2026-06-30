import { AGE_GROUPS } from '../data/questions'

export default function AgeSelector({ onPick, onBack }) {
  return (
    <div style={{ padding: '32px 24px', position: 'relative', zIndex: 1 }}>
      {/* Back */}
      <button className="back-btn mb-24" onClick={onBack}>
        ← Balik
      </button>

      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: 36 }}>
        <h2 className="section-title">Pilih Peringkat Umur</h2>
        <p className="section-sub">Soalan akan disesuaikan mengikut umur kamu 🎯</p>
      </div>

      {/* Age cards */}
      <div className="age-cards">
        {AGE_GROUPS.map((ag, i) => (
          <AgeCard key={ag.id} ag={ag} delay={i * 80} onClick={() => onPick(ag.id)} />
        ))}
      </div>
    </div>
  )
}

function AgeCard({ ag, delay, onClick }) {
  return (
    <div
      className="age-card"
      style={{
        animationDelay: `${delay}ms`,
        animation: `pageEnter .45s ${delay}ms cubic-bezier(.34,1.56,.64,1) both`,
      }}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick()}
      aria-label={`Pilih peringkat ${ag.label}`}
    >
      <div className="age-card-icon">{ag.icon}</div>
      <div className="age-card-label">{ag.label}</div>
      <div
        className="age-card-sublabel"
        style={{ background: ag.color + '22', color: ag.color }}
      >
        {ag.sublabel}
      </div>
      <div className="age-card-desc">{ag.desc}</div>

      {/* Decorative glow */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: 'var(--radius-md)',
        background: `radial-gradient(circle at 50% 0%, ${ag.color}18 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />
    </div>
  )
}
