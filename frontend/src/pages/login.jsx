import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, LogIn, Zap, Shield, RefreshCw, Layers } from "lucide-react";
import { Input }    from "@/components/ui/input";
import { Label }    from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { auth }     from "@/state/auth";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const schema = z.object({
  identifier: z.string().min(1, "Enter your email"),
  password:   z.string().min(1, "Enter your password"),
});

const FEATURES = [
  { icon: Zap,       text: "Seamless drag-and-drop workflow", desc: "Move tasks across columns instantly"  },
  { icon: RefreshCw, text: "Instant real-time updates",       desc: "All changes sync live across devices" },
  { icon: Shield,    text: "Smart auto-recovery on errors",   desc: "Never lose progress, ever"            },
];

export default function LoginPage() {
  const [, setLocation]       = useLocation();
  const { toast }             = useToast();
  const [show, setShow]       = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { identifier: "", password: "" },
  });

  const onSubmit = async (values) => {
    setLoading(true);
    try {
      const res  = await fetch(`${API_URL}/auth/login`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: values.identifier.trim(), password: values.password }),
      });
      const data = await res.json();
      if (!res.ok) {
        // ── STEP 6: destructive = rose/red tone ───────────────────────────
        toast({
          title:       "Login failed",
          description: data.message || "Invalid credentials. Please check your email and password.",
          variant:     "destructive",
        });
        return;
      }
      auth.login(data.token, data.user);
      // ── STEP 7: success = emerald/green tone ──────────────────────────
      toast({
        title:       "Welcome back 👋",
        description: `${data.user.email}`,
        variant:     "success",
      });
      setLocation("/board");
    } catch {
      // ── STEP 8: connection error = destructive ────────────────────────
      toast({
        title:       "Connection Error",
        description: "Could not reach the server. Make sure the backend is running.",
        variant:     "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // ── STEP 10: guest = default/info tone ──────────────────────────────────
  const handleGuestContinue = () => {
    sessionStorage.setItem("guest", "true");
    toast({
      title:       "Continuing as guest",
      description: "Some features may be limited without an account.",
      variant:     "default",
    });
    setTimeout(() => setLocation("/board"), 800);
  };

  const fv = form.watch();
  const canSubmit = fv.identifier?.trim().length > 0 && fv.password?.trim().length > 0 && !loading;

  return (
    <div className="min-h-screen bg-[#F4F5F7] flex items-center justify-center px-4 py-10">

      {/* Subtle background blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full bg-violet-200/40 blur-[100px]" />
        <div className="absolute -bottom-32 -right-32 h-[400px] w-[400px] rounded-full bg-indigo-200/40 blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[300px] w-[300px] rounded-full bg-purple-100/50 blur-[80px]" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-5xl">
        <div className="grid w-full gap-8 lg:grid-cols-2 lg:items-center">

          {/* ── LEFT: Feature Panel ── */}
          <div className="hidden lg:block anim-slide-right delay-100">
            <div className="relative overflow-hidden rounded-3xl bg-[#5243F0] p-8 shadow-[0_24px_64px_rgba(82,67,240,0.35)]">
              <div className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/10" />
              <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-white/10" />
              <div className="relative flex items-center gap-4">
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white/20 ring-1 ring-white/30">
                  <Layers className="h-7 w-7 text-white" strokeWidth={1.5} />
                </div>
                <div>
                  <h2 className="text-3xl font-black leading-none tracking-tight text-white">TaskTrack</h2>
                  <p className="mt-1 text-sm text-white/60">Real-time collaborative task management</p>
                </div>
              </div>
              <div className="mt-8 grid gap-3">
                {FEATURES.map(({ icon: Icon, text, desc }) => (
                  <div key={text} className="flex items-center gap-4 rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/20">
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{text}</p>
                      <p className="mt-0.5 text-xs text-white/55">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="relative mt-8 flex gap-2">
                {[
                  { label: "To Do",       color: "bg-blue-300"   },
                  { label: "In Progress", color: "bg-yellow-300" },
                  { label: "Done",        color: "bg-green-300"  },
                ].map(({ label, color }) => (
                  <div key={label} className="flex-1 rounded-xl bg-white/10 p-3 text-center text-xs text-white/70">
                    <div className={`mx-auto mb-1.5 h-1.5 w-6 rounded-full ${color}`} />
                    {label}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── RIGHT: Login Form ── */}
          <div className="anim-slide-up delay-200">
            <div className="rounded-3xl border border-[#E4E6EF] bg-white p-8 shadow-[0_8px_40px_rgba(0,0,0,0.08)]">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-black tracking-tight text-[#1B1C22]">Sign in</h1>
                  <p className="mt-1.5 text-sm text-[#8E92A4]">
                    Access your workspace and continue where you left off.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setLocation("/")}
                  className="rounded-xl border border-[#E4E6EF] bg-[#F4F5F7] px-4 py-2 text-xs font-medium text-[#8E92A4] transition-all hover:border-[#5243F0] hover:text-[#5243F0]"
                >
                  ← Back
                </button>
              </div>

              <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 grid gap-5" noValidate>

                {/* Email */}
                <div className="grid gap-2">
                  <Label className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#8E92A4]">
                    Email Address
                  </Label>
                  <Input
                    type="email"
                    autoComplete="email"
                    placeholder="kamal008@example.com"
                    className="h-12 rounded-xl border-[#E4E6EF] bg-[#F4F5F7] text-[#1B1C22] placeholder:text-[#B0B4C8] focus-visible:border-[#5243F0] focus-visible:ring-[3px] focus-visible:ring-[#5243F0]/10"
                    {...form.register("identifier")}
                  />
                  {form.formState.errors.identifier && (
                    <p className="text-xs text-red-500">{form.formState.errors.identifier.message}</p>
                  )}
                </div>

                {/* Password */}
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#8E92A4]">
                      Password
                    </Label>
                    {/* ── STEP 9: warning tone for "coming soon" ── */}
                    <button
                      type="button"
                      onClick={() => toast({
                        title:       "Coming soon",
                        description: "Password reset via email will be available soon.",
                        variant:     "warning",
                      })}
                      className="text-[10px] font-medium text-[#5243F0]/70 transition-colors hover:text-[#5243F0]"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Input
                      type={show ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="password"
                      className="h-12 rounded-xl border-[#E4E6EF] bg-[#F4F5F7] pr-12 text-[#1B1C22] placeholder:text-[#B0B4C8] focus-visible:border-[#5243F0] focus-visible:ring-[3px] focus-visible:ring-[#5243F0]/10"
                      {...form.register("password")}
                    />
                    <button
                      type="button"
                      onClick={() => setShow(s => !s)}
                      aria-label={show ? "Hide password" : "Show password"}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-[#B0B4C8] transition-colors hover:text-[#5243F0]"
                    >
                      {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {form.formState.errors.password && (
                    <p className="text-xs text-red-500">{form.formState.errors.password.message}</p>
                  )}
                </div>

                {/* Remember me */}
                <label className="flex w-fit cursor-pointer items-center gap-2 group">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-[#E4E6EF] bg-[#F4F5F7] text-[#5243F0] focus:ring-[#5243F0]/30"
                  />
                  <span className="text-xs text-[#8E92A4] transition-colors group-hover:text-[#1B1C22]">
                    Remember me
                  </span>
                </label>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="mt-1 h-12 w-full rounded-xl bg-[#5243F0] text-sm font-bold text-white shadow-[0_4px_16px_rgba(82,67,240,0.35)] transition-all hover:bg-[#4537D6] hover:shadow-[0_6px_24px_rgba(82,67,240,0.45)] hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-y-0"
                >
                  <span className="flex items-center justify-center gap-2">
                    {loading ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
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

                {/* Footer */}
                <div className="flex items-center justify-between pt-1 text-xs text-[#8E92A4]">
                  <button
                    type="button"
                    onClick={() => setLocation("/register")}
                    className="transition-colors hover:text-[#5243F0]"
                  >
                    Create an account
                  </button>
                  <button
                    type="button"
                    onClick={handleGuestContinue}
                    className="transition-colors hover:text-[#5243F0]"
                  >
                    Continue as guest →
                  </button>
                </div>

              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
