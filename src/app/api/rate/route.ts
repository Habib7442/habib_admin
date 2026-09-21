import { NextResponse } from 'next/server'
import { sanityWrite } from '@/lib/sanity'
import { getMyRatings, saveMyRating } from '@/lib/rated'

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { id, stars } = (body ?? {}) as { id?: unknown; stars?: unknown }
  if (typeof id !== 'string' || !id || id.startsWith('drafts.')) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  }
  if (typeof stars !== 'number' || !Number.isInteger(stars) || stars < 1 || stars > 5) {
    return NextResponse.json({ error: 'Stars must be a whole number from 1 to 5' }, { status: 400 })
  }

  const mine = await getMyRatings()
  if (mine[id]) {
    return NextResponse.json({ error: 'You already rated this', myRating: mine[id] }, { status: 409 })
  }

  const exists = await sanityWrite.fetch<boolean>('count(*[_type == "landingPage" && _id == $id]) > 0', { id })
  if (!exists) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  try {
    // Atomic increment, so simultaneous votes are not lost.
    const doc = await sanityWrite
      .patch(id)
      .setIfMissing({ ratingCount: 0, ratingTotal: 0 })
      .inc({ ratingCount: 1, ratingTotal: stars })
      .commit<{ ratingCount: number; ratingTotal: number }>()
    await saveMyRating(id, stars)
    return NextResponse.json({ ratingCount: doc.ratingCount, ratingTotal: doc.ratingTotal, myRating: stars })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Could not save rating' }, { status: 500 })
  }
}
