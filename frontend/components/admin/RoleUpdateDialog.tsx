'use client'

import { AlertDialog } from '@base-ui/react/alert-dialog'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface RoleUpdateDialogProps {
    open: boolean
    userEmail: string
    newRole: string
    isUpdating: boolean
    onConfirm: () => void
    onCancel: () => void
}

/**
 * A modal confirmation dialog for role update actions.
 * Shows the target user's email and the new role, and asks the admin to confirm.
 *
 * Requirements: 6.3, 6.5, 6.6, 6.7
 */
export default function RoleUpdateDialog({
    open,
    userEmail,
    newRole,
    isUpdating,
    onConfirm,
    onCancel,
}: RoleUpdateDialogProps) {
    if (!open) return null

    return (
        <AlertDialog.Root open={open}>
            <AlertDialog.Portal>
                {/* Backdrop */}
                <AlertDialog.Backdrop
                    className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
                    aria-hidden="true"
                />

                {/* Popup */}
                <AlertDialog.Popup
                    className={cn(
                        'fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2',
                        'rounded-xl border border-border bg-card text-card-foreground shadow-lg',
                        'p-6 space-y-5 outline-none'
                    )}
                >
                    {/* Title */}
                    <AlertDialog.Title className="text-base font-semibold text-foreground">
                        Update Role
                    </AlertDialog.Title>

                    {/* Description */}
                    <AlertDialog.Description className="text-sm text-muted-foreground">
                        Change role for{' '}
                        <strong className="text-foreground">{userEmail}</strong> to{' '}
                        <strong className="text-foreground">{newRole}</strong>?
                    </AlertDialog.Description>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-1">
                        {/* Cancel button — disabled while updating to prevent closing mid-update */}
                        <AlertDialog.Close
                            onClick={onCancel}
                            disabled={isUpdating}
                            className={cn(
                                'inline-flex h-8 items-center justify-center rounded-lg border border-border',
                                'bg-background px-3 text-sm font-medium text-foreground',
                                'hover:bg-muted transition-colors',
                                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
                                'disabled:pointer-events-none disabled:opacity-50'
                            )}
                        >
                            Cancel
                        </AlertDialog.Close>

                        {/* Confirm button — disabled while updating, shows spinner */}
                        <AlertDialog.Close
                            onClick={onConfirm}
                            disabled={isUpdating}
                            className={cn(
                                'inline-flex h-8 min-w-[80px] items-center justify-center gap-1.5 rounded-lg',
                                'bg-primary px-3 text-sm font-medium text-primary-foreground',
                                'hover:bg-primary/90 transition-colors',
                                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
                                'disabled:pointer-events-none disabled:opacity-50'
                            )}
                            aria-label={isUpdating ? 'Updating role…' : `Confirm role change to ${newRole}`}
                        >
                            {isUpdating ? (
                                <>
                                    <Loader2
                                        className="h-3.5 w-3.5 animate-spin"
                                        aria-hidden="true"
                                    />
                                    <span>Updating…</span>
                                </>
                            ) : (
                                'Confirm'
                            )}
                        </AlertDialog.Close>
                    </div>
                </AlertDialog.Popup>
            </AlertDialog.Portal>
        </AlertDialog.Root>
    )
}
