import type { ReactNode } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import { SidebarProvider } from '@/contexts/SidebarContext'
import MobileSidebarDrawer from '@/components/layout/MobileSidebarDrawer'

export default function DashboardLayout({ children }: { children: ReactNode }) {
    return (
        <SidebarProvider>
            <div className="flex h-screen overflow-hidden bg-background">
                {/* Mobile drawer — hidden on lg+ */}
                <MobileSidebarDrawer />

                {/* Desktop sidebar — hidden on mobile */}
                <div className="hidden lg:flex lg:flex-shrink-0">
                    <Sidebar />
                </div>

                {/* Main content */}
                <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
                    <Header />
                    <main className="flex-1 overflow-y-auto p-6">
                        {children}
                    </main>
                </div>
            </div>
        </SidebarProvider>
    )
}
