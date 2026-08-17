'use client'

import { UserOut } from '@/types/admin.types'

// Role badge color config
const roleBadgeConfig: Record<string, string> = {
    admin: 'bg-red-100 text-red-700 border-red-200',
    executive: 'bg-blue-100 text-blue-700 border-blue-200',
    user: 'bg-gray-100 text-gray-600 border-gray-200',
}

const BASE_BADGE_CLASSES =
    'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border'

const ROLE_OPTIONS = ['admin', 'executive', 'user'] as const

interface RoleBadgeProps {
    role: string
}

function RoleBadge({ role }: RoleBadgeProps) {
    const colorClasses =
        roleBadgeConfig[role] ?? 'bg-gray-100 text-gray-600 border-gray-200'
    return (
        <span className={`${BASE_BADGE_CLASSES} ${colorClasses}`}>
            {role}
        </span>
    )
}

interface RoleSelectProps {
    userId: number
    currentRole: string
    disabled: boolean
    onRoleChangeIntent: (userId: number, newRole: string) => void
}

function RoleSelect({
    userId,
    currentRole,
    disabled,
    onRoleChangeIntent,
}: RoleSelectProps) {
    return (
        <select
            value={currentRole}
            disabled={disabled}
            onChange={(e) => {
                const newValue = e.target.value
                if (newValue !== currentRole) {
                    onRoleChangeIntent(userId, newValue)
                }
            }}
            className="text-sm border border-gray-300 rounded px-2 py-1 bg-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {ROLE_OPTIONS.map((role) => (
                <option key={role} value={role}>
                    {role}
                </option>
            ))}
        </select>
    )
}

export interface UserTableProps {
    users: UserOut[]
    listStatus: 'idle' | 'loading' | 'succeeded' | 'failed'
    listError: string | null
    updatingUserId: number | null
    onRoleChangeIntent: (userId: number, newRole: string) => void
}

export default function UserTable({
    users,
    listStatus,
    listError,
    updatingUserId,
    onRoleChangeIntent,
}: UserTableProps) {
    // --- Loading state: 5 skeleton rows ---
    if (listStatus === 'loading') {
        return (
            <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-16">
                                #
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Email
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Current Role
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Change Role
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <tr key={i} className="animate-pulse">
                                <td className="px-4 py-3">
                                    <div className="h-4 bg-gray-200 rounded w-8" />
                                </td>
                                <td className="px-4 py-3">
                                    <div className="h-4 bg-gray-200 rounded w-48" />
                                </td>
                                <td className="px-4 py-3">
                                    <div className="h-5 bg-gray-200 rounded-full w-16" />
                                </td>
                                <td className="px-4 py-3">
                                    <div className="h-7 bg-gray-200 rounded w-28" />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )
    }

    // --- Error state ---
    if (listStatus === 'failed') {
        return (
            <div className="rounded-lg border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
                <p className="font-semibold">Failed to load users</p>
                <p className="mt-1 text-red-600">
                    {listError ?? 'An unexpected error occurred. Please try again.'}
                </p>
            </div>
        )
    }

    // --- Empty state ---
    if (listStatus === 'succeeded' && users.length === 0) {
        return (
            <div className="flex items-center justify-center rounded-lg border border-gray-200 bg-white py-16 text-sm text-gray-500">
                No users found.
            </div>
        )
    }

    // --- Populated table ---
    return (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-16">
                            #
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Email
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Current Role
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Change Role
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                    {users.map((user, index) => {
                        const currentRole = user.roles[0] ?? 'user'
                        return (
                            <tr
                                key={user.id}
                                className={
                                    index % 2 === 0
                                        ? 'bg-white hover:bg-gray-50'
                                        : 'bg-gray-50/50 hover:bg-gray-100/60'
                                }
                            >
                                <td className="px-4 py-3 text-sm text-gray-500 font-mono">
                                    {user.id}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-800">
                                    {user.email}
                                </td>
                                <td className="px-4 py-3">
                                    <RoleBadge role={currentRole} />
                                </td>
                                <td className="px-4 py-3">
                                    <RoleSelect
                                        userId={user.id}
                                        currentRole={currentRole}
                                        disabled={updatingUserId === user.id}
                                        onRoleChangeIntent={onRoleChangeIntent}
                                    />
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    )
}
