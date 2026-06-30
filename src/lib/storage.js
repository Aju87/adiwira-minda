// ── Storage helpers — keyed per WhatsApp + child ID ──────────────────────────
// Setiap anak mempunyai data bintang dan progres tersendiri.

const starKey  = (wa, cid) => `am_stars_${wa}_${cid}`
const progKey  = (wa, cid) => `am_prog_${wa}_${cid}`
const childKey = (wa)      => `am_children_${wa}`

export const loadChildren = (wa) => {
  try { return JSON.parse(localStorage.getItem(childKey(wa)) || '[]') } catch { return [] }
}
export const saveChildren = (wa, list) =>
  localStorage.setItem(childKey(wa), JSON.stringify(list))

export const loadStars = (wa, cid) =>
  parseInt(localStorage.getItem(starKey(wa, cid)) || '0', 10)

export const saveStars = (wa, cid, v) =>
  localStorage.setItem(starKey(wa, cid), String(v))

export const loadProgress = (wa, cid) => {
  try { return JSON.parse(localStorage.getItem(progKey(wa, cid)) || '{}') } catch { return {} }
}
export const saveProgress = (wa, cid, v) =>
  localStorage.setItem(progKey(wa, cid), JSON.stringify(v))

// Umur → kumpulan umur (ageGroup 1/2/3)
export function ageToGroup(age) {
  if (age <= 7)  return 1   // Darjah 1–2
  if (age <= 10) return 2   // Darjah 3–4
  return 3                   // Darjah 5–6
}

export const AGE_GROUP_LABEL = {
  1: { label: 'Darjah 1–2', range: '5–7 tahun',   emoji: '🌱' },
  2: { label: 'Darjah 3–4', range: '8–10 tahun',  emoji: '🌿' },
  3: { label: 'Darjah 5–6', range: '11–12 tahun', emoji: '🌳' },
}
