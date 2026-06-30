import { useState, useEffect, useRef } from 'react'

const OPTION_LABELS = ['A', 'B', 'C', 'D']

// Characters that "speak" during the game (placeholder)
const CHARS = [
  { name: 'Mega Wira', emoji: '🦸', color: '#4ECA6F' },
  { name: 'Puteri Bijak', emoji: '👸', color: '#FF9FF3' },
  { name: 'Kapten Zara', emoji: '🧑‍✈️', color: '#74B9FF' },
  { name: 'Cikgu Sakti', emoji: '🧙', color: '#A29BFE' },
]

const CORRECT_MSGS = [
  'Terbaik! Kamu hebat! 🎉',
  'Betul! Adiwira sejati! 💪',
  'Wah! Pandai sangat! ⭐',
  'Cemerlang! Teruskan! 🚀',
  'Tepat sekali! Luar biasa! 🏆',
]
const WRONG_MSGS = [
  'Takpe, cuba lagi! 💙',
  'Jangan give up, kita boleh! 🌟',
  'Hampir betul! Teruskan! 👍',
  'Belajar dari kesilapan — kamu pasti berjaya! 💪',
]

function pick(arr, seed) { return arr[seed % arr.length] }

export default function QuestionScreen({
  questions, currentQ, answers, bundleMeta,
  onAnswer, onNext, onQuit,
}) {
  const [selected,    setSelected]    = useState(null)   // index of chosen answer
  const [feedback,    setFeedback]    = useState(null)   // 'correct' | 'wrong' | null
  const [toastVisible, setToastVisible] = useState(false)
  const timerRef = useRef(null)

  const q       = questions[currentQ]
  const total   = questions.length
  const charIdx = (currentQ + (bundleMeta?.id?.charCodeAt(0) || 0)) % CHARS.length
  const char    = CHARS[charIdx]

  // Reset state when question changes
  useEffect(() => {
    setSelected(null)
    setFeedback(null)
    setToastVisible(false)
    clearTimeout(timerRef.current)
  }, [currentQ])

  const handlePick = (optIdx) => {
    if (selected !== null) return // already answered
    const isCorrect = optIdx === q.correct
    setSelected(optIdx)
    setFeedback(isCorrect ? 'correct' : 'wrong')
    setToastVisible(true)
    onAnswer(isCorrect)

    // Auto-advance after 1.6s
    timerRef.current = setTimeout(() => {
      setToastVisible(false)
      setTimeout(() => onNext(), 300)
    }, 1600)
  }

  if (!q) return null

  const progress = ((currentQ) / total) * 100
  const msgSeed  = currentQ + (bundleMeta?.id?.length || 0)

  return (
    <div className="question-wrap">
      {/* Top bar: quit + progress */}
      <div className="q-meta">
        <button className="back-btn btn-sm" onClick={onQuit} style={{ padding: '6px 14px', fontSize: '.82rem' }}>
          ✕ Keluar
        </button>
        <div className="progress-bar-wrap" style={{ flex: 1 }}>
          <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
        </div>
        <div className="q-counter">{currentQ + 1} / {total}</div>
      </div>

      {/* Score dots */}
      <div style={{ display: 'flex', gap: 5, marginBottom: 18, flexWrap: 'wrap' }}>
        {answers.map((correct, i) => (
          <span key={i} style={{
            width: 12, height: 12, borderRadius: '50%',
            background: correct ? '#4ECA6F' : '#FF6B6B',
            display: 'inline-block',
            boxShadow: correct ? '0 2px 6px rgba(78,202,111,.4)' : '0 2px 6px rgba(255,107,107,.4)',
          }} />
        ))}
        {Array.from({ length: total - answers.length }, (_, i) => (
          <span key={`empty-${i}`} style={{
            width: 12, height: 12, borderRadius: '50%',
            background: 'rgba(255,255,255,.5)',
            border: '1.5px solid rgba(0,0,0,.12)',
            display: 'inline-block',
          }} />
        ))}
      </div>

      {/* Character + story bubble */}
      <div className="char-wrap">
        <div className="char-avatar" style={{ fontSize: '3.8rem' }}>{char.emoji}</div>
        <div className="story-bubble" style={{ flex: 1 }}>
          <div className="char-label" style={{ color: char.color }}>{char.name}</div>
          <p>{q.story}</p>
        </div>
      </div>

      {/* Question */}
      <div className="question-text-box">
        <p className="q-text">❓ {q.question}</p>
      </div>

      {/* Answer buttons */}
      <div className="answer-grid">
        {q.options.map((opt, idx) => {
          let cls = 'answer-btn'
          if (selected !== null) {
            if (idx === q.correct) cls += ' reveal-correct'
            if (idx === selected && selected !== q.correct) cls += ' wrong'
            if (idx === selected && selected === q.correct) cls += ' correct'
          }

          return (
            <button
              key={idx}
              className={cls}
              onClick={() => handlePick(idx)}
              disabled={selected !== null}
              aria-label={`Pilihan ${OPTION_LABELS[idx]}: ${opt}`}
            >
              <span className="option-label">{OPTION_LABELS[idx]}</span>
              {opt}
            </button>
          )
        })}
      </div>

      {/* Feedback toast */}
      <div className={`feedback-toast ${toastVisible ? 'show' : ''} ${feedback === 'correct' ? 'correct-toast' : 'wrong-toast'}`}>
        <div className="toast-emoji">
          {feedback === 'correct' ? '🌟' : '💙'}
        </div>
        <div className="toast-title" style={{ color: feedback === 'correct' ? '#166534' : '#991B1B' }}>
          {feedback === 'correct' ? 'Betul!' : 'Salah!'}
        </div>
        <div className="toast-sub">
          {feedback === 'correct'
            ? pick(CORRECT_MSGS, msgSeed)
            : pick(WRONG_MSGS, msgSeed)}
        </div>
        {feedback === 'correct' && (
          <div style={{
            marginTop: 8,
            fontSize: '.85rem',
            fontWeight: 700,
            color: '#28A745',
          }}>
            +10 ⭐
          </div>
        )}
      </div>

      {/* Dimmed overlay when feedback shown */}
      {toastVisible && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,.35)',
            zIndex: 150, cursor: 'default',
          }}
          onClick={() => {
            clearTimeout(timerRef.current)
            setToastVisible(false)
            setTimeout(() => onNext(), 200)
          }}
        />
      )}
    </div>
  )
}
