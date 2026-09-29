import { sanityWrite } from '@/lib/sanity'
import { getMyRatings, saveMyRating } from '@/lib/rated'
import { corsJson, corsPreflight, isDisallowedCrossOrigin } from '@/lib/cors'

// Public endpoint the portfolio's star-rating widget posts to.
// Cross-site calls can't rely on the "already rated" cookie below (third-party cookies),
// so the portfolio also keeps its own localStorage guard — this is a soft, UX-level dedupe.

export async function OPTIONS(request: Request) {
  return corsPreflight(request)
}

export async function POST(request: Request) {
  const origin = request.headers.get('origin')
  if (isDisallowedCrossOrigin(request)) return corsJson({ error: 'Origin not allowed' }, 403, null)

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return corsJson({ error: 'Invalid JSON' }, 400, origin)
  }

  const { id, stars } = (body ?? {}) as { id?: unknown; stars?: unknown }
  if (typeof id !== 'string' || !id || id.startsWith('drafts.')) {
    return corsJson({ error: 'Invalid id' }, 400, origin)
  }
  if (typeof stars !== 'number' || !Number.isInteger(stars) || stars < 1 || stars > 5) {
    return corsJson({ error: 'Stars must be a whole number from 1 to 5' }, 400, origin)
  }

  const mine = await getMyRatings()
  if (mine[id]) {
    return corsJson({ error: 'You already rated this', myRating: mine[id] }, 409, origin)
  }

  const exists = await sanityWrite.fetch<boolean>('count(*[_type == "landingPage" && _id == $id]) > 0', { id })
  if (!exists) return corsJson({ error: 'Not found' }, 404, origin)

  try {
    // Atomic increment, so simultaneous votes are not lost.
    const doc = await sanityWrite
      .patch(id)
      .setIfMissing({ ratingCount: 0, ratingTotal: 0 })
      .inc({ ratingCount: 1, ratingTotal: stars })
      .commit<{ ratingCount: number; ratingTotal: number }>()
    await saveMyRating(id, stars)
    return corsJson({ ratingCount: doc.ratingCount, ratingTotal: doc.ratingTotal, myRating: stars }, 200, origin)
  } catch (e) {
    console.error(e)
    return corsJson({ error: 'Could not save rating' }, 500, origin)
  }
}
