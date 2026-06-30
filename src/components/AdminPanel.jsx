import { useState, useEffect } from 'react'
import { generateCode, getAllCodes, deactivateCode } from '../lib/supabase'

const ADMIN_PWD = import.meta.env.VITE_ADMIN_PASSWORD || 'adiwira2024'

export default function AdminPanel({ onBack }) {
  const [authed,   setAuthed]   = useState(false)
  const [pwd,      setPwd]      = useState('')
  const [pwdErr,   setPwdErr]   = useState(false)
  const [codes,    setCodes]    = useState([])
  const [loading,  setLoading]  = useState(false)
  const [newCode,  setNewCode]  = useState(null)
  const [copied,   setCopied]   = useState(false)
  const [genErr,   setGenErr]   = useState('')

  useEffect(() => { if (authed) fetchCodes() }, [authed])

  const fetchCodes = async () => {
    try { setCodes(await getAllCodes()) } catch {}
  }

  const handleAuth = () => {
    if (pwd === ADMIN_PWD) { setAuthed(true) }
    else { setPwdErr(true); setTimeout(() => setPwdErr(false), 1200) }
  }

  const handleGenerate = async () => {
    setLoading(true); setGenErr(''); setNewCode(null)
    try {
      const c = await generateCode()
      setNewCode(c)
      await fetchCodes()
    } catch (e) {
      setGenErr('Gagal jana kod: ' + e.message)
    }
    setLoading(false)
  }

  const handleDeactivate = async (id, code) => {
    if (!window.confirm(`Nyahaktif kod ${code}?`)) return
    await deactivateCode(id)
    await fetchCodes()
  }

  const copyCode = (text) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // ── Password gate ──────────────────────────────────────────────────────────
  if (!authed) {
    return (
      <div style={centerWrap}>
        <div style={card}>
          <div style={{ fontSize:'3rem', textAlign:'center', marginBottom:12 }}>🔐</div>
          <h2 style={{ fontFamily:'var(--font-display)', textAlign:'center', marginBottom:20, color:'#1A2A4A' }}>
            Panel Admin
          </h2>
          <input
            type="password"
            placeholder="Kata laluan admin"
            value={pwd}
            onChange={e => setPwd(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAuth()}
            style={{
              ...inputSt,
              borderColor: pwdErr ? '#FF4757' : '#C8D8F0',
              animation: pwdErr ? 'shake .4s ease-in-out' : 'none',
            }}
          />
          <button onClick={handleAuth} style={orangeBtn}>🔓 Masuk</button>
          <button onClick={onBack} style={{ ...ghostBtn, marginTop:10 }}>← Balik</button>
        </div>
      </div>
    )
  }

  // ── Admin dashboard ────────────────────────────────────────────────────────
  const active   = codes.filter(c => c.is_active && !c.whatsapp)
  const used     = codes.filter(c => c.whatsapp)
  const inactive = codes.filter(c => !c.is_active)

  return (
    <div style={{ padding:'24px 16px', maxWidth:700, margin:'0 auto', position:'relative', zIndex:1 }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:24 }}>
        <button onClick={onBack} style={ghostBtn}>← Balik</button>
        <h2 style={{ fontFamily:'var(--font-display)', fontSize:'1.5rem', color:'#1A2A4A', flex:1 }}>
          🔐 Panel Admin
        </h2>
        <div style={{
          background:'rgba(255,255,255,.7)',
          borderRadius:50, padding:'6px 14px',
          fontSize:'.82rem', fontWeight:700, color:'#006080',
          border:'2px solid rgba(255,255,255,.9)',
        }}>
          {active.length} aktif · {used.length} digunakan
        </div>
      </div>

      {/* Generate button */}
      <button
        onClick={handleGenerate}
        disabled={loading}
        style={{
          ...orangeBtn,
          width:'100%',
          fontSize:'1.15rem',
          padding:'18px',
          marginBottom: newCode ? 12 : 24,
          opacity: loading ? .7 : 1,
        }}
      >
        {loading ? '⏳ Menjana...' : '✨ Jana Kod Baru'}
      </button>

      {genErr && <div style={{ color:'#CC0000', fontWeight:700, marginBottom:16, textAlign:'center' }}>{genErr}</div>}

      {/* New code display */}
      {newCode && (
        <div style={{
          background: 'linear-gradient(135deg,#EFFFEF,#C8FFD8)',
          border: '3px solid #4ECA6F',
          borderRadius: 18,
          padding:'20px 24px',
          marginBottom: 24,
          textAlign:'center',
          boxShadow:'0 6px 0 #28A745, 0 10px 28px rgba(78,202,111,.3)',
          animation:'pageEnter .4s cubic-bezier(.34,1.56,.64,1)',
        }}>
          <div style={{ fontSize:'.85rem', fontWeight:800, color:'#166534', marginBottom:6 }}>
            ✅ KOD BARU BERJAYA DIJANA
          </div>
          <div style={{
            fontFamily:'var(--font-display)',
            fontSize: '2rem',
            color:'#0A4D1A',
            letterSpacing:'.15em',
            marginBottom:14,
          }}>
            {newCode.code}
          </div>
          <button
            onClick={() => copyCode(newCode.code)}
            style={{
              background: copied ? '#4ECA6F' : '#0A4D1A',
              color:'#fff',
              fontFamily:'var(--font-body)',
              fontWeight:800,
              fontSize:'1rem',
              border:'none',
              borderRadius:10,
              padding:'10px 28px',
              cursor:'pointer',
              transition:'background .2s',
            }}
          >
            {copied ? '✅ Disalin!' : '📋 Salin Kod'}
          </button>
          <div style={{ fontSize:'.8rem', color:'#166534', marginTop:10, fontWeight:600 }}>
            Hantar kod ini kepada pelanggan via WhatsApp
          </div>
        </div>
      )}

      {/* Codes table */}
      <div style={{ background:'rgba(255,255,255,.88)', borderRadius:18, overflow:'hidden', boxShadow:'0 6px 24px rgba(0,0,0,.1)' }}>
        <div style={{ padding:'16px 20px', background:'rgba(0,0,0,.03)', borderBottom:'1.5px solid rgba(0,0,0,.06)' }}>
          <span style={{ fontFamily:'var(--font-display)', fontSize:'1.05rem', color:'#1A2A4A' }}>
            📋 Senarai Semua Kod ({codes.length})
          </span>
        </div>

        {codes.length === 0 ? (
          <div style={{ padding:32, textAlign:'center', color:'#999', fontWeight:700 }}>
            Tiada kod lagi. Jana kod pertama!
          </div>
        ) : (
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'.88rem' }}>
              <thead>
                <tr style={{ background:'rgba(0,0,0,.04)' }}>
                  {['Kod','Status','Nombor WhatsApp','Tarikh Jana',''].map(h => (
                    <th key={h} style={{ padding:'10px 16px', textAlign:'left', fontWeight:800, color:'#445', whiteSpace:'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {codes.map((c, i) => {
                  const status = !c.is_active ? 'inactive' : c.whatsapp ? 'used' : 'active'
                  const statusLabel = { active:'✅ Aktif', used:'🔵 Digunakan', inactive:'🔴 Nyahaktif' }[status]
                  const statusColor = { active:'#166534', used:'#1D4ED8', inactive:'#991B1B' }[status]
                  const date = new Date(c.created_at).toLocaleDateString('ms-MY', { day:'2-digit', month:'short', year:'numeric' })

                  return (
                    <tr key={c.id} style={{ borderBottom:'1px solid rgba(0,0,0,.06)', background: i%2===0 ? 'transparent' : 'rgba(0,0,0,.015)' }}>
                      <td style={{ padding:'12px 16px', fontFamily:'var(--font-display)', fontSize:'1rem', letterSpacing:'.05em', color:'#1A2A4A' }}>
                        {c.code}
                      </td>
                      <td style={{ padding:'12px 16px', fontWeight:700, color: statusColor }}>
                        {statusLabel}
                      </td>
                      <td style={{ padding:'12px 16px', fontWeight:600, color:'#445' }}>
                        {c.whatsapp ? (
                          <a href={`https://wa.me/${c.whatsapp}`} target="_blank" rel="noreferrer"
                            style={{ color:'#25D366', fontWeight:700 }}>
                            📲 {c.whatsapp}
                          </a>
                        ) : '—'}
                      </td>
                      <td style={{ padding:'12px 16px', color:'#778', whiteSpace:'nowrap' }}>{date}</td>
                      <td style={{ padding:'12px 16px' }}>
                        <div style={{ display:'flex', gap:6 }}>
                          <button onClick={() => copyCode(c.code)} style={smallBtn('#0A4D1A')}>📋</button>
                          {c.is_active && (
                            <button onClick={() => handleDeactivate(c.id, c.code)} style={smallBtn('#CC0000')} title="Nyahaktif">🚫</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Stats */}
      <div style={{ display:'flex', gap:12, marginTop:16, flexWrap:'wrap' }}>
        {[
          { label:'Kod Aktif',     value: active.length,   color:'#4ECA6F', bg:'#EFFFEF' },
          { label:'Sudah Digunakan', value: used.length,   color:'#5352ED', bg:'#F0F0FF' },
          { label:'Nyahaktif',     value: inactive.length, color:'#FF6B6B', bg:'#FFF0F0' },
        ].map(s => (
          <div key={s.label} style={{
            flex:1, minWidth:90,
            background: s.bg,
            border:`2px solid ${s.color}33`,
            borderRadius:14, padding:'12px 16px',
            textAlign:'center',
          }}>
            <div style={{ fontFamily:'var(--font-display)', fontSize:'1.6rem', color: s.color }}>{s.value}</div>
            <div style={{ fontSize:'.78rem', fontWeight:700, color:'#556' }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Styles ─────────────────────────────────────────────────────────────────────
const centerWrap = {
  minHeight:'calc(100vh - 64px)',
  display:'flex', alignItems:'center', justifyContent:'center',
  padding:'24px', position:'relative', zIndex:1,
}
const card = {
  background:'rgba(255,255,255,.92)', backdropFilter:'blur(16px)',
  borderRadius:24, padding:'32px 28px', width:'100%', maxWidth:380,
  boxShadow:'0 12px 48px rgba(0,0,0,.14)', border:'2.5px solid rgba(255,255,255,.9)',
  display:'flex', flexDirection:'column', gap:0,
}
const inputSt = {
  display:'block', width:'100%', fontFamily:'var(--font-body)',
  fontWeight:700, fontSize:'1rem', color:'#1A2A4A',
  background:'#F8FAFF', border:'2.5px solid #C8D8F0',
  borderRadius:12, padding:'14px 16px', outline:'none',
  boxSizing:'border-box', marginBottom:14,
}
const orangeBtn = {
  display:'block', width:'100%',
  background:'linear-gradient(160deg,#FF8C00,#FF5E00)', color:'#fff',
  fontFamily:'var(--font-display)', fontSize:'1.05rem',
  border:'none', borderRadius:14, padding:'15px',
  cursor:'pointer', boxShadow:'0 6px 0 #B83D00, 0 10px 24px rgba(255,90,0,.3)',
  transition:'transform .12s, box-shadow .12s',
}
const ghostBtn = {
  background:'rgba(255,255,255,.7)', color:'#334',
  fontFamily:'var(--font-body)', fontWeight:700, fontSize:'.88rem',
  border:'2px solid rgba(255,255,255,.9)', borderRadius:50,
  padding:'7px 16px', cursor:'pointer', backdropFilter:'blur(8px)',
}
const smallBtn = (color) => ({
  background: color, color:'#fff', border:'none',
  borderRadius:8, padding:'5px 9px', cursor:'pointer', fontSize:'.85rem',
})
