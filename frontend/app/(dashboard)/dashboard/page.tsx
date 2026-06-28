'use client'

import { useEffect, useState } from 'react'
import { Users, MessageSquare, AlertTriangle, Zap, Plus, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { useAppSelector } from '@/lib/redux/hooks'
import { getDashboardAnalytics, DashboardAnalytics } from '@/lib/api/dashboardApi'
import StatCard from '@/components/dashboard/StatCard'
import InteractionActivityChart from '@/components/dashboard/InteractionActivityChart'
import CustomerHealthChart from '@/components/dashboard/CustomerHealthChart'

export default function DashboardPage() {
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [range, setRange] = useState<'7d' | '30d'>('7d')

  const currentUser = useAppSelector((s) => s.user.currentUser)
  const firstName = currentUser?.name?.split(' ')[0] ?? 'there'

  useEffect(() => {
    setLoading(true)
    setError(null)
    getDashboardAnalytics(range)
      .then(setAnalytics)
      .catch(() => setError('Failed to load dashboard data. Please try again.'))
      .finally(() => setLoading(false))
  }, [range])

  const statCards = analytics
    ? [
        {
          icon: <Users className="h-5 w-5" />,
          iconBg: 'bg-teal-50',
          iconColor: 'text-teal-600',
          label: 'Total Customers',
          value: analytics.total_customers,
          changePct: analytics.total_customers_change_pct,
        },
        {
          icon: <MessageSquare className="h-5 w-5" />,
          iconBg: 'bg-teal-50',
          iconColor: 'text-teal-600',
          label: 'Active Interactions',
          value: analytics.active_interactions,
          changePct: analytics.active_interactions_change_pct,
        },
        {
          icon: <AlertTriangle className="h-5 w-5" />,
          iconBg: 'bg-red-50',
          iconColor: 'text-red-500',
          label: 'At-Risk Customers',
          value: analytics.at_risk_customers,
          changePct: analytics.at_risk_change_pct,
        },
        {
          icon: <Zap className="h-5 w-5" />,
          iconBg: 'bg-purple-50',
          iconColor: 'text-purple-600',
          label: 'AI Insights Generated',
          value: analytics.ai_insights_generated,
          changePct: analytics.ai_insights_change_pct,
        },
      ]
    : []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-sm text-gray-500 mt-1">
            Welcome back, {firstName}. Here&apos;s what&apos;s happening with your accounts today.
          </p>
        </div>
        <Link
          href="/dashboard/interactions/new"
          className="inline-flex items-center gap-2 rounded-xl bg-[#134e4a] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0f3d3a] transition-colors"
        >
          <Plus className="h-4 w-4" />
          Log Interaction
        </Link>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Stat cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse h-32"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((card, i) => (
            <StatCard key={i} {...card} />
          ))}
        </div>
      )}

      {/* Charts */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-6">
          <div className="bg-white rounded-2xl border border-gray-100 h-[320px] animate-pulse" />
          <div className="bg-white rounded-2xl border border-gray-100 h-[320px] animate-pulse" />
        </div>
      ) : (
        analytics && (
          <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-6">
            <InteractionActivityChart
              data={analytics.interaction_activity}
              range={range}
              onRangeChange={(r) => setRange(r)}
            />
            <CustomerHealthChart
              healthy={analytics.customer_health.healthy}
              stagnant={analytics.customer_health.stagnant}
              churnRisk={analytics.customer_health.churn_risk}
            />
          </div>
        )
      )}
    </div>
  )
}
