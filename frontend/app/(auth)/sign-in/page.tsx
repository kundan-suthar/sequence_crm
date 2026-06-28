'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, ShieldCheck, Sparkles, LayoutDashboard, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { authService } from '@/services/auth/auth.service'

// ── Zod schema ──────────────────────────────────────────────────────────────
const signInSchema = z.object({
    email: z.string().email('Enter a valid email address'),
    password: z.string().min(1, 'Password is required'),
})

type SignInFormValues = z.infer<typeof signInSchema>

// ── Feature badges ───────────────────────────────────────────────────────────
const features = [
    { icon: Sparkles, label: 'AI Insights' },
    { icon: ShieldCheck, label: 'Role-Based Access' },
    { icon: LayoutDashboard, label: 'Real-time Dashboard' },
]

// ── Page ─────────────────────────────────────────────────────────────────────
export default function SignInPage() {
    const [showPassword, setShowPassword] = useState(false)
    const [serverError, setServerError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    const form = useForm<SignInFormValues>({
        resolver: zodResolver(signInSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    })

    const onSubmit = async (values: SignInFormValues) => {
        try {
            setServerError(null)
            setIsLoading(true)
            await authService.login({
                email: values.email,
                password: values.password,
            })
            // TODO: store token / redirect to dashboard
        } catch (err: unknown) {
            const message =
                err instanceof Error ? err.message : 'Invalid credentials. Please try again.'
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
                {/* Dark teal overlay */}
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
                    <div className="space-y-2">
                        <h1 className="text-4xl font-bold text-white leading-tight">
                            Your customer relationships,{' '}
                            <span className="text-[#4ade80]">beautifully managed</span>.
                        </h1>
                    </div>

                    {/* Feature badges */}
                    <div className="flex flex-wrap gap-3">
                        {features.map(({ icon: Icon, label }) => (
                            <div
                                key={label}
                                className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm px-4 py-1.5 text-sm text-white"
                            >
                                <Icon className="h-3.5 w-3.5 text-[#4ade80]" />
                                {label}
                            </div>
                        ))}
                    </div>

                    {/* Dashboard preview card */}
                    <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 max-w-md">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
                            <div className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
                            <div className="h-2.5 w-2.5 rounded-full bg-green-400" />
                            <span className="ml-2 text-xs text-white/50 font-mono">SEQUENCE CRM</span>
                        </div>
                        {/* Mini chart bars */}
                        <div className="flex items-end gap-1 h-20">
                            {[40, 65, 50, 80, 70, 90, 75, 95, 60, 85, 78, 92].map((h, i) => (
                                <div
                                    key={i}
                                    className="flex-1 rounded-sm bg-gradient-to-t from-[#4ade80]/60 to-[#4ade80]/20"
                                    style={{ height: `${h}%` }}
                                />
                            ))}
                        </div>
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
                        <h2 className="text-2xl font-bold text-foreground">Welcome back</h2>
                        <p className="text-sm text-muted-foreground">
                            Access your dashboard and manage pipelines.
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
                                        <FormLabel>Email Address</FormLabel>
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
                                        <div className="flex items-center justify-between">
                                            <FormLabel>Password</FormLabel>
                                            <Link
                                                href="/forgot-password"
                                                className="text-xs font-medium text-primary hover:underline"
                                            >
                                                Forgot password?
                                            </Link>
                                        </div>
                                        <FormControl>
                                            <div className="relative">
                                                <Input
                                                    type={showPassword ? 'text' : 'password'}
                                                    placeholder="••••••••"
                                                    autoComplete="current-password"
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
                                        Signing in…
                                    </span>
                                ) : (
                                    'Sign In'
                                )}
                            </Button>
                        </form>
                    </Form>

                    {/* Divider */}
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-border" />
                        </div>
                    </div>

                    {/* Footer links */}
                    <div className="space-y-4 text-center">
                        <p className="text-sm text-muted-foreground">
                            Don&apos;t have an account?{' '}
                            <Link href="/register" className="font-semibold text-primary hover:underline">
                                Register
                            </Link>
                        </p>
                        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                            <Link href="/privacy" className="hover:text-foreground transition-colors">
                                Privacy Policy
                            </Link>
                            <Link href="/terms" className="hover:text-foreground transition-colors">
                                Terms
                            </Link>
                            <Link href="/help" className="hover:text-foreground transition-colors">
                                Help
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
