import { memo, useCallback, useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS }         from "@dnd-kit/utilities";
import {
  GripVertical, Trash2, Clock,
  CalendarDays, MessageCircle,
} from "lucide-react";
import { useBoardStore }         from "@/state/boardStore";
import { useToast }              from "@/hooks/use-toast";
import TaskDetailPanel           from "@/components/Board/TaskDetailPanel";
import { PRIORITY_COLORS_LIGHT } from "@/constants/priority";

// ── Real timestamp formatter ──────────────────────────────────────────────────
function formatDateTime(ts) {
  if (!ts) return null;
  return new Intl.DateTimeFormat("en-IN", {
    day:    "numeric",
    month:  "short",
    hour:   "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(ts));
}

// ── TaskCard ──────────────────────────────────────────────────────────────────
const TaskCard = memo(function TaskCard({ task, isOverlay = false }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task.id, data: { type: "Task", task } });

  const deleteTask = useBoardStore(s => s.deleteTask);
  const { toast }  = useToast();

  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const style = {
    transform:  CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : task.pending ? 0.7 : 1,
  };

  const handleDelete = useCallback(async (e) => {
    e.stopPropagation();
    e.preventDefault();
    const res = await deleteTask(task.id);
    if (res?.ok) {
      toast({ title: "Task deleted", description: "The task has been removed." });
    } else {
      toast({ variant: "destructive", title: "Failed to delete", description: res?.error || "Something went wrong." });
    }
  }, [task.id, deleteTask, toast]);

  const handleCardClick = useCallback(() => {
    if (!isDragging) setIsPanelOpen(true);
  }, [isDragging]);

  const priorityKey   = task.priority
    ? task.priority.charAt(0).toUpperCase() + task.priority.slice(1).toLowerCase()
    : "";
  const priorityClass = PRIORITY_COLORS_LIGHT[priorityKey] ||
    PRIORITY_COLORS_LIGHT[task.priority] ||
    "text-gray-500 bg-gray-100 border-gray-200";

  const isUpdated    = task.updatedAt && task.updatedAt !== task.createdAt;
  const displayTs    = task.updatedAt || task.createdAt;
  const displayLabel = isUpdated ? "Updated" : "Added";

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        onClick={handleCardClick}
        className={`bg-white p-3 md:p-4 rounded-2xl border transition-all cursor-pointer group relative ${
          isOverlay
            ? "border-[#5243F0] shadow-[0_8px_32px_rgba(82,67,240,0.2)] rotate-2 scale-105"
            : "border-[#E4E6EF] shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:border-[#C7C9DE]"
        } ${isDragging ? "scale-105 rotate-2 shadow-xl cursor-grabbing" : ""} ${
          task.pending ? "opacity-60" : ""
        }`}
      >
        {/* Optimistic sync overlay */}
        {task.pending && (
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-100/60 to-transparent animate-pulse pointer-events-none" />
        )}

        {/* Top row: drag handle + content + delete */}
        <div className="flex items-start gap-2 relative z-10">

          {/* Drag handle — listeners isolated here, NOT on whole card */}
          <button
            {...attributes}
            {...listeners}
            onClick={e => e.stopPropagation()}
            aria-label="Drag task"
            className="mt-1 cursor-grab active:cursor-grabbing text-[#C7C9DE] hover:text-[#5243F0] transition-all touch-none p-1 rounded hover:bg-[#5243F0]/8 shrink-0"
          >
            <GripVertical className="h-4 w-4" />
          </button>

          <div className="flex-1 min-w-0">
            <span className={`inline-block px-2 md:px-3 py-0.5 rounded-full text-[10px] md:text-[11px] font-bold uppercase tracking-wide mb-2 border ${priorityClass}`}>
              {task.priority}
            </span>

            {/* Title */}
            <h3 className="text-[13px] md:text-[15px] font-bold text-[#1B1C22] group-hover:text-[#5243F0] mb-1.5 leading-snug line-clamp-2 transition-colors">
              {task.title}
            </h3>

            {/* Description */}
            {task.description && (
              <p className="text-[12px] md:text-[13px] text-[#8E92A4] mb-3 leading-relaxed line-clamp-2">
                {task.description}
              </p>
            )}

            <div className="flex items-center flex-wrap gap-1.5">
              {task.assignee?.name && (
                <span className="text-[10px] font-bold text-[#8E92A4] bg-[#F4F5F7] px-2.5 py-1 rounded-lg border border-[#E4E6EF]">
                  👤 {task.assignee.name}
                </span>
              )}
              {task.dueDate && (
                <span className="text-[10px] font-bold text-[#8E92A4] bg-[#F4F5F7] px-2.5 py-1 rounded-lg border border-[#E4E6EF] flex items-center gap-1">
                  <CalendarDays className="h-3 w-3" />
                  {new Date(task.dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                </span>
              )}
              {task.pending && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#8E92A4] bg-[#F4F5F7] px-2.5 py-1 rounded-lg border border-[#E4E6EF]">
                  <Clock className="h-3 w-3 animate-pulse" /> Syncing…
                </span>
              )}
            </div>
          </div>

          {/* Delete — onPointerDown stops DnD from intercepting */}
          <button
            onClick={handleDelete}
            onPointerDown={e => e.stopPropagation()}
            aria-label="Delete task"
            className="
              shrink-0 rounded-xl border border-[#E4E6EF] bg-[#F4F5F7] p-2
              text-[#B0B4C8] transition-all
              hover:bg-red-500 hover:text-white hover:border-red-500
              hover:shadow-lg hover:shadow-red-500/20 hover:scale-110 active:scale-95
              md:opacity-0 md:group-hover:opacity-100
            "
          >
            <Trash2 className="h-3.5 w-3.5 stroke-[2.5]" />
          </button>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2.5 mt-2.5 border-t border-[#F4F5F7] relative z-10">
          <div className="flex items-center gap-2">
            {task.assignee?.name && (
              <div
                className="w-6 h-6 rounded-full bg-[#5243F0]/10 text-[#5243F0] text-[10px] font-bold grid place-items-center border border-[#5243F0]/20"
                title={task.assignee.name}
              >
                {task.assignee.name[0].toUpperCase()}
              </div>
            )}
            {task.comments !== undefined && (
              <div className="flex items-center gap-1 text-[#B0B4C8] hover:text-[#8E92A4] transition-colors">
                <MessageCircle className="w-3.5 h-3.5 opacity-70" />
                <span className="text-[11px] font-bold">{task.comments}</span>
              </div>
            )}
          </div>
          {displayTs && (
            <div className="hidden sm:flex items-center gap-1 text-[10px] font-bold text-[#B0B4C8]">
              <CalendarDays className="h-3 w-3 shrink-0" />
              <span className="text-[#8E92A4]">{displayLabel}</span>
              <span>{formatDateTime(displayTs)}</span>
            </div>
          )}
        </div>
      </div>

      {/* TaskDetailPanel — self-contained, opens on card click */}
      <TaskDetailPanel
        task={task}
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
      />
    </>
  );
});

export default TaskCard;
