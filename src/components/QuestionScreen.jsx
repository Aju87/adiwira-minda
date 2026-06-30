import { useState, useEffect, useRef } from 'react'

const OPTION_LABELS = ['A', 'B', 'C', 'D']
const TIMER_TOTAL   = 60

const CHARS = [
  { name: 'Mega Wira',    emoji: '🦸', color: '#4ECA6F' },
  { name: 'Puteri Bijak', emoji: '👸', color: '#FF9FF3' },
  { name: 'Kapten Zara',  emoji: '🧑‍✈️', color: '#74B9FF' },
  { name: 'Cikgu Sakti',  emoji: '🧙', color: '#A29BFE' },
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

// ── SVG Jam Randik (Stopwatch) Timer ────────────────────────────────────────
function TimerCircle({ seconds }) {
  const R     = 23
  const circ  = 2 * Math.PI * R
  const fill  = (seconds / TIMER_TOTAL) * circ
  const urgent = seconds <= 10
  const rim    = urgent ? '#8B0000' : '#CC0000'
  const stroke = urgent ? '#FF0000' : '#FF3333'
  const face   = urgent ? '#FFD0D0' : '#FFF0F0'

  // 12 tick marks around face
  const ticks = Array.from({ length: 12 }, (_, i) => {
    const a  = ((i * 30) - 90) * Math.PI / 180
    const r1 = 20, r2 = 16
    return {
      x1: 34 + r1 * Math.cos(a), y1: 50 + r1 * Math.sin(a),
      x2: 34 + r2 * Math.cos(a), y2: 50 + r2 * Math.sin(a),
      major: i % 3 === 0,
    }
  })

  return (
    <div style={{
      flexShrink: 0,
      animation: urgent ? 'pulseBounce .55s ease-in-out infinite' : 'none',
      filter: urgent ? 'drop-shadow(0 0 8px rgba(255,0,0,.55))' : 'drop-shadow(0 3px 6px rgba(180,0,0,.25))',
    }}>
      <svg width="68" height="82" viewBox="0 0 68 82" aria-label={`${seconds} saat berbaki`}>

        {/* ── Crown button (top centre) ── */}
        <rect x="27" y="1" width="14" height="8" rx="4" fill={rim} />
        {/* Crown stem */}
        <rect x="32" y="8" width="4" height="5" fill={rim} />

        {/* ── Side push-buttons ── */}
        <rect x="4"  y="22" width="9" height="6" rx="3" fill={rim} />
        <rect x="55" y="22" width="9" height="6" rx="3" fill={rim} />

        {/* ── Outer rim ── */}
        <circle cx="34" cy="50" r="30" fill={rim} />

        {/* ── Watch face ── */}
        <circle cx="34" cy="50" r="26" fill={face} />

        {/* ── Tick marks ── */}
        {ticks.map((t, i) => (
          <line
            key={i}
            x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2}
            stroke={t.major ? rim : '#FFAAAA'}
            strokeWidth={t.major ? 2.5 : 1.5}
            strokeLinecap="round"
          />
        ))}

        {/* ── Progress track (inner arc) ── */}
        <circle cx="34" cy="50" r={R}
          fill="none" stroke="#FFCCCC" strokeWidth="4.5" />

        {/* ── Countdown arc ── */}
        <circle
          cx="34" cy="50" r={R}
          fill="none"
          stroke={stroke}
          strokeWidth="4.5"
          strokeDasharray={circ}
          strokeDashoffset={circ - fill}
          strokeLinecap="round"
          transform="rotate(-90 34 50)"
          style={{ transition: 'stroke-dashoffset .9s linear' }}
        />

        {/* ── Centre dot ── */}
        <circle cx="34" cy="50" r="3" fill={rim} />

        {/* ── Seconds number ── */}
        <text
          x="34" y={seconds >= 10 ? '47' : '47'}
          textAnchor="middle"
          fontFamily="Lilita One, cursive"
          fontSize={seconds >= 10 ? '15' : '17'}
          fill={rim}
          dominantBaseline="middle"
        >
          {seconds}
        </text>

        {/* ── "s" label ── */}
        <text x="34" y="60" textAnchor="middle"
          fontFamily="Baloo 2, cursive" fontSize="9" fill={rim} fontWeight="700">
          saat
        </text>
      </svg>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function QuestionScreen({
  questions, currentQ, answers, bundleMeta,
  onAnswer, onNext, onTimeout, onQuit,
  isRetryRound,
}) {
  const [selected,     setSelected]     = useState(null)
  const [feedback,     setFeedback]     = useState(null) // 'correct'|'wrong'|'timeout'
  const [toastVisible, setToastVisible] = useState(false)
  const [timeLeft,     setTimeLeft]     = useState(TIMER_TOTAL)

  const toastTimer   = useRef(null)
  const intervalRef  = useRef(null)
  const doneRef      = useRef(false) // has this question been resolved?

  const q        = questions[currentQ]
  const total    = questions.length
  const charIdx  = (currentQ + (bundleMeta?.id?.charCodeAt(0) || 0)) % CHARS.length
  const char     = CHARS[charIdx]
  const msgSeed  = currentQ + (bundleMeta?.id?.length || 0)
  const progress = (currentQ / total) * 100

  // ── Reset everything when question changes ────────────────────────────────
  useEffect(() => {
    setSelected(null)
    setFeedback(null)
    setToastVisible(false)
    setTimeLeft(TIMER_TOTAL)
    doneRef.current = false
    clearTimeout(toastTimer.current)
    clearInterval(intervalRef.current)

    // Start countdown
    intervalRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(intervalRef.current)
          triggerTimeout()
          return 0
        }
        return t - 1
      })
    }, 1000)

    return () => {
      clearInterval(intervalRef.current)
      clearTimeout(toastTimer.current)
    }
  }, [currentQ]) // eslint-disable-line

  // ── Timeout handler ───────────────────────────────────────────────────────
  const triggerTimeout = () => {
    if (doneRef.current) return
    doneRef.current = true
    clearInterval(intervalRef.current)
    setSelected(-1)          // -1 = timed out, no option chosen
    setFeedback('timeout')
    setToastVisible(true)
    onAnswer(false)           // count as wrong in score
    onTimeout(currentQ)       // signal App to deduct 10 stars

    toastTimer.current = setTimeout(() => {
      setToastVisible(false)
      setTimeout(() => onNext(), 300)
    }, 1800)
  }

  // ── User picks an answer ──────────────────────────────────────────────────
  const handlePick = (optIdx) => {
    if (doneRef.current) return
    doneRef.current = true
    clearInterval(intervalRef.current)

    const isCorrect = optIdx === q.correct
    setSelected(optIdx)
    setFeedback(isCorrect ? 'correct' : 'wrong')
    setToastVisible(true)
    onAnswer(isCorrect)

    toastTimer.current = setTimeout(() => {
      setToastVisible(false)
      setTimeout(() => onNext(), 300)
    }, 1600)
  }

  if (!q) return null

  // ── Timer colour for bar ──────────────────────────────────────────────────
  const barColor  = timeLeft > 20 ? '#4ECA6F' : timeLeft > 10 ? '#FF9F43' : '#FF4757'
  const barWidth  = `${(timeLeft / TIMER_TOTAL) * 100}%`

  return (
    <div className="question-wrap">

      {/* ── TOP META BAR ─────────────────────────────────────────── */}
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
        <button
          className="back-btn"
          style={{ padding:'6px 14px', fontSize:'.82rem' }}
          onClick={onQuit}
        >
          ✕ Keluar
        </button>

        {/* Progress bar */}
        <div style={{ flex:1 }}>
          <div style={{
            height:12, background:'rgba(255,255,255,.5)',
            borderRadius:50, border:'2px solid rgba(255,255,255,.7)', overflow:'hidden',
          }}>
            <div style={{
              height:'100%', width:barWidth,
              background: `linear-gradient(90deg, ${barColor}, ${barColor}CC)`,
              borderRadius:50,
              boxShadow:`0 2px 8px ${barColor}66`,
              transition:'width .9s linear, background .4s',
            }} />
          </div>
        </div>

        {/* Question counter */}
        <div style={{ fontFamily:'var(--font-display)', fontSize:'1rem', color:'var(--text-mid)', whiteSpace:'nowrap' }}>
          {currentQ+1} / {total}
        </div>

        {/* Timer circle */}
        <TimerCircle seconds={timeLeft} />
      </div>

      {/* ── RETRY ROUND BANNER ───────────────────────────────────── */}
      {isRetryRound && (
        <div style={{
          background:'linear-gradient(135deg,#FF9F43,#FF6348)',
          color:'#fff',
          fontFamily:'var(--font-display)',
          fontSize:'.92rem',
          borderRadius:12,
          padding:'10px 16px',
          marginBottom:12,
          textAlign:'center',
          boxShadow:'0 4px 0 #B34500',
        }}>
          ⏰ Pusingan Ulangan — Soalan Yang Tamat Masa!
        </div>
      )}

      {/* ── ANSWER DOTS ──────────────────────────────────────────── */}
      <div style={{ display:'flex', gap:5, marginBottom:16, flexWrap:'wrap' }}>
        {answers.map((correct, i) => (
          <span key={i} style={{
            width:12, height:12, borderRadius:'50%',
            background: correct ? '#4ECA6F' : '#FF6B6B',
            display:'inline-block',
            boxShadow: correct ? '0 2px 6px rgba(78,202,111,.4)' : '0 2px 6px rgba(255,107,107,.4)',
          }} />
        ))}
        {Array.from({ length: total - answers.length }, (_, i) => (
          <span key={`e${i}`} style={{
            width:12, height:12, borderRadius:'50%',
            background:'rgba(255,255,255,.5)',
            border:'1.5px solid rgba(0,0,0,.12)',
            display:'inline-block',
          }} />
        ))}
      </div>

      {/* ── CHARACTER + STORY BUBBLE ─────────────────────────────── */}
      <div className="char-wrap">
        <div className="char-avatar">{char.emoji}</div>
        <div className="story-bubble" style={{ flex:1 }}>
          <div className="char-label" style={{ color: char.color }}>{char.name}</div>
          <p>{q.story}</p>
        </div>
      </div>

      {/* ── QUESTION ─────────────────────────────────────────────── */}
      <div className="question-text-box">
        <p className="q-text">❓ {q.question}</p>
      </div>

      {/* ── ANSWER OPTIONS ───────────────────────────────────────── */}
      <div className="answer-grid">
        {q.options.map((opt, idx) => {
          let cls = 'answer-btn'
          if (selected !== null && selected !== -1) {
            if (idx === q.correct)                           cls += ' reveal-correct'
            if (idx === selected && selected !== q.correct)  cls += ' wrong'
            if (idx === selected && selected === q.correct)  cls += ' correct'
          }
          if (selected === -1) {
            if (idx === q.correct) cls += ' reveal-correct'
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

      {/* ── FEEDBACK TOAST ───────────────────────────────────────── */}
      <div className={`feedback-toast ${toastVisible ? 'show' : ''} ${
        feedback === 'correct' ? 'correct-toast' :
        feedback === 'timeout' ? 'wrong-toast'   : 'wrong-toast'
      }`}>
        <div className="toast-emoji">
          {feedback === 'correct' ? '🌟' : feedback === 'timeout' ? '⏰' : '💙'}
        </div>
        <div className="toast-title" style={{
          color: feedback === 'correct' ? '#166534' : '#991B1B'
        }}>
          {feedback === 'correct' ? 'Betul!' : feedback === 'timeout' ? 'Masa Habis!' : 'Salah!'}
        </div>
        <div className="toast-sub">
          {feedback === 'correct'
            ? pick(CORRECT_MSGS, msgSeed)
            : feedback === 'timeout'
              ? '−10 ⭐ · Soalan ini akan muncul semula nanti!'
              : pick(WRONG_MSGS, msgSeed)}
        </div>
        {feedback === 'correct' && (
          <div style={{ marginTop:8, fontSize:'.85rem', fontWeight:700, color:'#28A745' }}>+10 ⭐</div>
        )}
      </div>

      {/* Dim overlay */}
      {toastVisible && (
        <div
          style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.35)', zIndex:150, cursor:'default' }}
          onClick={() => {
            clearTimeout(toastTimer.current)
            setToastVisible(false)
            setTimeout(() => onNext(), 200)
          }}
        />
      )}
    </div>
  )
}
