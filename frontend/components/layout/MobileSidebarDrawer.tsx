'use client'

import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { useSidebar } from '@/contexts/SidebarContext'
import Sidebar from '@/components/layout/Sidebar'
import { cn } from '@/lib/utils'

const FOCUSABLE_SELECTOR =
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

export default function MobileSidebarDrawer() {
    const { isOpen, close } = useSidebar()

    const closeButtonRef = useRef<HTMLButtonElement>(null)
    const panelRef = useRef<HTMLDivElement>(null)

    // Sub-task 1: Escape key closes the drawer
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                close()
            }
        }
        document.addEventListener('keydown', handleKeyDown)
        return () => {
            document.removeEventListener('keydown', handleKeyDown)
        }
    }, [close])

    // Sub-tasks 3 & 4: Move focus on open/close transitions
    useEffect(() => {
        if (isOpen) {
            // Move focus to the close button when the drawer opens
            closeButtonRef.current?.focus()
        } else {
            // Return focus to the hamburger trigger when the drawer closes
            const trigger = document.querySelector<HTMLElement>('[aria-label="Open navigation"]')
            trigger?.focus()
        }
    }, [isOpen])

    // Sub-task 5: Focus trap — Tab / Shift+Tab cycles within the panel
    useEffect(() => {
        const panel = panelRef.current
        if (!panel) return

        const handleTabKey = (e: KeyboardEvent) => {
            if (e.key !== 'Tab') return
            if (!isOpen) return

            const focusable = Array.from(
                panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
            ).filter((el) => !el.closest('[hidden]') && el.offsetParent !== null)

            if (focusable.length === 0) {
                e.preventDefault()
                return
            }

            const first = focusable[0]
            const last = focusable[focusable.length - 1]

            if (e.shiftKey) {
                // Shift+Tab: wrap from first → last
                if (document.activeElement === first) {
                    e.preventDefault()
                    last.focus()
                }
            } else {
                // Tab: wrap from last → first
                if (document.activeElement === last) {
                    e.preventDefault()
                    first.focus()
                }
            }
        }

        panel.addEventListener('keydown', handleTabKey)
        return () => {
            panel.removeEventListener('keydown', handleTabKey)
        }
    }, [isOpen])

    // Sub-task 6: Body scroll lock
    useEffect(() => {
        if (isOpen) {
            document.body.classList.add('overflow-hidden')
        } else {
            document.body.classList.remove('overflow-hidden')
        }
        return () => {
            document.body.classList.remove('overflow-hidden')
        }
    }, [isOpen])

    return (
        <>
            {/* Backdrop */}
            <div
                className={cn(
                    'fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 ease-in-out lg:hidden',
                    isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                )}
                onClick={close}
                aria-hidden="true"
            />

            {/* Drawer panel */}
            <div
                ref={panelRef}
                role="dialog"
                aria-modal="true"
                aria-label="Navigation"
                className={cn(
                    'fixed inset-y-0 left-0 z-50 w-64 bg-[oklch(0.18_0.06_175)] transition-transform duration-300 ease-in-out lg:hidden',
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                )}
            >
                {/* Close button */}
                <div className="flex items-center justify-end px-3 pt-3">
                    <button
                        ref={closeButtonRef}
                        type="button"
                        onClick={close}
                        aria-label="Close navigation"
                        className="flex items-center justify-center rounded-md p-2 text-white/60 hover:bg-white/10 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                    >
                        <X className="h-5 w-5" aria-hidden="true" />
                    </button>
                </div>

                {/* Nav links — clicking any link closes the drawer */}
                <div onClick={close}>
                    <Sidebar />
                </div>
            </div>
        </>
    )
}
