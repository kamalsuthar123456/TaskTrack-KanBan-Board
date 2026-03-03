import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, UserPlus, Check, X, WifiOff, Lock, Settings, Layers } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { auth } from "@/state/auth";
import ParticleField from "@/components/ParticleField";
import TiltCard from "@/components/TiltCard";

const passwordRules = [
  { id: "length",  label: "At least 8 characters",          test: p => p.length >= 8 },
  { id: "upper",   label: "Uppercase & lowercase letters",  test: p => /[A-Z]/.test(p) && /[a-z]/.test(p) },
  { id: "number",  label: "Contains a number",              test: p => /[0-9]/.test(p) },
  { id: "special", label: "Contains a special character",   test: p => /[^A-Za-z0-9]/.test(p) },
];

const schema = z.object({
  name: z.string().min(1, "Enter your name"),
  email: z.string().min(1).email("Enter a valid email"),
  password: z.string().min(8).regex(/[A-Z]/).regex(/[a-z]/).regex(/[0-9]/).regex(/[^A-Za-z0-9]/),
  confirmPassword: z.string().min(1),
}).refine(d => d.password === d.confirmPassword, { message: "Passwords do not match", path: ["confirmPassword"] });

const features = [
  { icon: WifiOff,  text: "Works seamlessly offline",   desc: "Full offline task management"   },
  { icon: Lock,     text: "Stay logged in securely",    desc: "JWT-powered session management" },
  { icon: Settings, text: "No complex setup required",  desc: "Start in under 30 seconds"      },
];

