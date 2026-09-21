import { createHmac, timingSafeEqual } from 'node:crypto'

export const SESSION_COOKIE = 'admin_session'
export const MAX_AGE_SECONDS = 60 * 60 * 24 * 7

function secret() {
  const s = process.env.ADMIN_SESSION_SECRET
  if (!s || s.length < 16) throw new Error('ADMIN_SESSION_SECRET is not set')
  return s
}

export function sign(payload: string) {
  return createHmac('sha256', secret()).update(payload).digest('base64url')
}

export function safeEqual(a: string, b: string) {
  const ab = Buffer.from(a)
  const bb = Buffer.from(b)
  return ab.length === bb.length && timingSafeEqual(ab, bb)
}

export function verifyToken(token: string | undefined): boolean {
  if (!token) return false
  const [payload, sig] = token.split('.')
  if (!payload || !sig || !safeEqual(sig, sign(payload))) return false
  const exp = Number(payload)
  return Number.isFinite(exp) && exp > Date.now()
}
