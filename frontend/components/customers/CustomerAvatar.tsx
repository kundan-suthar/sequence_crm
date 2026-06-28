import { cn } from '@/lib/utils'

const COLORS = [
    'bg-teal-600',
    'bg-blue-600',
    'bg-violet-600',
    'bg-rose-600',
    'bg-amber-600',
    'bg-emerald-600',
    'bg-indigo-600',
    'bg-pink-600',
]

function getInitials(name: string): string {
    return name
        .split(' ')
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase() ?? '')
        .join('')
}

function getColor(name: string): string {
    let hash = 0
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash)
    }
    return COLORS[Math.abs(hash) % COLORS.length]
}

interface CustomerAvatarProps {
    name: string
    className?: string
}

export default function CustomerAvatar({ name, className }: CustomerAvatarProps) {
    const initials = getInitials(name)
    const color = getColor(name)

    return (
        <span
            className={cn(
                'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white',
                color,
                className
            )}
            aria-hidden="true"
        >
            {initials}
        </span>
    )
}
