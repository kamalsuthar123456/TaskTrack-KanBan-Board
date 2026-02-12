import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import TaskCard from './TaskCard';

const columnConfig = {
  todo: {
    title: 'To Do',
    status: '',
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
    iconBg: 'bg-blue-500/10',
    iconColor: 'text-blue-400',
    iconBorder: 'border-blue-500/10',
    glowColor: 'hover:shadow-[0_0_30px_rgba(59,130,246,0.15)]', // Blue glow
  },
  inprogress: {
    title: 'In Progress',
    status: '',
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    iconBg: 'bg-amber-500/10',
    iconColor: 'text-amber-400',
    iconBorder: 'border-amber-500/10',
    glowColor: 'hover:shadow-[0_0_30px_rgba(245,158,11,0.15)]', // Amber glow
  },
  done: {
    title: 'Done',
    status: '',
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    iconBg: 'bg-green-500/10',
    iconColor: 'text-green-400',
    iconBorder: 'border-green-500/10',
    glowColor: 'hover:shadow-[0_0_30px_rgba(34,197,94,0.15)]', // Green glow
  },
};

export default function Column({ id, tasks }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  const config = columnConfig[id];

  return (
    <div 
      ref={setNodeRef}
      className={`glass noise relative rounded-[36px] p-6 ring-gradient shadow-soft flex flex-col min-h-[550px] transition-all duration-500 ${config.glowColor} hover:border-white/20 ${
        isOver ? 'ring-2 ring-primary/50 bg-primary/5 scale-[1.02] shadow-[0_0_40px_rgba(132,90,255,0.3)]' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-8 px-1">
        <div className="flex items-center gap-4">
          <div className={`grid h-11 w-11 place-items-center rounded-2xl border ${config.iconBorder} ${config.iconBg} ${config.iconColor} shadow-inner transition-transform hover:scale-110`}>
            {config.icon}
          </div>
          <div>
            <h3 className="font-display text-lg font-bold tracking-tight">
              {config.title}
            </h3>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50 font-black">
              {config.status}
            </p>
          </div>
        </div>
        <div className="flex h-8 min-w-[32px] items-center justify-center rounded-full border border-primary/20 bg-primary/10 px-2.5 text-xs font-black text-primary shadow-xl shadow-primary/10 ring-1 ring-primary/5 transition-all hover:scale-110 hover:shadow-primary/20">
          {tasks.length}
        </div>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto pr-1 custom-scrollbar">
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-[28px] border-2 border-dashed border-white/5 bg-black/10 py-20 px-6 text-center transition-all hover:bg-black/20 hover:border-white/10 group/empty">
              <div className="mb-4 h-16 w-16 rounded-2xl border border-white/5 bg-white/5 flex items-center justify-center opacity-20 group-hover/empty:scale-110 group-hover/empty:opacity-30 transition-all duration-500">
                <Plus className="h-8 w-8" />
              </div>
              <p className="text-sm font-bold text-muted-foreground/40 tracking-wide">Ready for tasks</p>
            </div>
          ) : (
            tasks.map((task) => <TaskCard key={task.id} task={task} />)
          )}
        </SortableContext>
      </div>
    </div>
  );
}
