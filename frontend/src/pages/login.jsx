import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, LayoutGrid, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { auth } from "@/state/auth";

const schema = z.object({
  identifier: z.string().min(1, "Enter your username or email"),
  password: z.string().min(1, "Enter your password"),
});

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [show, setShow] = useState(false);

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { identifier: "", password: "" },
  });

  const onSubmit = (values) => {
    auth.login(values.identifier);
    toast({
      title: "Welcome back",
      description: `Signed in as ${values.identifier}`,
    });
    setLocation("/board");
  };

  const formValues = form.watch();
  const canSubmit = formValues.identifier?.trim().length > 0 && formValues.password?.trim().length > 0;

  return (
    <div className="min-h-screen grid-bg">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl items-center px-4 py-10">
        <div className="grid w-full gap-8 lg:grid-cols-2 lg:items-center">
          <div className="hidden lg:block">
            <div className="glass noise relative rounded-3xl p-8 ring-gradient shadow-soft">
              <div className="flex items-center gap-3">
                <div className="ring-gradient glass noise relative grid h-12 w-12 place-items-center rounded-2xl">
                  <LayoutGrid className="h-6 w-6" strokeWidth={2.2} />
                </div>
                <div>
                  <div className="font-display text-2xl leading-none">Kanban Board</div>
                  <div className="mt-1 text-sm text-muted-foreground">Collaborate smarter with real-time task management.</div>
                </div>
              </div>

              <div className="mt-8 grid gap-3">
                {["Seamless drag-and-drop workflow", "Instant real-time updates", "Smart auto-recovery on errors"].map((t) => (
                  <div key={t} className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm">
                    {t}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="glass noise relative rounded-3xl p-6 sm:p-8 ring-gradient shadow-soft">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="font-display text-2xl">Sign in</h1>
                <p className="mt-1 text-sm text-muted-foreground">Access your workspace securely and continue where you left off.</p>
              </div>
              <Button
                variant="secondary"
                className="h-9 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10"
                onClick={() => setLocation("/")}
              >
                Back
              </Button>
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="identifier">Username / Email</Label>
                <Input
                  id="identifier"
                  placeholder="e.g. kamal@email.com"
                  className="h-11 rounded-xl bg-black/20 border-white/10 focus-visible:ring-primary"
                  {...form.register("identifier")}
                />
                {form.formState.errors.identifier?.message && (
                  <p className="text-xs text-red-300">
                    {String(form.formState.errors.identifier.message)}
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={show ? "text" : "password"}
                    placeholder="password"
                    className="h-11 rounded-xl bg-black/20 border-white/10 pr-11 focus-visible:ring-primary"
                    {...form.register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShow((s) => !s)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-muted-foreground hover:bg-white/5 hover:text-foreground"
                  >
                    {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {form.formState.errors.password?.message && (
                  <p className="text-xs text-red-300">
                    {String(form.formState.errors.password.message)}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="mt-2 h-11 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={!canSubmit}
              >
                <LogIn className="mr-2 h-4 w-4" />
                Login
              </Button>

              <div className="mt-2 flex items-center justify-between text-sm flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setLocation("/register")}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Create an account
                </button>

                <button
                  type="button"
                  onClick={() => {
                    auth.login(form.getValues().identifier || "Guest");
                    setLocation("/board");
                  }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Continue as guest
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
