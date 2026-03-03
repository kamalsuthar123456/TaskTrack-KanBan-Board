import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, LogIn, Zap, Shield, RefreshCw, Layers } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { auth } from "@/state/auth";
import ParticleField from "@/components/ParticleField";
import TiltCard from "@/components/TiltCard";


const schema = z.object({
  identifier: z.string().min(1, "Enter your email"),
  password: z.string().min(1, "Enter your password"),
});

const features = [
  { icon: Zap,       text: "Seamless drag-and-drop workflow", desc: "Move tasks across columns instantly" },
  { icon: RefreshCw, text: "Instant real-time updates",       desc: "All changes sync live across devices"  },
  { icon: Shield,    text: "Smart auto-recovery on errors",   desc: "Never lose progress, ever"             },
];

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { identifier: "", password: "" },
  });

  const onSubmit = async (values) => {
    setLoading(true);
    try {
      const res = await fetch("http://192.168.56.1:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: values.identifier, password: values.password }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: "Login failed", description: data.message || "Invalid credentials", variant: "destructive" });
        return;
      }
      auth.login(data.user.email, data.token);
      toast({ title: "Welcome back 👋", description: `Signed in as ${data.user.email}` });
      setLocation("/board");
    } catch {
      toast({ title: "Connection Error", description: "Could not reach server.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const fv = form.watch();
  const canSubmit = fv.identifier?.trim().length > 0 && fv.password?.trim().length > 0 && !loading;

  return (
    <div className="relative min-h-screen grid-bg overflow-hidden">

      {/* Particle background */}
      <div className="absolute inset-0">
        <ParticleField />
      </div>

      {/* Perspective grid overlay */}
      <div className="absolute inset-0 perspective-grid opacity-40" />

      {/* Glow orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="glow-orb   absolute -top-40  -left-40  h-[500px] w-[500px] rounded-full bg-violet-700/20 blur-[80px]" />
        <div className="glow-orb-2 absolute -bottom-40 -right-40 h-[400px] w-[400px] rounded-full bg-indigo-700/20 blur-[80px]" />
        <div className="glow-orb-3 absolute top-1/3 right-1/3 h-[300px] w-[300px] rounded-full bg-purple-700/10 blur-[60px]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl items-center px-4 py-10">
        <div className="grid w-full gap-10 lg:grid-cols-2 lg:items-center">

          {/* ── LEFT PANEL ── */}
          <TiltCard className="hidden lg:block anim-slide-right delay-100">
            <div className="spin-border relative rounded-3xl bg-[#080c1a]/80 p-8 backdrop-blur-2xl shadow-soft">

              {/* Inner gradient shimmer */}
              <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-br from-violet-600/8 via-transparent to-indigo-600/8" />

              {/* Logo row */}
              <div className="relative flex items-center gap-4">
                <div className="spin-border float-anim relative grid h-16 w-16 place-items-center rounded-2xl bg-violet-950/80">
                  <Layers className="icon-glow h-8 w-8 text-violet-300" strokeWidth={1.5} />
                </div>
                <div>
                  <h2 className="shimmer-text font-display text-4xl font-black leading-none tracking-tight">
                    Kanban Board
                  </h2>
                  <p className="mt-1 text-sm text-white/40">Real-time collaborative task management</p>
                </div>
              </div>

              {/* Features */}
              <div className="mt-8 grid gap-2">
                {features.map(({ icon: Icon, text, desc }, i) => (
                  <div
                    key={text}
                    className={`feature-row anim-slide-right delay-${(i + 2) * 100} flex items-center gap-4 rounded-2xl border border-white/5 bg-white/2 p-4`}
                  >
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-violet-500/10 ring-1 ring-violet-500/20">
                      <Icon className="h-5 w-5 text-violet-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white/85">{text}</p>
                      <p className="text-xs text-white/35 mt-0.5">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Decorative 3D floating cards */}
              <div className="mt-8 flex gap-2">
                {["To Do", "In Progress", "Done"].map((label, i) => (
                  <div
                    key={label}
                    className={`float-anim float-anim-delay-${i} flex-1 rounded-xl border border-white/8 bg-white/3 p-3 text-center text-xs text-white/40`}
                  >
                    <div className={`mx-auto mb-1.5 h-1.5 w-6 rounded-full ${
                      i === 0 ? "bg-red-400/50" : i === 1 ? "bg-yellow-400/50" : "bg-green-400/50"
                    }`} />
                    {label}
                  </div>
                ))}
              </div>
            </div>
          </TiltCard>

          {/* ── RIGHT PANEL ── */}
          <TiltCard className="anim-slide-up delay-200">
            <div className="spin-border relative rounded-3xl bg-[#080c1a]/90 p-7 backdrop-blur-2xl shadow-soft">
              <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-b from-violet-500/5 to-transparent" />

              <div className="relative">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="shimmer-text font-display text-4xl font-black tracking-tight">Sign in</h1>
                    <p className="mt-1.5 text-sm text-white/40">Access your workspace and continue where you left off.</p>
                  </div>
                  <button
                    onClick={() => setLocation("/")}
                    className="rounded-xl border border-white/8 bg-white/4 px-4 py-2 text-xs text-white/50 transition-all hover:bg-white/8 hover:text-white"
                  >
                    ← Back
                  </button>
                </div>

                <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 grid gap-5">

                  {/* Email */}
                  <div className="anim-slide-up delay-300 grid gap-2">
                    <Label className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/40">
                      Email Address
                    </Label>
                    <Input
                      id="identifier"
                      placeholder="kamal@email.com"
                      className="glow-input h-12 rounded-xl border-white/8 bg-white/4 text-white placeholder:text-white/20 focus-visible:border-violet-500/40 focus-visible:ring-0"
                      {...form.register("identifier")}
                    />
                    {form.formState.errors.identifier?.message && (
                      <p className="text-xs text-red-400">{String(form.formState.errors.identifier.message)}</p>
                    )}
                  </div>

                  {/* Password */}
                  <div className="anim-slide-up delay-400 grid gap-2">
                    <Label className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/40">
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={show ? "text" : "password"}
                        placeholder="••••••••"
                        className="glow-input h-12 rounded-xl border-white/8 bg-white/4 text-white placeholder:text-white/20 pr-12 focus-visible:border-violet-500/40 focus-visible:ring-0"
                        {...form.register("password")}
                      />
                      <button type="button" onClick={() => setShow(s => !s)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-white/25 transition-all hover:text-white/60">
                        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {form.formState.errors.password?.message && (
                      <p className="text-xs text-red-400">{String(form.formState.errors.password.message)}</p>
                    )}
                  </div>

                  {/* Submit */}
                  <div className="anim-slide-up delay-500">
                    <button
                      type="submit"
                      disabled={!canSubmit}
                      className="aurora-btn relative mt-1 h-13 w-full rounded-xl py-3 text-sm font-bold text-white disabled:opacity-30 disabled:cursor-not-allowed disabled:animation-none"
                    >
                      <span className="relative flex items-center justify-center gap-2">
                        {loading ? (
                          <>
                            <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                            Signing in...
                          </>
                        ) : (
                          <>
                            <LogIn className="h-4 w-4" />
                            Login to Workspace
                          </>
                        )}
                      </span>
                    </button>
                  </div>

                  {/* Footer */}
                  <div className="anim-slide-up delay-600 flex items-center justify-between text-xs text-white/30 pt-1">
                    <button type="button" onClick={() => setLocation("/register")}
                      className="transition-colors hover:text-violet-400">
                      Create an account
                    </button>
                    <button type="button" onClick={() => { auth.login("Guest", null); setLocation("/board"); }}
                      className="transition-colors hover:text-violet-400">
                      Continue as guest →
                    </button>
                  </div>

                </form>
              </div>
            </div>
          </TiltCard>

        </div>
      </div>
    </div>
  );
}
