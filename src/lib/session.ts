import 'server-only'
import { createHmac } from 'node:crypto'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { MAX_AGE_SECONDS, SESSION_COOKIE, safeEqual, sign, verifyToken } from './token'

export function checkPassword(input: string): boolean {
  const expected = process.env.ADMIN_PASSWORD
  if (!expected) return false // fail closed when no password is configured
  return safeEqual(
    createHmac('sha256', 'pw').update(input).digest('hex'),
    createHmac('sha256', 'pw').update(expected).digest('hex')
  )
}

export async function createSession() {
  const payload = String(Date.now() + MAX_AGE_SECONDS * 1000)
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: MAX_AGE_SECONDS,
  })
}

export async function destroySession() {
  ;(await cookies()).delete(SESSION_COOKIE)
}

export async function isAuthed() {
  return verifyToken((await cookies()).get(SESSION_COOKIE)?.value)
}

/** Call at the top of every admin page and server action. */
export async function requireAuth() {
  if (!(await isAuthed())) redirect('/login')
}
