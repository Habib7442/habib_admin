import 'server-only'
import { cookies } from 'next/headers'

const COOKIE = 'rated'
const MAX_ENTRIES = 200

/** Map of landingPage id -> stars this browser has already given. */
export async function getMyRatings(): Promise<Record<string, number>> {
  const raw = (await cookies()).get(COOKIE)?.value
  if (!raw) return {}
  try {
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {}
    const out: Record<string, number> = {}
    for (const [k, v] of Object.entries(parsed)) {
      if (typeof v === 'number' && Number.isInteger(v) && v >= 1 && v <= 5) out[k] = v
    }
    return out
  } catch {
    return {}
  }
}

export async function saveMyRating(id: string, stars: number) {
  const current = await getMyRatings()
  const entries = Object.entries({ ...current, [id]: stars }).slice(-MAX_ENTRIES)
  ;(await cookies()).set(COOKIE, JSON.stringify(Object.fromEntries(entries)), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
  })
}
