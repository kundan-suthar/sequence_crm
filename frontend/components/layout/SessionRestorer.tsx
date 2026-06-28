'use client'

import { useEffect, useRef } from 'react'
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks'
import { restoreUser, clearUser } from '@/lib/redux/features/user/userSlice'
import { authService } from '@/services/auth/auth.service'

/**
 * Restores the user session (including roles) on page refresh.
 *
 * Redux state is in-memory only — it resets to null on every hard refresh.
 * On mount this calls GET /auth/me. The axios 401→refresh interceptor will
 * automatically exchange the httpOnly refresh_token cookie for a fresh
 * access token (dispatching setAccessToken into the store), then /auth/me
 * returns the full user including roles[]. We dispatch restoreUser to set
 * currentUser + isAuthenticated without clobbering the token the interceptor
 * just stored.
 *
 * Renders nothing — purely a side-effect component.
 */
export default function SessionRestorer() {
    const dispatch = useAppDispatch()
    const isAuthenticated = useAppSelector((s) => s.user.isAuthenticated)
    const attempted = useRef(false)

    useEffect(() => {
        // Skip if the user is already in the store (came from the sign-in flow)
        if (isAuthenticated || attempted.current) return
        attempted.current = true

        authService.getCurrentUser()
            .then((user) => {
                // The axios interceptor already stored the refreshed access token
                // via setAccessToken. We only need to restore currentUser + roles.
                dispatch(restoreUser(user))
            })
            .catch(() => {
                // Refresh token absent or expired — ensure store is clean
                dispatch(clearUser())
            })
    }, [dispatch, isAuthenticated])

    return null
}
