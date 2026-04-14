import { Route, Switch } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster }         from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { queryClient }     from "./lib/queryClient";
import { useEffect, useState } from "react";
import { auth }            from "@/state/auth";

// ── Pages ─────────────────────────────────────────────────────────────────────
import NotFound     from "@/pages/not-found";
import LandingPage  from "@/pages/landing";
import LoginPage    from "@/pages/login";
import RegisterPage from "@/pages/register";
import BoardPage    from "@/pages/board";
import InvitePage   from "@/pages/InvitePage";
import DashboardPage from "@/pages/dashboard";
import ProjectsPage  from "@/pages/projects";
import IssuesPage    from "@/pages/issues";
import CalendarPage  from "@/pages/calendar";

// ── Loading spinner ───────────────────────────────────────────────────────────
function FullscreenSpinner() {
  return (
    <div className="min-h-screen bg-[#0a0a12] flex items-center justify-center">
      <div className="h-8 w-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
    </div>
  );
}

// ── Router ────────────────────────────────────────────────────────────────────
function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/"         component={LandingPage}   />
      <Route path="/login"    component={LoginPage}     />
      <Route path="/register" component={RegisterPage}  />
      <Route path="/invite"   component={InvitePage}    />

      <Route path="/dashboard" component={DashboardPage} />
      <Route path="/projects"  component={ProjectsPage}  />
      <Route path="/issues"    component={IssuesPage}    />
      <Route path="/board"     component={BoardPage}     />
      <Route path="/calendar"  component={CalendarPage}  />

      <Route component={NotFound} />
    </Switch>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    auth.rehydrate().finally(() => setAuthReady(true));
  }, []);

  if (!authReady) return <FullscreenSpinner />;

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
