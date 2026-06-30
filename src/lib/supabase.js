import { createClient } from '@supabase/supabase-js'

const URL = import.meta.env.VITE_SUPABASE_URL
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(URL, KEY)

// ── Normalize nombor WhatsApp → format 60XXXXXXXXX ────────────────────────────
export function normalizeWA(num) {
  const d = num.replace(/\D/g, '')
  if (d.startsWith('60')) return d
  if (d.startsWith('0'))  return '6' + d
  return '60' + d
}

// ── Validate + redeem kod ─────────────────────────────────────────────────────
// Returns { success, error }
export async function redeemCode(code, whatsapp) {
  const upper = code.trim().toUpperCase()

  // Fetch the code
  const { data, error } = await supabase
    .from('codes')
    .select('*')
    .eq('code', upper)
    .eq('is_active', true)
    .single()

  if (error || !data) return { success: false, error: '❌ Kod tidak sah atau tidak aktif.' }

  // Already redeemed by SAME number → allow re-login
  if (data.whatsapp === whatsapp) return { success: true }

  // Already redeemed by DIFFERENT number
  if (data.whatsapp && data.whatsapp !== whatsapp)
    return { success: false, error: '❌ Kod ini sudah digunakan oleh nombor lain.' }

  // First-time redemption — bind WhatsApp to this code
  const { error: updateErr } = await supabase
    .from('codes')
    .update({ whatsapp, redeemed_at: new Date().toISOString() })
    .eq('code', upper)
    .is('whatsapp', null)   // extra safety — only update if still unbounded

  if (updateErr) return { success: false, error: '❌ Ralat sistem. Cuba lagi.' }
  return { success: true }
}

// ── Jana kod baru (dari Admin Panel) ─────────────────────────────────────────
export async function generateCode() {
  const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // tiada 0/O/1/I (mengelirukan)
  const rand  = n => Array.from({ length: n }, () => CHARS[Math.floor(Math.random() * CHARS.length)]).join('')
  const code  = `WIRA-${rand(4)}-${rand(4)}`

  const { data, error } = await supabase
    .from('codes')
    .insert({ code })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') return generateCode() // duplicate, try again
    throw new Error(error.message)
  }
  return data
}

// ── Senarai semua kod (Admin) ─────────────────────────────────────────────────
export async function getAllCodes() {
  const { data, error } = await supabase
    .from('codes')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return data
}

// ── Nyahaktif kod (Admin) ─────────────────────────────────────────────────────
export async function deactivateCode(id) {
  const { error } = await supabase
    .from('codes')
    .update({ is_active: false })
    .eq('id', id)
  if (error) throw new Error(error.message)
}
