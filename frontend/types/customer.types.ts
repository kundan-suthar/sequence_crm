export type CustomerStatus = 'active' | 'inactive' | 'churned' | 'at-risk'

export interface Customer {
    id: number
    name: string
    email: string | null
    phone: string | null
    company: string | null
    status: CustomerStatus
    created_at: string
    updated_at: string
}

export interface CustomerCreatePayload {
    name: string
    email?: string | null
    phone?: string | null
    company?: string | null
    status?: CustomerStatus
}

export interface CustomerUpdatePayload {
    name?: string | null
    email?: string | null
    phone?: string | null
    company?: string | null
    status?: CustomerStatus | null
}
