import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { adminService } from '@/services/admin/admin.service'
import { UserOut } from '@/types/admin.types'

// ── Types ─────────────────────────────────────────────────────────────────────

type ValidRole = 'admin' | 'executive' | 'user'

// ── State ─────────────────────────────────────────────────────────────────────

interface AdminState {
    users: UserOut[]
    listStatus: 'idle' | 'loading' | 'succeeded' | 'failed'
    listError: string | null
    updateStatus: 'idle' | 'loading' | 'succeeded' | 'failed'
    updateError: string | null
}

const initialState: AdminState = {
    users: [],
    listStatus: 'idle',
    listError: null,
    updateStatus: 'idle',
    updateError: null,
}

// ── Thunks ────────────────────────────────────────────────────────────────────

export const fetchUsers = createAsyncThunk(
    'admin/fetchUsers',
    async (_, { rejectWithValue }) => {
        try {
            return await adminService.listUsers()
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to fetch users'
            return rejectWithValue(message)
        }
    }
)

export const updateUserRole = createAsyncThunk(
    'admin/updateUserRole',
    async ({ userId, roleName }: { userId: number; roleName: string }, { rejectWithValue }) => {
        try {
            return await adminService.updateUserRole(userId, roleName as ValidRole)
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to update user role'
            return rejectWithValue(message)
        }
    }
)

// ── Slice ─────────────────────────────────────────────────────────────────────

const adminSlice = createSlice({
    name: 'admin',
    initialState,
    reducers: {
        resetUpdateStatus(state) {
            state.updateStatus = 'idle'
            state.updateError = null
        },
    },
    extraReducers: (builder) => {
        // fetchUsers
        builder
            .addCase(fetchUsers.pending, (state) => {
                state.listStatus = 'loading'
                state.listError = null
            })
            .addCase(fetchUsers.fulfilled, (state, action) => {
                state.listStatus = 'succeeded'
                state.users = action.payload
            })
            .addCase(fetchUsers.rejected, (state, action) => {
                state.listStatus = 'failed'
                state.listError = action.payload as string
            })

        // updateUserRole
        builder
            .addCase(updateUserRole.pending, (state) => {
                state.updateStatus = 'loading'
                state.updateError = null
            })
            .addCase(updateUserRole.fulfilled, (state, action) => {
                state.updateStatus = 'succeeded'
                const idx = state.users.findIndex((u) => u.id === action.payload.id)
                if (idx !== -1) state.users[idx] = action.payload
            })
            .addCase(updateUserRole.rejected, (state, action) => {
                state.updateStatus = 'failed'
                state.updateError = action.payload as string
            })
    },
})

export const { resetUpdateStatus } = adminSlice.actions
export default adminSlice.reducer
