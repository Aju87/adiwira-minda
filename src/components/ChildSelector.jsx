import { loadStars, AGE_GROUP_LABEL } from '../lib/storage'

export default function ChildSelector({ wa, children, onSelect, onAdd, onEdit, onLogout }) {
  return (
    <div style={{
      padding:'24px 16px', maxWidth:500,
      margin:'0 auto', position:'relative', zIndex:1,
      minHeight:'calc(100vh - 64px)',
      display:'flex', flexDirection:'column',
    }}>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:6 }}>
        <button onClick={onLogout} style={ghostBtn}>🚪 Log Keluar</button>
        <button onClick={onAdd} style={{
          ...ghostBtn,
          background:'linear-gradient(160deg,#FF8C00,#FF5E00)',
          color:'#fff', border:'none',
          boxShadow:'0 4px 0 #B83D00',
        }}>
          ➕ Tambah Anak
        </button>
      </div>

      {/* Title */}
      <div style={{ textAlign:'center', margin:'16px 0 24px' }}>
        <div style={{ fontSize:'2.8rem', animation:'heroFloat 4s ease-in-out infinite', marginBottom:6 }}>🌟</div>
        <h2 style={{
          fontFamily:'var(--font-display)', fontSize:'clamp(1.6rem,4vw,2rem)',
          color:'#1A2A4A', textShadow:'0 3px 0 rgba(255,255,255,.8)',
          marginBottom:4,
        }}>
          Pilih Profil Anak
        </h2>
        <p style={{ fontFamily:'var(--font-body)', fontWeight:700, color:'#006080', fontSize:'.9rem' }}>
          Siapakah yang akan belajar hari ini?
        </p>
      </div>

      {/* Empty state */}
      {children.length === 0 ? (
        <div style={{
          flex:1, display:'flex', flexDirection:'column',
          alignItems:'center', justifyContent:'center',
          textAlign:'center', padding:32,
          background:'rgba(255,255,255,.7)', backdropFilter:'blur(12px)',
          borderRadius:24, border:'2px solid rgba(255,255,255,.9)',
          boxShadow:'0 8px 32px rgba(0,0,0,.08)',
        }}>
          <div style={{ fontSize:'4rem', marginBottom:12 }}>👶</div>
          <p style={{ fontFamily:'var(--font-display)', fontSize:'1.1rem', color:'#1A2A4A', marginBottom:8 }}>
            Belum ada profil anak
          </p>
          <p style={{ fontFamily:'var(--font-body)', fontWeight:600, color:'#778', fontSize:'.9rem', marginBottom:24 }}>
            Tambah profil anak untuk mulakan pembelajaran yang disesuaikan dengan umur mereka.
          </p>
          <button
            onClick={onAdd}
            style={{
              ...orangeBtn,
              fontSize:'1.1rem', padding:'14px 36px',
            }}
          >
            ➕ Tambah Anak Pertama
          </button>
        </div>
      ) : (
        <>
          {/* Children grid */}
          <div style={{
            display:'grid',
            gridTemplateColumns: children.length === 1 ? '1fr' : 'repeat(2, 1fr)',
            gap:14, marginBottom:16, flex:1,
          }}>
            {children.map(child => {
              const stars = loadStars(wa, child.id)
              const grpInfo = AGE_GROUP_LABEL[child.ageGroup] || AGE_GROUP_LABEL[1]
              return (
                <ChildCard
                  key={child.id}
                  child={child}
                  stars={stars}
                  grpInfo={grpInfo}
                  onSelect={() => onSelect(child)}
                  onEdit={() => onEdit(child)}
                />
              )
            })}
          </div>

          {/* Add more children */}
          <button
            onClick={onAdd}
            style={{
              width:'100%', padding:'14px',
              background:'rgba(255,255,255,.7)', backdropFilter:'blur(8px)',
              border:'2.5px dashed rgba(0,96,128,.3)',
              borderRadius:16, cursor:'pointer',
              fontFamily:'var(--font-display)', fontSize:'1rem',
              color:'#006080', fontWeight:700,
              transition:'all .15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background='rgba(255,255,255,.9)'; e.currentTarget.style.borderColor='#FF8C00' }}
            onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,.7)'; e.currentTarget.style.borderColor='rgba(0,96,128,.3)' }}
          >
            ➕ Tambah Profil Anak Lain
          </button>
        </>
      )}
    </div>
  )
}

