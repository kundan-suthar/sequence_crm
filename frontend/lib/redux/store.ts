import { configureStore } from '@reduxjs/toolkit'
import userReducer from './features/user/userSlice'
import customerReducer from './features/customer/customerSlice'

export const makeStore = () => {
    return configureStore({
        reducer: {
            user: userReducer,
            customer: customerReducer,
        },
    })
}

// Infer types from the store itself
export type AppStore = ReturnType<typeof makeStore>
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']
