'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, ShieldCheck, ArrowRight, LayoutDashboard } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { authService } from '@/services/auth/auth.service'
import { setSessionCookie } from '@/services/auth/auth.service'

// ── Zod schema ──────────────────────────────────────────────────────────────
const registerSchema = z
    .object({
        email: z.string().email('Enter a valid email address'),
        password: z
            .string()
            .min(8, 'Password must be at least 8 characters')
            .regex(/[A-Z]/, 'Include at least one uppercase letter')
            .regex(/[0-9]/, 'Include at least one number'),
        confirmPassword: z.string().min(1, 'Please confirm your password'),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'Passwords do not match',
        path: ['confirmPassword'],
    })

type RegisterFormValues = z.infer<typeof registerSchema>

// ── Page ─────────────────────────────────────────────────────────────────────
export default function RegisterPage() {
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [serverError, setServerError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const form = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            email: '',
            password: '',
            confirmPassword: '',
        },
    })

    const onSubmit = async (values: RegisterFormValues) => {
        try {
            setServerError(null)
            setIsLoading(true)
            await authService.register({
                name: '',
                email: values.email,
                password: values.password,
            })
            // Set session cookie so middleware allows access to protected routes,
            // then redirect to sign-in to complete the login flow
            setSessionCookie()
            router.push('/sign-in')
        } catch (err: unknown) {
            const message =
                err instanceof Error ? err.message : 'Registration failed. Please try again.'
            setServerError(message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen w-full">
            {/* ── Left panel ──────────────────────────────────────────── */}
            <div className="relative hidden lg:flex lg:w-3/5 flex-col justify-between p-12 overflow-hidden">
                {/* Background image */}
                <Image
                    src="/register_bg.png"
                    alt="Sequence CRM background"
                    fill
                    className="object-cover object-center"
                    priority
                />
                {/* Dark teal gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#0b4d45]/90 via-[#0d5c52]/80 to-[#0a3d36]/85" />

                {/* Logo */}
                <div className="relative z-10 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
                        <ShieldCheck className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-xl font-semibold text-white tracking-wide">Sequence</span>
                </div>

                {/* Hero copy */}
                <div className="relative z-10 space-y-6">
                    <div className="space-y-3">
                        <h1 className="text-4xl font-bold text-white leading-tight">
                            Manage customers.
                            <br />
                            Generate insights.
                            <br />
                            Close the loop.
                        </h1>
                        <p className="text-white/70 text-base max-w-sm leading-relaxed">
                            Experience the next evolution of CRM. Professional tools for
                            efficient, data-driven teams who prioritize focus and performance.
                        </p>
                    </div>

                    {/* Decorative feature grid */}
                    <div className="grid grid-cols-2 gap-3 max-w-sm">
                        {[
                            { icon: ShieldCheck, label: 'Role-Based Access', desc: 'Granular permissions' },
                            { icon: LayoutDashboard, label: 'Real-time Data', desc: 'Live dashboards' },
                        ].map(({ icon: Icon, label, desc }) => (
                            <div
                                key={label}
                                className="rounded-xl border border-white/15 bg-white/8 backdrop-blur-sm p-4 space-y-1"
                            >
                                <Icon className="h-5 w-5 text-[#4ade80]" />
                                <p className="text-sm font-medium text-white">{label}</p>
                                <p className="text-xs text-white/55">{desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Right panel — form ───────────────────────────────────── */}
            <div className="flex w-full lg:w-2/5 flex-col items-center justify-center bg-background px-6 py-12 sm:px-12">
                {/* Mobile logo */}
                <div className="mb-8 flex items-center gap-2 lg:hidden">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                        <ShieldCheck className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-lg font-semibold">Sequence</span>
                </div>

                <div className="w-full max-w-sm space-y-8">
                    {/* Heading */}
                    <div className="space-y-1">
                        <h2 className="text-2xl font-bold text-foreground">Create your account</h2>
                        <p className="text-sm text-muted-foreground">
                            Start managing your customers smarter
                        </p>
                    </div>

                    {/* Form */}
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            {/* Email */}
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="email"
                                                placeholder="name@company.com"
                                                autoComplete="email"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Password */}
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input
                                                    type={showPassword ? 'text' : 'password'}
                                                    placeholder="••••••••"
                                                    autoComplete="new-password"
                                                    className="pr-10"
                                                    {...field}
                                                />
                                                <button
                                                    type="button"
                                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                                    onClick={() => setShowPassword((v) => !v)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                                >
                                                    {showPassword ? (
                                                        <EyeOff className="h-4 w-4" />
                                                    ) : (
                                                        <Eye className="h-4 w-4" />
                                                    )}
                                                </button>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Confirm password */}
                            <FormField
                                control={form.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Confirm Password</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input
                                                    type={showConfirm ? 'text' : 'password'}
                                                    placeholder="••••••••"
                                                    autoComplete="new-password"
                                                    className="pr-10"
                                                    {...field}
                                                />
                                                <button
                                                    type="button"
                                                    aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
                                                    onClick={() => setShowConfirm((v) => !v)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                                >
                                                    {showConfirm ? (
                                                        <EyeOff className="h-4 w-4" />
                                                    ) : (
                                                        <Eye className="h-4 w-4" />
                                                    )}
                                                </button>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Server error */}
                            {serverError && (
                                <p className="text-sm font-medium text-destructive">{serverError}</p>
                            )}

                            {/* Submit */}
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-semibold rounded-lg transition-colors"
                                size="lg"
                            >
                                {isLoading ? (
                                    <span className="flex items-center gap-2">
                                        <svg
                                            className="animate-spin h-4 w-4"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            aria-hidden="true"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            />
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z"
                                            />
                                        </svg>
                                        Creating account…
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        Create Account
                                        <ArrowRight className="h-4 w-4" />
                                    </span>
                                )}
                            </Button>
                        </form>
                    </Form>

                    {/* Sign-in link */}
                    <p className="text-center text-sm text-muted-foreground">
                        Already have an account?{' '}
                        <Link href="/sign-in" className="font-semibold text-primary hover:underline">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
