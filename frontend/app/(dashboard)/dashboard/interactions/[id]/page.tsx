'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
    Loader2,
    AlertCircle,
    ArrowLeft,
    Pencil,
    Calendar,
    Phone,
    Users,
    Mail,
    Sparkles,
    TriangleAlert,
    CheckSquare,
    Square,
    Clock,
    AlertTriangle,
} from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks'
import { fetchInteractionById } from '@/lib/redux/features/interaction/interactionSlice'
import { Button } from '@/components/ui/button'
import { AIInsight, InteractionType, SentimentType } from '@/types/interaction.types'

interface InteractionDetailPageProps {
    params: Promise<{ id: string }>
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function TypeIcon({ type }: { type: InteractionType }) {
    const cls = 'h-4 w-4'
    switch (type) {
        case 'call':
            return <Phone className={cls} aria-hidden="true" />
        case 'meeting':
            return <Users className={cls} aria-hidden="true" />
        case 'email':
            return <Mail className={cls} aria-hidden="true" />
    }
}

const TYPE_LABEL: Record<InteractionType, string> = {
    call: 'Call',
    meeting: 'Meeting',
    email: 'Email',
}

function SentimentChip({ sentiment }: { sentiment: SentimentType | null | undefined }) {
    if (!sentiment) return null

    const styles: Record<SentimentType, string> = {
        positive: 'bg-emerald-600 text-white',
        neutral: 'bg-gray-500 text-white',
        negative: 'bg-red-600 text-white',
    }

    return (
        <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold capitalize ${styles[sentiment]}`}
        >
            {sentiment}
        </span>
    )
}

// ── AI Insights section ───────────────────────────────────────────────────────

function AIInsightsSection({ insight }: { insight: AIInsight | null | undefined }) {
    if (!insight || insight.status === 'pending') {
        return (
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-3">
                <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
                    <h2 className="font-semibold text-foreground text-sm">AI Insights</h2>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" aria-hidden="true" />
                    AI insights are being processed for this interaction…
                </div>
            </div>
        )
    }

    if (insight.status === 'failed') {
        return (
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-3">
                <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
                    <h2 className="font-semibold text-foreground text-sm">AI Insights</h2>
                </div>
                <div className="flex items-center gap-2 text-sm text-red-500">
                    <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                    AI insight generation failed.
                    {insight.error_message && (
                        <span className="text-muted-foreground ml-1">{insight.error_message}</span>
                    )}
                </div>
            </div>
        )
    }

    // Generated
    const actionItems = Array.isArray(insight.action_items) ? insight.action_items : []
    const risks = Array.isArray(insight.risks) ? insight.risks : []

    return (
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-5">
            {/* Header */}
            <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
                <h2 className="font-semibold text-foreground">AI Insights</h2>
            </div>

            {/* Summary */}
            {insight.summary && (
                <div className="space-y-1.5">
                    <p className="text-xs font-semibold text-foreground uppercase tracking-wide">
                        Summary
                    </p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        {insight.summary}
                    </p>
                </div>
            )}

            {/* Action items */}
            {actionItems.length > 0 && (
                <div className="space-y-2">
                    <p className="text-xs font-semibold text-foreground uppercase tracking-wide">
                        Action Items
                    </p>
                    <ul className="space-y-1.5" aria-label="Action items">
                        {actionItems.map((item, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                                <Square
                                    className="h-4 w-4 shrink-0 mt-0.5 text-muted-foreground"
                                    aria-hidden="true"
                                />
                                <span>{String(item)}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Key risks */}
            {risks.length > 0 && (
                <div className="space-y-2">
                    <p className="text-xs font-semibold text-foreground uppercase tracking-wide">
                        Key Risks
                    </p>
                    <ul className="space-y-1.5" aria-label="Key risks">
                        {risks.map((risk, i) => (
                            <li
                                key={i}
                                className="flex items-center gap-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700"
                            >
                                <TriangleAlert
                                    className="h-4 w-4 shrink-0 text-red-500"
                                    aria-hidden="true"
                                />
                                <span>{String(risk)}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Footer: sentiment + generated date */}
            <div className="flex items-center justify-between border-t border-border pt-4 gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Overall Sentiment</span>
                    <SentimentChip sentiment={insight.sentiment} />
                </div>
                <span className="text-xs text-muted-foreground">
                    Generated on{' '}
                    {new Date(insight.created_at).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                    })}
                </span>
            </div>
        </div>
    )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function InteractionDetailPage({ params }: InteractionDetailPageProps) {
    const { id } = use(params)
    const interactionId = Number(id)

    const dispatch = useAppDispatch()
    const router = useRouter()

    const selectedInteraction = useAppSelector((s) => s.interaction.selectedInteraction)

    const [loading, setLoading] = useState(true)
    const [loadError, setLoadError] = useState<string | null>(null)

    useEffect(() => {
        async function load() {
            setLoading(true)
            setLoadError(null)
            try {
                await dispatch(fetchInteractionById(interactionId)).unwrap()
            } catch (err: unknown) {
                setLoadError(
                    err instanceof Error
                        ? err.message
                        : typeof err === 'string'
                        ? err
                        : 'Failed to load interaction.'
                )
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [dispatch, interactionId])

    const interaction =
        selectedInteraction?.id === interactionId ? selectedInteraction : null

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
                <span className="text-foreground font-medium truncate max-w-[220px]">
                    {interaction?.title ?? `#${interactionId}`}
                </span>
            </nav>

            {/* ── Loading ────────────────────────────────────────────── */}
            {loading && (
                <div
                    className="flex items-center justify-center py-24"
                    role="status"
                    aria-label="Loading interaction"
                >
                    <Loader2 className="h-6 w-6 animate-spin text-primary" aria-hidden="true" />
                    <span className="ml-2 text-sm text-muted-foreground">Loading interaction…</span>
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

            {/* ── Content ────────────────────────────────────────────── */}
            {!loading && !loadError && interaction && (
                <>
                    {/* ── Header card ──────────────────────────────── */}
                    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                        <div className="flex items-start justify-between gap-4">
                            <div className="space-y-1 min-w-0">
                                {/* Type badge */}
                                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                    <TypeIcon type={interaction.type} />
                                    <span>{TYPE_LABEL[interaction.type]}</span>
                                </div>

                                {/* Title */}
                                <h1 className="text-xl font-semibold text-foreground leading-snug">
                                    {interaction.title}
                                </h1>

                                {/* Date */}
                                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                    <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                                    <time dateTime={interaction.occurred_at}>
                                        {new Date(interaction.occurred_at).toLocaleDateString(
                                            undefined,
                                            {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                            }
                                        )}
                                    </time>
                                </div>
                            </div>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    router.push(`/dashboard/interactions/${interactionId}/edit`)
                                }
                                className="shrink-0 gap-1.5"
                            >
                                <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                                Edit
                            </Button>
                        </div>
                    </div>

                    {/* ── Notes card ───────────────────────────────── */}
                    {interaction.notes && (
                        <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-3">
                            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                <span
                                    className="block h-4 w-1 rounded-full bg-primary"
                                    aria-hidden="true"
                                />
                                {TYPE_LABEL[interaction.type]} Notes
                            </h2>
                            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                                {interaction.notes}
                            </p>
                        </div>
                    )}

                    {/* ── AI Insights card ─────────────────────────── */}
                    <AIInsightsSection insight={interaction.ai_insight} />

                    {/* ── Back ─────────────────────────────────────── */}
                    <div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push('/dashboard/interactions')}
                            className="gap-1.5 text-muted-foreground"
                        >
                            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                            Back to Interactions
                        </Button>
                    </div>
                </>
            )}
        </div>
    )
}
