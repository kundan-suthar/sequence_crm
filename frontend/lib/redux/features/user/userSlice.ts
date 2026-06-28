import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface User {
    id: string
    name: string
    email: string
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
        clearUser: (state) => {
            state.currentUser = null
            state.accessToken = null
            state.isAuthenticated = false
        },
    },
})

export const { setUser, clearUser } = userSlice.actions
export default userSlice.reducer