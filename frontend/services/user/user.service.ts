import axiosInstance from '@/lib/axios/axiosInstance'
import { ENDPOINTS } from '@/lib/axios/endpoints'
import { ApiResponse, PaginatedResponse } from '@/types/api.types'

export interface UserDto {
    id: string
    name: string
    email: string
}

export const userService = {
    getAll: async (page = 1, pageSize = 10) => {
        const { data } = await axiosInstance.get<ApiResponse<PaginatedResponse<UserDto>>>(
            ENDPOINTS.USER.LIST, { params: { page, pageSize } }
        )
        return data.data
    },

    getById: async (id: string) => {
        const { data } = await axiosInstance.get<ApiResponse<UserDto>>(
            ENDPOINTS.USER.DETAIL(id)
        )
        return data.data
    },

    update: async (id: string, payload: Partial<UserDto>) => {
        const { data } = await axiosInstance.put<ApiResponse<UserDto>>(
            ENDPOINTS.USER.UPDATE(id),
            payload
        )
        return data.data
    },

    delete: async (id: string) => {
        await axiosInstance.delete(ENDPOINTS.USER.DELETE(id))
    },
}