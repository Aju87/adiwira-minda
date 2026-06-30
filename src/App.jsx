import { useState, useCallback } from 'react'
import {
  getQuestions, BUNDLES, AGE_GROUPS,
  TOTAL_LEVELS, STARS_PER_CORRECT, BONUS_STARS_PERFECT
} from './data/questions'
import Home          from './components/Home'
import AgeSelector   from './components/AgeSelector'
import BundleSelector  from './components/BundleSelector'
import LevelSelector   from './components/LevelSelector'
import QuestionScreen  from './components/QuestionScreen'
import ResultScreen    from './components/ResultScreen'

// ── Persist helpers ────────────────────────────────────────────────────────────
const loadStars    = () => parseInt(localStorage.getItem('am_stars') || '0', 10)
const loadProgress = () => { try { return JSON.parse(localStorage.getItem('am_progress') || '{}') } catch { return {} } }
const saveStars    = v  => localStorage.setItem('am_stars', v)
const saveProgress = v  => localStorage.setItem('am_progress', JSON.stringify(v))
const progKey      = (bundleId, ageGroup) => `${bundleId}_${ageGroup}`

export default function App() {
  const [screen,        setScreen]        = useState('home')
  const [selectedAge,   setSelectedAge]   = useState(null)
  const [selectedBundle,setSelectedBundle]= useState(null)
  const [selectedLevel, setSelectedLevel] = useState(null)
  const [currentQ,      setCurrentQ]      = useState(0)
  const [answers,       setAnswers]       = useState([])
  const [currentQuestions, setCurrentQuestions] = useState([])

  // Timeout tracking — indices into currentQuestions that ran out of time
  const [timeoutIndices, setTimeoutIndices] = useState([])
  // Retry round: playing the timed-out questions again
  const [isRetryRound,   setIsRetryRound]   = useState(false)

  const [stars,    setStars]    = useState(loadStars)
  const [progress, setProgress] = useState(loadProgress)

  // ── Derived ──────────────────────────────────────────────────────────────────
  const bundleMeta  = BUNDLES.find(b => b.id === selectedBundle)
  const ageMeta     = AGE_GROUPS.find(a => a.id === selectedAge)
  const progressKey = selectedBundle && selectedAge ? progKey(selectedBundle, selectedAge) : null

  // ── Navigation ────────────────────────────────────────────────────────────────
  const goHome   = () => setScreen('home')
  const goAge    = () => setScreen('age')
  const goBundle = () => setScreen('bundle')
  const goLevel  = () => { setIsRetryRound(false); setTimeoutIndices([]); setScreen('level') }

  const pickAge    = id => { setSelectedAge(id); setSelectedBundle(null); setScreen('bundle') }
  const pickBundle = id => { setSelectedBundle(id); setScreen('level') }

  const startQuestions = (qs) => {
    setCurrentQuestions(qs)
    setCurrentQ(0)
    setAnswers([])
    setTimeoutIndices([])
    setScreen('question')
  }

  const pickLevel = lvl => {
    setSelectedLevel(lvl)
    setIsRetryRound(false)
    startQuestions(getQuestions(selectedBundle, selectedAge, lvl))
  }

  // ── Answer handling ───────────────────────────────────────────────────────────
  const handleAnswer = useCallback(isCorrect => {
    setAnswers(prev => [...prev, isCorrect])
  }, [])

  const handleNextQuestion = useCallback(() => {
    setCurrentQ(q => {
      const next = q + 1
      if (next >= currentQuestions.length) {
        setScreen('result')
        return q
      }
      return next
    })
  }, [currentQuestions.length])

  // ── Timeout: deduct 10 stars, record which question timed out ─────────────────
  const handleTimeout = useCallback(questionIndex => {
    setTimeoutIndices(prev => [...prev, questionIndex])
    setStars(s => {
      const next = s - 10   // can go negative as per spec
      saveStars(next)
      return next
    })
  }, [])

  // ── Start retry round with timed-out questions ────────────────────────────────
  const startRetryRound = useCallback(() => {
    const retryQs = timeoutIndices.map(i => currentQuestions[i])
    if (retryQs.length === 0) { goLevel(); return }
    setIsRetryRound(true)
    setCurrentQuestions(retryQs)
    setCurrentQ(0)
    setAnswers([])
    setTimeoutIndices([])   // no further retry of retry
    setScreen('question')
  }, [timeoutIndices, currentQuestions])

  // ── Stars & progress after level ends ────────────────────────────────────────
  const earnStars = useCallback((starsToAdd, levelStars) => {
    setStars(s => {
      const next = s + starsToAdd
      saveStars(next)
      return next
    })
    if (!isRetryRound) {
      setProgress(prev => {
        const key   = progKey(selectedBundle, selectedAge)
        const entry = prev[key] || {}
        const best  = Math.max(entry[selectedLevel] || 0, levelStars)
        const next  = { ...prev, [key]: { ...entry, [selectedLevel]: best } }
        saveProgress(next)
        return next
      })
    }
  }, [selectedBundle, selectedAge, selectedLevel, isRetryRound])

  // ── Level progress helpers ────────────────────────────────────────────────────
  const getLevelStars = lvl => {
    if (!progressKey) return null
    return (progress[progressKey] || {})[lvl] ?? null
  }
  const getMaxUnlockedLevel = () => {
    if (!progressKey) return 1
    const done = Object.keys(progress[progressKey] || {}).map(Number)
    if (!done.length) return 1
    return Math.min(Math.max(...done) + 1, TOTAL_LEVELS)
  }

  // ── Screen render ─────────────────────────────────────────────────────────────
  const renderScreen = () => {
    switch (screen) {
      case 'home':
        return <Home totalStars={stars} onStart={goAge} />
      case 'age':
        return <AgeSelector onPick={pickAge} onBack={goHome} />
      case 'bundle':
        return <BundleSelector ageMeta={ageMeta} onPick={pickBundle} onBack={goAge} progress={progress} selectedAge={selectedAge} />
      case 'level':
        return (
          <LevelSelector
            bundleMeta={bundleMeta} ageMeta={ageMeta} totalStars={stars}
            maxUnlocked={getMaxUnlockedLevel()} getLevelStars={getLevelStars}
            onPick={pickLevel} onBack={goBundle}
          />
        )
      case 'question':
        return (
          <QuestionScreen
            questions={currentQuestions}
            currentQ={currentQ}
            answers={answers}
            bundleMeta={bundleMeta}
            isRetryRound={isRetryRound}
            onAnswer={handleAnswer}
            onNext={handleNextQuestion}
            onTimeout={handleTimeout}
            onQuit={goLevel}
          />
        )
      case 'result':
        return (
          <ResultScreen
            answers={answers}
            questions={currentQuestions}
            level={selectedLevel}
            bundleMeta={bundleMeta}
            timeoutCount={isRetryRound ? 0 : timeoutIndices.length}
            isRetryRound={isRetryRound}
            onEarnStars={earnStars}
            onStartRetry={startRetryRound}
            onPlayAgain={() => pickLevel(selectedLevel)}
            onNextLevel={() => {
              const next = selectedLevel < TOTAL_LEVELS ? selectedLevel + 1 : null
              if (next) pickLevel(next)
              else goLevel()
            }}
            onBack={goLevel}
            hasNextLevel={selectedLevel < TOTAL_LEVELS}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="sky-bg">
      <div className="cloud cloud-1" />
      <div className="cloud cloud-2" />
      <div className="cloud cloud-3" />
      <div className="cloud cloud-4" />
      <div className="cloud cloud-5" />

      <header className="app-header">
        <div className="app-logo">
          <span>⭐</span> Adiwira Minda
        </div>
        <div className="star-badge">
          ⭐ {stars.toLocaleString()}
        </div>
      </header>

      <div key={screen} className="page page-enter">
        {renderScreen()}
      </div>
    </div>
  )
}
