import { useEffect, useState, useRef } from 'react'
import { STARS_PER_CORRECT, BONUS_STARS_PERFECT } from '../data/questions'

const CONFETTI_COLORS = ['#FF6B6B','#4ECA6F','#FFD93D','#A29BFE','#74B9FF','#FD9B63','#FF9FF3','#3DD9DC']

function Confetti({ count = 60 }) {
  const pieces = useRef(
    Array.from({ length: count }, (_, i) => ({
      id: i,
      left:  Math.random() * 100,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      delay: Math.random() * 1.2,
      dur:   2.2 + Math.random() * 1.6,
      size:  8 + Math.random() * 10,
      rotation: Math.random() * 360,
    }))
  ).current

  return (
    <div className="confetti-wrap" aria-hidden="true">
      {pieces.map(p => (
        <div key={p.id} className="confetti-piece" style={{
          left: `${p.left}%`,
          background: p.color,
          width: p.size, height: p.size * 1.2,
          animationDuration: `${p.dur}s`,
          animationDelay: `${p.delay}s`,
          transform: `rotate(${p.rotation}deg)`,
        }} />
      ))}
    </div>
  )
}

export default function ResultScreen({
  answers, questions, level, bundleMeta,
  timeoutCount, isRetryRound,
  onEarnStars, onStartRetry,
  onPlayAgain, onNextLevel, onBack,
  hasNextLevel,
}) {
  const [earned, setEarned] = useState(false)

  const correctCount = answers.filter(Boolean).length
  const total        = questions.length
  const isPerfect    = correctCount === total && total > 0
  const pct          = total > 0 ? Math.round((correctCount / total) * 100) : 0
  const starsEarned  = correctCount * STARS_PER_CORRECT + (isPerfect ? BONUS_STARS_PERFECT : 0)

  const grade =
    pct >= 90 ? { label: 'Cemerlang! 🏆', color: '#FF8C00' } :
    pct >= 70 ? { label: 'Bagus! 🌟',      color: '#4ECA6F' } :
    pct >= 50 ? { label: 'Baik! 👍',         color: '#74B9FF' } :
                { label: 'Cuba Lagi! 💙',    color: '#FF6B6B' }

  useEffect(() => {
    if (!earned) {
      onEarnStars(starsEarned, starsEarned)
      setEarned(true)
    }
  }, []) // eslint-disable-line

  const showConfetti = pct >= 70

  return (
    <>
      {showConfetti && <Confetti count={isPerfect ? 90 : 55} />}

      <div className="result-wrap">

        {/* Retry round label */}
        {isRetryRound && (
          <div style={{
            background: 'linear-gradient(135deg,#FF9F43,#FF6348)',
            color: '#fff',
            fontFamily: 'var(--font-display)',
            fontSize: '.95rem',
            borderRadius: 14,
            padding: '10px 24px',
            marginBottom: 16,
            boxShadow: '0 4px 0 #B34500',
          }}>
            ⏰ Pusingan Ulangan Selesai!
          </div>
        )}

        {/* Trophy */}
        <div className="result-emoji">
          {pct === 100 ? '🏆' : pct >= 70 ? '🌟' : pct >= 50 ? '👍' : '💙'}
        </div>

        {/* Grade */}
        <h2 className="result-title" style={{ color: grade.color }}>
          {grade.label}
        </h2>

        {/* Score */}
        <p className="result-score">
          Betul <strong>{correctCount}</strong> daripada <strong>{total}</strong> soalan ({pct}%)
        </p>

        {/* Stars earned */}
        <div className="star-earned">
          <span>⭐</span>
          <span>+{starsEarned} Bintang</span>
          {isPerfect && (
            <span style={{ fontSize:'1rem', fontWeight:600, opacity:.85 }}>
              (Bonus Sempurna! 🎉)
            </span>
          )}
        </div>

        {/* Timeout info — only on main round */}
        {!isRetryRound && timeoutCount > 0 && (
          <div style={{
            background: 'linear-gradient(135deg, #FFF3E0, #FFE0B2)',
            border: '2.5px solid #FF9F43',
            borderRadius: 16,
            padding: '14px 20px',
            marginBottom: 20,
            textAlign: 'center',
            maxWidth: 340,
          }}>
            <div style={{ fontSize:'1.5rem', marginBottom:4 }}>⏰</div>
            <div style={{ fontFamily:'var(--font-display)', fontSize:'1rem', color:'#B36A00' }}>
              {timeoutCount} soalan tamat masa
            </div>
            <div style={{ fontSize:'.85rem', color:'#7A4800', fontWeight:600, marginTop:4 }}>
              −{timeoutCount * 10} ⭐ · Soalan ini akan diulang sekarang!
            </div>
          </div>
        )}

        {/* Per-question dots */}
        <div style={{
          display:'flex', gap:5, flexWrap:'wrap',
          justifyContent:'center', marginBottom:24,
        }}>
          {answers.map((ok, i) => (
            <span key={i} style={{
              width:36, height:36, borderRadius:8,
              background: ok ? '#EFFFEF' : '#FFF5F5',
              border: `2px solid ${ok ? '#4ECA6F' : '#FF6B6B'}`,
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:'1.1rem',
            }}>
              {ok ? '✅' : '❌'}
            </span>
          ))}
        </div>

        {/* Level badge */}
        <div style={{
          background:'rgba(255,255,255,.7)', backdropFilter:'blur(8px)',
          border:'2px solid rgba(255,255,255,.9)', borderRadius:50,
          padding:'6px 18px', fontSize:'.88rem', fontWeight:700,
          color:'var(--text-mid)', marginBottom:24,
          display:'flex', alignItems:'center', gap:8,
        }}>
          {bundleMeta?.icon} {bundleMeta?.label} · Level {level}
        </div>

        {/* Action buttons */}
        <div className="result-actions">
          {/* Retry timed-out questions — main round only */}
          {!isRetryRound && timeoutCount > 0 && (
            <button
              className="btn full-w"
              onClick={onStartRetry}
              style={{
                background:'linear-gradient(135deg,#FF9F43,#FF6348)',
                color:'#fff', fontFamily:'var(--font-display)', fontSize:'1.05rem',
                padding:'16px 20px', borderRadius:14,
                boxShadow:'0 6px 0 #B34500, 0 10px 24px rgba(255,100,0,.35)',
                border:'none', cursor:'pointer',
              }}
            >
              ⏰ Cuba Soalan Yang Tertinggal! ({timeoutCount})
            </button>
          )}

          {/* Next level */}
          {hasNextLevel && pct >= 50 && (
            <button className="btn btn-primary full-w" onClick={onNextLevel}>
              ➡️ Level Seterusnya
            </button>
          )}

          <button className="btn btn-yellow full-w" onClick={onPlayAgain}>
            🔄 Cuba Semula Level Ini
          </button>

          <button className="btn btn-ghost full-w" onClick={onBack}>
            📋 Pilih Level Lain
          </button>
        </div>
      </div>
    </>
  )
}
