import { createHash } from 'node:crypto'
import { NextResponse } from 'next/server'
import { sanityWrite } from '@/lib/sanity'

// Public endpoint your portfolio's contact form posts to.
// Set CONTACT_ALLOWED_ORIGINS to a comma-separated list of your portfolio's origins.

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const LIMIT_PER_HOUR = 3

function allowedOrigins() {
  return (process.env.CONTACT_ALLOWED_ORIGINS ?? '')
    .split(',')
    .map((o) => o.trim().replace(/\/$/, ''))
    .filter(Boolean)
}

function corsHeaders(origin: string | null): Record<string, string> {
  const headers: Record<string, string> = { Vary: 'Origin' }
  if (origin && allowedOrigins().includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin
    headers['Access-Control-Allow-Methods'] = 'POST, OPTIONS'
    headers['Access-Control-Allow-Headers'] = 'Content-Type'
    headers['Access-Control-Max-Age'] = '86400'
  }
  return headers
}

function json(body: unknown, status: number, origin: string | null) {
  return NextResponse.json(body, { status, headers: corsHeaders(origin) })
}

export async function OPTIONS(request: Request) {
  return new NextResponse(null, { status: 204, headers: corsHeaders(request.headers.get('origin')) })
}

export async function POST(request: Request) {
  const origin = request.headers.get('origin')
  // Browsers always send Origin on cross-site POSTs; refuse ones that are not on the list.
  if (origin && !allowedOrigins().includes(origin) && origin !== new URL(request.url).origin) {
    return json({ error: 'Origin not allowed' }, 403, null)
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return json({ error: 'Invalid JSON' }, 400, origin)
  }
  const str = (k: string) => (typeof body[k] === 'string' ? (body[k] as string).trim() : '')

  // Honeypot: real visitors never fill this hidden field. Pretend success so bots learn nothing.
  if (str('website')) return json({ ok: true }, 200, origin)

  const name = str('name')
  const email = str('email')
  const subject = str('subject')
  const message = str('message')

  if (!name || name.length > 100) return json({ error: 'Name is required (max 100 characters)' }, 400, origin)
  if (!EMAIL.test(email) || email.length > 200) return json({ error: 'A valid email is required' }, 400, origin)
  if (subject.length > 150) return json({ error: 'Subject must be 150 characters or less' }, 400, origin)
  if (!message || message.length > 5000) return json({ error: 'Message is required (max 5000 characters)' }, 400, origin)

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
      return json({ error: 'Too many messages. Please try again later.' }, 429, origin)
    }

    await sanityWrite.create({
      _type: 'contactMessage',
      name,
      email,
      ...(subject && { subject }),
      message,
      status: 'new',
      ipHash,
    })
    return json({ ok: true }, 200, origin)
  } catch (e) {
    console.error(e)
    return json({ error: 'Could not send your message. Please try again.' }, 500, origin)
  }
}
