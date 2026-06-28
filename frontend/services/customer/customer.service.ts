import axiosInstance from '@/lib/axios/axiosInstance'
import { ENDPOINTS } from '@/lib/axios/endpoints'
import { Customer, CustomerCreatePayload, CustomerUpdatePayload } from '@/types/customer.types'

export const customerService = {
    getAll: async (): Promise<Customer[]> => {
        const { data } = await axiosInstance.get<Customer[]>(ENDPOINTS.CUSTOMER.LIST)
        return data
    },

    getById: async (id: number): Promise<Customer> => {
        const { data } = await axiosInstance.get<Customer>(ENDPOINTS.CUSTOMER.DETAIL(id))
        return data
    },

    create: async (payload: CustomerCreatePayload): Promise<Customer> => {
        const { data } = await axiosInstance.post<Customer>(
            ENDPOINTS.CUSTOMER.CREATE,
            payload
        )
        return data
    },

    update: async (id: number, payload: CustomerUpdatePayload): Promise<Customer> => {
        const { data } = await axiosInstance.patch<Customer>(
            ENDPOINTS.CUSTOMER.UPDATE(id),
            payload
        )
        return data
    },

    delete: async (id: number): Promise<void> => {
        await axiosInstance.delete(ENDPOINTS.CUSTOMER.DELETE(id))
    },
}