export default function RegisterPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [show, setShow] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
    mode: "onChange",
  });

  const fv = form.watch();
  const password = fv.password || "";
  const ruleResults = passwordRules.map(r => ({ ...r, passed: r.test(password) }));
  const strengthScore = ruleResults.filter(r => r.passed).length;
  const allPassed = ruleResults.every(r => r.passed);
  const passwordsMatch = fv.password === fv.confirmPassword && fv.confirmPassword?.length > 0;
  const canSubmit = fv.name?.trim() && fv.email?.trim() && allPassed && passwordsMatch && !loading;

  const strengthMeta = [
    null,
    { label: "Weak",   color: "bg-red-500",    text: "text-red-400"    },
    { label: "Fair",   color: "bg-orange-500", text: "text-orange-400" },
    { label: "Good",   color: "bg-yellow-500", text: "text-yellow-400" },
    { label: "Strong", color: "bg-green-500",  text: "text-green-400"  },
  ];
  const sm = strengthMeta[strengthScore];

  const onSubmit = async (values) => {
    setLoading(true);
    try {
      const res = await fetch("http://192.168.56.1:5000/api/auth/register",{
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: values.name, email: values.email, password: values.password }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: "Registration failed", description: data.message || "Something went wrong", variant: "destructive" });
        return;
      }
      auth.login(data.user.email, data.token);
      toast({ title: "Account created 🎉", description: `Welcome, ${data.user.name}!` });
      setLocation("/board");
    } catch {
      toast({ title: "Connection Error", description: "Could not reach server.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen grid-bg overflow-hidden">

      <div className="absolute inset-0"><ParticleField /></div>
      <div className="absolute inset-0 perspective-grid opacity-40" />

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="glow-orb   absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-violet-700/20 blur-[80px]" />
        <div className="glow-orb-2 absolute -bottom-40 -left-40 h-[400px] w-[400px] rounded-full bg-indigo-700/20 blur-[80px]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl items-center px-4 py-10">
        <div className="grid w-full gap-10 lg:grid-cols-2 lg:items-center">

          {/* ── LEFT PANEL ── */}
          <TiltCard className="hidden lg:block anim-slide-right delay-100">
            <div className="spin-border relative rounded-3xl bg-[#080c1a]/80 p-8 backdrop-blur-2xl shadow-soft">
              <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-br from-violet-600/8 via-transparent to-indigo-600/8" />

              <div className="relative flex items-center gap-4">
                <div className="spin-border float-anim relative grid h-16 w-16 place-items-center rounded-2xl bg-violet-950/80">
                  <Layers className="icon-glow h-8 w-8 text-violet-300" strokeWidth={1.5} />
                </div>
                <div>
                  <h2 className="shimmer-text font-display text-4xl font-black leading-none tracking-tight">
                    Your Workspace
                  </h2>
                  <p className="mt-1 text-sm text-white/40">Start organizing tasks in seconds.</p>
                </div>
              </div>

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

              {/* Floating stat chips */}
              <div className="mt-8 flex gap-2">
                {[["🔥", "Tasks"], ["⚡", "Fast"], ["🔒", "Secure"]].map(([emoji, label]) => (
                  <div key={label} className="float-anim flex-1 rounded-xl border border-white/8 bg-white/3 p-3 text-center">
                    <div className="text-lg">{emoji}</div>
                    <div className="text-[10px] text-white/40 mt-0.5">{label}</div>
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
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="shimmer-text font-display text-4xl font-black tracking-tight">Register</h1>
                    <p className="mt-1.5 text-sm text-white/40">Create your account to start managing tasks instantly.</p>
                  </div>
                  <button onClick={() => setLocation("/")}
                    className="rounded-xl border border-white/8 bg-white/4 px-4 py-2 text-xs text-white/50 transition-all hover:bg-white/8 hover:text-white">
                    ← Back
                  </button>
                </div>

                <form onSubmit={form.handleSubmit(onSubmit)} className="mt-7 grid gap-4">

                  {/* Name */}
                  <div className="anim-slide-up delay-200 grid gap-1.5">
                    <Label className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/40">Name</Label>
                    <Input id="name" placeholder="e.g. Kamal"
                      className="glow-input h-12 rounded-xl border-white/8 bg-white/4 text-white placeholder:text-white/20 focus-visible:border-violet-500/40 focus-visible:ring-0"
                      {...form.register("name")} />
                    {form.formState.errors.name?.message && (
                      <p className="text-xs text-red-400">{String(form.formState.errors.name.message)}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="anim-slide-up delay-300 grid gap-1.5">
                    <Label className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/40">Email</Label>
                    <Input id="email" placeholder="kamal@email.com"
                      className="glow-input h-12 rounded-xl border-white/8 bg-white/4 text-white placeholder:text-white/20 focus-visible:border-violet-500/40 focus-visible:ring-0"
                      {...form.register("email")} />
                    {form.formState.errors.email?.message && (
                      <p className="text-xs text-red-400">{String(form.formState.errors.email.message)}</p>
                    )}
                  </div>

                  {/* Password */}
                  <div className="anim-slide-up delay-400 grid gap-1.5">
                    <Label className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/40">Password</Label>
                    <div className="relative">
                      <Input id="password" type={show ? "text" : "password"} placeholder="••••••••"
                        className="glow-input h-12 rounded-xl border-white/8 bg-white/4 text-white placeholder:text-white/20 pr-12 focus-visible:border-violet-500/40 focus-visible:ring-0"
                        {...form.register("password")} />
                      <button type="button" onClick={() => setShow(s => !s)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-white/25 transition-all hover:text-white/60">
                        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>

                    {password.length > 0 && (
                      <div className="grid gap-2 rounded-xl border border-white/6 bg-white/2 p-3">
                        {/* Strength bar */}
                        <div className="flex items-center gap-2">
                          <div className="flex flex-1 gap-1">
                            {[1,2,3,4].map(n => (
                              <div key={n}
                                className={`h-1 flex-1 rounded-full transition-all duration-500 ${n <= strengthScore && sm ? sm.color : "bg-white/8"}`} />
                            ))}
                          </div>
                          {sm && <span className={`text-[10px] font-bold uppercase ${sm.text}`}>{sm.label}</span>}
                        </div>
                        {/* Rules */}
                        <div className="grid grid-cols-2 gap-1">
                          {ruleResults.map(rule => (
                            <div key={rule.id} className="flex items-center gap-1.5 text-[11px]">
                              <span className={`grid h-3.5 w-3.5 shrink-0 place-items-center rounded-full transition-all duration-300 ${rule.passed ? "bg-green-500/25 text-green-400" : "bg-white/5 text-white/25"}`}>
                                {rule.passed
                                  ? <Check className="h-2 w-2" strokeWidth={3} />
                                  : <X className="h-2 w-2" strokeWidth={3} />}
                              </span>
                              <span className={rule.passed ? "text-green-400" : "text-white/35"}>{rule.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div className="anim-slide-up delay-500 grid gap-1.5">
                    <Label className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/40">Confirm Password</Label>
                    <div className="relative">
                      <Input id="confirmPassword" type={showConfirm ? "text" : "password"} placeholder="••••••••"
                        className={`glow-input h-12 rounded-xl bg-white/4 text-white placeholder:text-white/20 pr-12 focus-visible:ring-0 transition-all ${
                          fv.confirmPassword?.length > 0
                            ? passwordsMatch ? "border-green-500/30" : "border-red-500/30"
                            : "border-white/8"
                        }`}
                        {...form.register("confirmPassword")} />
                      <button type="button" onClick={() => setShowConfirm(s => !s)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-white/25 transition-all hover:text-white/60">
                        {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {fv.confirmPassword?.length > 0 && (
                      <p className={`flex items-center gap-1 text-xs ${passwordsMatch ? "text-green-400" : "text-red-400"}`}>
                        {passwordsMatch
                          ? <><Check className="h-3 w-3" strokeWidth={3}/> Passwords match</>
                          : <><X className="h-3 w-3" strokeWidth={3}/> Passwords do not match</>}
                      </p>
                    )}
                  </div>

                  {/* Submit */}
                  <div className="anim-slide-up delay-600">
                    <button type="submit" disabled={!canSubmit}
                      className="aurora-btn mt-1 h-13 w-full rounded-xl py-3 text-sm font-bold text-white disabled:opacity-30 disabled:cursor-not-allowed">
                      <span className="flex items-center justify-center gap-2">
                        {loading ? (
                          <>
                            <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                            Creating account...
                          </>
                        ) : (
                          <><UserPlus className="h-4 w-4" /> Create Account</>
                        )}
                      </span>
                    </button>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between text-xs text-white/30 pt-1">
                    <button type="button" onClick={() => setLocation("/login")}
                      className="transition-colors hover:text-violet-400">
                      Already have an account?
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
