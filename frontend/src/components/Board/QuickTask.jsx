import { useState } from 'react';
import { Plus, ChevronDown, X } from 'lucide-react';
import { Button }   from '@/components/ui/button';
import { Input }    from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useBoardStore }         from '@/state/boardStore';
import { useToast }              from '@/hooks/use-toast';
import { PRIORITY_COLORS_LIGHT } from '@/constants/priority';

const PRIORITIES = [
  { key: 'low',      label: 'Low'      },
  { key: 'medium',   label: 'Medium'   },
  { key: 'high',     label: 'High'     },
  { key: 'critical', label: 'Critical' },
];

export default function QuickTask({ onClose }) {
  const [title,    setTitle]    = useState('');
  const [priority, setPriority] = useState('low');
  const addTask   = useBoardStore(state => state.addTask);
  const { toast } = useToast();

  const currentPriority = PRIORITIES.find(p => p.key === priority);

  const normalizedKey = priority.charAt(0).toUpperCase() + priority.slice(1).toLowerCase();
  const colorClass    = PRIORITY_COLORS_LIGHT[normalizedKey] || "text-gray-500 bg-gray-100 border-gray-200";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      toast({ title: 'Title required', description: 'Type a task name to add it.' });
      return;
    }
    const res = await addTask(title.trim(), priority);
    if (res.ok) {
      toast({ title: 'Task added', description: 'Your task has been created successfully.' });
      setTitle('');
      setPriority('low');
    } else {
      toast({ variant: 'destructive', title: 'Failed to add task', description: res.error || 'Please try again.' });
    }
  };

  return (
    <div className="relative rounded-2xl bg-white border border-[#E4E6EF] p-6 sm:p-7 shadow-[0_4px_24px_rgba(0,0,0,0.07)] overflow-hidden">

      {/* Subtle purple top accent */}
      <div className="absolute inset-x-0 top-0 h-0.5 rounded-t-2xl bg-gradient-to-r from-[#5243F0] via-[#8B5CF6] to-[#5243F0]" />

      {/* Close button */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 h-8 w-8 rounded-xl bg-[#F4F5F7] border border-[#E4E6EF] grid place-items-center text-[#8E92A4] hover:text-[#1B1C22] hover:bg-[#EDEEF3] transition-all"
        >
          <X className="h-4 w-4" />
        </button>
      )}

      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end">
        <div className="flex-1 space-y-4">

          <div>
            <h2 className="font-display text-xl font-bold text-[#1B1C22]">Add New Task</h2>
            <p className="text-sm text-[#8E92A4]">Add tasks to your workflow with zero latency.</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">

            {/* Task title input */}
            <div className="flex-1">
              <Input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Capture your next big idea..."
                className="h-12 w-full rounded-xl bg-[#F4F5F7] border-[#E4E6EF] text-[#1B1C22] placeholder:text-[#B0B4C8] focus-visible:border-[#5243F0] focus-visible:ring-[3px] focus-visible:ring-[#5243F0]/10 text-sm px-4"
                onKeyDown={e => { if (e.key === 'Enter') handleSubmit(e); }}
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className={`h-12 w-full sm:w-[148px] rounded-xl border font-semibold text-sm transition-all ${colorClass}`}
                >
                  {currentPriority.label}
                  <ChevronDown className="ml-2 h-4 w-4 opacity-60" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-[148px] rounded-xl border-[#E4E6EF] bg-white shadow-[0_8px_32px_rgba(0,0,0,0.1)] p-1.5"
              >
                {PRIORITIES.map(p => {
                  const nk  = p.key.charAt(0).toUpperCase() + p.key.slice(1).toLowerCase();
                  const cls = PRIORITY_COLORS_LIGHT[nk] || "text-gray-500 bg-gray-100 border-gray-200";
                  return (
                    <DropdownMenuItem
                      key={p.key}
                      className={`rounded-lg mb-1 last:mb-0 cursor-pointer font-semibold px-3 py-2 text-sm border ${cls}`}
                      onSelect={() => setPriority(p.key)}
                    >
                      {p.label}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Submit */}
            <Button
              type="submit"
              disabled={!title.trim()}
              className="h-12 rounded-xl bg-[#5243F0] hover:bg-[#4537D6] text-white px-8 font-bold text-sm shadow-[0_4px_14px_rgba(82,67,240,0.35)] hover:shadow-[0_4px_20px_rgba(82,67,240,0.45)] transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-y-0"
            >
              <Plus className="mr-2 h-4 w-4 stroke-[2.5]" />
              Add Task
            </Button>

          </form>
        </div>
      </div>
    </div>
  );
}
