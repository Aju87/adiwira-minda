import { AGE_GROUP_LABEL } from '../lib/storage'

const FEATURES = [
  { icon: '🎯', text: '6 Topik Utama',           bg: '#FF6B6B', shadow: '#C0392B' },
  { icon: '⚡', text: '10 Level Setiap Topik',    bg: '#FF9F43', shadow: '#B36A00' },
  { icon: '🏆', text: 'Sistem Bintang Ganjaran',  bg: '#A29BFE', shadow: '#5F52CC' },
  { icon: '📐', text: 'Silibus KSSR Malaysia',    bg: '#5352ED', shadow: '#2C2BAA' },
]

export default function Home({ totalStars, activeChild, onStart, onChangeChild }) {
  const grpInfo = activeChild ? (AGE_GROUP_LABEL[activeChild.ageGroup] || AGE_GROUP_LABEL[1]) : null

  return (
    <div className="hero-wrap">

      {/* Floating sparkles */}
      {['✨','⭐','💫','🌟','✨'].map((s, i) => (
        <span key={i} aria-hidden="true" style={{
          position:'absolute', fontSize:`${1.2 + i * 0.3}rem`,
          top:`${10 + i * 13}%`,
          left: i % 2 === 0 ? `${5 + i * 4}%` : undefined,
          right: i % 2 !== 0 ? `${4 + i * 4}%` : undefined,
          animation:`floatCloud ${14 + i * 3}s ease-in-out infinite ${i * 1.2}s`,
          pointerEvents:'none', userSelect:'none', opacity:.7,
        }}>{s}</span>
      ))}

      {/* Active child card */}
      {activeChild && (
        <div style={{
          display:'flex', alignItems:'center', gap:12,
          background:'rgba(255,255,255,.8)', backdropFilter:'blur(12px)',
          borderRadius:20, padding:'12px 20px',
          border:'2.5px solid rgba(255,255,255,.95)',
          boxShadow:'0 8px 24px rgba(0,0,0,.1)',
          marginBottom:20, position:'relative', zIndex:2,
        }}>
          <div style={{ fontSize:'2.8rem', animation:'heroFloat 4s ease-in-out infinite', lineHeight:1 }}>
            {activeChild.icon}
          </div>
          <div>
            <div style={{ fontFamily:'var(--font-display)', fontSize:'1.2rem', color:'#1A2A4A' }}>
              {activeChild.name}
            </div>
            <div style={{ fontFamily:'var(--font-body)', fontWeight:700, fontSize:'.78rem', color:'#666' }}>
              {activeChild.age} tahun · {grpInfo?.emoji} {grpInfo?.label}
            </div>
          </div>
          <button
            onClick={onChangeChild}
            style={{
              marginLeft:'auto',
              background:'rgba(0,0,0,.06)', border:'none',
              borderRadius:50, padding:'6px 14px',
              fontFamily:'var(--font-body)', fontWeight:700,
              fontSize:'.78rem', color:'#556', cursor:'pointer',
            }}
          >
            Tukar ↗
          </button>
        </div>
      )}

      {/* Title */}
      <h1 className="hero-title" style={{
        textShadow:'0 3px 0 rgba(255,255,255,.9), 0 6px 20px rgba(0,0,0,.12)',
        color:'#1A2A4A',
      }}>
        Adiwira<br />
        <span style={{
          color:'#0099BB',
          textShadow:'0 3px 0 rgba(255,255,255,.8), 0 6px 16px rgba(0,150,180,.25)',
        }}>Minda</span>
      </h1>

      {/* Tagline */}
      <p style={{
        fontFamily:'var(--font-body)', fontWeight:700,
        fontSize:'clamp(1rem,2.5vw,1.2rem)', color:'#006080',
        marginBottom:28, textAlign:'center', maxWidth:480, lineHeight:1.5,
      }}>
        Belajar Matematik Bersama Adiwira! 🌟<br />
        <span style={{ fontWeight:500, color:'#337F99', fontSize:'.95em' }}>
          Seronok · Pantas · Mengikut Silibus KSSR
        </span>
      </p>

      {/* CTA Button */}
      <button
        onClick={onStart}
        aria-label="Mula bermain"
        style={{
          fontFamily:'var(--font-display)',
          fontSize:'clamp(1.25rem,3vw,1.55rem)',
          color:'#fff',
          background:'linear-gradient(160deg,#FF8C00 0%,#FF5E00 100%)',
          border:'3px solid rgba(255,255,255,.35)',
          borderRadius:20, padding:'20px 60px',
          cursor:'pointer',
          boxShadow:'0 10px 0 #B83D00, 0 16px 40px rgba(255,90,0,.45)',
          transition:'transform .12s, box-shadow .12s',
          letterSpacing:'.02em',
          animation:'pulseBounce 2s ease-in-out infinite',
          position:'relative', zIndex:2,
        }}
        onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.08)' }}
        onMouseLeave={e => { e.currentTarget.style.filter = '' }}
        onMouseDown={e  => { e.currentTarget.style.transform='translateY(8px)'; e.currentTarget.style.boxShadow='0 2px 0 #B83D00, 0 4px 16px rgba(255,90,0,.3)' }}
        onMouseUp={e    => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='' }}
      >
        🚀&nbsp; Mula Main!
      </button>

      {/* Stars */}
      {totalStars > 0 && (
        <div style={{
          marginTop:22, fontFamily:'var(--font-body)', fontWeight:700,
          fontSize:'1rem', color:'#006080',
          display:'flex', alignItems:'center', gap:6,
          background:'rgba(255,255,255,.65)', backdropFilter:'blur(8px)',
          borderRadius:50, padding:'7px 20px',
          border:'2px solid rgba(255,255,255,.9)',
          boxShadow:'0 3px 12px rgba(0,0,0,.1)',
        }}>
          ⭐ Bintang {activeChild?.name || 'Kamu'}: <strong>{totalStars.toLocaleString()}</strong>
        </div>
      )}

      {/* Feature pills */}
      <div style={{
        display:'flex', flexWrap:'wrap', gap:12,
        justifyContent:'center', marginTop:32, maxWidth:600,
      }}>
        {FEATURES.map(f => (
          <div key={f.text} style={{
            display:'flex', alignItems:'center', gap:8,
            background:f.bg, color:'#fff',
            fontFamily:'var(--font-body)', fontWeight:800,
            fontSize:'.92rem', borderRadius:14, padding:'10px 18px',
            boxShadow:`0 5px 0 ${f.shadow}, 0 8px 20px ${f.bg}55`,
            border:'2.5px solid rgba(255,255,255,.3)',
            letterSpacing:'.01em',
          }}>
            <span style={{ fontSize:'1.3rem', lineHeight:1 }}>{f.icon}</span>
            {f.text}
          </div>
        ))}
      </div>

      {/* Bottom wave */}
      <svg viewBox="0 0 1440 80" xmlns="http://www.w3.org/2000/svg"
        style={{ position:'absolute', bottom:0, left:0, width:'100%', pointerEvents:'none', opacity:.3 }}
        aria-hidden="true"
      >
        <path d="M0,40 C240,80 480,0 720,40 C960,80 1200,0 1440,40 L1440,80 L0,80 Z" fill="white" />
      </svg>
    </div>
  )
}