// ── Child card ────────────────────────────────────────────────────────────────
function ChildCard({ child, stars, grpInfo, onSelect, onEdit }) {
  return (
    <div style={{
      background:'rgba(255,255,255,.88)', backdropFilter:'blur(12px)',
      borderRadius:22, padding:'20px 14px',
      textAlign:'center', cursor:'pointer',
      border:'2.5px solid rgba(255,255,255,.9)',
      boxShadow:'0 8px 24px rgba(0,0,0,.1)',
      transition:'transform .15s, box-shadow .15s',
      position:'relative',
    }}
    onClick={onSelect}
    onMouseEnter={e => {
      e.currentTarget.style.transform = 'translateY(-5px)'
      e.currentTarget.style.boxShadow = '0 16px 40px rgba(0,0,0,.16)'
    }}
    onMouseLeave={e => {
      e.currentTarget.style.transform = ''
      e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,.1)'
    }}
    >
      {/* Edit button */}
      <button
        onClick={e => { e.stopPropagation(); onEdit() }}
        style={{
          position:'absolute', top:10, right:10,
          background:'rgba(0,0,0,.06)', border:'none',
          borderRadius:50, width:28, height:28,
          cursor:'pointer', fontSize:'.8rem',
          display:'flex', alignItems:'center', justifyContent:'center',
        }}
        title="Edit profil"
      >
        ✏️
      </button>

      {/* Icon */}
      <div style={{
        fontSize:'3.5rem', marginBottom:6, lineHeight:1,
        animation:'heroFloat 4s ease-in-out infinite',
      }}>
        {child.icon}
      </div>

      {/* Name */}
      <div style={{
        fontFamily:'var(--font-display)', fontSize:'1.2rem',
        color:'#1A2A4A', marginBottom:2,
      }}>
        {child.name}
      </div>

      {/* Age */}
      <div style={{
        fontFamily:'var(--font-body)', fontWeight:700,
        fontSize:'.78rem', color:'#668', marginBottom:10,
      }}>
        {child.age} tahun · {grpInfo.label}
      </div>

      {/* Stars */}
      <div style={{
        display:'inline-flex', alignItems:'center', gap:4,
        background:'linear-gradient(135deg,#FFF3D0,#FFE8A0)',
        border:'1.5px solid #FFB800', borderRadius:20,
        padding:'5px 14px',
        fontFamily:'var(--font-display)', fontSize:'.95rem',
        color:'#8B6000', marginBottom:12,
      }}>
        ⭐ {stars.toLocaleString()}
      </div>

      {/* Select button */}
      <button
        onClick={onSelect}
        style={{
          display:'block', width:'100%',
          background:'linear-gradient(160deg,#FF8C00,#FF5E00)',
          color:'#fff', fontFamily:'var(--font-display)',
          fontSize:'.95rem', border:'none', borderRadius:12,
          padding:'10px', cursor:'pointer',
          boxShadow:'0 5px 0 #B83D00',
          transition:'transform .1s, box-shadow .1s',
        }}
        onMouseDown={e => { e.currentTarget.style.transform='translateY(4px)'; e.currentTarget.style.boxShadow='0 1px 0 #B83D00' }}
        onMouseUp={e   => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='' }}
      >
        🚀 Pilih
      </button>
    </div>
  )
}

// ── Styles ────────────────────────────────────────────────────────────────────
const ghostBtn = {
  background:'rgba(255,255,255,.7)', color:'#334',
  fontFamily:'var(--font-body)', fontWeight:700, fontSize:'.85rem',
  border:'2px solid rgba(255,255,255,.9)', borderRadius:50,
  padding:'8px 16px', cursor:'pointer', backdropFilter:'blur(8px)',
}
const orangeBtn = {
  background:'linear-gradient(160deg,#FF8C00,#FF5E00)', color:'#fff',
  fontFamily:'var(--font-display)',
  border:'none', borderRadius:14, cursor:'pointer',
  boxShadow:'0 6px 0 #B83D00, 0 10px 24px rgba(255,90,0,.3)',
  transition:'transform .12s, box-shadow .12s',
}
