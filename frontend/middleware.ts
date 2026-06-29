import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// ── Route config ─────────────────────────────────────────────────────────────

/** Paths that require the user to be logged in */
const PROTECTED_PREFIXES = ['/dashboard', '/settings', '/profile']

/** Paths that logged-in users should NOT see */
const GUEST_ONLY_PATHS = ['/sign-in', '/register', '/forgot-password']

// ── Helpers ───────────────────────────────────────────────────────────────────

function matchesAny(pathname: string, patterns: string[]) {
    return patterns.some((p) => pathname.startsWith(p))
}

// ── Middleware ────────────────────────────────────────────────────────────────

export function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl

    // "session" is a non-httpOnly presence-flag cookie set by the frontend on
    // login and cleared on logout. It doesn't carry sensitive data — the real
    // security lives in the httpOnly refresh_token + in-memory access token.
    const isAuthenticated = Boolean(req.cookies.get('session')?.value)

    // 🔒 Protected route — user not logged in → redirect to /sign-in
    if (matchesAny(pathname, PROTECTED_PREFIXES) && !isAuthenticated) {
        const url = req.nextUrl.clone()
        url.pathname = '/sign-in'
        // Preserve intended destination so we can redirect back after login
        url.searchParams.set('callbackUrl', pathname)
        return NextResponse.redirect(url)
    }

    // 🔓 Auth page — user already logged in → redirect to /dashboard
    if (matchesAny(pathname, GUEST_ONLY_PATHS) && isAuthenticated) {
        const url = req.nextUrl.clone()
        url.pathname = '/dashboard'
        url.search = ''
        return NextResponse.redirect(url)
    }

    return NextResponse.next()
}

// ── Matcher ───────────────────────────────────────────────────────────────────

export const config = {
    matcher: [
        /*
         * Run on all paths except:
         * - _next/static  (compiled JS/CSS)
         * - _next/image   (image optimisation API)
         * - favicon.ico
         * - public folder files
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
