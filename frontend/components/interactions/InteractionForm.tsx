'use client'

import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { Loader2, Phone, Users, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Customer } from '@/types/customer.types'
import { InteractionType } from '@/types/interaction.types'

export interface InteractionFormValues {
    customer_id: number
    type: InteractionType
    title: string
    occurred_at: string
    notes: string
}

interface TypeOption {
    value: InteractionType
    label: string
    icon: React.ReactNode
}

const TYPE_OPTIONS: TypeOption[] = [
    {
        value: 'meeting',
        label: 'Meeting',
        icon: <Users className="h-4 w-4" aria-hidden="true" />,
    },
    {
        value: 'call',
        label: 'Call',
        icon: <Phone className="h-4 w-4" aria-hidden="true" />,
    },
    {
        value: 'email',
        label: 'Email',
        icon: <Mail className="h-4 w-4" aria-hidden="true" />,
    },
]

interface InteractionFormProps {
    customers: Customer[]
    customersLoading?: boolean
    defaultValues?: Partial<InteractionFormValues>
    onSubmit: (values: InteractionFormValues) => Promise<void>
    submitLabel: string
    isSubmitting: boolean
    submitError: string | null
}

export default function InteractionForm({
    customers,
    customersLoading = false,
    defaultValues,
    onSubmit,
    submitLabel,
    isSubmitting,
    submitError,
}: InteractionFormProps) {
    const router = useRouter()

    const {
        register,
        handleSubmit,
        control,
        setValue,
        watch,
        formState: { errors },
    } = useForm<InteractionFormValues>({
        defaultValues: {
            customer_id: undefined,
            type: 'meeting',
            title: '',
            occurred_at: '',
            notes: '',
            ...defaultValues,
        },
    })

    const selectedType = watch('type')

    // When a default customer_id is provided but the select hasn't been set yet,
    // ensure the form value is in sync after mount.
    useEffect(() => {
        if (defaultValues?.customer_id) {
            setValue('customer_id', defaultValues.customer_id)
        }
    }, [defaultValues?.customer_id, setValue])

    return (
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
            {/* ── Select Customer ────────────────────────────────────── */}
            <div className="space-y-1.5">
                <Label htmlFor="customer_id">
                    Select Customer{' '}
                    <span className="text-destructive" aria-hidden="true">*</span>
                </Label>
                {customersLoading ? (
                    <div className="flex items-center gap-2 h-10 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                        Loading customers…
                    </div>
                ) : (
                    <select
                        id="customer_id"
                        aria-invalid={!!errors.customer_id}
                        className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50"
                        {...register('customer_id', {
                            required: 'Please select a customer',
                            valueAsNumber: true,
                            validate: (v) => (!isNaN(v) && v > 0) || 'Please select a customer',
                        })}
                    >
                        <option value="">— Select a customer —</option>
                        {customers.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.name}{c.company ? ` — ${c.company}` : ''}
                            </option>
                        ))}
                    </select>
                )}
                {errors.customer_id && (
                    <p className="text-[0.8rem] font-medium text-destructive flex items-center gap-1">
                        <span aria-hidden="true">⚠</span> {errors.customer_id.message}
                    </p>
                )}
            </div>

            {/* ── Interaction Type ───────────────────────────────────── */}
            <div className="space-y-1.5">
                <Label>
                    Interaction Type{' '}
                    <span className="text-destructive" aria-hidden="true">*</span>
                </Label>
                <Controller
                    name="type"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                        <div
                            className="grid grid-cols-3 gap-2"
                            role="radiogroup"
                            aria-label="Interaction type"
                        >
                            {TYPE_OPTIONS.map(({ value, label, icon }) => {
                                const isSelected = field.value === value
                                return (
                                    <button
                                        key={value}
                                        type="button"
                                        role="radio"
                                        aria-checked={isSelected}
                                        onClick={() => field.onChange(value)}
                                        className={`flex flex-col items-center justify-center gap-1.5 rounded-lg border py-3 px-2 text-xs font-medium transition-colors
                                            ${isSelected
                                                ? 'border-primary bg-primary/10 text-primary'
                                                : 'border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground'
                                            }`}
                                    >
                                        {icon}
                                        {label}
                                    </button>
                                )
                            })}
                        </div>
                    )}
                />
            </div>

            {/* ── Subject ────────────────────────────────────────────── */}
            <div className="space-y-1.5">
                <Label htmlFor="title">
                    Subject{' '}
                    <span className="text-destructive" aria-hidden="true">*</span>
                </Label>
                <Input
                    id="title"
                    placeholder="e.g. Q4 Strategy Alignment"
                    aria-invalid={!!errors.title}
                    {...register('title', { required: 'Subject is required' })}
                />
                {errors.title && (
                    <p className="text-[0.8rem] font-medium text-destructive flex items-center gap-1">
                        <span aria-hidden="true">⚠</span> {errors.title.message}
                    </p>
                )}
            </div>

            {/* ── Date ───────────────────────────────────────────────── */}
            <div className="space-y-1.5">
                <Label htmlFor="occurred_at">
                    Date{' '}
                    <span className="text-destructive" aria-hidden="true">*</span>
                </Label>
                <Input
                    id="occurred_at"
                    type="date"
                    aria-invalid={!!errors.occurred_at}
                    {...register('occurred_at', { required: 'Date is required' })}
                />
                {errors.occurred_at && (
                    <p className="text-[0.8rem] font-medium text-destructive flex items-center gap-1">
                        <span aria-hidden="true">⚠</span> {errors.occurred_at.message}
                    </p>
                )}
            </div>

            {/* ── Notes ──────────────────────────────────────────────── */}
            <div className="space-y-1.5">
                <Label htmlFor="notes">Interaction Notes</Label>
                <textarea
                    id="notes"
                    rows={5}
                    placeholder="Document the key takeaways and discussion points…"
                    className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm placeholder:text-muted-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                    {...register('notes')}
                />
            </div>

            {/* ── Submit error ───────────────────────────────────────── */}
            {submitError && (
                <div
                    className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
                    role="alert"
                >
                    {submitError}
                </div>
            )}

            {/* ── Actions ────────────────────────────────────────────── */}
            <div className="flex items-center justify-end gap-3 border-t border-border pt-5">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={isSubmitting}
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    disabled={isSubmitting || customersLoading}
                    className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 min-w-[160px]"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                            Saving…
                        </>
                    ) : (
                        submitLabel
                    )}
                </Button>
            </div>
        </form>
    )
}
