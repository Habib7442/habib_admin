import { createHash, randomUUID } from 'node:crypto'
import { privateId, sanityWrite } from '@/lib/sanity'
import { corsJson, corsPreflight, isDisallowedCrossOrigin } from '@/lib/cors'

// Public endpoint the portfolio's /review form posts to (multipart, because of the optional photo).
// Reviews are saved as "pending" and only appear on the site after approval in the admin.

const LIMIT_PER_HOUR = 3
const MAX_PHOTO_BYTES = 2 * 1024 * 1024 // the form shrinks photos to well under this first
const PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export async function OPTIONS(request: Request) {
  return corsPreflight(request)
}

export async function POST(request: Request) {
  const origin = request.headers.get('origin')
  if (isDisallowedCrossOrigin(request)) return corsJson({ error: 'Origin not allowed' }, 403, null)

  let form: FormData
  try {
    form = await request.formData()
  } catch {
    return corsJson({ error: 'Invalid form data' }, 400, origin)
  }
  const str = (k: string) => {
    const v = form.get(k)
    return typeof v === 'string' ? v.trim() : ''
  }

  // Honeypot: real visitors never fill this hidden field. Pretend success so bots learn nothing.
  if (str('website')) return corsJson({ ok: true }, 200, origin)

  const name = str('name')
  const role = str('role')
  const review = str('review')
  const rating = Number(str('rating'))
  const consent = str('consent') === 'yes'
  const photo = form.get('photo')

  if (!name || name.length > 100) return corsJson({ error: 'Please enter your name (max 100 characters)' }, 400, origin)
  if (role.length > 100) return corsJson({ error: 'Role / company must be 100 characters or less' }, 400, origin)
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) return corsJson({ error: 'Please choose a rating from 1 to 5 stars' }, 400, origin)
  if (review.length < 10 || review.length > 1000) return corsJson({ error: 'Your review should be between 10 and 1000 characters' }, 400, origin)
  if (!consent) return corsJson({ error: 'Please confirm the review can be shown on the website' }, 400, origin)

  let photoFile: File | null = null
  if (photo instanceof File && photo.size > 0) {
    if (!PHOTO_TYPES.includes(photo.type)) return corsJson({ error: 'Photo must be a JPG, PNG or WebP image' }, 400, origin)
    if (photo.size > MAX_PHOTO_BYTES) return corsJson({ error: 'Photo is too large (max 2 MB)' }, 400, origin)
    photoFile = photo
  }

  // Rate limit by salted IP hash, stored with the reviews so it works across serverless instances.
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const ipHash = createHash('sha256')
    .update(`${process.env.ADMIN_SESSION_SECRET ?? ''}:${ip}`)
    .digest('hex')
    .slice(0, 32)

  let assetId: string | null = null
  try {
    const since = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    const recent = await sanityWrite.fetch<number>(
      'count(*[_type == "review" && ipHash == $ipHash && _createdAt > $since])',
      { ipHash, since }
    )
    if (recent >= LIMIT_PER_HOUR) {
      return corsJson({ error: 'Too many reviews from you just now. Please try again later.' }, 429, origin)
    }

    if (photoFile) {
      const asset = await sanityWrite.assets.upload('image', Buffer.from(await photoFile.arrayBuffer()), {
        filename: `review-${Date.now()}`,
        contentType: photoFile.type,
      })
      assetId = asset._id
    }

    await sanityWrite.create({
      // Private until approved in the admin, which moves it to a public id.
      _id: privateId(`review-${randomUUID()}`),
      _type: 'review',
      submittedAt: new Date().toISOString(),
      name,
      ...(role && { role }),
      rating,
      review,
      ...(assetId && { photo: { _type: 'image', asset: { _type: 'reference', _ref: assetId } } }),
      status: 'pending',
      consent,
      ipHash,
    })
    return corsJson({ ok: true }, 200, origin)
  } catch (e) {
    console.error(e)
    // Don't leave an orphaned photo behind if saving the review failed.
    if (assetId) await sanityWrite.delete(assetId).catch(() => {})
    return corsJson({ error: 'Could not send your review. Please try again.' }, 500, origin)
  }
}
