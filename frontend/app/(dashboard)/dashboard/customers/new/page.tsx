'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Users } from 'lucide-react'
import { useAppDispatch } from '@/lib/redux/hooks'
import { createCustomer } from '@/lib/redux/features/customer/customerSlice'
import CustomerForm, { CustomerFormValues } from '@/components/customers/CustomerForm'

export default function NewCustomerPage() {
    const dispatch = useAppDispatch()
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitError, setSubmitError] = useState<string | null>(null)

    async function handleSubmit(values: CustomerFormValues) {
        setIsSubmitting(true)
        setSubmitError(null)
        try {
            await dispatch(
                createCustomer({
                    name: values.name,
                    email: values.email || null,
                    phone: values.phone || null,
                    company: values.company || null,
                    status: values.status,
                })
            ).unwrap()
            router.push('/dashboard/customers')
        } catch (err: unknown) {
            setSubmitError(
                err instanceof Error ? err.message : typeof err === 'string' ? err : 'Failed to create customer. Please try again.'
            )
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="mx-auto max-w-2xl space-y-6">
            {/* ── Breadcrumb ─────────────────────────────────────────── */}
            <nav className="flex items-center gap-1.5 text-sm text-muted-foreground" aria-label="Breadcrumb">
                <button
                    type="button"
                    onClick={() => router.push('/dashboard/customers')}
                    className="hover:text-foreground transition-colors"
                >
                    Customers
                </button>
                <span aria-hidden="true">›</span>
                <span className="text-foreground font-medium">New</span>
            </nav>

            {/* ── Page title ─────────────────────────────────────────── */}
            <div>
                <h1 className="text-2xl font-semibold text-foreground">New Customer</h1>
            </div>

            {/* ── Form card ──────────────────────────────────────────── */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                {/* Card header */}
                <div className="mb-6 flex items-center gap-3 border-b border-border pb-5">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Users className="h-5 w-5 text-primary" aria-hidden="true" />
                    </span>
                    <div>
                        <p className="font-semibold text-foreground">Customer Registration</p>
                        <p className="text-sm text-muted-foreground">
                            Enter the core details to establish a new client account.
                        </p>
                    </div>
                </div>

                <CustomerForm
                    onSubmit={handleSubmit}
                    submitLabel="Save Customer"
                    isSubmitting={isSubmitting}
                    submitError={submitError}
                />
            </div>
        </div>
    )
}
