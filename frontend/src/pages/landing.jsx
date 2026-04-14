import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Zap, RotateCcw, Layers, ArrowRight, CheckCircle2 } from 'lucide-react';

const stats = [
  { value: "10x",   label: "Faster workflow" },
  { value: "99.9%", label: "Uptime guarantee" },
  { value: "Zero",  label: "Data loss" },
];

const features = [
  {
    icon: Zap,
    color: "bg-violet-100 text-violet-600",
    ring: "ring-violet-200",
    title: "Instant Updates",
    desc: "See every change instantly with optimistic updates that keep your workflow smooth and responsive.",
    badge: "Real-time",
    badgeColor: "bg-violet-50 text-violet-600 ring-1 ring-violet-200",
  },
  {
    icon: RotateCcw,
    color: "bg-amber-100 text-amber-600",
    ring: "ring-amber-200",
    title: "Auto Rollback",
    desc: "Errors? No problem. Automatically restore the last stable state with intelligent failure handling.",
    badge: "Smart recovery",
    badgeColor: "bg-amber-50 text-amber-600 ring-1 ring-amber-200",
  },
  {
    icon: Layers,
    color: "bg-emerald-100 text-emerald-600",
    ring: "ring-emerald-200",
    title: "Drag & Drop",
    desc: "Move tasks across stages with a smooth, intuitive drag-and-drop interface.",
    badge: "Effortless",
    badgeColor: "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200",
  },
];

const perks = [
  "No credit card required",
  "Free forever plan",
  "Cancel anytime",
];

