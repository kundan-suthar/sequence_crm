'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
    Loader2,
    AlertCircle,
    Pencil,
    ArrowLeft,
    Mail,
    Phone,
    Building2,
    Calendar,
} from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks'
import { fetchCustomerById } from '@/lib/redux/features/customer/customerSlice'
import { Button } from '@/components/ui/button'
import CustomerStatusBadge from '@/components/customers/CustomerStatusBadge'
import CustomerAvatar from '@/components/customers/CustomerAvatar'

interface CustomerDetailPageProps {
    params: Promise<{ id: string }>
}

export default function CustomerDetailPage({ params }: CustomerDetailPageProps) {
    const { id } = use(params)
    const customerId = Number(id)

    const dispatch = useAppDispatch()
    const router = useRouter()

    const selectedCustomer = useAppSelector((s) => s.customer.selectedCustomer)

    const [loading, setLoading] = useState(true)
    const [loadError, setLoadError] = useState<string | null>(null)

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

    const customer = selectedCustomer?.id === customerId ? selectedCustomer : null

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
                <span className="text-foreground font-medium truncate max-w-[200px]">
                    {customer?.name ?? `#${customerId}`}
                </span>
            </nav>

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

            {/* ── Error ──────────────────────────────────────────────── */}
            {!loading && loadError && (
                <div
                    className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
                    role="alert"
                >
                    <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <p>{loadError}</p>
                </div>
            )}

            {/* ── Detail card ────────────────────────────────────────── */}
            {!loading && !loadError && customer && (
                <>
                    {/* Header card */}
                    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <CustomerAvatar
                                    name={customer.company ?? customer.name}
                                    className="h-14 w-14 text-base"
                                />
                                <div>
                                    <h1 className="text-xl font-semibold text-foreground">
                                        {customer.name}
                                    </h1>
                                    {customer.company && (
                                        <p className="text-sm text-muted-foreground">
                                            {customer.company}
                                        </p>
                                    )}
                                    <div className="mt-1.5">
                                        <CustomerStatusBadge status={customer.status} />
                                    </div>
                                </div>
                            </div>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => router.push(`/dashboard/customers/${customerId}/edit`)}
                                className="shrink-0 gap-1.5"
                            >
                                <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                                Edit
                            </Button>
                        </div>
                    </div>

                    {/* Contact details card */}
                    <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
                        <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                            <span className="block h-4 w-1 rounded-full bg-primary" aria-hidden="true" />
                            Contact Details
                        </h2>

                        <dl className="space-y-3">
                            <DetailRow
                                icon={<Mail className="h-4 w-4" aria-hidden="true" />}
                                label="Email"
                                value={customer.email ?? '—'}
                                isLink={!!customer.email}
                                href={customer.email ? `mailto:${customer.email}` : undefined}
                            />
                            <DetailRow
                                icon={<Phone className="h-4 w-4" aria-hidden="true" />}
                                label="Phone"
                                value={customer.phone ?? '—'}
                                isLink={!!customer.phone}
                                href={customer.phone ? `tel:${customer.phone}` : undefined}
                            />
                            <DetailRow
                                icon={<Building2 className="h-4 w-4" aria-hidden="true" />}
                                label="Company"
                                value={customer.company ?? '—'}
                            />
                        </dl>
                    </div>

                    {/* Meta card */}
                    <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
                        <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                            <span className="block h-4 w-1 rounded-full bg-primary" aria-hidden="true" />
                            Account Details
                        </h2>

                        <dl className="space-y-3">
                            <DetailRow
                                icon={<Calendar className="h-4 w-4" aria-hidden="true" />}
                                label="Created"
                                value={new Date(customer.created_at).toLocaleDateString(undefined, {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                })}
                            />
                            <DetailRow
                                icon={<Calendar className="h-4 w-4" aria-hidden="true" />}
                                label="Last updated"
                                value={new Date(customer.updated_at).toLocaleDateString(undefined, {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                })}
                            />
                        </dl>
                    </div>

                    {/* Back button */}
                    <div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push('/dashboard/customers')}
                            className="gap-1.5 text-muted-foreground"
                        >
                            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                            Back to Customers
                        </Button>
                    </div>
                </>
            )}
        </div>
    )
}

// ── Detail row ────────────────────────────────────────────────────────────────

interface DetailRowProps {
    icon: React.ReactNode
    label: string
    value: string
    isLink?: boolean
    href?: string
}

function DetailRow({ icon, label, value, isLink, href }: DetailRowProps) {
    return (
        <div className="flex items-start gap-3">
            <span className="mt-0.5 text-muted-foreground shrink-0">{icon}</span>
            <div className="min-w-0">
                <dt className="text-xs text-muted-foreground">{label}</dt>
                <dd className="text-sm font-medium text-foreground mt-0.5">
                    {isLink && href ? (
                        <a
                            href={href}
                            className="text-primary hover:underline underline-offset-2"
                        >
                            {value}
                        </a>
                    ) : (
                        value
                    )}
                </dd>
            </div>
        </div>
    )
}
