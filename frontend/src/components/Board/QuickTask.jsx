import { useState } from 'react';
import { Plus, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useBoardStore } from '@/state/boardStore';
import { useToast } from '@/hooks/use-toast';

const PRIORITIES = [
  { key: 'low', label: 'Low', color: 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border-blue-500/30' },
  { key: 'medium', label: 'Medium', color: 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 border-amber-500/30' },
  { key: 'high', label: 'High', color: 'bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 border-rose-500/30' },
];

export default function QuickTask() {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('low');
  const addTask = useBoardStore((state) => state.addTask);
  const { toast } = useToast();

  const currentPriorityObj = PRIORITIES.find(p => p.key === priority);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      toast({ 
        title: 'Title required', 
        description: 'Type a task name to add it.' 
      });
      return;
    }

    const res = await addTask(title.trim(), priority);
    
    if (res.ok) {
      toast({
        title: 'Task added',
        description: 'Your task has been created successfully.',
      });
      setTitle('');
      setPriority('low');
    } else {
      toast({
        variant: 'destructive',
        title: 'Failed to add task',
        description: res.error || 'Please try again.',
      });
    }
  };

  return (
    <div className="glass noise relative rounded-[32px] p-6 sm:p-8 ring-gradient shadow-soft overflow-hidden group">
      <div className="absolute -top-12 -right-12 p-8 opacity-[0.03] pointer-events-none group-hover:opacity-[0.07] transition-all duration-700 rotate-12 group-hover:rotate-0 scale-150">
        <svg className="h-48 w-48" fill="currentColor" viewBox="0 0 24 24">
          <path d="M10 3H3v7h7V3zm11 0h-7v7h7V3zm0 11h-7v7h7v-7zm-11 0H3v7h7v-7z"/>
        </svg>
      </div>

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end">
        <div className="flex-1 space-y-4">
          <div>
            <h2 className="font-display text-xl font-bold">Add New Task</h2>
            <p className="text-sm text-muted-foreground">Add tasks to your workflow with zero latency.</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
            <div className="flex-1">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Capture your next big idea..."
                className="h-14 w-full rounded-2xl bg-black/40 border-white/10 focus-visible:ring-primary focus-visible:bg-black/60 transition-all text-base px-6"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSubmit(e);
                }}
              />
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  type="button"
                  variant="secondary" 
                  className={`h-14 w-full sm:w-[150px] rounded-2xl border ${currentPriorityObj.color} transition-all font-bold tracking-wide`}
                >
                  {currentPriorityObj.label}
                  <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[150px] rounded-2xl border-white/10 bg-black/95 backdrop-blur-2xl p-1.5 shadow-2xl">
                {PRIORITIES.map((p) => (
                  <DropdownMenuItem 
                    key={p.key}
                    className={`rounded-xl mb-1 last:mb-0 cursor-pointer ${p.color} focus:brightness-125 font-bold px-3 py-2`}
                    onSelect={() => setPriority(p.key)}
                  >
                    {p.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              type="submit"
              disabled={!title.trim()}
              className="h-14 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-xl shadow-primary/25 px-10 font-bold transition-all hover:scale-[1.02] active:scale-[0.98] border-t border-white/20"
            >
              <Plus className="mr-2 h-5 w-5 stroke-[3]" />
              Add Task
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
