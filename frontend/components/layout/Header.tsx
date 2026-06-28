'use client'

import { Bell, Menu } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useSidebar } from '@/contexts/SidebarContext'

const routeLabels: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/dashboard/customers': 'Customers',
    '/dashboard/interactions': 'Interactions',
    '/dashboard/users': 'Users',
    '/dashboard/settings': 'Settings',
}

function getBreadcrumb(pathname: string): { parent: string; current: string } {
    const label = routeLabels[pathname] ?? 'Page'
    const isNested = pathname !== '/dashboard'
    return {
        parent: isNested ? 'Admin' : '',
        current: label,
    }
}

export default function Header() {
    const pathname = usePathname()
    const { parent, current } = getBreadcrumb(pathname)
    const { open } = useSidebar()

    return (
        <header className="flex h-14 items-center justify-between border-b border-border bg-background px-6">
            {/* Hamburger button — visible only on mobile */}
            <button
                type="button"
                aria-label="Open navigation"
                onClick={open}
                className="lg:hidden flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
                <Menu className="h-5 w-5" aria-hidden="true" />
            </button>

            {/* Breadcrumb + title */}
            <div className="flex-1 lg:flex-none">
                {parent && (
                    <p className="text-xs text-muted-foreground uppercase tracking-widest mb-0.5">
                        {parent} › {current}
                    </p>
                )}
                <h1 className="text-lg font-semibold text-foreground leading-none">{current}</h1>
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-3">
                <button
                    type="button"
                    aria-label="Notifications"
                    className="relative flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                    <Bell className="h-4 w-4" aria-hidden="true" />
                </button>

                {/* Avatar */}
                <button
                    type="button"
                    aria-label="User menu"
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 transition-opacity"
                >
                    A
                </button>
            </div>
        </header>
    )
}
