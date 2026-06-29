'use client'

import { useRef } from 'react'
import { Provider } from 'react-redux'
import { makeStore, AppStore } from './store'
import { setAuthTokenGetter, setAccessTokenUpdater, setUnauthorizedHandler, setRefreshTokenGetter } from '@/lib/axios/axiosInstance'
import { setAccessToken, clearUser } from './features/user/userSlice'
import { getRefreshToken, clearRefreshToken, clearSessionCookie } from '@/services/auth/auth.service'

export default function StoreProvider({
    children,
}: {
    children: React.ReactNode
}) {
    const storeRef = useRef<AppStore | null>(null)

    if (!storeRef.current) {
        const store = makeStore()
        storeRef.current = store

        // Inject the token getter so axios always reads the latest value from the store
        setAuthTokenGetter(() => store.getState().user.accessToken)

        // Dispatch the new token into the store after a successful refresh
        setAccessTokenUpdater((token: string) => {
            store.dispatch(setAccessToken(token))
        })

        // Redirect to sign-in and clear state when a refresh attempt fails.
        // clearSessionCookie() + clearRefreshToken() ensure middleware won't
        // redirect back to /dashboard (preventing the infinite redirect loop).
        setUnauthorizedHandler(() => {
            store.dispatch(clearUser())
            clearRefreshToken()
            clearSessionCookie()
            window.location.href = '/sign-in'
        })

        // Wire the localStorage refresh token getter into the axios interceptor
        setRefreshTokenGetter(getRefreshToken)
    }

    return <Provider store={storeRef.current}>{children}</Provider>
}