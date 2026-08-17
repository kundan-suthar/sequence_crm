import { configureStore } from '@reduxjs/toolkit'
import userReducer from './features/user/userSlice'
import customerReducer from './features/customer/customerSlice'
import interactionReducer from './features/interaction/interactionSlice'
import adminReducer from './features/admin/adminSlice'

export const makeStore = () => {
    return configureStore({
        reducer: {
            user: userReducer,
            customer: customerReducer,
            interaction: interactionReducer,
            admin: adminReducer,
        },
    })
}

// Infer types from the store itself
export type AppStore = ReturnType<typeof makeStore>
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']
