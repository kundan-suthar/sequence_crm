import axiosInstance from '@/lib/axios/axiosInstance'
import { ENDPOINTS } from '@/lib/axios/endpoints'
import {
    Interaction,
    InteractionWithInsight,
    InteractionCreatePayload,
    InteractionUpdatePayload,
} from '@/types/interaction.types'

export const interactionService = {
    getAll: async (params?: { customer_id?: number; type?: string }): Promise<Interaction[]> => {
        const { data } = await axiosInstance.get<Interaction[]>(ENDPOINTS.INTERACTION.LIST, {
            params,
        })
        return data
    },

    getById: async (id: number): Promise<InteractionWithInsight> => {
        const { data } = await axiosInstance.get<InteractionWithInsight>(
            ENDPOINTS.INTERACTION.DETAIL(id)
        )
        return data
    },

    create: async (payload: InteractionCreatePayload): Promise<InteractionWithInsight> => {
        const { data } = await axiosInstance.post<InteractionWithInsight>(
            ENDPOINTS.INTERACTION.CREATE,
            payload
        )
        return data
    },

    update: async (id: number, payload: InteractionUpdatePayload): Promise<Interaction> => {
        const { data } = await axiosInstance.patch<Interaction>(
            ENDPOINTS.INTERACTION.UPDATE(id),
            payload
        )
        return data
    },

    delete: async (id: number): Promise<void> => {
        await axiosInstance.delete(ENDPOINTS.INTERACTION.DELETE(id))
    },
}
