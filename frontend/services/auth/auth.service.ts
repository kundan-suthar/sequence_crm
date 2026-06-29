import axiosInstance from '@/lib/axios/axiosInstance'
import { ENDPOINTS } from '@/lib/axios/endpoints'
import { ApiResponse } from '@/types/api.types'

export interface LoginPayload {
    email: string
    password: string
}

export interface RegisterPayload {
    name: string
    email: string
    password: string
}

export interface AuthUser {
    id: string
    name: string
    email: string
    roles: string[]
}

// ── Session cookie helpers ────────────────────────────────────────────────────
// A lightweight non-httpOnly "session=1" cookie that middleware can read to
// decide route access. It carries no sensitive data — security is enforced by
// the httpOnly refresh_token cookie + in-memory access token.

const SESSION_COOKIE = 'session'

export function setSessionCookie() {
    // Expires with the browser session (no max-age); SameSite=Lax is the default
    document.cookie = `${SESSION_COOKIE}=1; path=/; SameSite=Lax`
}

export function clearSessionCookie() {
    document.cookie = `${SESSION_COOKIE}=; path=/; max-age=0; SameSite=Lax`
}

// ── Service ───────────────────────────────────────────────────────────────────

export const authService = {
    login: async (payload: LoginPayload): Promise<{ access_token: string }> => {
        const { data } = await axiosInstance.post<{ access_token: string }>(
            ENDPOINTS.AUTH.LOGIN,
            payload
        )
        return data
    },

    register: async (payload: RegisterPayload) => {
        const { data } = await axiosInstance.post<ApiResponse<AuthUser>>(
            ENDPOINTS.AUTH.REGISTER,
            payload
        )
        return data.data
    },

    logout: async () => {
        await axiosInstance.post(ENDPOINTS.AUTH.LOGOUT)
    },

    getCurrentUser: async (): Promise<AuthUser> => {
        const { data } = await axiosInstance.get<AuthUser>(
            ENDPOINTS.AUTH.ME
        )
        return data
    },
}