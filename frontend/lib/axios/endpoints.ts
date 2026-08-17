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
    ADMIN: {
        USER_LIST: '/admin/users',
        USER_UPDATE_ROLE: (user_id: number) => `/admin/users/${user_id}/role`,
    },
} as const