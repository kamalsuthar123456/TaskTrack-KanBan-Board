import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, UserPlus, Check, X, WifiOff, Lock, Settings, Layers } from "lucide-react";
import { Input }    from "@/components/ui/input";
import { Label }    from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { auth }     from "@/state/auth";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const PASSWORD_RULES = [
  { id: "length",  label: "At least 8 characters",         test: (p) => p.length >= 8                        },
  { id: "upper",   label: "Uppercase & lowercase letters", test: (p) => /[A-Z]/.test(p) && /[a-z]/.test(p)  },
  { id: "number",  label: "Contains a number",             test: (p) => /[0-9]/.test(p)                      },
  { id: "special", label: "Contains a special character",  test: (p) => /[^A-Za-z0-9]/.test(p)              },
];

const STRENGTH_META = [
  null,
  { label: "Weak",   bar: "bg-red-500",    text: "text-red-500"    },
  { label: "Fair",   bar: "bg-orange-500", text: "text-orange-500" },
  { label: "Good",   bar: "bg-yellow-500", text: "text-yellow-600" },
  { label: "Strong", bar: "bg-green-500",  text: "text-green-600"  },
];

const schema = z
  .object({
    name:            z.string().min(1, "Enter your name"),
    email:           z.string().email("Enter a valid email"),
    password:        z.string()
      .min(8, "At least 8 characters")
      .regex(/[A-Z]/, "Add an uppercase letter")
      .regex(/[a-z]/, "Add a lowercase letter")
      .regex(/[0-9]/, "Add a number")
      .regex(/[^A-Za-z0-9]/, "Add a special character"),
    confirmPassword: z.string().min(1, "Confirm your password"),
  })
  .refine(d => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const FEATURES = [
  { icon: WifiOff,  text: "Works seamlessly offline",  desc: "Full offline task management"   },
  { icon: Lock,     text: "Stay logged in securely",   desc: "JWT-powered session management" },
  { icon: Settings, text: "No complex setup required", desc: "Start in under 30 seconds"      },
];

export default function RegisterPage() {
  const [, setLocation]             = useLocation();
  const { toast }                   = useToast();
  const [show, setShow]             = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading]       = useState(false);

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
    mode: "onChange",
  });

  const fv             = form.watch();
  const password       = fv.password || "";
  const ruleResults    = PASSWORD_RULES.map(r => ({ ...r, passed: r.test(password) }));
  const strengthScore  = ruleResults.filter(r => r.passed).length;
  const allPassed      = strengthScore === PASSWORD_RULES.length;
  const passwordsMatch = fv.password === fv.confirmPassword && fv.confirmPassword?.length > 0;
  const canSubmit      = fv.name?.trim() && fv.email?.trim() && allPassed && passwordsMatch && !loading;
  const sm             = STRENGTH_META[strengthScore];

  const onSubmit = async (values) => {
  setLoading(true);
  try {
    const res  = await fetch(`${API_URL}/auth/register`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: values.name.trim(), email: values.email.trim(), password: values.password }),
    });
    const data = await res.json();
    if (!res.ok) {
      // ── STEP 11a: registration failure = destructive ──────────────────
      toast({
        title:       "Registration failed",
        description: data.message || "Something went wrong. Please try again.",
        variant:     "destructive",
      });
      return;
    }
    auth.login(data.token, data.user);
    // ── STEP 11b: registration success = success ──────────────────────
    toast({
      title:       "Account created 🎉",
      description: `Welcome aboard, ${data.user.name}! Your workspace is ready.`,
      variant:     "success",
    });
    setLocation("/board");
  } catch {
    // ── STEP 11c: connection error = destructive ──────────────────────
    toast({
      title:       "Connection Error",
      description: "Could not reach the server. Make sure the backend is running.",
      variant:     "destructive",
    });
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-[#F4F5F7] flex items-center justify-center px-4 py-10">

      {/* Subtle background blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 -right-32 h-[500px] w-[500px] rounded-full bg-violet-200/40 blur-[100px]" />
        <div className="absolute -bottom-32 -left-32 h-[400px] w-[400px] rounded-full bg-indigo-200/40 blur-[100px]" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-5xl">
        <div className="grid w-full gap-8 lg:grid-cols-2 lg:items-start">

          {/* ── LEFT: Feature Panel ── */}
          <div className="hidden lg:block anim-slide-right delay-100">
            <div className="relative overflow-hidden rounded-3xl bg-[#5243F0] p-8 shadow-[0_24px_64px_rgba(82,67,240,0.35)]">
              <div className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/10" />
              <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-white/10" />

              {/* Logo */}
              <div className="relative flex items-center gap-4">
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white/20 ring-1 ring-white/30">
                  <Layers className="h-7 w-7 text-white" strokeWidth={1.5} />
                </div>
                <div>
                  <h2 className="text-3xl font-black leading-none tracking-tight text-white">Your Workspace</h2>
                  <p className="mt-1 text-sm text-white/60">Start organizing tasks in seconds.</p>
                </div>
              </div>

              {/* Features */}
              <div className="relative mt-8 grid gap-3">
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

              {/* Emoji chips */}
              <div className="relative mt-8 flex gap-2">
                {[["🔥", "Tasks"], ["⚡", "Fast"], ["🔒", "Secure"]].map(([emoji, label]) => (
                  <div key={label} className="flex-1 rounded-xl bg-white/10 p-3 text-center">
                    <div className="text-lg">{emoji}</div>
                    <div className="mt-0.5 text-[10px] text-white/60">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── RIGHT: Register Form ── */}
          <div className="anim-slide-up delay-200">
            <div className="rounded-3xl border border-[#E4E6EF] bg-white p-8 shadow-[0_8px_40px_rgba(0,0,0,0.08)]">

              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-black tracking-tight text-[#1B1C22]">Create account</h1>
                  <p className="mt-1.5 text-sm text-[#8E92A4]">Join your team and start managing tasks today.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setLocation("/")}
                  className="rounded-xl border border-[#E4E6EF] bg-[#F4F5F7] px-4 py-2 text-xs font-medium text-[#8E92A4] transition-all hover:border-[#5243F0] hover:text-[#5243F0]"
                >
                  ← Back
                </button>
              </div>

              <form onSubmit={form.handleSubmit(onSubmit)} className="mt-7 grid gap-4" noValidate>

                {/* Name */}
                <div className="grid gap-2">
                  <Label className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#8E92A4]">Full Name</Label>
                  <Input
                    autoComplete="name"
                    placeholder="Kamal Suthar"
                    className="h-12 rounded-xl border-[#E4E6EF] bg-[#F4F5F7] text-[#1B1C22] placeholder:text-[#B0B4C8] focus-visible:border-[#5243F0] focus-visible:ring-[3px] focus-visible:ring-[#5243F0]/10"
                    {...form.register("name")}
                  />
                  {form.formState.errors.name && (
                    <p className="text-xs text-red-500">{form.formState.errors.name.message}</p>
                  )}
                </div>

                {/* Email */}
                <div className="grid gap-2">
                  <Label className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#8E92A4]">Email Address</Label>
                  <Input
                    type="email"
                    autoComplete="email"
                    placeholder="kamal008@example.com"
                    className="h-12 rounded-xl border-[#E4E6EF] bg-[#F4F5F7] text-[#1B1C22] placeholder:text-[#B0B4C8] focus-visible:border-[#5243F0] focus-visible:ring-[3px] focus-visible:ring-[#5243F0]/10"
                    {...form.register("email")}
                  />
                  {form.formState.errors.email && (
                    <p className="text-xs text-red-500">{form.formState.errors.email.message}</p>
                  )}
                </div>

                {/* Password */}
                <div className="grid gap-2">
                  <Label className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#8E92A4]">Password</Label>
                  <div className="relative">
                    <Input
                      type={show ? "text" : "password"}
                      autoComplete="new-password"
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

                  {/* Strength indicator */}
                  {password.length > 0 && (
                    <div className="mt-1 space-y-2">
                      {/* Strength bar */}
                      <div className="flex gap-1 h-1.5">
                        {[1, 2, 3, 4].map(i => (
                          <div
                            key={i}
                            className={`flex-1 rounded-full transition-all duration-300 ${
                              i <= strengthScore ? sm?.bar ?? "bg-gray-300" : "bg-[#E4E6EF]"
                            }`}
                          />
                        ))}
                      </div>
                      {sm && (
                        <p className={`text-[10px] font-bold ${sm.text}`}>
                          Password strength: {sm.label}
                        </p>
                      )}
                      {/* Rule checklist */}
                      <div className="grid grid-cols-2 gap-1">
                        {ruleResults.map(({ id, label, passed }) => (
                          <div key={id} className="flex items-center gap-1.5">
                            {passed
                              ? <Check className="h-3 w-3 text-green-500 shrink-0" />
                              : <X     className="h-3 w-3 text-[#B0B4C8] shrink-0" />
                            }
                            <span className={`text-[10px] ${passed ? "text-[#1B1C22]" : "text-[#B0B4C8]"}`}>
                              {label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="grid gap-2">
                  <Label className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#8E92A4]">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      type={showConfirm ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="password"
                      className={`h-12 rounded-xl bg-[#F4F5F7] pr-12 text-[#1B1C22] placeholder:text-[#B0B4C8] transition-all focus-visible:ring-[3px] ${
                        fv.confirmPassword?.length > 0
                          ? passwordsMatch
                            ? "border-green-400 focus-visible:border-green-500 focus-visible:ring-green-500/10"
                            : "border-red-400 focus-visible:border-red-500 focus-visible:ring-red-500/10"
                          : "border-[#E4E6EF] focus-visible:border-[#5243F0] focus-visible:ring-[#5243F0]/10"
                      }`}
                      {...form.register("confirmPassword")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(s => !s)}
                      aria-label={showConfirm ? "Hide confirm password" : "Show confirm password"}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-[#B0B4C8] transition-colors hover:text-[#5243F0]"
                    >
                      {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {form.formState.errors.confirmPassword && (
                    <p className="text-xs text-red-500">{form.formState.errors.confirmPassword.message}</p>
                  )}
                  {/* Live match indicator */}
                  {fv.confirmPassword?.length > 0 && (
                    <p className={`flex items-center gap-1 text-[10px] font-bold ${passwordsMatch ? "text-green-600" : "text-red-500"}`}>
                      {passwordsMatch
                        ? <><Check className="h-3 w-3" /> Passwords match</>
                        : <><X     className="h-3 w-3" /> Passwords do not match</>
                      }
                    </p>
                  )}
                </div>

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
                        Creating account...
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4" />
                        Create Account
                      </>
                    )}
                  </span>
                </button>

                {/* Footer */}
                <p className="pt-1 text-center text-xs text-[#8E92A4]">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setLocation("/login")}
                    className="font-semibold text-[#5243F0] transition-colors hover:text-[#4537D6]"
                  >
                    Sign in instead
                  </button>
                </p>

              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
