'use client'

import { useEffect, useRef, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks'
import {
    fetchUsers,
    updateUserRole,
    resetUpdateStatus,
} from '@/lib/redux/features/admin/adminSlice'
import AdminGuard from '@/components/admin/AdminGuard'
import UserTable from '@/components/admin/UserTable'
import RoleUpdateDialog from '@/components/admin/RoleUpdateDialog'

// ── AdminPanel (client component) ────────────────────────────────────────────

function AdminPanel() {
    const dispatch = useAppDispatch()

    // Redux state
    const users = useAppSelector((s) => s.admin.users)
    const listStatus = useAppSelector((s) => s.admin.listStatus)
    const listError = useAppSelector((s) => s.admin.listError)
    const updateStatus = useAppSelector((s) => s.admin.updateStatus)
    const updateError = useAppSelector((s) => s.admin.updateError)

    // Local state
    const [pendingChange, setPendingChange] = useState<{
        userId: number
        userEmail: string
        newRole: string
    } | null>(null)
    const [toast, setToast] = useState<{
        message: string
        type: 'success' | 'error'
    } | null>(null)
    const [updatingUserId, setUpdatingUserId] = useState<number | null>(null)

    // Track previous updateStatus to avoid firing on mount
    const prevUpdateStatusRef = useRef(updateStatus)

    // Fetch users on mount
    useEffect(() => {
        dispatch(fetchUsers())
    }, [dispatch])

    // Watch updateStatus transitions
    useEffect(() => {
        const prev = prevUpdateStatusRef.current
        prevUpdateStatusRef.current = updateStatus

        if (prev === updateStatus) return

        if (updateStatus === 'succeeded') {
            setToast({ message: 'Role updated successfully.', type: 'success' })
            setUpdatingUserId(null)
            const timer = setTimeout(() => {
                dispatch(resetUpdateStatus())
                setToast(null)
            }, 5000)
            return () => clearTimeout(timer)
        }

        if (updateStatus === 'failed') {
            setToast({
                message: updateError ?? 'Failed to update role. Please try again.',
                type: 'error',
            })
            setUpdatingUserId(null)
            const timer = setTimeout(() => {
                dispatch(resetUpdateStatus())
                setToast(null)
            }, 5000)
            return () => clearTimeout(timer)
        }
    }, [updateStatus, updateError, dispatch])

    // Handlers
    function onRoleChangeIntent(userId: number, newRole: string) {
        const user = users.find((u) => u.id === userId)
        if (!user) return
        setPendingChange({ userId, userEmail: user.email, newRole })
    }

    function handleConfirm() {
        if (!pendingChange) return
        setUpdatingUserId(pendingChange.userId)
        dispatch(
            updateUserRole({
                userId: pendingChange.userId,
                roleName: pendingChange.newRole,
            })
        )
        setPendingChange(null)
    }

    function handleCancel() {
        setPendingChange(null)
    }

    return (
        <div className="space-y-4">
            {/* Page heading */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                <p className="text-sm text-gray-500 mt-1">
                    View and manage user roles across the system.
                </p>
            </div>

            {/* User table */}
            <UserTable
                users={users}
                listStatus={listStatus}
                listError={listError}
                updatingUserId={updatingUserId}
                onRoleChangeIntent={onRoleChangeIntent}
            />

            {/* Role update confirmation dialog */}
            <RoleUpdateDialog
                open={pendingChange !== null}
                userEmail={pendingChange?.userEmail ?? ''}
                newRole={pendingChange?.newRole ?? ''}
                isUpdating={updateStatus === 'loading'}
                onConfirm={handleConfirm}
                onCancel={handleCancel}
            />

            {/* Toast notification */}
            {toast !== null && (
                <div
                    className={`fixed bottom-6 right-6 z-[60] rounded-lg px-4 py-3 text-sm font-medium shadow-lg ${
                        toast.type === 'success'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-red-600 text-white'
                    }`}
                    role="status"
                    aria-live="polite"
                >
                    {toast.message}
                </div>
            )}
        </div>
    )
}

// ── UsersPage (default export) ────────────────────────────────────────────────

export default function UsersPage() {
    return (
        <AdminGuard>
            <AdminPanel />
        </AdminGuard>
    )
}
