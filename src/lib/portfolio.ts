import 'server-only'

/**
 * Tells the public portfolio site to drop its cached pages right away. The portfolio is a separate
 * deployment, so revalidatePath() here can't reach its cache; it exposes /api/revalidate instead.
 * Always refreshes /, /work, list pages and every detail page; `paths` adds the item's own page.
 * Best effort: a failure is logged, never thrown — the portfolio still refreshes within 60s.
 */
export async function revalidatePortfolio(paths: string[] = []) {
  const site = process.env.PORTFOLIO_URL
  const secret = process.env.PORTFOLIO_REVALIDATE_SECRET
  if (!site || !secret) {
    console.warn('PORTFOLIO_URL / PORTFOLIO_REVALIDATE_SECRET not set; portfolio will refresh within 60s instead')
    return
  }
  try {
    const res = await fetch(new URL('/api/revalidate', site), {
      method: 'POST',
      headers: { authorization: `Bearer ${secret}`, 'content-type': 'application/json' },
      body: JSON.stringify({ paths }),
      cache: 'no-store',
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) console.error('Portfolio revalidation failed', res.status, await res.text())
  } catch (e) {
    console.error('Portfolio revalidation failed', e)
  }
}
