import { LogOut, LayoutGrid } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { auth } from '@/state/auth';
import { useLocation, Link } from 'wouter';

function Logo() {
  return (
    <div className="flex items-center gap-2 group cursor-pointer">
      <div className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
        <div className="relative ring-gradient glass noise grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-black shadow-2xl">
          <LayoutGrid className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" strokeWidth={2.5} />
        </div>
      </div>
      <div className="flex flex-col">
        <span className="font-display text-lg font-bold tracking-tight leading-none bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
          TaskTrack
        </span>
        <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium">
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
    <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/40 backdrop-blur-2xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/">
          <Logo />
        </Link>

        <div className="flex items-center gap-4">
          {user && (
            <div className="hidden sm:flex items-center gap-3 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm font-medium text-foreground/80">{user.identifier}</span>
            </div>
          )}
          
          <Button
            variant="ghost"
            className="h-9 px-4 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-xl"
            onClick={() => {
              auth.logout();
              setLocation('/');
            }}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>
    </nav>
  );
}
