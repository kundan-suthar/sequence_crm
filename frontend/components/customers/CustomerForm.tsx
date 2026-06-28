'use client'

import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CustomerStatus } from '@/types/customer.types'

export interface CustomerFormValues {
    name: string
    email: string
    phone: string
    company: string
    status: CustomerStatus
}

const STATUS_OPTIONS: { value: CustomerStatus; label: string }[] = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'at-risk', label: 'At-Risk' },
    { value: 'churned', label: 'Churned' },
]

interface CustomerFormProps {
    defaultValues?: Partial<CustomerFormValues>
    onSubmit: (values: CustomerFormValues) => Promise<void>
    submitLabel: string
    isSubmitting: boolean
    submitError: string | null
}

export default function CustomerForm({
    defaultValues,
    onSubmit,
    submitLabel,
    isSubmitting,
    submitError,
}: CustomerFormProps) {
    const router = useRouter()

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<CustomerFormValues>({
        defaultValues: {
            name: '',
            email: '',
            phone: '',
            company: '',
            status: 'active',
            ...defaultValues,
        },
    })

    return (
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-8">
            {/* ── Company Info ───────────────────────────────────────── */}
            <section className="space-y-4">
                <div className="flex items-center gap-2">
                    <span className="block h-4 w-1 rounded-full bg-primary" aria-hidden="true" />
                    <h2 className="text-sm font-semibold text-foreground">Company Info</h2>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                        <Label htmlFor="company">Company Name</Label>
                        <Input
                            id="company"
                            placeholder="e.g. Acme Corp"
                            {...register('company')}
                        />
                    </div>
                </div>
            </section>

            {/* ── Primary Contact ────────────────────────────────────── */}
            <section className="space-y-4">
                <div className="flex items-center gap-2">
                    <span className="block h-4 w-1 rounded-full bg-primary" aria-hidden="true" />
                    <h2 className="text-sm font-semibold text-foreground">Primary Contact</h2>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {/* Contact name */}
                    <div className="space-y-1.5">
                        <Label htmlFor="name">
                            Contact Name{' '}
                            <span className="text-destructive" aria-hidden="true">*</span>
                        </Label>
                        <Input
                            id="name"
                            placeholder="John Doe"
                            aria-invalid={!!errors.name}
                            {...register('name', { required: 'Contact name is required' })}
                        />
                        {errors.name && (
                            <p className="text-[0.8rem] font-medium text-destructive flex items-center gap-1">
                                <span aria-hidden="true">⚠</span> {errors.name.message}
                            </p>
                        )}
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5">
                        <Label htmlFor="email">
                            Email{' '}
                            <span className="text-destructive" aria-hidden="true">*</span>
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="john@acme.com"
                            aria-invalid={!!errors.email}
                            {...register('email', {
                                required: 'Email is required',
                                pattern: {
                                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                    message: 'Enter a valid email address',
                                },
                            })}
                        />
                        {errors.email && (
                            <p className="text-[0.8rem] font-medium text-destructive flex items-center gap-1">
                                <span aria-hidden="true">⚠</span> {errors.email.message}
                            </p>
                        )}
                    </div>

                    {/* Phone */}
                    <div className="space-y-1.5">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                            id="phone"
                            type="tel"
                            placeholder="+1 (555) 000-0000"
                            {...register('phone')}
                        />
                    </div>
                </div>
            </section>

            {/* ── Account Details ────────────────────────────────────── */}
            <section className="space-y-4">
                <div className="flex items-center gap-2">
                    <span className="block h-4 w-1 rounded-full bg-primary" aria-hidden="true" />
                    <h2 className="text-sm font-semibold text-foreground">Account Details</h2>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                        <Label htmlFor="status">Status</Label>
                        <select
                            id="status"
                            className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50"
                            {...register('status')}
                        >
                            {STATUS_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </section>

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
            <div className="flex items-center justify-end gap-3 border-t border-border pt-6">
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
                    disabled={isSubmitting}
                    className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 min-w-[130px]"
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
