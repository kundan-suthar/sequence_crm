
import { setAuthTokenGetter, setUnauthorizedHandler } from './axiosInstance'
import { AppStore } from '@/lib/redux/store'
import { clearUser } from '@/lib/redux/features/user/userSlice'

export function bridgeAxiosWithStore(store: AppStore) {
    setAuthTokenGetter(() => {
        const state = store.getState()
        return state.user.currentUser ? state.user.accessToken ?? null : null
    })

    setUnauthorizedHandler(() => {
        store.dispatch(clearUser())
        if (typeof window !== 'undefined') {
            window.location.href = '/login'
        }
    })
}