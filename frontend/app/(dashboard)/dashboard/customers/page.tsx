'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
    Plus,
    Search,
    Pencil,
    Eye,
    Loader2,
    AlertCircle,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks'
import { fetchCustomers } from '@/lib/redux/features/customer/customerSlice'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import CustomerStatusBadge from '@/components/customers/CustomerStatusBadge'
import CustomerAvatar from '@/components/customers/CustomerAvatar'
import { Customer } from '@/types/customer.types'

const PAGE_SIZE = 10

export default function CustomersPage() {
    const dispatch = useAppDispatch()
    const router = useRouter()
    const { items, status, error } = useAppSelector((s) => s.customer)

    const [search, setSearch] = useState('')
    const [page, setPage] = useState(1)

    useEffect(() => {
        dispatch(fetchCustomers())
    }, [dispatch])

    // Reset to page 1 whenever the search query changes
    useEffect(() => {
        setPage(1)
    }, [search])

    const filtered = useMemo(() => {
        if (!search.trim()) return items
        const q = search.toLowerCase()
        return items.filter(
            (c) =>
                c.name.toLowerCase().includes(q) ||
                c.company?.toLowerCase().includes(q) ||
                c.email?.toLowerCase().includes(q) ||
                c.phone?.includes(q)
        )
    }, [items, search])

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
    const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

    function handleView(customer: Customer) {
        router.push(`/dashboard/customers/${customer.id}`)
    }

    function handleEdit(customer: Customer) {
        router.push(`/dashboard/customers/${customer.id}/edit`)
    }

    return (
        <div className="space-y-6">
            {/* ── Page header ─────────────────────────────────────────── */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative w-full sm:max-w-xs">
                    <Search
                        className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                        aria-hidden="true"
                    />
                    <Input
                        type="search"
                        placeholder="Search customers..."
                        className="pl-9"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        aria-label="Search customers"
                    />
                </div>

                <Button
                    className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shrink-0"
                    onClick={() => router.push('/dashboard/customers/new')}
                >
                    <Plus className="h-4 w-4" aria-hidden="true" />
                    Add Customer
                </Button>
            </div>

            {/* ── Loading ──────────────────────────────────────────────── */}
            {status === 'loading' && (
                <div
                    className="flex items-center justify-center py-24"
                    role="status"
                    aria-label="Loading customers"
                >
                    <Loader2 className="h-6 w-6 animate-spin text-primary" aria-hidden="true" />
                    <span className="ml-2 text-sm text-muted-foreground">Loading customers…</span>
                </div>
            )}

            {/* ── Error ────────────────────────────────────────────────── */}
            {status === 'failed' && (
                <div
                    className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
                    role="alert"
                >
                    <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <p>{error ?? 'Failed to load customers. Please try again.'}</p>
                </div>
            )}

            {/* ── Table ────────────────────────────────────────────────── */}
            {status === 'succeeded' && (
                <>
                    <div className="rounded-xl border border-border bg-card overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm" aria-label="Customers table">
                                <thead>
                                    <tr className="border-b border-border bg-muted/40">
                                        <th
                                            scope="col"
                                            className="px-4 py-3 text-left font-medium text-muted-foreground"
                                        >
                                            Company
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-4 py-3 text-left font-medium text-muted-foreground"
                                        >
                                            Contact Name
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell"
                                        >
                                            Email
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-4 py-3 text-left font-medium text-muted-foreground hidden lg:table-cell"
                                        >
                                            Phone
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-4 py-3 text-left font-medium text-muted-foreground"
                                        >
                                            Status
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-4 py-3 text-right font-medium text-muted-foreground"
                                        >
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {paginated.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={6}
                                                className="px-4 py-12 text-center text-muted-foreground"
                                            >
                                                {search
                                                    ? 'No customers match your search.'
                                                    : 'No customers yet. Add your first one.'}
                                            </td>
                                        </tr>
                                    ) : (
                                        paginated.map((customer) => (
                                            <CustomerRow
                                                key={customer.id}
                                                customer={customer}
                                                onView={handleView}
                                                onEdit={handleEdit}
                                            />
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* ── Pagination ─────────────────────────────────────── */}
                    <Pagination
                        page={page}
                        totalPages={totalPages}
                        total={filtered.length}
                        pageSize={PAGE_SIZE}
                        onChange={setPage}
                    />
                </>
            )}
        </div>
    )
}

// ── Customer row ─────────────────────────────────────────────────────────────

interface CustomerRowProps {
    customer: Customer
    onView: (c: Customer) => void
    onEdit: (c: Customer) => void
}

function CustomerRow({ customer, onView, onEdit }: CustomerRowProps) {
    return (
        <tr className="group hover:bg-muted/30 transition-colors">
            {/* Company */}
            <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                    <CustomerAvatar name={customer.company ?? customer.name} />
                    <span className="font-medium text-foreground">
                        {customer.company ?? '—'}
                    </span>
                </div>
            </td>

            {/* Contact name */}
            <td className="px-4 py-3 text-foreground">{customer.name}</td>

            {/* Email — hidden on small screens */}
            <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                {customer.email ?? '—'}
            </td>

            {/* Phone — hidden on medium screens */}
            <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">
                {customer.phone ?? '—'}
            </td>

            {/* Status */}
            <td className="px-4 py-3">
                <CustomerStatusBadge status={customer.status} />
            </td>

            {/* Actions */}
            <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        type="button"
                        aria-label={`View ${customer.name}`}
                        onClick={() => onView(customer)}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    >
                        <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                    <button
                        type="button"
                        aria-label={`Edit ${customer.name}`}
                        onClick={() => onEdit(customer)}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    >
                        <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                </div>
            </td>
        </tr>
    )
}

// ── Pagination ────────────────────────────────────────────────────────────────

interface PaginationProps {
    page: number
    totalPages: number
    total: number
    pageSize: number
    onChange: (p: number) => void
}

function Pagination({ page, totalPages, total, pageSize, onChange }: PaginationProps) {
    const from = Math.min((page - 1) * pageSize + 1, total)
    const to = Math.min(page * pageSize, total)

    // Build page numbers: always show first, last, current ± 1, with ellipsis
    const pages = buildPages(page, totalPages)

    return (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
                Showing{' '}
                <span className="font-medium text-foreground">
                    {from}–{to}
                </span>{' '}
                of{' '}
                <span className="font-medium text-foreground">{total}</span>{' '}
                results
            </p>

            <nav aria-label="Pagination" className="flex items-center gap-1">
                <button
                    type="button"
                    onClick={() => onChange(page - 1)}
                    disabled={page === 1}
                    aria-label="Previous page"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:pointer-events-none disabled:opacity-40"
                >
                    <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                </button>

                {pages.map((p, idx) =>
                    p === '...' ? (
                        <span
                            key={`ellipsis-${idx}`}
                            className="inline-flex h-8 w-8 items-center justify-center text-sm text-muted-foreground"
                            aria-hidden="true"
                        >
                            …
                        </span>
                    ) : (
                        <button
                            key={p}
                            type="button"
                            onClick={() => onChange(p as number)}
                            aria-label={`Page ${p}`}
                            aria-current={p === page ? 'page' : undefined}
                            className={`inline-flex h-8 w-8 items-center justify-center rounded-md border text-sm font-medium transition-colors
                                ${
                                    p === page
                                        ? 'border-primary bg-primary text-primary-foreground'
                                        : 'border-border text-foreground hover:bg-muted'
                                }`}
                        >
                            {p}
                        </button>
                    )
                )}

                <button
                    type="button"
                    onClick={() => onChange(page + 1)}
                    disabled={page === totalPages}
                    aria-label="Next page"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:pointer-events-none disabled:opacity-40"
                >
                    <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </button>
            </nav>
        </div>
    )
}

function buildPages(current: number, total: number): (number | '...')[] {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

    const pages: (number | '...')[] = []
    const add = (p: number) => {
        if (!pages.includes(p)) pages.push(p)
    }

    add(1)
    if (current > 3) pages.push('...')
    for (let p = Math.max(2, current - 1); p <= Math.min(total - 1, current + 1); p++) {
        add(p)
    }
    if (current < total - 2) pages.push('...')
    add(total)

    return pages
}
