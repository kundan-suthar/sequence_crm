'use client'

import { Bell, Menu, LogOut, User, ChevronDown } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { useRef, useState } from 'react'
import { useSidebar } from '@/contexts/SidebarContext'
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks'
import { clearUser } from '@/lib/redux/features/user/userSlice'
import { authService, clearSessionCookie } from '@/services/auth/auth.service'

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

/** Returns up to two uppercase initials from a name or email */
function getInitials(name?: string | null, email?: string | null): string {
    if (name?.trim()) {
        const parts = name.trim().split(/\s+/)
        return parts.length >= 2
            ? (parts[0][0] + parts[1][0]).toUpperCase()
            : parts[0].slice(0, 2).toUpperCase()
    }
    if (email) return email[0].toUpperCase()
    return '?'
}

export default function Header() {
    const pathname = usePathname()
    const { parent, current } = getBreadcrumb(pathname)
    const { open } = useSidebar()
    const dispatch = useAppDispatch()
    const router = useRouter()

    const currentUser = useAppSelector((s) => s.user.currentUser)
    const initials = getInitials(currentUser?.name, currentUser?.email)

    const [menuOpen, setMenuOpen] = useState(false)
    const [loggingOut, setLoggingOut] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)

    const handleLogout = async () => {
        try {
            setLoggingOut(true)
            await authService.logout()
        } catch {
            // best-effort — clear local state regardless
        } finally {
            clearSessionCookie()
            dispatch(clearUser())
            router.replace('/sign-in')
        }
    }

    return (
        <header className="flex h-14 items-center justify-between border-b border-border bg-background px-6">
            {/* Hamburger — mobile only */}
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

                {/* User menu */}
                <div className="relative" ref={menuRef}>
                    <button
                        type="button"
                        aria-label="User menu"
                        aria-expanded={menuOpen}
                        aria-haspopup="true"
                        onClick={() => setMenuOpen((v) => !v)}
                        className="flex items-center gap-1.5 rounded-full hover:opacity-90 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold select-none">
                            {initials}
                        </span>
                        <ChevronDown
                            className={`h-3.5 w-3.5 text-muted-foreground transition-transform duration-150 ${menuOpen ? 'rotate-180' : ''}`}
                            aria-hidden="true"
                        />
                    </button>

                    {/* Dropdown */}
                    {menuOpen && (
                        <>
                            {/* Backdrop to close on outside click */}
                            <div
                                className="fixed inset-0 z-10"
                                aria-hidden="true"
                                onClick={() => setMenuOpen(false)}
                            />

                            <div
                                role="menu"
                                className="absolute right-0 top-full mt-2 z-20 w-56 rounded-xl border border-border bg-background shadow-lg py-1 animate-in fade-in slide-in-from-top-1 duration-150"
                            >
                                {/* User info */}
                                <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
                                    <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold select-none">
                                        {initials}
                                    </span>
                                    <div className="min-w-0">
                                        {currentUser?.name && (
                                            <p className="text-sm font-semibold text-foreground truncate">
                                                {currentUser.name}
                                            </p>
                                        )}
                                        {currentUser?.email && (
                                            <p className="text-xs text-muted-foreground truncate">
                                                {currentUser.email}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Menu items */}
                                <div className="py-1">
                                    <button
                                        type="button"
                                        role="menuitem"
                                        className="flex w-full items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                                        onClick={() => setMenuOpen(false)}
                                    >
                                        <User className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                                        Profile
                                    </button>

                                    <button
                                        type="button"
                                        role="menuitem"
                                        disabled={loggingOut}
                                        onClick={handleLogout}
                                        className="flex w-full items-center gap-3 px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
                                    >
                                        <LogOut className="h-4 w-4" aria-hidden="true" />
                                        {loggingOut ? 'Signing out…' : 'Sign out'}
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    )
}
