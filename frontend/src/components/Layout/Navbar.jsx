import { LogOut, LayoutGrid, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { auth } from '@/state/auth';
import { useLocation, Link } from 'wouter';

function Logo() {
  return (
    <div className="flex items-center gap-3 group cursor-pointer">
      {/* Animated logo icon */}
      <div className="relative">
        {/* Glow ring */}
        <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 opacity-0 blur-md transition-all duration-500 group-hover:opacity-60" />
        <div className="relative grid h-10 w-10 place-items-center rounded-xl border border-violet-500/30 bg-gradient-to-br from-violet-600/20 to-indigo-600/20 shadow-lg backdrop-blur-sm transition-transform duration-300 group-hover:scale-110">
          <LayoutGrid
            className="h-5 w-5 text-violet-400 transition-all duration-300 group-hover:text-violet-300 group-hover:drop-shadow-[0_0_6px_rgba(167,139,250,0.8)]"
            strokeWidth={2.5}
          />
        </div>
      </div>

      {/* Text */}
      <div className="flex flex-col leading-none">
        <span className="font-display text-base font-extrabold tracking-tight text-white">
          TaskTrack
        </span>
        <span className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.25em] text-violet-400/70">
          Kanban Board
        </span>
      </div>
    </div>
  );
}

export default function Navbar() {
  const [, setLocation] = useLocation();
  const user = auth.getUser();

  return (
    <nav className="sticky top-0 z-50 w-full">
      {/* Blur bar */}
      <div className="absolute inset-0 navbar-blur" />

      {/* Subtle top accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />

      <div className="relative mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/">
          <Logo />
        </Link>

        <div className="flex items-center gap-3">
          {/* Sparkle icon - decorative */}

          {/* User pill */}
          {user && (
            <div className="hidden sm:flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 transition-all hover:bg-white/[0.07] hover:border-white/20">
              <div className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </div>
              <span className="text-[13px] font-medium text-foreground/75 max-w-[180px] truncate">
                {user.identifier}
              </span>
            </div>
          )}

          {/* Sign out button */}
          <Button
            variant="ghost"
            className="h-9 gap-2 rounded-xl border border-white/0 px-4 text-[13px] font-medium text-muted-foreground transition-all hover:border-red-500/20 hover:bg-red-500/10 hover:text-red-400"
            onClick={() => {
              auth.logout();
              setLocation('/');
            }}
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </Button>
        </div>
      </div>
    </nav>
  );
}
