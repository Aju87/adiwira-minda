import { TOTAL_LEVELS } from '../data/questions'

export default function LevelSelector({
  bundleMeta, ageMeta, totalStars,
  maxUnlocked, getLevelStars,
  onPick, onBack,
}) {
  return (
    <div className="level-screen-wrap">
      {/* Back */}
      <button className="back-btn mb-16" onClick={onBack}>
        ← Balik ke Topik
      </button>

      {/* Bundle header card */}
      <div className="level-header-card">
        <div className="level-bundle-icon">{bundleMeta?.icon}</div>
        <div className="level-bundle-info">
          <h2>{bundleMeta?.label}</h2>
          <p>
            {ageMeta?.label} · {ageMeta?.sublabel}
          </p>
        </div>
        {/* Stars earned badge */}
        <div style={{ marginLeft: 'auto' }}>
          <div style={{
            background: 'linear-gradient(135deg,#FFD93D,#FFBE00)',
            color: '#7A4800',
            fontWeight: 800,
            fontSize: '.95rem',
            padding: '8px 16px',
            borderRadius: 50,
            boxShadow: '0 3px 0 #C97A00',
            display: 'flex',
            alignItems: 'center',
            gap: 5,
          }}>
            ⭐ {totalStars.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Levels */}
      <div className="levels-grid-label">Pilih Level:</div>
      <div className="level-grid">
        {Array.from({ length: TOTAL_LEVELS }, (_, i) => i + 1).map(lvl => {
          const stars  = getLevelStars(lvl)
          const isDone = stars !== null
          const isOpen = lvl <= maxUnlocked
          const state  = isDone ? 'completed' : isOpen ? 'unlocked' : 'locked'

          return (
            <button
              key={lvl}
              className={`level-btn ${state}`}
              onClick={() => isOpen && onPick(lvl)}
              disabled={!isOpen}
              title={isOpen ? `Level ${lvl}` : 'Selesaikan level sebelumnya dahulu!'}
              aria-label={`Level ${lvl} — ${state === 'locked' ? 'terkunci' : state === 'completed' ? `selesai, ${stars} bintang` : 'sedia dimainkan'}`}
              style={{
                animationDelay: `${(lvl - 1) * 40}ms`,
                animation: `pageEnter .4s ${(lvl - 1) * 40}ms cubic-bezier(.34,1.56,.64,1) both`,
              }}
            >
              {state === 'locked' ? '🔒' : lvl}
              {isDone && (
                <span className="level-stars">
                  {'⭐'.repeat(Math.min(3, Math.ceil(stars / 30)))}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Legend */}
      <div style={{
        display: 'flex',
        gap: 14,
        flexWrap: 'wrap',
        marginTop: 28,
        justifyContent: 'center',
      }}>
        {[
          { cls: 'completed', icon: '🌟', label: 'Selesai' },
          { cls: 'unlocked',  icon: '▶️',  label: 'Sedia' },
          { cls: 'locked',    icon: '🔒', label: 'Terkunci' },
        ].map(it => (
          <div key={it.cls} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: '.83rem', fontWeight: 700, color: 'var(--text-mid)' }}>
            <span className={`level-btn ${it.cls}`} style={{ width: 28, height: 28, minWidth: 28, minHeight: 28, fontSize: '.8rem', cursor: 'default' }}>
              {it.icon}
            </span>
            {it.label}
          </div>
        ))}
      </div>
    </div>
  )
}
