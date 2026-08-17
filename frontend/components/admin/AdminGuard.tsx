'use client'

import { useAppSelector } from '@/lib/redux/hooks'
import { selectIsAdmin } from '@/lib/redux/features/user/userSlice'
import { LockKeyhole } from 'lucide-react'

interface AdminGuardProps {
  children: React.ReactNode
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const currentUser = useAppSelector((s) => s.user.currentUser)
  const isAdmin = useAppSelector(selectIsAdmin)

  // Session is still restoring — currentUser hasn't been populated yet
  if (currentUser === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin" />
          <p className="text-sm text-muted-foreground">Loading…</p>
        </div>
      </div>
    )
  }

  // Authenticated but not an admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-card p-10 shadow-sm">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600">
            <LockKeyhole className="h-7 w-7" />
          </div>
          <div className="text-center">
            <h2 className="text-lg font-semibold text-foreground">Not Authorized</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              You don&apos;t have permission to access this page.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Admin — render protected content
  return <>{children}</>
}
