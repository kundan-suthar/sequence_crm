import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '@/lib/redux/store'

interface User {
    id: string
    name: string
    email: string
    roles: string[]
}

interface UserState {
    currentUser: User | null
    accessToken: string | null
    isAuthenticated: boolean
}

const initialState: UserState = {
    currentUser: null,
    accessToken: null,
    isAuthenticated: false,
}

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUser: (
            state,
            action: PayloadAction<{ user: User; accessToken: string }>
        ) => {
            state.currentUser = action.payload.user
            state.accessToken = action.payload.accessToken
            state.isAuthenticated = true
        },
        restoreUser: (state, action: PayloadAction<User>) => {
            // Used on page refresh: the axios interceptor already updated accessToken
            // via setAccessToken, so we only restore currentUser + isAuthenticated.
            state.currentUser = action.payload
            state.isAuthenticated = true
        },
        setAccessToken: (state, action: PayloadAction<string>) => {
            state.accessToken = action.payload
        },
        clearUser: (state) => {
            state.currentUser = null
            state.accessToken = null
            state.isAuthenticated = false
        },
    },
})

export const { setUser, restoreUser, setAccessToken, clearUser } = userSlice.actions
export default userSlice.reducer

export const selectIsAdmin = (state: RootState): boolean =>
    state.user.currentUser?.roles?.includes('admin') ?? false