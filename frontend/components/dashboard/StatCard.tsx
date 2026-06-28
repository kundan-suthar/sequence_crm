import React from 'react'

interface StatCardProps {
  icon: React.ReactNode
  iconBg: string
  iconColor: string
  label: string
  value: number
  changePct: number
}

export default function StatCard({
  icon,
  iconBg,
  iconColor,
  label,
  value,
  changePct,
}: StatCardProps) {
  const isPositive = changePct >= 0
  const formattedChange = `${isPositive ? '+' : ''}${changePct.toFixed(1)}%`

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      {/* Top row: icon + change badge */}
      <div className="flex items-center justify-between">
        <div
          className={`h-10 w-10 flex items-center justify-center rounded-xl ${iconBg}`}
        >
          <span className={`h-5 w-5 flex items-center justify-center ${iconColor}`}>
            {icon}
          </span>
        </div>

        {isPositive ? (
          <span className="text-emerald-600 bg-emerald-50 text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-0.5">
            {formattedChange} <span aria-hidden="true">↑</span>
          </span>
        ) : (
          <span className="text-red-500 bg-red-50 text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-0.5">
            {formattedChange} <span aria-hidden="true">↓</span>
          </span>
        )}
      </div>

      {/* Label */}
      <p className="text-sm text-gray-500 mt-3">{label}</p>

      {/* Value */}
      <p className="text-3xl font-bold text-gray-900 mt-1">
        {value.toLocaleString()}
      </p>
    </div>
  )
}
