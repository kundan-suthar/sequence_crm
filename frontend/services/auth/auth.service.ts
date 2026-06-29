import axiosInstance from '@/lib/axios/axiosInstance'
import { ENDPOINTS } from '@/lib/axios/endpoints'
import { ApiResponse } from '@/types/api.types'

export interface LoginPayload {
    email: string
    password: string
}

export interface LoginResponse {
    access_token: string
    refresh_token: string
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

// ── localStorage refresh token helpers ───────────────────────────────────────

const REFRESH_TOKEN_KEY = 'refresh_token'

export function saveRefreshToken(token: string): void {
    try {
        localStorage.setItem(REFRESH_TOKEN_KEY, token)
    } catch {
        // SSR or storage unavailable — silently ignore
    }
}

export function getRefreshToken(): string | null {
    try {
        return localStorage.getItem(REFRESH_TOKEN_KEY)
    } catch {
        return null
    }
}

export function clearRefreshToken(): void {
    try {
        localStorage.removeItem(REFRESH_TOKEN_KEY)
    } catch {
        // SSR or storage unavailable — silently ignore
    }
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
    login: async (payload: LoginPayload): Promise<LoginResponse> => {
        const { data } = await axiosInstance.post<LoginResponse>(
            ENDPOINTS.AUTH.LOGIN,
            payload
        )
        saveRefreshToken(data.refresh_token)
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
        clearRefreshToken()
        clearSessionCookie()
    },

    getCurrentUser: async (): Promise<AuthUser> => {
        const { data } = await axiosInstance.get<AuthUser>(
            ENDPOINTS.AUTH.ME
        )
        return data
    },
}