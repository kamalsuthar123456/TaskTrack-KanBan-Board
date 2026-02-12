import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBoardStore } from '@/state/boardStore';
import { useToast } from '@/hooks/use-toast';

const priorityConfig = {
  low: {
    bg: 'bg-blue-500/10',
    text: 'text-blue-400',
    border: 'border-blue-500/20',
    dot: 'bg-blue-500',
    glow: 'hover:shadow-[0_8px_30px_rgba(59,130,246,0.2)]',
  },
  medium: {
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    border: 'border-amber-500/20',
    dot: 'bg-amber-500',
    glow: 'hover:shadow-[0_8px_30px_rgba(245,158,11,0.2)]',
  },
  high: {
    bg: 'bg-rose-500/10',
    text: 'text-rose-400',
    border: 'border-rose-500/20',
    dot: 'bg-rose-500',
    glow: 'hover:shadow-[0_8px_30px_rgba(244,63,94,0.2)]',
  },
};

export default function TaskCard({ task }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  });
  const deleteTask = useBoardStore((state) => state.deleteTask);
  const { toast } = useToast();

  const priority = priorityConfig[task.priority] || priorityConfig.low;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : task.pending ? 0.7 : 1,
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    const res = await deleteTask(task.id);
    
    if (res.ok) {
      toast({
        title: 'Task deleted',
        description: 'The task has been removed.',
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Failed to delete',
        description: res.error,
      });
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative rounded-[26px] border border-white/10 bg-black/40 backdrop-blur-sm p-5 transition-all duration-300 cursor-pointer ${priority.glow} hover:bg-black/60 hover:border-primary/40 active:scale-[0.98] ${
        isDragging ? 'cursor-grabbing scale-105 rotate-3 shadow-2xl shadow-primary/50' : ''
      } ${task.pending ? 'opacity-60 grayscale-[0.3]' : ''}`}
    >
      {task.pending && (
        <div className="absolute inset-0 rounded-[26px] bg-gradient-to-br from-primary/10 to-transparent animate-pulse pointer-events-none" />
      )}

      <div className="flex items-start gap-3 relative z-10">
        <button
          {...attributes}
          {...listeners}
          className="mt-1 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-primary transition-all touch-none p-1 hover:bg-primary/10 rounded hover:scale-110"
        >
          <GripVertical className="h-4 w-4" />
        </button>

        <div className="flex-1 min-w-0">
          <p className="text-[15px] leading-relaxed break-words font-medium text-foreground/90 group-hover:text-foreground transition-colors mb-3">
            {task.title}
          </p>
          
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border flex items-center gap-1.5 ${priority.bg} ${priority.text} ${priority.border} transition-all hover:scale-105 hover:brightness-125`}>
              <span className={`h-1.5 w-1.5 rounded-full ${priority.dot}`}></span>
              {task.priority}
            </span>
            {task.pending && (
              <span className="text-xs flex items-center gap-1.5 text-muted-foreground bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
                <Clock className="h-3 w-3 animate-pulse" />
                <span className="text-[10px] font-bold">Syncing...</span>
              </span>
            )}
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleDelete}
          className="shrink-0 rounded-xl border border-white/10 bg-white/5 p-2.5 text-muted-foreground transition-all duration-300 hover:bg-rose-500 hover:text-white hover:border-rose-500 hover:shadow-lg hover:shadow-rose-500/30 hover:scale-110 active:scale-95"
        >
          <Trash2 className="h-4 w-4 stroke-[2.5]" />
        </Button>
      </div>

      <div className="mt-5 flex items-center justify-between relative z-10 border-t border-white/5 pt-4">
        <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground/40 tracking-wider">
          <span className="h-1.5 w-1.5 rounded-full bg-white/20" />
          Task Id: {task.id.slice(0, 8)}
        </div>
        <div className="h-7 w-7 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary group-hover:shadow-lg group-hover:shadow-primary/30 transition-all duration-300">
          <GripVertical className="h-3.5 w-3.5" />
        </div>
      </div>
    </div>
  );
}
