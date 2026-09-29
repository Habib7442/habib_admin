import { createHash, randomUUID } from 'node:crypto'
import { privateId, sanityWrite } from '@/lib/sanity'
import { corsJson, corsPreflight, isDisallowedCrossOrigin } from '@/lib/cors'

// Public endpoint your portfolio's contact form posts to.
// Set PUBLIC_SITE_ORIGINS to a comma-separated list of your portfolio's origins.

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const LIMIT_PER_HOUR = 3

export async function OPTIONS(request: Request) {
  return corsPreflight(request)
}

export async function POST(request: Request) {
  const origin = request.headers.get('origin')
  if (isDisallowedCrossOrigin(request)) return corsJson({ error: 'Origin not allowed' }, 403, null)

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return corsJson({ error: 'Invalid JSON' }, 400, origin)
  }
  const str = (k: string) => (typeof body[k] === 'string' ? (body[k] as string).trim() : '')

  // Honeypot: real visitors never fill this hidden field. Pretend success so bots learn nothing.
  if (str('website')) return corsJson({ ok: true }, 200, origin)

  const name = str('name')
  const email = str('email')
  const subject = str('subject')
  const message = str('message')

  if (!name || name.length > 100) return corsJson({ error: 'Name is required (max 100 characters)' }, 400, origin)
  if (!EMAIL.test(email) || email.length > 200) return corsJson({ error: 'A valid email is required' }, 400, origin)
  if (subject.length > 150) return corsJson({ error: 'Subject must be 150 characters or less' }, 400, origin)
  if (!message || message.length > 5000) return corsJson({ error: 'Message is required (max 5000 characters)' }, 400, origin)

  // Rate limit by salted IP hash, stored with the messages so it works across serverless instances.
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const ipHash = createHash('sha256')
    .update(`${process.env.ADMIN_SESSION_SECRET ?? ''}:${ip}`)
    .digest('hex')
    .slice(0, 32)

  try {
    const since = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    const recent = await sanityWrite.fetch<number>(
      'count(*[_type == "contactMessage" && ipHash == $ipHash && _createdAt > $since])',
      { ipHash, since }
    )
    if (recent >= LIMIT_PER_HOUR) {
      return corsJson({ error: 'Too many messages. Please try again later.' }, 429, origin)
    }

    await sanityWrite.create({
      // Private id: hidden from the public API (names, emails and messages must never be readable).
      _id: privateId(`contact-${randomUUID()}`),
      _type: 'contactMessage',
      name,
      email,
      ...(subject && { subject }),
      message,
      status: 'new',
      ipHash,
    })
    return corsJson({ ok: true }, 200, origin)
  } catch (e) {
    console.error(e)
    return corsJson({ error: 'Could not send your message. Please try again.' }, 500, origin)
  }
}
