import { useState } from 'react'
import { ageToGroup, AGE_GROUP_LABEL } from '../lib/storage'

const ICONS = [
  '🦸','🧙','🦊','🐯','🦁','🐸',
  '🚀','⭐','🌈','🐉','🦄','🐧',
  '🦋','🐬','🦅','🎯','🏆','🌺',
  '🦖','🤖','👩‍🚀','🧸','🦔','🐼',
]

export default function AddChild({ existingChild, onSave, onBack }) {
  const [name,    setName]    = useState(existingChild?.name || '')
  const [age,     setAge]     = useState(existingChild?.age  || 7)
  const [icon,    setIcon]    = useState(existingChild?.icon || '🦸')
  const [err,     setErr]     = useState('')
  const [preview, setPreview] = useState(false)

  const grp = ageToGroup(age)
  const grpInfo = AGE_GROUP_LABEL[grp]

  const handleSave = () => {
    if (!name.trim()) { setErr('Sila masukkan nama anak.'); return }
    onSave({
      id:       existingChild?.id || Date.now().toString(),
      name:     name.trim(),
      age,
      icon,
      ageGroup: grp,
    })
  }

  return (
    <div style={{ padding:'24px 16px', maxWidth:460, margin:'0 auto', position:'relative', zIndex:1, minHeight:'100vh' }}>

      {/* Back button */}
      <button onClick={onBack} style={ghostBtn}>← Balik</button>

      <h2 style={{
        fontFamily:'var(--font-display)', fontSize:'1.7rem',
        color:'#1A2A4A', textAlign:'center',
        textShadow:'0 3px 0 rgba(255,255,255,.8)',
        margin:'18px 0 20px',
      }}>
        {existingChild ? '✏️ Edit Profil Anak' : '➕ Tambah Profil Anak'}
      </h2>

      <div style={card}>

        {/* Icon preview */}
        <div style={{ textAlign:'center', fontSize:'4.5rem', marginBottom:10,
          animation:'heroFloat 4s ease-in-out infinite', lineHeight:1 }}>
          {icon}
        </div>

        {/* Icon grid */}
        <label style={labelSt}>Pilih Ikon Avatar</label>
        <div style={{
          display:'grid', gridTemplateColumns:'repeat(8,1fr)',
          gap:5, marginBottom:20, padding:'10px',
          background:'rgba(0,0,0,.03)', borderRadius:12,
        }}>
          {ICONS.map(ic => (
            <button
              key={ic}
              onClick={() => setIcon(ic)}
              style={{
                fontSize:'1.5rem', lineHeight:1,
                background: ic === icon ? '#FFF0D0' : 'transparent',
                border: ic === icon ? '2.5px solid #FF8C00' : '2px solid transparent',
                borderRadius:8, padding:'5px 2px',
                cursor:'pointer', transition:'all .12s',
              }}
            >
              {ic}
            </button>
          ))}
        </div>

        {/* Name */}
        <label style={labelSt}>👤 Nama Anak</label>
        <input
          type="text"
          placeholder="Contoh: Ahmad, Sara, Daniel..."
          value={name}
          onChange={e => { setName(e.target.value); setErr('') }}
          maxLength={30}
          style={{ ...inputSt, marginBottom:18 }}
        />

        {/* Age */}
        <label style={labelSt}>
          🎂 Umur: <span style={{ color:'#FF8C00', fontFamily:'var(--font-display)', fontSize:'1.1em' }}>{age} tahun</span>
        </label>
        <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:8 }}>
          {[5,6,7,8,9,10,11,12].map(a => (
            <button
              key={a}
              onClick={() => setAge(a)}
              style={{
                flex:'1 0 calc(12.5% - 6px)', minWidth:36,
                background: a === age
                  ? 'linear-gradient(160deg,#FF8C00,#FF5E00)'
                  : 'rgba(0,0,0,.06)',
                color: a === age ? '#fff' : '#445',
                fontFamily:'var(--font-display)', fontSize:'1.05rem',
                border:'none', borderRadius:10, padding:'11px 4px',
                cursor:'pointer',
                boxShadow: a === age ? '0 4px 0 #B83D00' : 'none',
                transition:'all .12s',
              }}
            >
              {a}
            </button>
          ))}
        </div>

        {/* Age group badge */}
        <div style={{
          display:'flex', alignItems:'center', justifyContent:'center', gap:8,
          background: grp === 1 ? '#E8FFF0' : grp === 2 ? '#E8F4FF' : '#F3F0FF',
          border: `2px solid ${grp === 1 ? '#4ECA6F' : grp === 2 ? '#5B9BD5' : '#A29BFE'}`,
          borderRadius:12, padding:'10px 16px', marginBottom:20,
        }}>
          <span style={{ fontSize:'1.4rem' }}>{grpInfo.emoji}</span>
          <div>
            <div style={{ fontFamily:'var(--font-display)', fontSize:'1rem',
              color: grp === 1 ? '#166534' : grp === 2 ? '#1D4ED8' : '#5B21B6' }}>
              {grpInfo.label}
            </div>
            <div style={{ fontSize:'.78rem', fontWeight:700, color:'#778' }}>
              Soalan akan disesuaikan untuk umur {grpInfo.range}
            </div>
          </div>
        </div>

        {/* Error */}
        {err && (
          <div style={{
            background:'#FFF0F0', border:'2px solid #FF6B6B',
            borderRadius:10, padding:'10px 14px',
            color:'#CC0000', fontWeight:700, textAlign:'center',
            marginBottom:14, fontSize:'.88rem',
          }}>
            {err}
          </div>
        )}

        {/* Save button */}
        <button
          onClick={handleSave}
          style={{
            ...orangeBtn,
            width:'100%', fontSize:'1.1rem', padding:'16px',
          }}
          onMouseDown={e => { e.currentTarget.style.transform='translateY(5px)'; e.currentTarget.style.boxShadow='0 2px 0 #B83D00' }}
          onMouseUp={e   => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='' }}
        >
          💾 Simpan Profil
        </button>
      </div>
    </div>
  )
}

