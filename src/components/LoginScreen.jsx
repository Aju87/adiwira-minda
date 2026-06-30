import { useState } from 'react'
import { redeemCode, normalizeWA } from '../lib/supabase'

export default function LoginScreen({ onLogin }) {
  const [wa,      setWa]      = useState('')
  const [code,    setCode]    = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const handleLogin = async () => {
    setError('')
    const waNum = normalizeWA(wa)
    if (waNum.length < 10 || waNum.length > 13) {
      setError('Nombor WhatsApp tidak sah. Contoh: 0123456789'); return
    }
    if (code.trim().length < 4) {
      setError('Sila masukkan kod akses anda.'); return
    }

    setLoading(true)
    const result = await redeemCode(code, waNum)
    setLoading(false)

    if (result.success) {
      const session = { wa: waNum, code: code.trim().toUpperCase(), loginAt: Date.now() }
      localStorage.setItem('am_auth', JSON.stringify(session))
      onLogin(session)
    } else {
      setError(result.error)
    }
  }

  const handleKeyDown = e => { if (e.key === 'Enter') handleLogin() }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
      position: 'relative',
      zIndex: 1,
    }}>

      {/* Logo */}
      <div style={{ marginBottom: 8, fontSize: '4rem', animation: 'heroFloat 4s ease-in-out infinite' }}>
        🦸
      </div>
      <h1 style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'clamp(1.8rem, 5vw, 2.8rem)',
        color: '#1A2A4A',
        textShadow: '0 3px 0 rgba(255,255,255,.8)',
        marginBottom: 4,
        textAlign: 'center',
      }}>
        Adiwira Minda
      </h1>
      <p style={{
        fontFamily: 'var(--font-body)',
        fontWeight: 700,
        fontSize: '.95rem',
        color: '#006080',
        marginBottom: 32,
      }}>
        Masuk untuk mula belajar! 🌟
      </p>

      {/* Login card */}
      <div style={{
        background: 'rgba(255,255,255,.92)',
        backdropFilter: 'blur(16px)',
        borderRadius: 24,
        padding: '32px 28px',
        width: '100%',
        maxWidth: 420,
        boxShadow: '0 12px 48px rgba(0,0,0,.14)',
        border: '2.5px solid rgba(255,255,255,.9)',
      }}>

        {/* WhatsApp input */}
        <label style={labelStyle}>
          📱 Nombor WhatsApp
        </label>
        <div style={{ display: 'flex', gap: 0, marginBottom: 16 }}>
          <div style={{
            background: '#25D366',
            color: '#fff',
            fontFamily: 'var(--font-body)',
            fontWeight: 800,
            fontSize: '1rem',
            padding: '14px 14px',
            borderRadius: '12px 0 0 12px',
            border: '2.5px solid #1DA851',
            borderRight: 'none',
            whiteSpace: 'nowrap',
            display: 'flex',
            alignItems: 'center',
            gap: 5,
          }}>
            🇲🇾 +60
          </div>
          <input
            type="tel"
            placeholder="123456789"
            value={wa}
            onChange={e => setWa(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{
              ...inputStyle,
              borderRadius: '0 12px 12px 0',
              borderLeft: 'none',
              flex: 1,
            }}
            maxLength={12}
          />
        </div>

        {/* Code input */}
        <label style={labelStyle}>
          🔑 Kod Akses
        </label>
        <input
          type="text"
          placeholder="WIRA-XXXX-XXXX"
          value={code}
          onChange={e => setCode(e.target.value.toUpperCase())}
          onKeyDown={handleKeyDown}
          style={{
            ...inputStyle,
            fontFamily: 'var(--font-display)',
            fontSize: '1.2rem',
            letterSpacing: '.12em',
            textAlign: 'center',
            marginBottom: 8,
          }}
          maxLength={14}
        />

        {/* Error message */}
        {error && (
          <div style={{
            background: '#FFF0F0',
            border: '2px solid #FF6B6B',
            borderRadius: 10,
            padding: '10px 14px',
            fontSize: '.88rem',
            fontWeight: 700,
            color: '#CC0000',
            marginBottom: 16,
            textAlign: 'center',
          }}>
            {error}
          </div>
        )}

        {/* Submit button */}
        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            width: '100%',
            background: loading
              ? 'linear-gradient(135deg,#aaa,#888)'
              : 'linear-gradient(160deg,#FF8C00,#FF5E00)',
            color: '#fff',
            fontFamily: 'var(--font-display)',
            fontSize: '1.2rem',
            border: 'none',
            borderRadius: 14,
            padding: '16px',
            cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: loading ? 'none' : '0 7px 0 #B83D00, 0 10px 28px rgba(255,90,0,.35)',
            transition: 'transform .12s, box-shadow .12s',
            marginTop: 8,
          }}
          onMouseDown={e => { if (!loading) { e.currentTarget.style.transform='translateY(5px)'; e.currentTarget.style.boxShadow='0 2px 0 #B83D00' }}}
          onMouseUp={e   => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='' }}
        >
          {loading ? '⏳ Sedang semak...' : '🚀 Masuk Sekarang'}
        </button>

        {/* Help text */}
        <p style={{
          textAlign: 'center',
          marginTop: 20,
          fontSize: '.83rem',
          fontWeight: 600,
          color: '#668',
          lineHeight: 1.6,
        }}>
          Belum ada kod?<br />
          Hubungi admin untuk dapatkan akses. 📲
        </p>
      </div>

      {/* Bottom note */}
      <p style={{
        marginTop: 8,
        fontSize: '.75rem',
        color: 'rgba(0,60,80,.45)',
        fontWeight: 600,
        textAlign: 'center',
      }}>
        Adiwira Minda • Pembelajaran Matematik KSSR
      </p>
    </div>
  )
}

const labelStyle = {
  display: 'block',
  fontFamily: 'var(--font-body)',
  fontWeight: 800,
  fontSize: '.9rem',
  color: '#334',
  marginBottom: 8,
}

const inputStyle = {
  display: 'block',
  width: '100%',
  fontFamily: 'var(--font-body)',
  fontWeight: 700,
  fontSize: '1.05rem',
  color: '#1A2A4A',
  background: '#F8FAFF',
  border: '2.5px solid #C8D8F0',
  borderRadius: 12,
  padding: '14px 16px',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color .2s',
}
