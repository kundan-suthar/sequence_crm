'use client'

import { useEffect, useRef, useState } from 'react'
import { useAppSelector, useAppDispatch } from '@/lib/redux/hooks'
import { restoreUser, clearUser } from '@/lib/redux/features/user/userSlice'
import { authService } from '@/services/auth/auth.service'

interface AuthGuardProps {
  children: React.ReactNode
}

/**
 * Restores the Redux user session after a hard page refresh.
 *
 * Route-level access control (protected vs guest-only) is handled entirely
 * by middleware.ts using the "session" cookie — no redirects happen here.
 *
 * On mount this calls GET /auth/me. The axios interceptor automatically
 * exchanges the httpOnly refresh_token cookie for a fresh access token,
 * then /auth/me returns the full user profile. We dispatch restoreUser to
 * repopulate currentUser + isAuthenticated in Redux.
 *
 * Shows a full-screen spinner while the restore is in-flight so pages that
 * depend on currentUser don't flash with empty state.
 */
export default function AuthGuard({ children }: AuthGuardProps) {
  const dispatch = useAppDispatch()
  const isAuthenticated = useAppSelector((s) => s.user.isAuthenticated)
  const [restoring, setRestoring] = useState(!isAuthenticated)
  const attempted = useRef(false)

  useEffect(() => {
    // Already in Redux (came from the login flow in this browser tab) — nothing to do
    if (isAuthenticated) {
      setRestoring(false)
      return
    }

    if (attempted.current) return
    attempted.current = true

    authService
      .getCurrentUser()
      .then((user) => {
        dispatch(restoreUser(user))
      })
      .catch(() => {
        // No valid session — middleware already ensured we're allowed here
        dispatch(clearUser())
      })
      .finally(() => {
        setRestoring(false)
      })
  }, [isAuthenticated, dispatch])

  if (restoring) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin" />
          <p className="text-sm text-muted-foreground">Loading…</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
