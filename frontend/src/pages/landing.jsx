import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Zap, RotateCcw, Layers } from 'lucide-react';

export default function LandingPage() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen grid-bg">
      <div className="mx-auto w-full max-w-6xl px-4 py-16">
        <div className="text-center">
          {/* Logo section removed */}

          <h1 className="mt-12 font-display text-5xl sm:text-6xl lg:text-7xl">
            Smarter Workflow.
            <br />
            <span className="bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
              Seamless Execution.
            </span>
          </h1>

          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
            Manage tasks in real time with intelligent automation, instant updates, and effortless drag-and-drop control.
          </p>

          <div className="mt-10 flex gap-4 justify-center flex-wrap">
            <Button
              size="lg"
              onClick={() => setLocation('/board')}
              className="h-14 px-8 rounded-xl bg-primary hover:bg-primary/90 text-lg"
            >
              Get Started
            </Button>
            <Button
              size="lg"
              variant="secondary"
              onClick={() => setLocation('/login')}
              className="h-14 px-8 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-lg"
            >
              Sign In
            </Button>
          </div>

          <div className="mt-24 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="glass noise rounded-3xl p-8 ring-gradient shadow-soft">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20 text-primary">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="mt-6 font-display text-xl">Instant Updates</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                See every change instantly with optimistic updates that keep your workflow smooth and responsive.              </p>
            </div>

            <div className="glass noise rounded-3xl p-8 ring-gradient shadow-soft">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-500/20 text-yellow-300">
                <RotateCcw className="h-6 w-6" />
              </div>
              <h3 className="mt-6 font-display text-xl">Auto Rollback</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Errors? No problem. Automatically restore the last stable state with intelligent failure handling.              </p>
            </div>

            <div className="glass noise rounded-3xl p-8 ring-gradient shadow-soft sm:col-span-2 lg:col-span-1">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/20 text-green-300">
                <Layers className="h-6 w-6" />
              </div>
              <h3 className="mt-6 font-display text-xl">Drag & Drop</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Move tasks across stages with a smooth, intuitive drag-and-drop interface.              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
