'use client'

import { useRef } from 'react'
import { Provider } from 'react-redux'
import { makeStore, AppStore } from './store'
import { setAuthTokenGetter, setAccessTokenUpdater, setUnauthorizedHandler } from '@/lib/axios/axiosInstance'
import { setAccessToken, clearUser } from './features/user/userSlice'

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

        // Redirect to sign-in and clear state when a refresh attempt fails
        setUnauthorizedHandler(() => {
            store.dispatch(clearUser())
            window.location.href = '/sign-in'
        })
    }

    return <Provider store={storeRef.current}>{children}</Provider>
}