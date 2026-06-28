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
}

export const authService = {
    login: async (payload: LoginPayload) => {
        const { data } = await axiosInstance.post<ApiResponse<AuthUser>>(
            ENDPOINTS.AUTH.LOGIN,
            payload
        )
        return data.data
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

    getCurrentUser: async () => {
        const { data } = await axiosInstance.get<ApiResponse<AuthUser>>(
            ENDPOINTS.AUTH.ME
        )
        return data.data
    },
}