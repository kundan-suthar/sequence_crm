'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'

interface InteractionActivityChartProps {
  data: { date: string; count: number }[]
  range: '7d' | '30d'
  onRangeChange: (range: '7d' | '30d') => void
  loading?: boolean
}

function formatXAxisTick(date: string, range: '7d' | '30d'): string {
  if (range === '7d') {
    return new Date(date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short' })
  }
  // 30d: show MM/DD
  const d = new Date(date + 'T12:00:00')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${month}/${day}`
}

export default function InteractionActivityChart({
  data,
  range,
  onRangeChange,
  loading = false,
}: InteractionActivityChartProps) {
  const maxCount = Math.max(...data.map((d) => d.count), 0)

  const chartData = data.map((d) => ({
    ...d,
    label: formatXAxisTick(d.date, range),
  }))

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-semibold text-gray-900">Interaction Activity</h2>
        <select
          value={range}
          onChange={(e) => onRangeChange(e.target.value as '7d' | '30d')}
          aria-label="Select time range"
          className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
        </select>
      </div>

      {/* Chart */}
      {loading ? (
        <div className="h-[220px] flex items-center justify-center">
          <div className="h-full w-full animate-pulse bg-gray-100 rounded-lg" />
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} margin={{ top: 4, right: 4, left: 4, bottom: 4 }}>
            <CartesianGrid vertical={false} stroke="#f3f4f6" strokeDasharray="3 3" />
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#9ca3af' }}
            />
            <YAxis hide={true} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1f2937',
                border: 'none',
                borderRadius: '8px',
                color: '#f9fafb',
                fontSize: '12px',
              }}
              itemStyle={{ color: '#f9fafb' }}
              labelStyle={{ color: '#d1d5db', marginBottom: '2px' }}
              formatter={(value: number) => [value, 'Interactions']}
              labelFormatter={(_label, payload) => {
                if (payload && payload.length > 0) {
                  return payload[0].payload.date
                }
                return _label
              }}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={40}>
              {chartData.map((entry, index) => (
                <Cell
                  key={index}
                  fill={entry.count === maxCount && maxCount > 0 ? '#10b981' : '#134e4a'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
