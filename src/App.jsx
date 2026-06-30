import { useState, useCallback } from 'react'
import {
  getQuestions, BUNDLES, AGE_GROUPS, TOTAL_LEVELS
} from './data/questions'
import {
  loadChildren, saveChildren,
  loadStars, saveStars,
  loadProgress, saveProgress,
} from './lib/storage'
import Home           from './components/Home'
import BundleSelector from './components/BundleSelector'
import LevelSelector  from './components/LevelSelector'
import QuestionScreen from './components/QuestionScreen'
import ResultScreen   from './components/ResultScreen'
import LoginScreen    from './components/LoginScreen'
import AdminPanel     from './components/AdminPanel'
import ChildSelector  from './components/ChildSelector'
import AddChild       from './components/AddChild'

const pgKey = (bundleId, ageGroup) => `${bundleId}_${ageGroup}`

// ── Cloud helper ──────────────────────────────────────────────────────────────
const Clouds = () => (
  <>
    <div className="cloud cloud-1" /><div className="cloud cloud-2" />
    <div className="cloud cloud-3" /><div className="cloud cloud-4" />
    <div className="cloud cloud-5" />
  </>
)

export default function App() {

  // ── Auth ──────────────────────────────────────────────────────────────────
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('am_auth') || 'null') } catch { return null }
  })

  // ── Child profiles ────────────────────────────────────────────────────────
  const [children,     setChildren]     = useState(() => {
    try {
      const u = JSON.parse(localStorage.getItem('am_auth') || 'null')
      return u ? loadChildren(u.wa) : []
    } catch { return [] }
  })
  const [activeChild,  setActiveChild]  = useState(null)
  const [editingChild, setEditingChild] = useState(null)

  // ── Screens ───────────────────────────────────────────────────────────────
  const [screen,          setScreen]          = useState('childSelect')
  const [selectedBundle,  setSelectedBundle]  = useState(null)
  const [selectedLevel,   setSelectedLevel]   = useState(null)
  const [currentQ,        setCurrentQ]        = useState(0)
  const [answers,         setAnswers]         = useState([])
  const [currentQuestions,setCurrentQuestions]= useState([])

  // ── Timeout / retry ───────────────────────────────────────────────────────
  const [timeoutIndices, setTimeoutIndices] = useState([])
  const [isRetryRound,   setIsRetryRound]   = useState(false)

  // ── Stars + progress (per child) ──────────────────────────────────────────
  const [stars,    setStars]    = useState(0)
  const [progress, setProgress] = useState({})

  // ── Derived ───────────────────────────────────────────────────────────────
  const bundleMeta  = BUNDLES.find(b => b.id === selectedBundle)
  const ageMeta     = activeChild ? AGE_GROUPS.find(a => a.id === activeChild.ageGroup) : null
  const progressKey = selectedBundle && activeChild
    ? pgKey(selectedBundle, activeChild.ageGroup) : null

  // ── Auth handlers ─────────────────────────────────────────────────────────
  const handleLogin = (session) => {
    setUser(session)
    const kids = loadChildren(session.wa)
    setChildren(kids)
    setScreen('childSelect')
  }

  const handleLogout = () => {
    localStorage.removeItem('am_auth')
    setUser(null)
    setActiveChild(null)
    setChildren([])
    setStars(0)
    setProgress({})
    setScreen('childSelect')
  }

  // ── Child handlers ────────────────────────────────────────────────────────
  const handleSelectChild = (child) => {
    setActiveChild(child)
    setStars(loadStars(user.wa, child.id))
    setProgress(loadProgress(user.wa, child.id))
    setSelectedBundle(null)
    setSelectedLevel(null)
    setScreen('home')
  }

  const handleSaveChild = (child) => {
    const updated = editingChild
      ? children.map(c => c.id === child.id ? child : c)
      : [...children, child]
    setChildren(updated)
    saveChildren(user.wa, updated)
    // If editing the active child, refresh it
    if (activeChild && activeChild.id === child.id) {
      setActiveChild(child)
    }
    setEditingChild(null)
    setScreen('childSelect')
  }

  const handleEditChild = (child) => {
    setEditingChild(child)
    setScreen('addChild')
  }

  // ── Navigation ────────────────────────────────────────────────────────────
  const goHome   = () => setScreen('home')
  const goBundle = () => setScreen('bundle')
  const goLevel  = () => { setIsRetryRound(false); setTimeoutIndices([]); setScreen('level') }

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
    startQuestions(getQuestions(selectedBundle, activeChild.ageGroup, lvl))
  }

  // ── Answer handling ───────────────────────────────────────────────────────
  const handleAnswer = useCallback(isCorrect => {
    setAnswers(prev => [...prev, isCorrect])
  }, [])

  const handleNextQuestion = useCallback(() => {
    setCurrentQ(q => {
      const next = q + 1
      if (next >= currentQuestions.length) { setScreen('result'); return q }
      return next
    })
  }, [currentQuestions.length])

  // ── Timeout ───────────────────────────────────────────────────────────────
  const handleTimeout = useCallback(questionIndex => {
    setTimeoutIndices(prev => [...prev, questionIndex])
    setStars(s => {
      const next = s - 10
      if (user && activeChild) saveStars(user.wa, activeChild.id, next)
      return next
    })
  }, [user, activeChild])

  // ── Retry round ───────────────────────────────────────────────────────────
  const startRetryRound = useCallback(() => {
    const retryQs = timeoutIndices.map(i => currentQuestions[i])
    if (!retryQs.length) { goLevel(); return }
    setIsRetryRound(true)
    setCurrentQuestions(retryQs)
    setCurrentQ(0)
    setAnswers([])
    setTimeoutIndices([])
    setScreen('question')
  }, [timeoutIndices, currentQuestions])

  // ── Stars & progress after level ──────────────────────────────────────────
  const earnStars = useCallback((starsToAdd, levelStars) => {
    setStars(s => {
      const next = s + starsToAdd
      if (user && activeChild) saveStars(user.wa, activeChild.id, next)
      return next
    })
    if (!isRetryRound && user && activeChild) {
      setProgress(prev => {
        const key   = pgKey(selectedBundle, activeChild.ageGroup)
        const entry = prev[key] || {}
        const best  = Math.max(entry[selectedLevel] || 0, levelStars)
        const next  = { ...prev, [key]: { ...entry, [selectedLevel]: best } }
        saveProgress(user.wa, activeChild.id, next)
        return next
      })
    }
  }, [user, activeChild, selectedBundle, selectedLevel, isRetryRound])

  // ── Level helpers ─────────────────────────────────────────────────────────
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

  // ── /admin route ──────────────────────────────────────────────────────────
  if (window.location.pathname === '/admin') {
    return (
      <div className="sky-bg">
        <Clouds />
        <header className="app-header">
          <div className="app-logo"><span>⭐</span> Adiwira Minda</div>
          <a href="/" style={backLinkSt}>← Balik ke App</a>
        </header>
        <div className="page page-enter">
          <AdminPanel onBack={() => { window.location.href = '/' }} />
        </div>
      </div>
    )
  }

  // ── Not logged in ─────────────────────────────────────────────────────────
  if (!user) {
    return (
      <div className="sky-bg">
        <Clouds />
        <LoginScreen onLogin={handleLogin} />
      </div>
    )
  }

  // ── Child select / add child screens ─────────────────────────────────────
  if (screen === 'childSelect' || screen === 'addChild') {
    return (
      <div className="sky-bg">
        <Clouds />
        <header className="app-header">
          <div className="app-logo"><span>⭐</span> Adiwira Minda</div>
          <div style={{ fontSize:'.8rem', fontWeight:700, color:'rgba(0,60,80,.6)',
            fontFamily:'var(--font-body)' }}>
            📱 {user.wa}
          </div>
        </header>
        <div key={screen} className="page page-enter">
          {screen === 'childSelect' ? (
            <ChildSelector
              wa={user.wa}
              children={children}
              onSelect={handleSelectChild}
              onAdd={() => { setEditingChild(null); setScreen('addChild') }}
              onEdit={handleEditChild}
              onLogout={handleLogout}
            />
          ) : (
            <AddChild
              existingChild={editingChild}
              onSave={handleSaveChild}
              onBack={() => setScreen('childSelect')}
            />
          )}
        </div>
      </div>
    )
  }

  // ── Main app (child active) ───────────────────────────────────────────────
  const renderScreen = () => {
    switch (screen) {
      case 'home':
        return (
          <Home
            totalStars={stars}
            activeChild={activeChild}
            onStart={goBundle}
            onChangeChild={() => setScreen('childSelect')}
          />
        )
      case 'bundle':
        return (
          <BundleSelector
            ageMeta={ageMeta}
            onPick={pickBundle}
            onBack={goHome}
            progress={progress}
            selectedAge={activeChild.ageGroup}
          />
        )
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
              next ? pickLevel(next) : goLevel()
            }}
            onBack={goLevel}
            hasNextLevel={selectedLevel < TOTAL_LEVELS}
          />
        )
      default: return null
    }
  }

  return (
    <div className="sky-bg">
      <Clouds />
      <header className="app-header">
        <div className="app-logo"><span>⭐</span> Adiwira Minda</div>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          {/* Active child chip */}
          <button
            onClick={() => setScreen('childSelect')}
            title="Tukar profil anak"
            style={{
              display:'flex', alignItems:'center', gap:6,
              background:'rgba(255,255,255,.75)', border:'2px solid rgba(255,255,255,.9)',
              borderRadius:50, padding:'5px 14px',
              fontFamily:'var(--font-body)', fontWeight:700, fontSize:'.82rem',
              cursor:'pointer', color:'#334', backdropFilter:'blur(8px)',
            }}
          >
            <span style={{ fontSize:'1.1rem' }}>{activeChild.icon}</span>
            {activeChild.name}
          </button>
          {/* Stars */}
          <div className="star-badge">⭐ {stars.toLocaleString()}</div>
          {/* Logout */}
          <button
            onClick={handleLogout}
            title="Log Keluar"
            style={{
              background:'rgba(255,255,255,.7)', border:'2px solid rgba(255,255,255,.9)',
              borderRadius:50, padding:'6px 12px',
              fontFamily:'var(--font-body)', fontWeight:700, fontSize:'.82rem',
              cursor:'pointer', color:'#667', backdropFilter:'blur(8px)',
            }}
          >
            🚪
          </button>
        </div>
      </header>
      <div key={screen} className="page page-enter">
        {renderScreen()}
      </div>
    </div>
  )
}

const backLinkSt = {
  background:'rgba(255,255,255,.7)', border:'2px solid rgba(255,255,255,.9)',
  borderRadius:50, padding:'7px 16px',
  fontFamily:'var(--font-body)', fontWeight:700, fontSize:'.85rem',
  color:'#334', textDecoration:'none',
}
