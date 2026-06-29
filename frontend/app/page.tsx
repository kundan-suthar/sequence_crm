import Link from 'next/link'
import { ArrowRight, BarChart3, Users, Zap, Shield, Star, CheckCircle } from 'lucide-react'

const features = [
  {
    icon: Users,
    title: 'Centralized Customer Intelligence',
    description:
      'Consolidate data from email, chat, and CRM logs into a single, unified profile for every customer.',
  },
  {
    icon: BarChart3,
    title: 'AI Forecasting',
    description:
      'Predict churn before it happens with machine learning algorithms trained on your data.',
  },
  {
    icon: Zap,
    title: 'Instant Sync',
    description:
      'Connect your entire stack in minutes with 200+ native integrations and a powerful REST API.',
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description:
      'SOC 2 Type II compliant with end-to-end encryption for all customer data and role-based access.',
  },
]

const stats = [
  { value: '99.9%', label: 'Uptime SLA' },
  { value: '40%', label: 'Faster Onboarding' },
  { value: '12k+', label: 'Active Teams' },
  { value: '$2B', label: 'Managed Revenue' },
]

const testimonials = [
  {
    quote:
      'Sequence CRM transformed how our sales team operates. We closed 35% more deals in the first quarter.',
    author: 'Sarah Chen',
    role: 'VP of Sales, Acme Corp',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=48&h=48&fit=crop&crop=face',
  },
  {
    quote:
      'The AI insights are genuinely game-changing. We can now anticipate customer needs before they arise.',
    author: 'Marcus Rivera',
    role: 'Head of CS, TechFlow',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=48&h=48&fit=crop&crop=face',
  },
  {
    quote:
      'Onboarding took 20 minutes. The team was productive same day. Incredible product.',
    author: 'Priya Nair',
    role: 'CTO, ScaleUp Inc.',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=48&h=48&fit=crop&crop=face',
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white font-sans">
      {/* ── Navbar ──────────────────────────────────────────────── */}
      <header className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-emerald-600 flex items-center justify-center">
              <BarChart3 className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">SequenceCRM</span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <a href="#features" className="hover:text-gray-900 transition-colors">Features</a>
            <a href="#testimonials" className="hover:text-gray-900 transition-colors">Customers</a>
            <a href="#stats" className="hover:text-gray-900 transition-colors">Pricing</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/sign-in"
              className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors px-3 py-1.5"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="text-sm font-semibold bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────────────── */}
      <section className="relative pt-16 min-h-screen flex items-center overflow-hidden">
        {/* Background image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1551434678-e076c223a692?w=1600&q=80"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/85 via-emerald-950/80 to-gray-900/90" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="max-w-3xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 border border-emerald-400/30 px-4 py-1.5 text-sm text-emerald-300 mb-8">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Now with AI Insights
            </div>

            <h1 className="text-5xl sm:text-6xl font-bold text-white leading-tight mb-6">
              Precision in{' '}
              <span className="text-emerald-400">Customer Success</span>
            </h1>

            <p className="text-lg text-gray-300 mb-10 max-w-xl leading-relaxed">
              Empower your team with AI-driven insights and a centralized view of every customer
              interaction. Close more deals, retain more customers.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold px-6 py-3 rounded-lg transition-colors shadow-lg shadow-emerald-500/25"
              >
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/sign-in"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold px-6 py-3 rounded-lg transition-colors backdrop-blur-sm"
              >
                Sign In
              </Link>
            </div>

            <p className="mt-6 text-sm text-gray-400 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-400" />
              Joined by <strong className="text-white">2,400+</strong> industry leaders this month.
            </p>
          </div>
        </div>
      </section>

      {/* ── Stats ───────────────────────────────────────────────── */}
      <section id="stats" className="bg-gray-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-4xl font-bold text-emerald-400">{s.value}</p>
                <p className="mt-1 text-sm text-gray-400">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────────── */}
      <section id="features" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-emerald-600 uppercase tracking-wide mb-2">
              Capabilities
            </p>
            <h2 className="text-4xl font-bold text-gray-900">
              Everything you need to scale success.
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center mb-4">
                  <f.icon className="h-5 w-5 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Product screenshot banner ─────────────────────────── */}
      <section className="relative py-24 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1600&q=80"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-emerald-900/80" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to transform your workflow?
          </h2>
          <p className="text-gray-300 mb-8 text-lg">
            Join thousands of customer-centric organizations that rely on SequenceCRM to drive
            growth and retention.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/register"
              className="bg-emerald-500 hover:bg-emerald-400 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              Start Free Trial
            </Link>
            <Link
              href="/sign-in"
              className="bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              Talk to Sales
            </Link>
          </div>
        </div>
      </section>

      {/* ── Testimonials ────────────────────────────────────────── */}
      <section id="testimonials" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900">Loved by teams worldwide</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t) => (
              <div
                key={t.author}
                className="bg-gray-50 rounded-2xl p-6 border border-gray-100"
              >
                <div className="flex gap-0.5 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-emerald-400 text-emerald-400" />
                  ))}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed mb-6">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={t.avatar}
                    alt={t.author}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{t.author}</p>
                    <p className="text-xs text-gray-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <footer className="bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-emerald-600 flex items-center justify-center">
                <BarChart3 className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="text-sm font-semibold text-white">SequenceCRM</span>
            </div>

            <p className="text-xs text-gray-500">
              © 2024 SequenceCRM. Precision in Customer Success.
            </p>

            <div className="flex items-center gap-6 text-xs text-gray-500">
              <a href="#" className="hover:text-gray-300 transition-colors">Product</a>
              <a href="#" className="hover:text-gray-300 transition-colors">Company</a>
              <a href="#" className="hover:text-gray-300 transition-colors">Support</a>
              <a href="#" className="hover:text-gray-300 transition-colors">Privacy</a>
              <a href="#" className="hover:text-gray-300 transition-colors">Terms</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
