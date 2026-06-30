import { useState, useCallback, useEffect } from 'react'
import {
  getQuestions, BUNDLES, AGE_GROUPS,
  TOTAL_LEVELS, STARS_PER_CORRECT, BONUS_STARS_PERFECT
} from './data/questions'
import Home        from './components/Home'
import AgeSelector from './components/AgeSelector'
import BundleSelector from './components/BundleSelector'
import LevelSelector  from './components/LevelSelector'
import QuestionScreen from './components/QuestionScreen'
import ResultScreen   from './components/ResultScreen'

// ── Persist helpers ────────────────────────────────────────────────────────────
const loadStars    = () => parseInt(localStorage.getItem('am_stars') || '0', 10)
const loadProgress = () => { try { return JSON.parse(localStorage.getItem('am_progress') || '{}') } catch { return {} } }
const saveStars    = (v) => localStorage.setItem('am_stars', v)
const saveProgress = (v) => localStorage.setItem('am_progress', JSON.stringify(v))

// ── progressKey: "bundleId_ageGroup" ──────────────────────────────────────────
const progKey = (bundleId, ageGroup) => `${bundleId}_${ageGroup}`

export default function App() {
  const [screen, setScreen]       = useState('home')        // home|age|bundle|level|question|result
  const [selectedAge,    setSelectedAge]    = useState(null) // 1|2|3
  const [selectedBundle, setSelectedBundle] = useState(null) // bundle id string
  const [selectedLevel,  setSelectedLevel]  = useState(null) // 1-10
  const [currentQ,       setCurrentQ]       = useState(0)
  const [answers,        setAnswers]         = useState([])   // array of booleans
  const [currentQuestions, setCurrentQuestions] = useState([])
  const [stars,    setStars]    = useState(loadStars)
  const [progress, setProgress] = useState(loadProgress)    // { key: { level: starsEarned } }

  // Derived
  const bundleMeta  = BUNDLES.find(b => b.id === selectedBundle)
  const ageMeta     = AGE_GROUPS.find(a => a.id === selectedAge)
  const progressKey = selectedBundle && selectedAge ? progKey(selectedBundle, selectedAge) : null

  // ── Navigation ───────────────────────────────────────────────────────────────
  const goHome   = () => setScreen('home')
  const goAge    = () => setScreen('age')
  const goBundle = () => setScreen('bundle')
  const goLevel  = () => setScreen('level')

  const pickAge = (id) => { setSelectedAge(id); setSelectedBundle(null); setScreen('bundle') }
  const pickBundle = (id) => { setSelectedBundle(id); setScreen('level') }

  const pickLevel = (lvl) => {
    const qs = getQuestions(selectedBundle, selectedAge, lvl)
    setSelectedLevel(lvl)
    setCurrentQuestions(qs)
    setCurrentQ(0)
    setAnswers([])
    setScreen('question')
  }

  // ── Answer handling ──────────────────────────────────────────────────────────
  const handleAnswer = useCallback((isCorrect) => {
    setAnswers(prev => [...prev, isCorrect])
  }, [])

  const handleNextQuestion = useCallback(() => {
    if (currentQ + 1 >= currentQuestions.length) {
      setScreen('result')
    } else {
      setCurrentQ(q => q + 1)
    }
  }, [currentQ, currentQuestions.length])

  // ── Stars & Progress save ────────────────────────────────────────────────────
  const earnStars = useCallback((starsToAdd, levelStars) => {
    setStars(s => {
      const next = s + starsToAdd
      saveStars(next)
      return next
    })
    // Record level progress
    setProgress(prev => {
      const key   = progKey(selectedBundle, selectedAge)
      const entry = prev[key] || {}
      const best  = Math.max(entry[selectedLevel] || 0, levelStars)
      const next  = { ...prev, [key]: { ...entry, [selectedLevel]: best } }
      saveProgress(next)
      return next
    })
  }, [selectedBundle, selectedAge, selectedLevel])

  // ── Get level progress for display ──────────────────────────────────────────
  const getLevelStars = (lvl) => {
    if (!progressKey) return null
    return (progress[progressKey] || {})[lvl] ?? null
  }

  const getMaxUnlockedLevel = () => {
    if (!progressKey) return 1
    const done = Object.keys((progress[progressKey] || {})).map(Number)
    if (done.length === 0) return 1
    const maxDone = Math.max(...done)
    return Math.min(maxDone + 1, TOTAL_LEVELS)
  }

  // ── Screen render ────────────────────────────────────────────────────────────
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
            bundleMeta={bundleMeta}
            ageMeta={ageMeta}
            totalStars={stars}
            maxUnlocked={getMaxUnlockedLevel()}
            getLevelStars={getLevelStars}
            onPick={pickLevel}
            onBack={goBundle}
          />
        )
      case 'question':
        return (
          <QuestionScreen
            questions={currentQuestions}
            currentQ={currentQ}
            answers={answers}
            bundleMeta={bundleMeta}
            onAnswer={handleAnswer}
            onNext={handleNextQuestion}
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
            onEarnStars={earnStars}
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
      {/* Floating clouds */}
      <div className="cloud cloud-1" />
      <div className="cloud cloud-2" />
      <div className="cloud cloud-3" />
      <div className="cloud cloud-4" />
      <div className="cloud cloud-5" />

      {/* Header */}
      <header className="app-header">
        <div className="app-logo">
          <span>⭐</span> Adiwira Minda
        </div>
        <div className="star-badge">
          ⭐ {stars.toLocaleString()}
        </div>
      </header>

      {/* Active screen */}
      <div key={screen} className="page page-enter">
        {renderScreen()}
      </div>
    </div>
  )
}
