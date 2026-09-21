import { NextResponse, type NextRequest } from 'next/server'
import { SESSION_COOKIE, verifyToken } from '@/lib/token'

// Optimistic gate only; pages and server actions re-check with requireAuth().
export function proxy(request: NextRequest) {
  if (!verifyToken(request.cookies.get(SESSION_COOKIE)?.value)) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
