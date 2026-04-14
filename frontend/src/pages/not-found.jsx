import { useLocation } from 'wouter';
import { Home, Layers } from 'lucide-react';

export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-[#F4F5F7] flex items-center justify-center px-4">

      {/* Background blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 h-[400px] w-[400px] rounded-full bg-violet-200/40 blur-[100px]" />
        <div className="absolute -bottom-32 -right-32 h-[400px] w-[400px] rounded-full bg-indigo-200/40 blur-[100px]" />
      </div>

      <div className="relative z-10 text-center anim-scale-in">

        {/* Logo mark */}
        <div className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-2xl bg-[#5243F0] shadow-[0_8px_28px_rgba(82,67,240,0.35)]">
          <Layers className="h-8 w-8 text-white" strokeWidth={1.5} />
        </div>

        {/* 404 number */}
        <h1
          className="text-[9rem] font-black leading-none tracking-tighter"
          style={{ backgroundImage: "linear-gradient(135deg, #5243F0, #8B5CF6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}
        >
          404
        </h1>

        <p className="mt-2 text-xl font-bold text-[#1B1C22]">Page not found</p>
        <p className="mt-2 text-sm text-[#8E92A4]">
          The page you're looking for doesn't exist or was moved.
        </p>

        <button
          onClick={() => setLocation('/')}
          className="mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-[#5243F0] px-7 text-sm font-bold text-white shadow-[0_4px_16px_rgba(82,67,240,0.35)] transition-all hover:bg-[#4537D6] hover:shadow-[0_6px_24px_rgba(82,67,240,0.45)] hover:-translate-y-0.5 active:translate-y-0"
        >
          <Home className="h-4 w-4" />
          Go Home
        </button>

      </div>
    </div>
  );
}
