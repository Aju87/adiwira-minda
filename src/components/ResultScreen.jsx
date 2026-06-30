import { useEffect, useState, useRef } from 'react'
import { STARS_PER_CORRECT, BONUS_STARS_PERFECT } from '../data/questions'

// Confetti colours
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
        <div
          key={p.id}
          className="confetti-piece"
          style={{
            left:             `${p.left}%`,
            background:       p.color,
            width:            p.size,
            height:           p.size * 1.2,
            animationDuration: `${p.dur}s`,
            animationDelay:   `${p.delay}s`,
            transform:        `rotate(${p.rotation}deg)`,
          }}
        />
      ))}
    </div>
  )
}

export default function ResultScreen({
  answers, questions, level, bundleMeta,
  onEarnStars, onPlayAgain, onNextLevel, onBack,
  hasNextLevel,
}) {
  const [earned, setEarned]   = useState(false)
  const correctCount = answers.filter(Boolean).length
  const total        = questions.length
  const isPerfect    = correctCount === total
  const starsEarned  = correctCount * STARS_PER_CORRECT + (isPerfect ? BONUS_STARS_PERFECT : 0)
  const pct          = Math.round((correctCount / total) * 100)

  // Grade
  const grade = pct >= 90 ? { label: 'Cemerlang! 🏆', color: '#FFD93D' }
              : pct >= 70 ? { label: 'Bagus! 🌟',      color: '#4ECA6F' }
              : pct >= 50 ? { label: 'Baik! 👍',         color: '#74B9FF' }
              :             { label: 'Cuba Lagi! 💙',    color: '#FF6B6B' }

  // Earn stars once on mount
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
        {/* Trophy / emoji */}
        <div className="result-emoji">
          {pct === 100 ? '🏆' : pct >= 70 ? '🌟' : pct >= 50 ? '👍' : '💙'}
        </div>

        {/* Grade */}
        <h2 className="result-title" style={{ color: grade.color }}>
          {grade.label}
        </h2>

        {/* Score text */}
        <p className="result-score">
          Kamu betul <strong>{correctCount}</strong> daripada <strong>{total}</strong> soalan ({pct}%)
        </p>

        {/* Stars earned */}
        <div className="star-earned">
          <span>⭐</span>
          <span>+{starsEarned} Bintang</span>
          {isPerfect && <span style={{ fontSize: '1rem', fontWeight: 600, opacity: .85 }}>
            (Termasuk bonus sempurna! 🎉)
          </span>}
        </div>

        {/* Per-question breakdown */}
        <div style={{
          display: 'flex', gap: 5, flexWrap: 'wrap', justifyContent: 'center',
          marginBottom: 28,
        }}>
          {answers.map((ok, i) => (
            <span key={i} style={{
              width: 36, height: 36, borderRadius: 8,
              background: ok ? '#EFFFEF' : '#FFF5F5',
              border: `2px solid ${ok ? '#4ECA6F' : '#FF6B6B'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.1rem',
            }}>
              {ok ? '✅' : '❌'}
            </span>
          ))}
        </div>

        {/* Level badge */}
        <div style={{
          background: 'rgba(255,255,255,.7)',
          backdropFilter: 'blur(8px)',
          border: '2px solid rgba(255,255,255,.9)',
          borderRadius: 50,
          padding: '6px 18px',
          fontSize: '.88rem',
          fontWeight: 700,
          color: 'var(--text-mid)',
          marginBottom: 24,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}>
          {bundleMeta?.icon} {bundleMeta?.label} · Level {level}
        </div>

        {/* Action buttons */}
        <div className="result-actions">
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
