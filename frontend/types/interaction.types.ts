export type InteractionType = 'call' | 'meeting' | 'email'

export type AIInsightStatus = 'generated' | 'pending' | 'failed'

export type SentimentType = 'positive' | 'neutral' | 'negative'

export interface AIInsight {
    id: number
    interaction_id: number
    summary: string | null
    sentiment: SentimentType | null
    action_items: unknown[] | null
    risks: unknown[] | null
    status: AIInsightStatus
    error_message: string | null
    created_at: string
    updated_at: string
}

export interface Interaction {
    id: number
    customer_id: number
    created_by: number
    type: InteractionType
    title: string
    notes: string
    occurred_at: string
    created_at: string
    updated_at: string
}

export interface InteractionWithInsight extends Interaction {
    ai_insight: AIInsight | null
}

export interface InteractionCreatePayload {
    customer_id: number
    type: InteractionType
    title: string
    notes: string
    occurred_at: string
}

export interface InteractionUpdatePayload {
    type?: InteractionType | null
    title?: string | null
    notes?: string | null
    occurred_at?: string | null
}
