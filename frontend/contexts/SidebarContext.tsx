'use client'

import { createContext, useContext, useState } from 'react'

interface SidebarContextValue {
    isOpen: boolean
    open: () => void
    close: () => void
}

const SidebarContext = createContext<SidebarContextValue | null>(null)

export function SidebarProvider({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false)

    const open = () => setIsOpen(true)
    const close = () => setIsOpen(false)

    return (
        <SidebarContext.Provider value={{ isOpen, open, close }}>
            {children}
        </SidebarContext.Provider>
    )
}

export function useSidebar(): SidebarContextValue {
    const context = useContext(SidebarContext)
    if (context === null) {
        throw new Error('useSidebar must be used within SidebarProvider')
    }
    return context
}
