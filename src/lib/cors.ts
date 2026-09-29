import 'server-only'
import { NextResponse } from 'next/server'

/** Origins (e.g. the portfolio site) allowed to call the public API routes from a browser. */
export function allowedOrigins() {
  return (process.env.PUBLIC_SITE_ORIGINS ?? '')
    .split(',')
    .map((o) => o.trim().replace(/\/$/, ''))
    .filter(Boolean)
}

export function corsHeaders(origin: string | null): Record<string, string> {
  const headers: Record<string, string> = { Vary: 'Origin' }
  if (origin && allowedOrigins().includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin
    headers['Access-Control-Allow-Methods'] = 'POST, OPTIONS'
    headers['Access-Control-Allow-Headers'] = 'Content-Type'
    headers['Access-Control-Max-Age'] = '86400'
  }
  return headers
}

export function corsJson(body: unknown, status: number, origin: string | null) {
  return NextResponse.json(body, { status, headers: corsHeaders(origin) })
}

export function corsPreflight(request: Request) {
  return new NextResponse(null, { status: 204, headers: corsHeaders(request.headers.get('origin')) })
}

/** True if the request's Origin header is present and NOT allowed (same-origin requests send no Origin here). */
export function isDisallowedCrossOrigin(request: Request) {
  const origin = request.headers.get('origin')
  return !!origin && !allowedOrigins().includes(origin) && origin !== new URL(request.url).origin
}
