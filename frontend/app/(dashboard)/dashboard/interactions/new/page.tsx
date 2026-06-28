'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Handshake } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks'
import { fetchCustomers } from '@/lib/redux/features/customer/customerSlice'
import { createInteraction } from '@/lib/redux/features/interaction/interactionSlice'
import InteractionForm, { InteractionFormValues } from '@/components/interactions/InteractionForm'

export default function NewInteractionPage() {
    const dispatch = useAppDispatch()
    const router = useRouter()

    const { items: customers, status: customersStatus } = useAppSelector((s) => s.customer)

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitError, setSubmitError] = useState<string | null>(null)

    // Load customer list for the dropdown
    useEffect(() => {
        if (customersStatus === 'idle') {
            dispatch(fetchCustomers())
        }
    }, [dispatch, customersStatus])

    async function handleSubmit(values: InteractionFormValues) {
        setIsSubmitting(true)
        setSubmitError(null)
        try {
            // occurred_at comes from a date input (YYYY-MM-DD).
            // The backend expects an ISO datetime string.
            const occurredAt = new Date(values.occurred_at + 'T00:00:00').toISOString()

            await dispatch(
                createInteraction({
                    customer_id: values.customer_id,
                    type: values.type,
                    title: values.title,
                    notes: values.notes,
                    occurred_at: occurredAt,
                })
            ).unwrap()

            router.push('/dashboard/interactions')
        } catch (err: unknown) {
            setSubmitError(
                err instanceof Error
                    ? err.message
                    : typeof err === 'string'
                    ? err
                    : 'Failed to create interaction. Please try again.'
            )
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="mx-auto max-w-2xl space-y-6">
            {/* ── Breadcrumb ─────────────────────────────────────────── */}
            <nav
                className="flex items-center gap-1.5 text-sm text-muted-foreground"
                aria-label="Breadcrumb"
            >
                <button
                    type="button"
                    onClick={() => router.push('/dashboard/interactions')}
                    className="hover:text-foreground transition-colors"
                >
                    Interactions
                </button>
                <span aria-hidden="true">›</span>
                <span className="text-foreground font-medium">New</span>
            </nav>

            {/* ── Page title ─────────────────────────────────────────── */}
            <div>
                <h1 className="text-2xl font-semibold text-foreground">Log New Interaction</h1>
            </div>

            {/* ── Form card ──────────────────────────────────────────── */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                {/* Card header */}
                <div className="mb-6 flex items-center gap-3 border-b border-border pb-5">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Handshake className="h-5 w-5 text-primary" aria-hidden="true" />
                    </span>
                    <div>
                        <p className="font-semibold text-foreground">Interaction Details</p>
                        <p className="text-sm text-muted-foreground">
                            Log a new customer interaction and capture key insights.
                        </p>
                    </div>
                </div>

                <InteractionForm
                    customers={customers}
                    customersLoading={customersStatus === 'loading'}
                    onSubmit={handleSubmit}
                    submitLabel="Save Interaction"
                    isSubmitting={isSubmitting}
                    submitError={submitError}
                />
            </div>
        </div>
    )
}
