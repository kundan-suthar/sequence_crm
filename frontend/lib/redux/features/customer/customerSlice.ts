import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { customerService } from '@/services/customer/customer.service'
import {
    Customer,
    CustomerCreatePayload,
    CustomerUpdatePayload,
} from '@/types/customer.types'

// ── State ────────────────────────────────────────────────────────────────────

interface CustomerState {
    items: Customer[]
    selectedCustomer: Customer | null
    status: 'idle' | 'loading' | 'succeeded' | 'failed'
    error: string | null
}

const initialState: CustomerState = {
    items: [],
    selectedCustomer: null,
    status: 'idle',
    error: null,
}

// ── Thunks ───────────────────────────────────────────────────────────────────

export const fetchCustomers = createAsyncThunk(
    'customer/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            return await customerService.getAll()
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to fetch customers'
            return rejectWithValue(message)
        }
    }
)

export const fetchCustomerById = createAsyncThunk(
    'customer/fetchById',
    async (id: number, { rejectWithValue }) => {
        try {
            return await customerService.getById(id)
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to fetch customer'
            return rejectWithValue(message)
        }
    }
)

export const createCustomer = createAsyncThunk(
    'customer/create',
    async (payload: CustomerCreatePayload, { rejectWithValue }) => {
        try {
            return await customerService.create(payload)
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to create customer'
            return rejectWithValue(message)
        }
    }
)

export const updateCustomer = createAsyncThunk(
    'customer/update',
    async (
        { id, payload }: { id: number; payload: CustomerUpdatePayload },
        { rejectWithValue }
    ) => {
        try {
            return await customerService.update(id, payload)
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to update customer'
            return rejectWithValue(message)
        }
    }
)

export const deleteCustomer = createAsyncThunk(
    'customer/delete',
    async (id: number, { rejectWithValue }) => {
        try {
            await customerService.delete(id)
            return id
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to delete customer'
            return rejectWithValue(message)
        }
    }
)

// ── Slice ────────────────────────────────────────────────────────────────────

const customerSlice = createSlice({
    name: 'customer',
    initialState,
    reducers: {
        setSelectedCustomer(state, action: PayloadAction<Customer | null>) {
            state.selectedCustomer = action.payload
        },
        clearCustomerError(state) {
            state.error = null
        },
    },
    extraReducers: (builder) => {
        // fetchAll
        builder
            .addCase(fetchCustomers.pending, (state) => {
                state.status = 'loading'
                state.error = null
            })
            .addCase(fetchCustomers.fulfilled, (state, action) => {
                state.status = 'succeeded'
                state.items = action.payload
            })
            .addCase(fetchCustomers.rejected, (state, action) => {
                state.status = 'failed'
                state.error = action.payload as string
            })

        // fetchById
        builder
            .addCase(fetchCustomerById.fulfilled, (state, action) => {
                state.selectedCustomer = action.payload
            })

        // create
        builder
            .addCase(createCustomer.fulfilled, (state, action) => {
                state.items.unshift(action.payload)
            })

        // update
        builder
            .addCase(updateCustomer.fulfilled, (state, action) => {
                const idx = state.items.findIndex((c) => c.id === action.payload.id)
                if (idx !== -1) state.items[idx] = action.payload
                if (state.selectedCustomer?.id === action.payload.id) {
                    state.selectedCustomer = action.payload
                }
            })

        // delete
        builder
            .addCase(deleteCustomer.fulfilled, (state, action) => {
                state.items = state.items.filter((c) => c.id !== action.payload)
                if (state.selectedCustomer?.id === action.payload) {
                    state.selectedCustomer = null
                }
            })
    },
})

export const { setSelectedCustomer, clearCustomerError } = customerSlice.actions
export default customerSlice.reducer
