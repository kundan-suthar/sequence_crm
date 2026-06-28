import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { interactionService } from '@/services/interaction/interaction.service'
import {
    Interaction,
    InteractionWithInsight,
    InteractionCreatePayload,
    InteractionUpdatePayload,
} from '@/types/interaction.types'

// ── State ────────────────────────────────────────────────────────────────────

interface InteractionState {
    items: Interaction[]
    selectedInteraction: InteractionWithInsight | null
    status: 'idle' | 'loading' | 'succeeded' | 'failed'
    error: string | null
    typeFilter: string | null
    customerIdFilter: number | null
}

const initialState: InteractionState = {
    items: [],
    selectedInteraction: null,
    status: 'idle',
    error: null,
    typeFilter: null,
    customerIdFilter: null,
}

// ── Thunks ───────────────────────────────────────────────────────────────────

export const fetchInteractions = createAsyncThunk(
    'interaction/fetchAll',
    async (params: { customer_id?: number; type?: string } | undefined, { rejectWithValue }) => {
        try {
            return await interactionService.getAll(params)
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to fetch interactions'
            return rejectWithValue(message)
        }
    }
)

export const fetchInteractionById = createAsyncThunk(
    'interaction/fetchById',
    async (id: number, { rejectWithValue }) => {
        try {
            return await interactionService.getById(id)
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to fetch interaction'
            return rejectWithValue(message)
        }
    }
)

export const createInteraction = createAsyncThunk(
    'interaction/create',
    async (payload: InteractionCreatePayload, { rejectWithValue }) => {
        try {
            return await interactionService.create(payload)
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to create interaction'
            return rejectWithValue(message)
        }
    }
)

export const updateInteraction = createAsyncThunk(
    'interaction/update',
    async (
        { id, payload }: { id: number; payload: InteractionUpdatePayload },
        { rejectWithValue }
    ) => {
        try {
            return await interactionService.update(id, payload)
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to update interaction'
            return rejectWithValue(message)
        }
    }
)

// ── Slice ────────────────────────────────────────────────────────────────────

const interactionSlice = createSlice({
    name: 'interaction',
    initialState,
    reducers: {
        setTypeFilter(state, action: PayloadAction<string | null>) {
            state.typeFilter = action.payload
        },
        setCustomerIdFilter(state, action: PayloadAction<number | null>) {
            state.customerIdFilter = action.payload
        },
        clearInteractionError(state) {
            state.error = null
        },
    },
    extraReducers: (builder) => {
        // fetchAll
        builder
            .addCase(fetchInteractions.pending, (state) => {
                state.status = 'loading'
                state.error = null
            })
            .addCase(fetchInteractions.fulfilled, (state, action) => {
                state.status = 'succeeded'
                state.items = action.payload
            })
            .addCase(fetchInteractions.rejected, (state, action) => {
                state.status = 'failed'
                state.error = action.payload as string
            })

        // fetchById
        builder.addCase(fetchInteractionById.fulfilled, (state, action) => {
            state.selectedInteraction = action.payload
        })

        // create
        builder.addCase(createInteraction.fulfilled, (state, action) => {
            state.items.unshift(action.payload)
        })

        // update
        builder.addCase(updateInteraction.fulfilled, (state, action) => {
            const idx = state.items.findIndex((i) => i.id === action.payload.id)
            if (idx !== -1) state.items[idx] = action.payload
            if (state.selectedInteraction?.id === action.payload.id) {
                state.selectedInteraction = { ...action.payload, ai_insight: state.selectedInteraction.ai_insight }
            }
        })
    },
})

export const { setTypeFilter, setCustomerIdFilter, clearInteractionError } =
    interactionSlice.actions
export default interactionSlice.reducer
