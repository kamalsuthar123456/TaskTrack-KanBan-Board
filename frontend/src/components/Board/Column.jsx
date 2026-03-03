import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import TaskCard from './TaskCard';

const columnConfig = {
  todo: {
    title: 'To Do',
    emptyLabel: 'No tasks yet',
    emptyHint: 'Add your first task to get started',
    emptyIcon: (
      <svg className="h-10 w-10 mb-3 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
    iconBg: 'bg-blue-500/10',
    iconColor: 'text-blue-400',
    iconBorder: 'border-blue-500/10',
    glowColor: 'hover:shadow-[0_0_30px_rgba(59,130,246,0.15)]',
    badgeColor: 'border-blue-500/20 bg-blue-500/10 text-blue-400 shadow-blue-500/10 ring-blue-500/5',
    dropBorder: 'ring-blue-500/40 bg-blue-500/5 shadow-[0_0_40px_rgba(59,130,246,0.2)]',
    fadeColor: 'from-transparent via-transparent to-[rgba(10,10,30,0.85)]',
  },
  inprogress: {
    title: 'In Progress',
    emptyLabel: 'Nothing in progress',
    emptyHint: 'Drag a task here or add a new one',
    emptyIcon: (
      <svg className="h-10 w-10 mb-3 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    iconBg: 'bg-amber-500/10',
    iconColor: 'text-amber-400',
    iconBorder: 'border-amber-500/10',
    glowColor: 'hover:shadow-[0_0_30px_rgba(245,158,11,0.15)]',
    badgeColor: 'border-amber-500/20 bg-amber-500/10 text-amber-400 shadow-amber-500/10 ring-amber-500/5',
    dropBorder: 'ring-amber-500/40 bg-amber-500/5 shadow-[0_0_40px_rgba(245,158,11,0.2)]',
    fadeColor: 'from-transparent via-transparent to-[rgba(20,15,5,0.85)]',
  },
  done: {
    title: 'Done',
    emptyLabel: 'Nothing completed yet',
    emptyHint: 'Finished tasks will appear here',
    emptyIcon: (
      <svg className="h-10 w-10 mb-3 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    iconBg: 'bg-green-500/10',
    iconColor: 'text-green-400',
    iconBorder: 'border-green-500/10',
    glowColor: 'hover:shadow-[0_0_30px_rgba(34,197,94,0.15)]',
    badgeColor: 'border-green-500/20 bg-green-500/10 text-green-400 shadow-green-500/10 ring-green-500/5',
    dropBorder: 'ring-green-500/40 bg-green-500/5 shadow-[0_0_40px_rgba(34,197,94,0.2)]',
    fadeColor: 'from-transparent via-transparent to-[rgba(5,20,10,0.85)]',
  },
};

// ✅ 3 cards × ~160px per card + 2 gaps × 20px = ~520px
const SCROLL_MAX_HEIGHT = 'max-h-[520px]';
// ✅ Empty state gets a fixed height so column doesn't collapse
const EMPTY_HEIGHT = 'min-h-[300px]';

export default function Column({ id, tasks }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  const config = columnConfig[id];
  const isEmpty = tasks.length === 0;
  const hasOverflow = tasks.length > 3; // ✅ show fade only when scrollable

  const draggableIds = tasks.filter((t) => !t.pending).map((t) => t.id);

  return (
    <div
      ref={setNodeRef}
      className={`glass noise relative rounded-[36px] p-6 ring-gradient shadow-soft flex flex-col transition-all duration-500 ${config.glowColor} hover:border-white/20 ${
        isOver ? `ring-2 scale-[1.02] ${config.dropBorder}` : ''
      }`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between mb-6 px-1">
        <div className="flex items-center gap-4">
          <div
            className={`grid h-11 w-11 place-items-center rounded-2xl border ${config.iconBorder} ${config.iconBg} ${config.iconColor} shadow-inner transition-transform hover:scale-110`}
          >
            {config.icon}
          </div>
          <div>
            <h3 className="font-display text-lg font-bold tracking-tight">
              {config.title}
            </h3>
          </div>
        </div>

        <div
          className={`flex h-8 min-w-[32px] items-center justify-center rounded-full border px-2.5 text-xs font-black shadow-xl ring-1 transition-all hover:scale-110 ${config.badgeColor}`}
        >
          {tasks.length}
        </div>
      </div>

      {/* ✅ Scroll Container — relative wrapper for fade overlay */}
      <div className="relative">

        {/* ✅ Fade gradient at bottom — only visible when there are >3 tasks */}
        {hasOverflow && (
          <div
            className={`pointer-events-none absolute bottom-0 left-0 right-0 h-16 z-10 bg-gradient-to-b ${config.fadeColor} rounded-b-[20px]`}
          />
        )}

        {/* ✅ Scrollable task list — capped to show exactly ~3 cards */}
        <div
          className={`
            ${SCROLL_MAX_HEIGHT}
            ${isEmpty ? EMPTY_HEIGHT : ''}
            overflow-y-auto
            pr-1
            space-y-4
            scrollbar-thin
            scrollbar-thumb-white/10
            scrollbar-track-transparent
            hover:scrollbar-thumb-white/20
            scroll-smooth
          `}
          style={{
            scrollbarWidth: 'thin',          /* Firefox */
            scrollbarColor: 'rgba(255,255,255,0.1) transparent',
          }}
        >
          <SortableContext items={draggableIds} strategy={verticalListSortingStrategy}>
            {isEmpty ? (
              <div
                className={`flex flex-col items-center justify-center rounded-[28px] border-2 border-dashed py-16 px-6 text-center transition-all group/empty h-full ${
                  isOver
                    ? 'border-white/20 bg-white/5 scale-[1.01]'
                    : 'border-white/5 bg-black/10 hover:bg-black/20 hover:border-white/10'
                }`}
              >
                <div className={`${config.iconColor} transition-transform group-hover/empty:scale-110`}>
                  {config.emptyIcon}
                </div>
                <p className="text-sm font-bold text-muted-foreground/50 tracking-wide">
                  {isOver ? 'Drop here' : config.emptyLabel}
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground/30">
                  {isOver ? '' : config.emptyHint}
                </p>
              </div>
            ) : (
              // ✅ Extra bottom padding so last card isn't hidden under fade
              <div className={`space-y-4 ${hasOverflow ? 'pb-10' : 'pb-1'}`}>
                {tasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            )}
          </SortableContext>
        </div>

        {/* ✅ "Scroll to see more" hint — only shows when overflow exists */}
        {hasOverflow && (
          <div className="mt-3 flex items-center justify-center gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30">
              scroll for more
            </span>
            <svg
              className="h-3 w-3 text-muted-foreground/30 animate-bounce"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}