export default function LandingPage() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-[#F4F5F7] overflow-x-hidden">

      {/* ── Topbar ── */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-[#E4E6EF]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#5243F0]">
              <Layers className="h-5 w-5 text-white" strokeWidth={1.75} />
            </div>
            <span className="text-[15px] font-bold text-[#1B1C22] tracking-tight">TaskTrack</span>
          </div>

          {/* Nav actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setLocation('/login')}
              className="text-sm font-medium text-[#8E92A4] transition-colors hover:text-[#1B1C22]"
            >
              Sign In
            </button>
            <button
              onClick={() => setLocation('/board')}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#5243F0] px-4 py-2 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(82,67,240,0.35)] transition-all hover:bg-[#4537D6] hover:shadow-[0_4px_20px_rgba(82,67,240,0.45)] active:scale-95"
            >
              Get Started
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* ── Hero Section ── */}
      <section className="mx-auto w-full max-w-6xl px-4 pt-20 pb-12 text-center">

        {/* Headline */}
        <h1 className="mt-6 font-display text-5xl font-black leading-[1.1] tracking-tight text-[#1B1C22] sm:text-6xl lg:text-7xl anim-slide-up delay-100">
          Smarter Workflow.
          <br />
          <span
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage: "linear-gradient(135deg, #5243F0 0%, #8B5CF6 50%, #3B82F6 100%)"
            }}
          >
            Seamless Execution.
          </span>
        </h1>

        {/* Subheading */}
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-[#8E92A4] anim-slide-up delay-200">
          Manage tasks in real time with intelligent automation, instant updates,
          and effortless drag-and-drop control.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3 anim-slide-up delay-300">
          <button
            onClick={() => setLocation('/board')}
            className="inline-flex items-center gap-2 rounded-full bg-[#5243F0] px-7 py-3.5 text-base font-bold text-white shadow-[0_8px_28px_rgba(82,67,240,0.38)] transition-all hover:bg-[#4537D6] hover:shadow-[0_8px_36px_rgba(82,67,240,0.5)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]"
          >
            Get Started Free
            <ArrowRight className="h-4 w-4" />
          </button>
          <button
            onClick={() => setLocation('/login')}
            className="inline-flex items-center gap-2 rounded-full border border-[#E4E6EF] bg-white px-7 py-3.5 text-base font-semibold text-[#1B1C22] shadow-sm transition-all hover:border-[#5243F0] hover:text-[#5243F0] hover:-translate-y-0.5 active:translate-y-0"
          >
            Sign In
          </button>
        </div>

        {/* Trust perks */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 anim-fade-in delay-400">
          {perks.map(p => (
            <span key={p} className="flex items-center gap-1.5 text-xs text-[#8E92A4]">
              <CheckCircle2 className="h-3.5 w-3.5 text-[#22C55E]" />
              {p}
            </span>
          ))}
        </div>
      </section>

      {/* ── Stats Row ── */}
      <section className="mx-auto max-w-6xl px-4 pb-16 anim-slide-up delay-200">
        <div className="grid grid-cols-3 divide-x divide-[#E4E6EF] rounded-2xl border border-[#E4E6EF] bg-white shadow-sm">
          {stats.map(({ value, label }) => (
            <div key={label} className="flex flex-col items-center py-7">
              <span className="text-3xl font-black tracking-tight text-[#5243F0]">{value}</span>
              <span className="mt-1 text-xs font-medium text-[#8E92A4]">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Feature Cards ── */}
      <section className="mx-auto max-w-6xl px-4 pb-24">

        {/* Section header */}
        <div className="mb-10 text-center anim-slide-up">
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#5243F0]">Why TaskTrack</p>
          <h2 className="mt-2 font-display text-3xl font-black text-[#1B1C22] sm:text-4xl">
            Everything you need to ship faster
          </h2>
          <p className="mt-3 text-sm text-[#8E92A4] max-w-xl mx-auto">
            Built for teams who can't afford to slow down. Every feature is designed to keep your
            work moving without friction.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, color, ring, title, desc, badge, badgeColor }, i) => (
            <div
              key={title}
              className={`anim-slide-up delay-${(i + 1) * 100} group relative flex flex-col rounded-2xl border border-[#E4E6EF] bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_8px_32px_rgba(0,0,0,0.09)] hover:border-transparent`}
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              {/* Subtle top accent line on hover */}
              <div
                className="absolute inset-x-0 top-0 h-0.5 rounded-t-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{ background: "linear-gradient(90deg, #5243F0, #8B5CF6)" }}
              />

              {/* Icon */}
              <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${color} ring-1 ${ring}`}>
                <Icon className="h-5 w-5" strokeWidth={1.75} />
              </div>

              {/* Badge */}
              <span className={`mt-5 inline-flex w-fit items-center rounded-full px-2.5 py-0.5 text-[0.6875rem] font-bold ${badgeColor}`}>
                {badge}
              </span>

              <h3 className="mt-2 font-display text-lg font-bold text-[#1B1C22]">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#8E92A4]">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="mx-auto max-w-6xl px-4 pb-24 anim-slide-up">
        <div
          className="relative overflow-hidden rounded-3xl p-10 text-center text-white shadow-[0_16px_48px_rgba(82,67,240,0.35)]"
          style={{ background: "linear-gradient(135deg, #5243F0 0%, #7C3AED 50%, #4F46E5 100%)" }}
        >
          {/* Decorative blobs */}
          <div className="pointer-events-none absolute -top-16 -right-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

          <div className="relative z-10">
            <h2 className="font-display text-3xl font-black sm:text-4xl">
              Ready to take control of your workflow?
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-sm text-white/70">
              Join thousands of teams already using TaskTrack to ship faster and stay organised.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => setLocation('/board')}
                className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-bold text-[#5243F0] shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0"
              >
                Start for Free
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => setLocation('/login')}
                className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-7 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20 hover:-translate-y-0.5"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-[#E4E6EF] bg-white py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="grid h-7 w-7 place-items-center rounded-lg bg-[#5243F0]">
              <Layers className="h-4 w-4 text-white" strokeWidth={1.75} />
            </div>
            <span className="text-sm font-bold text-[#1B1C22]">TaskTrack</span>
          </div>
          <p className="text-xs text-[#B0B4C8]">
            © {new Date().getFullYear()} TaskTrack. Built with React &amp; Node.js.
          </p>
          <div className="flex gap-5 text-xs text-[#8E92A4]">
            <button className="transition-colors hover:text-[#5243F0]">Privacy</button>
            <button className="transition-colors hover:text-[#5243F0]">Terms</button>
            <button className="transition-colors hover:text-[#5243F0]">Contact</button>
          </div>
        </div>
      </footer>

    </div>
  );
}
