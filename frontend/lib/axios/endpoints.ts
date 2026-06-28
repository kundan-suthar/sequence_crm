export const ENDPOINTS = {
    AUTH: {
        LOGIN: '/auth/login',
        LOGOUT: '/auth/logout',
        REFRESH: '/auth/refresh',
        REGISTER: '/auth/register',
        ME: '/auth/me',
    },
    USER: {
        LIST: '/users',
        DETAIL: (id: string) => `/users/${id}`,
        UPDATE: (id: string) => `/users/${id}`,
        DELETE: (id: string) => `/users/${id}`,
    },
    CUSTOMER: {
        LIST: '/customers',
        CREATE: '/customers',
        DETAIL: (id: number) => `/customers/${id}`,
        UPDATE: (id: number) => `/customers/${id}`,
        DELETE: (id: number) => `/customers/${id}`,
    },
    INTERACTION: {
        LIST: '/interactions',
        CREATE: '/interactions',
        DETAIL: (id: number) => `/interactions/${id}`,
        UPDATE: (id: number) => `/interactions/${id}`,
        DELETE: (id: number) => `/interactions/${id}`,
    },
    DASHBOARD: {
        ANALYTICS: '/dashboard/analytics',
    },
} as const