// ── Styles ────────────────────────────────────────────────────────────────────
const card = {
  background:'rgba(255,255,255,.92)', backdropFilter:'blur(16px)',
  borderRadius:24, padding:'24px 20px',
  boxShadow:'0 12px 48px rgba(0,0,0,.13)',
  border:'2.5px solid rgba(255,255,255,.9)',
}
const labelSt = {
  display:'block',
  fontFamily:'var(--font-body)', fontWeight:800,
  fontSize:'.88rem', color:'#334', marginBottom:8,
}
const inputSt = {
  display:'block', width:'100%',
  fontFamily:'var(--font-body)', fontWeight:700,
  fontSize:'1rem', color:'#1A2A4A',
  background:'#F8FAFF', border:'2.5px solid #C8D8F0',
  borderRadius:12, padding:'13px 15px', outline:'none',
  boxSizing:'border-box', transition:'border-color .2s',
}
const orangeBtn = {
  background:'linear-gradient(160deg,#FF8C00,#FF5E00)', color:'#fff',
  fontFamily:'var(--font-display)',
  border:'none', borderRadius:14, cursor:'pointer',
  boxShadow:'0 6px 0 #B83D00, 0 10px 24px rgba(255,90,0,.3)',
  transition:'transform .12s, box-shadow .12s',
}
const ghostBtn = {
  background:'rgba(255,255,255,.7)', color:'#334',
  fontFamily:'var(--font-body)', fontWeight:700, fontSize:'.88rem',
  border:'2px solid rgba(255,255,255,.9)', borderRadius:50,
  padding:'7px 16px', cursor:'pointer', backdropFilter:'blur(8px)',
}
