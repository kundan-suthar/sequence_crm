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
    ChevronDown,
    ChevronUp,
    Phone,
    Users,
    Mail,
    Sparkles,
    Clock,
    AlertTriangle,
    TriangleAlert,
} from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks'
import { fetchInteractions } from '@/lib/redux/features/interaction/interactionSlice'
import { fetchCustomers } from '@/lib/redux/features/customer/customerSlice'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import CustomerAvatar from '@/components/customers/CustomerAvatar'
import { Interaction, InteractionType, AIInsight, SentimentType, InteractionWithInsight } from '@/types/interaction.types'

const PAGE_SIZE = 10

// ── Type helpers ─────────────────────────────────────────────────────────────

function TypeIcon({ type }: { type: InteractionType }) {
    switch (type) {
        case 'call':
            return <Phone className="h-3.5 w-3.5" aria-hidden="true" />
        case 'meeting':
            return <Users className="h-3.5 w-3.5" aria-hidden="true" />
        case 'email':
            return <Mail className="h-3.5 w-3.5" aria-hidden="true" />
    }
}

function SentimentBadge({ sentiment }: { sentiment: SentimentType | null | undefined }) {
    if (!sentiment) return <span className="text-muted-foreground text-xs">—</span>

    const styles: Record<SentimentType, string> = {
        positive: 'text-emerald-600 bg-emerald-50',
        neutral: 'text-gray-600 bg-gray-100',
        negative: 'text-red-600 bg-red-50',
    }

    return (
        <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${styles[sentiment]}`}
        >
            {sentiment}
        </span>
    )
}

function AIInsightBadge({ insight }: { insight: AIInsight | null | undefined }) {
    if (!insight || insight.status === 'pending') {
        return (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" aria-hidden="true" />
                PENDING
            </span>
        )
    }
    if (insight.status === 'failed') {
        return (
            <span className="inline-flex items-center gap-1 text-xs text-red-500">
                <AlertTriangle className="h-3 w-3" aria-hidden="true" />
                FAILED
            </span>
        )
    }
    return (
        <span className="inline-flex items-center gap-1 text-xs text-primary font-medium">
            <Sparkles className="h-3 w-3" aria-hidden="true" />
            GENERATED
        </span>
    )
}

function AIInsightPanel({ insight }: { insight: AIInsight | null | undefined }) {
    if (!insight || insight.status === 'pending') {
        return (
            <p className="text-sm italic text-muted-foreground">
                AI Insights are currently processing for this interaction…
            </p>
        )
    }

    if (insight.status === 'failed') {
        return (
            <p className="text-sm italic text-muted-foreground">
                AI Insight generation failed.{insight.error_message ? ` ${insight.error_message}` : ''}
            </p>
        )
    }

    // Generated with risks → critical panel
    if (insight.risks && insight.risks.length > 0) {
        return (
            <div className="border-l-4 border-red-500 pl-4 space-y-2">
                <div className="flex items-center gap-2 text-orange-600 font-semibold text-sm">
                    <TriangleAlert className="h-4 w-4" aria-hidden="true" />
                    Critical AI Insight
                </div>
                {insight.summary && (
                    <p className="text-sm text-foreground">{insight.summary}</p>
                )}
                <Button
                    size="sm"
                    variant="destructive"
                    className="h-7 text-xs"
                    onClick={(e) => e.stopPropagation()}
                >
                    Action Required
                </Button>
            </div>
        )
    }

    // Generated, no risks → standard summary panel
    return (
        <div className="border-l-4 border-emerald-500 pl-4 space-y-2">
            <p className="text-sm font-semibold text-foreground">AI Summary Preview</p>
            {insight.summary ? (
                <p className="text-sm text-muted-foreground">{insight.summary}</p>
            ) : (
                <p className="text-sm italic text-muted-foreground">No summary available.</p>
            )}
            <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs"
                onClick={(e) => e.stopPropagation()}
            >
                Read Full Transcript
            </Button>
        </div>
    )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function InteractionsPage() {
    const dispatch = useAppDispatch()
    const router = useRouter()
    const { items, status, error } = useAppSelector((s) => s.interaction)
    const { items: customers } = useAppSelector((s) => s.customer)

    const [search, setSearch] = useState('')
    const [typeFilter, setTypeFilter] = useState<InteractionType | 'all'>('all')
    const [page, setPage] = useState(1)
    const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set())

    useEffect(() => {
        dispatch(fetchInteractions())
        dispatch(fetchCustomers())
    }, [dispatch])

    // Build a quick id→name lookup for the customer column
    const customerMap = useMemo(() => {
        const map = new Map<number, string>()
        customers.forEach((c) => map.set(c.id, c.name))
        return map
    }, [customers])

    // Reset to page 1 on search/filter change
    useEffect(() => {
        setPage(1)
    }, [search, typeFilter])

    const filtered = useMemo(() => {
        let result = items

        if (typeFilter !== 'all') {
            result = result.filter((i) => i.type === typeFilter)
        }

        if (search.trim()) {
            const q = search.toLowerCase()
            result = result.filter(
                (i) =>
                    i.title.toLowerCase().includes(q) ||
                    String(i.customer_id).includes(q) ||
                    (customerMap.get(i.customer_id) ?? '').toLowerCase().includes(q)
            )
        }

        return result
    }, [items, search, typeFilter, customerMap])

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
    const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

    function toggleRow(id: number) {
        setExpandedRows((prev) => {
            const next = new Set(prev)
            if (next.has(id)) {
                next.delete(id)
            } else {
                next.add(id)
            }
            return next
        })
    }

    function handleView(id: number) {
        router.push(`/dashboard/interactions/${id}`)
    }

    function handleEdit(id: number) {
        router.push(`/dashboard/interactions/${id}/edit`)
    }

    const typeButtons: { label: string; value: InteractionType | 'all' }[] = [
        { label: 'All', value: 'all' },
        { label: 'Call', value: 'call' },
        { label: 'Meeting', value: 'meeting' },
        { label: 'Email', value: 'email' },
    ]

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
                        placeholder="Search interactions..."
                        className="pl-9"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        aria-label="Search interactions"
                    />
                </div>

                <Button
                    className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shrink-0"
                    onClick={() => router.push('/dashboard/interactions/new')}
                >
                    <Plus className="h-4 w-4" aria-hidden="true" />
                    Create Interaction
                </Button>
            </div>

            {/* ── Filter bar ──────────────────────────────────────────── */}
            <div className="flex flex-wrap items-center gap-2">
                {typeButtons.map(({ label, value }) => (
                    <button
                        key={value}
                        type="button"
                        onClick={() => setTypeFilter(value)}
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors
                            ${typeFilter === value
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted text-muted-foreground hover:bg-muted/70 hover:text-foreground'
                            }`}
                    >
                        {value !== 'all' && (
                            <TypeIcon type={value as InteractionType} />
                        )}
                        {label}
                    </button>
                ))}

                {(typeFilter !== 'all' || search) && (
                    <button
                        type="button"
                        onClick={() => {
                            setTypeFilter('all')
                            setSearch('')
                        }}
                        className="text-xs text-muted-foreground underline-offset-2 hover:underline"
                    >
                        Clear Filters
                    </button>
                )}
            </div>

            {/* ── Loading ──────────────────────────────────────────────── */}
            {status === 'loading' && (
                <div
                    className="flex items-center justify-center py-24"
                    role="status"
                    aria-label="Loading interactions"
                >
                    <Loader2 className="h-6 w-6 animate-spin text-primary" aria-hidden="true" />
                    <span className="ml-2 text-sm text-muted-foreground">Loading interactions…</span>
                </div>
            )}

            {/* ── Error ────────────────────────────────────────────────── */}
            {status === 'failed' && (
                <div
                    className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
                    role="alert"
                >
                    <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <p>{error ?? 'Failed to load interactions. Please try again.'}</p>
                </div>
            )}

            {/* ── Table ────────────────────────────────────────────────── */}
            {status === 'succeeded' && (
                <>
                    <div className="rounded-xl border border-border bg-card overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm" aria-label="Interactions table">
                                <thead>
                                    <tr className="border-b border-border bg-muted/40">
                                        {/* expand toggle col */}
                                        <th scope="col" className="w-8 px-2 py-3" aria-hidden="true" />
                                        <th scope="col" className="px-4 py-3 text-left font-medium text-muted-foreground">
                                            Customer
                                        </th>
                                        <th scope="col" className="px-4 py-3 text-left font-medium text-muted-foreground">
                                            Type
                                        </th>
                                        <th scope="col" className="px-4 py-3 text-left font-medium text-muted-foreground">
                                            Title / Subject
                                        </th>
                                        <th scope="col" className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">
                                            Date
                                        </th>
                                        <th scope="col" className="px-4 py-3 text-left font-medium text-muted-foreground hidden lg:table-cell">
                                            Sentiment
                                        </th>
                                        {/* <th scope="col" className="px-4 py-3 text-left font-medium text-muted-foreground hidden lg:table-cell">
                                            Owner
                                        </th> */}
                                        <th scope="col" className="px-4 py-3 text-left font-medium text-muted-foreground">
                                            AI Insights
                                        </th>
                                        <th scope="col" className="px-4 py-3 text-right font-medium text-muted-foreground">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {paginated.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={9}
                                                className="px-4 py-12 text-center text-muted-foreground"
                                            >
                                                {search || typeFilter !== 'all'
                                                    ? 'No interactions match your filters.'
                                                    : 'No interactions yet. Create your first one.'}
                                            </td>
                                        </tr>
                                    ) : (
                        paginated.map((interaction) => (
                                            <InteractionRow
                                                key={interaction.id}
                                                interaction={interaction}
                                                customerName={customerMap.get(interaction.customer_id)}
                                                expanded={expandedRows.has(interaction.id)}
                                                onToggle={() => toggleRow(interaction.id)}
                                                onView={() => handleView(interaction.id)}
                                                onEdit={() => handleEdit(interaction.id)}
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

// ── Interaction row ───────────────────────────────────────────────────────────

interface InteractionRowProps {
    interaction: Interaction & { ai_insight?: AIInsight | null }
    customerName?: string
    expanded: boolean
    onToggle: () => void
    onView: () => void
    onEdit: () => void
}

function InteractionRow({ interaction, customerName, expanded, onToggle, onView, onEdit }: InteractionRowProps) {
    const date = new Date(interaction.occurred_at).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    })

    const insight = 'ai_insight' in interaction ? (interaction as Interaction & { ai_insight?: AIInsight | null }).ai_insight : undefined

    const typeLabel: Record<InteractionType, string> = {
        call: 'Call',
        meeting: 'Meeting',
        email: 'Email',
    }

    return (
        <>
            <tr
                className="group hover:bg-muted/30 transition-colors cursor-pointer"
                onClick={onToggle}
            >
                {/* Expand chevron */}
                <td className="w-8 px-2 py-3 text-muted-foreground">
                    {expanded ? (
                        <ChevronUp className="h-4 w-4" aria-hidden="true" />
                    ) : (
                        <ChevronDown className="h-4 w-4" aria-hidden="true" />
                    )}
                </td>

                {/* Customer */}
                <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                        <CustomerAvatar name={customerName ?? `Customer ${interaction.customer_id}`} />
                        <span className="text-foreground font-medium">
                            {customerName ?? `#${interaction.customer_id}`}
                        </span>
                    </div>
                </td>

                {/* Type */}
                <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1.5 text-muted-foreground capitalize">
                        <TypeIcon type={interaction.type} />
                        {typeLabel[interaction.type]}
                    </span>
                </td>

                {/* Title */}
                <td className="px-4 py-3 font-medium text-foreground max-w-xs truncate">
                    {interaction.title}
                </td>

                {/* Date */}
                <td className="px-4 py-3 text-muted-foreground hidden md:table-cell whitespace-nowrap">
                    {date}
                </td>

                {/* Sentiment */}
                <td className="px-4 py-3 hidden lg:table-cell">
                    <SentimentBadge sentiment={insight?.sentiment as SentimentType | null | undefined} />
                </td>

                {/* Owner */}
                {/* <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell whitespace-nowrap">
                    User #{interaction.created_by}
                </td> */}

                {/* AI Insights */}
                <td className="px-4 py-3">
                    <AIInsightBadge insight={insight} />
                </td>

                {/* Actions */}
                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1  group-hover:opacity-100 transition-opacity">
                        <button
                            type="button"
                            aria-label={`View interaction ${interaction.title}`}
                            onClick={onView}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                        >
                            <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                        <button
                            type="button"
                            aria-label={`Edit interaction ${interaction.title}`}
                            onClick={onEdit}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                        >
                            <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                    </div>
                </td>
            </tr>

            {/* Expanded AI insight panel */}
            {expanded && (
                <tr className="bg-muted/20">
                    <td colSpan={9} className="px-8 py-4">
                        <AIInsightPanel insight={insight} />
                    </td>
                </tr>
            )}
        </>
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
                                ${p === page
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
