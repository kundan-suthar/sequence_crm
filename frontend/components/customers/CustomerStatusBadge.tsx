import { cn } from '@/lib/utils'
import { CustomerStatus } from '@/types/customer.types'

const statusConfig: Record<
    CustomerStatus,
    { label: string; className: string }
> = {
    active: {
        label: 'Active',
        className: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    },
    inactive: {
        label: 'Inactive',
        className: 'bg-zinc-100 text-zinc-600 border-zinc-200',
    },
    churned: {
        label: 'Churned',
        className: 'bg-red-100 text-red-600 border-red-200',
    },
    'at-risk': {
        label: 'At-Risk',
        className: 'bg-amber-100 text-amber-700 border-amber-200',
    },
}

interface CustomerStatusBadgeProps {
    status: string
}

export default function CustomerStatusBadge({ status }: CustomerStatusBadgeProps) {
    const config = statusConfig[status as CustomerStatus] ?? {
        label: status,
        className: 'bg-zinc-100 text-zinc-600 border-zinc-200',
    }

    return (
        <span
            className={cn(
                'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
                config.className
            )}
        >
            {config.label}
        </span>
    )
}
