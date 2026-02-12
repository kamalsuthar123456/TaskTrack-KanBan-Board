import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';

export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen grid-bg flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="font-display text-9xl">404</h1>
        <p className="mt-4 text-xl text-muted-foreground">Page not found</p>
        <Button
          size="lg"
          onClick={() => setLocation('/')}
          className="mt-8 h-12 px-6 rounded-xl"
        >
          <Home className="mr-2 h-5 w-5" />
          Go Home
        </Button>
      </div>
    </div>
  );
}
