'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Label } from 'recharts'

interface CustomerHealthChartProps {
  healthy: number
  stagnant: number
  churnRisk: number
}

const COLORS = {
  healthy: '#10b981',
  stagnant: '#f97316',
  churnRisk: '#ef4444',
}

interface CenterLabelProps {
  viewBox?: { cx: number; cy: number }
  healthy: number
  total: number
}

const CenterLabel = ({ viewBox, healthy, total }: CenterLabelProps) => {
  if (!viewBox) return null
  const { cx, cy } = viewBox
  const pct = total > 0 ? Math.round((healthy / total) * 100) : 0
  return (
    <>
      <text
        x={cx}
        y={cy - 8}
        textAnchor="middle"
        style={{ fontSize: 28, fontWeight: 700, fill: '#111827' }}
      >
        {pct}%
      </text>
      <text
        x={cx}
        y={cy + 16}
        textAnchor="middle"
        style={{ fontSize: 11, fill: '#6b7280', letterSpacing: '0.1em' }}
      >
        HEALTHY
      </text>
    </>
  )
}

const LEGEND_ITEMS = [
  { key: 'healthy', label: 'Healthy', color: COLORS.healthy },
  { key: 'stagnant', label: 'Stagnant', color: COLORS.stagnant },
  { key: 'churnRisk', label: 'Churn Risk', color: COLORS.churnRisk },
] as const

export default function CustomerHealthChart({
  healthy,
  stagnant,
  churnRisk,
}: CustomerHealthChartProps) {
  const total = healthy + stagnant + churnRisk

  const data = [
    { name: 'Healthy', value: healthy, color: COLORS.healthy },
    { name: 'Stagnant', value: stagnant, color: COLORS.stagnant },
    { name: 'Churn Risk', value: churnRisk, color: COLORS.churnRisk },
  ]

  const counts: Record<string, number> = {
    healthy,
    stagnant,
    churnRisk,
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h2 className="font-semibold text-gray-900 mb-4">Customer Health Breakdown</h2>

      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={65}
            outerRadius={90}
            dataKey="value"
            startAngle={90}
            endAngle={-270}
            strokeWidth={0}
          >
            {data.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
            <Label
              content={
                <CenterLabel healthy={healthy} total={total} />
              }
              position="center"
            />
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex flex-col gap-2 mt-4">
        {LEGEND_ITEMS.map(({ key, label, color }) => (
          <div key={key} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: color }}
              />
              <span className="text-sm text-gray-600">{label}</span>
            </div>
            <span className="text-sm font-medium text-gray-700">{counts[key].toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
