import axiosInstance from '@/lib/axios/axiosInstance'
import { ENDPOINTS } from '@/lib/axios/endpoints'
import { UserOut } from '@/types/admin.types'

export const adminService = {
    listUsers: async (): Promise<UserOut[]> => {
        const { data } = await axiosInstance.get<UserOut[]>(ENDPOINTS.ADMIN.USER_LIST)
        return data
    },

    updateUserRole: async (
        user_id: number,
        role_name: 'admin' | 'executive' | 'user'
    ): Promise<UserOut> => {
        const { data } = await axiosInstance.patch<UserOut>(
            ENDPOINTS.ADMIN.USER_UPDATE_ROLE(user_id),
            { role_name }
        )
        return data
    },
}
