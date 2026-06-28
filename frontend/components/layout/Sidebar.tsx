'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    LayoutDashboard,
    Users,
    Handshake,
    UserCog,
    Settings,
    ShieldCheck,
    HelpCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Customers', href: '/dashboard/customers', icon: Users },
    { label: 'Interactions', href: '/dashboard/interactions', icon: Handshake },
    // { label: 'Users', href: '/dashboard/users', icon: UserCog },
]

export default function Sidebar() {
    const pathname = usePathname()

    return (
        <aside className="flex h-full w-56 flex-col bg-[oklch(0.18_0.06_175)] text-white">
            {/* Logo */}
            <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 border border-white/20">
                    <ShieldCheck className="h-4 w-4 text-white" />
                </div>
                <div className="leading-tight">
                    <p className="text-sm font-semibold tracking-wide">SequenceCRM</p>
                    <p className="text-[10px] text-white/50 uppercase tracking-widest">
                        Enterprise Admin
                    </p>
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 py-4 space-y-0.5" aria-label="Main navigation">
                {navItems.map(({ label, href, icon: Icon }) => {
                    const active = pathname === href || pathname.startsWith(href + '/')
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={cn(
                                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                                active
                                    ? 'bg-white/15 text-white'
                                    : 'text-white/60 hover:bg-white/10 hover:text-white'
                            )}
                            aria-current={active ? 'page' : undefined}
                        >
                            <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                            {label}
                        </Link>
                    )
                })}
            </nav>

            {/* Footer */}
            {/* <div className="px-3 py-4 border-t border-white/10">
                <Link
                    href="/help"
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/60 hover:bg-white/10 hover:text-white transition-colors"
                >
                    <HelpCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                    Help Center
                </Link>
                <p className="mt-3 px-3 text-[11px] text-white/30">
                    © 2024 SequenceCRM v2.4.0
                </p>
            </div> */}
        </aside>
    )
}
