export default function Home({ totalStars, onStart }) {
  return (
    <div className="hero-wrap">
      {/* Main character */}
      <div className="hero-character" role="img" aria-label="Adiwira Minda">
        🦸
      </div>

      {/* App title */}
      <h1 className="hero-title">
        Adiwira<br />
        <span style={{ color: 'var(--teal-dark)' }}>Minda</span>
      </h1>

      {/* Tagline */}
      <p className="hero-sub">
        Belajar Matematik Bersama Adiwira! 🌟<br />
        <span style={{ fontSize: '.95em', fontWeight: 500, color: 'var(--text-mid)' }}>
          Seronok · Pantas · Mengikut Silibus KSSR
        </span>
      </p>

      {/* CTA */}
      <button
        className="btn btn-primary btn-lg hero-start-btn"
        onClick={onStart}
        aria-label="Mula bermain"
      >
        🚀 Mula Main!
      </button>

      {/* Stars display */}
      {totalStars > 0 && (
        <div className="hero-stars-display slide-up">
          <span>⭐</span>
          <span>Jumlah Bintang Kamu: <strong>{totalStars.toLocaleString()}</strong></span>
        </div>
      )}

      {/* Feature pills */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center', marginTop: 32 }}>
        {['6 Topik Utama','3 Peringkat Umur','10 Level Setiap Topik','Sistem Bintang Ganjaran'].map(f => (
          <span key={f} style={{
            background: 'rgba(255,255,255,.75)',
            backdropFilter: 'blur(8px)',
            border: '2px solid rgba(255,255,255,.9)',
            borderRadius: 50,
            padding: '6px 16px',
            fontSize: '.85rem',
            fontWeight: 700,
            color: 'var(--teal-dark)',
            boxShadow: 'var(--shadow-sm)',
          }}>
            ✅ {f}
          </span>
        ))}
      </div>

      {/* Wavy bottom decoration */}
      <svg
        viewBox="0 0 1440 80"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          pointerEvents: 'none',
          opacity: .35,
        }}
        aria-hidden="true"
      >
        <path
          d="M0,40 C240,80 480,0 720,40 C960,80 1200,0 1440,40 L1440,80 L0,80 Z"
          fill="white"
        />
      </svg>
    </div>
  )
}
