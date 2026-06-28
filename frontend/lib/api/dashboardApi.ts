import axiosInstance from '@/lib/axios/axiosInstance'
import { ENDPOINTS } from '@/lib/axios/endpoints'

export interface InteractionActivityPoint {
    date: string
    count: number
}

export interface CustomerHealth {
    healthy: number
    stagnant: number
    churn_risk: number
}

export interface DashboardAnalytics {
    total_customers: number
    total_customers_change_pct: number
    active_interactions: number
    active_interactions_change_pct: number
    at_risk_customers: number
    at_risk_change_pct: number
    ai_insights_generated: number
    ai_insights_change_pct: number
    interaction_activity: InteractionActivityPoint[]
    customer_health: CustomerHealth
}

export async function getDashboardAnalytics(range: '7d' | '30d'): Promise<DashboardAnalytics> {
    const response = await axiosInstance.get<DashboardAnalytics>(
        ENDPOINTS.DASHBOARD.ANALYTICS,
        { params: { range } }
    )
    return response.data
}
