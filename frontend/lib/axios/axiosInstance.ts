import axios, {
    AxiosError,
    AxiosInstance,
    InternalAxiosRequestConfig,
} from 'axios'
import { normalizeAxiosError } from './apiError'

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL
const TIMEOUT = Number(process.env.NEXT_PUBLIC_API_TIMEOUT) || 15000

// Token getter/setter are injected to avoid circular deps with redux store
let getAccessToken: () => string | null = () => null
let updateAccessToken: (token: string) => void = () => { }
let onUnauthorized: () => void = () => { }

const AUTH_ENDPOINTS_NO_REFRESH = ['/auth/login', '/auth/register', '/auth/refresh']

function shouldSkipRefresh(url?: string) {
  if (!url) return false
  return AUTH_ENDPOINTS_NO_REFRESH.some((endpoint) => url.includes(endpoint))
}

export function setAuthTokenGetter(fn: () => string | null) {
    getAccessToken = fn
}

export function setAccessTokenUpdater(fn: (token: string) => void) {
    updateAccessToken = fn
}

export function setUnauthorizedHandler(fn: () => void) {
    onUnauthorized = fn
}

const axiosInstance: AxiosInstance = axios.create({
    baseURL: BASE_URL,
    timeout: TIMEOUT,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials:true
})

// ---- Request Interceptor ----
axiosInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = getAccessToken()
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => Promise.reject(error)
)

// ---- Response Interceptor ----
let isRefreshing = false
let pendingQueue: Array<() => void> = []

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        // error.config can be undefined for network errors (e.g. CORS pre-flight
        // failures, request cancellations). Guard here to avoid crashing the
        // interceptor before the refresh flow ever runs.
        if (!error.config) {
            return Promise.reject(normalizeAxiosError(error))
        }

        const originalRequest = error.config as InternalAxiosRequestConfig & {
            _retry?: boolean
        }
        const isAuthEndpoint = shouldSkipRefresh(originalRequest.url)
        // Handle 401 — token refresh flow
        if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
            if (isRefreshing) {
                // Queue requests while refresh is in progress
                return new Promise((resolve) => {
                    pendingQueue.push(() => resolve(axiosInstance(originalRequest)))
                })
            }

            originalRequest._retry = true
            isRefreshing = true

            try {
                const { data } = await axiosInstance.post<{ access_token: string }>('/auth/refresh')
                updateAccessToken(data.access_token)

                pendingQueue.forEach((cb) => cb())
                pendingQueue = []
                return axiosInstance(originalRequest)
            } catch (refreshError) {
                pendingQueue = []
                onUnauthorized() // e.g. dispatch logout, redirect to /login
                return Promise.reject(normalizeAxiosError(refreshError))
            } finally {
                isRefreshing = false
            }
        }

        return Promise.reject(normalizeAxiosError(error))
    }
)

export default axiosInstance