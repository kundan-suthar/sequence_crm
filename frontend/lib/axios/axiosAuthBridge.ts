import { setAuthTokenGetter, setAccessTokenUpdater, setUnauthorizedHandler } from './axiosInstance'
import { AppStore } from '@/lib/redux/store'
import { setAccessToken, clearUser } from '@/lib/redux/features/user/userSlice'

export function bridgeAxiosWithStore(store: AppStore) {
    setAuthTokenGetter(() => {
        const state = store.getState()
        return state.user.currentUser ? state.user.accessToken ?? null : null
    })

    setAccessTokenUpdater((token: string) => {
        store.dispatch(setAccessToken(token))
    })

    setUnauthorizedHandler(() => {
        store.dispatch(clearUser())
        if (typeof window !== 'undefined') {
            window.location.href = '/login'
        }
    })
}