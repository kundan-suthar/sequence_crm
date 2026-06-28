'use client'

import { AlertDialog } from '@base-ui/react/alert-dialog'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ConfirmDeleteDialogProps {
    open: boolean
    itemName: string
    onConfirm: () => void
    onCancel: () => void
    loading?: boolean
}

/**
 * A modal confirmation dialog for destructive delete actions.
 * Shows the item name and asks the user to confirm before proceeding.
 *
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7
 */
export default function ConfirmDeleteDialog({
    open,
    itemName,
    onConfirm,
    onCancel,
    loading = false,
}: ConfirmDeleteDialogProps) {
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
                        Delete &ldquo;{itemName}&rdquo;?
                    </AlertDialog.Title>

                    {/* Description — Requirement 4.4: includes itemName */}
                    <AlertDialog.Description className="text-sm text-muted-foreground">
                        Are you sure you want to delete &ldquo;{itemName}&rdquo;? This action cannot be
                        undone.
                    </AlertDialog.Description>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-1">
                        {/* Cancel — Requirement 4.6 */}
                        <AlertDialog.Close
                            onClick={onCancel}
                            disabled={loading}
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

                        {/* Confirm (destructive) — Requirements 4.5, 4.7 */}
                        <AlertDialog.Close
                            onClick={onConfirm}
                            disabled={loading}
                            className={cn(
                                'inline-flex h-8 min-w-[80px] items-center justify-center gap-1.5 rounded-lg',
                                'bg-destructive/10 px-3 text-sm font-medium text-destructive',
                                'hover:bg-destructive/20 transition-colors',
                                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive/30',
                                'disabled:pointer-events-none disabled:opacity-50'
                            )}
                            aria-label={loading ? 'Deleting…' : `Delete ${itemName}`}
                        >
                            {/* Requirement 4.7: show spinner when loading */}
                            {loading ? (
                                <>
                                    <Loader2
                                        className="h-3.5 w-3.5 animate-spin"
                                        aria-hidden="true"
                                    />
                                    <span>Deleting…</span>
                                </>
                            ) : (
                                'Delete'
                            )}
                        </AlertDialog.Close>
                    </div>
                </AlertDialog.Popup>
            </AlertDialog.Portal>
        </AlertDialog.Root>
    )
}
