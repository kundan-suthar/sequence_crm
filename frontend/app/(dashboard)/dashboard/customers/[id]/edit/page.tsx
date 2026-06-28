'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, AlertCircle, Pencil } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks'
import {
    fetchCustomerById,
    updateCustomer,
} from '@/lib/redux/features/customer/customerSlice'
import CustomerForm, { CustomerFormValues } from '@/components/customers/CustomerForm'

interface EditCustomerPageProps {
    params: Promise<{ id: string }>
}

export default function EditCustomerPage({ params }: EditCustomerPageProps) {
    const { id } = use(params)
    const customerId = Number(id)

    const dispatch = useAppDispatch()
    const router = useRouter()

    const selectedCustomer = useAppSelector((s) => s.customer.selectedCustomer)

    const [loadError, setLoadError] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitError, setSubmitError] = useState<string | null>(null)

    useEffect(() => {
        async function load() {
            setLoading(true)
            setLoadError(null)
            try {
                await dispatch(fetchCustomerById(customerId)).unwrap()
            } catch (err: unknown) {
                setLoadError(
                    err instanceof Error ? err.message : typeof err === 'string' ? err : 'Failed to load customer.'
                )
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [dispatch, customerId])

    async function handleSubmit(values: CustomerFormValues) {
        setIsSubmitting(true)
        setSubmitError(null)
        try {
            await dispatch(
                updateCustomer({
                    id: customerId,
                    payload: {
                        name: values.name,
                        email: values.email || null,
                        phone: values.phone || null,
                        company: values.company || null,
                        status: values.status,
                    },
                })
            ).unwrap()
            router.push(`/dashboard/customers/${customerId}`)
        } catch (err: unknown) {
            setSubmitError(
                err instanceof Error ? err.message : typeof err === 'string' ? err : 'Failed to update customer. Please try again.'
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
                <button
                    type="button"
                    onClick={() => router.push(`/dashboard/customers/${customerId}`)}
                    className="hover:text-foreground transition-colors truncate max-w-[160px]"
                >
                    {selectedCustomer?.name ?? `#${customerId}`}
                </button>
                <span aria-hidden="true">›</span>
                <span className="text-foreground font-medium">Edit</span>
            </nav>

            {/* ── Page title ─────────────────────────────────────────── */}
            <div>
                <h1 className="text-2xl font-semibold text-foreground">Edit Customer</h1>
            </div>

            {/* ── Loading ────────────────────────────────────────────── */}
            {loading && (
                <div
                    className="flex items-center justify-center py-24"
                    role="status"
                    aria-label="Loading customer"
                >
                    <Loader2 className="h-6 w-6 animate-spin text-primary" aria-hidden="true" />
                    <span className="ml-2 text-sm text-muted-foreground">Loading customer…</span>
                </div>
            )}

            {/* ── Load error ─────────────────────────────────────────── */}
            {!loading && loadError && (
                <div
                    className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
                    role="alert"
                >
                    <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <p>{loadError}</p>
                </div>
            )}

            {/* ── Form card ──────────────────────────────────────────── */}
            {!loading && !loadError && selectedCustomer && (
                <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                    {/* Card header */}
                    <div className="mb-6 flex items-center gap-3 border-b border-border pb-5">
                        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                            <Pencil className="h-5 w-5 text-primary" aria-hidden="true" />
                        </span>
                        <div>
                            <p className="font-semibold text-foreground">Edit Customer</p>
                            <p className="text-sm text-muted-foreground">
                                Update the details for{' '}
                                <span className="font-medium text-foreground">{selectedCustomer.name}</span>.
                            </p>
                        </div>
                    </div>

                    <CustomerForm
                        defaultValues={{
                            name: selectedCustomer.name,
                            email: selectedCustomer.email ?? '',
                            phone: selectedCustomer.phone ?? '',
                            company: selectedCustomer.company ?? '',
                            status: selectedCustomer.status,
                        }}
                        onSubmit={handleSubmit}
                        submitLabel="Save Changes"
                        isSubmitting={isSubmitting}
                        submitError={submitError}
                    />
                </div>
            )}
        </div>
    )
}
