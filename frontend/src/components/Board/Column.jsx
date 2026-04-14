import { memo, useState, useCallback, useRef, useEffect } from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Plus, X, ChevronDown, Check } from "lucide-react";
import TaskCard   from "./TaskCard";
import { useBoardStore }          from "@/state/boardStore";
import { PRIORITY_LABELS, PRIORITY_COLORS_LIGHT } from "@/constants/priority";

// ── Priority dot colors ───────────────────────────────────────────────────────
const PRIORITY_DOT = {
  Low:       "#10B981",
  Medium:    "#F59E0B",
  High:      "#F97316",
  Critical:  "#EF4444",
  Important: "#8B5CF6",
};

// ── Column visual config ──────────────────────────────────────────────────────
const COLUMN_CONFIG = {
  todo: {
    title:      "To Do",
    headerBg:   "bg-blue-500",
    textColor:  "text-blue-600",
    glowColor:  "hover:shadow-[0_4px_24px_rgba(59,130,246,0.12)]",
    dropBorder: "ring-2 ring-blue-400/40 bg-blue-50/60",
    emptyLabel: "No tasks yet",
    emptyHint:  "Add your first task to get started",
  },
  inprogress: {
    title:      "In Progress",
    headerBg:   "bg-amber-500",
    textColor:  "text-amber-600",
    glowColor:  "hover:shadow-[0_4px_24px_rgba(245,158,11,0.12)]",
    dropBorder: "ring-2 ring-amber-400/40 bg-amber-50/60",
    emptyLabel: "Nothing in progress",
    emptyHint:  "Drag a task here or add a new one",
  },
  review: {
    title:      "Review",
    headerBg:   "bg-purple-500",
    textColor:  "text-purple-600",
    glowColor:  "hover:shadow-[0_4px_24px_rgba(168,85,247,0.12)]",
    dropBorder: "ring-2 ring-purple-400/40 bg-purple-50/60",
    emptyLabel: "No tasks in review",
    emptyHint:  "Move tasks here for review",
  },
  done: {
    title:      "Done",
    headerBg:   "bg-green-500",
    textColor:  "text-green-600",
    glowColor:  "hover:shadow-[0_4px_24px_rgba(34,197,94,0.12)]",
    dropBorder: "ring-2 ring-green-400/40 bg-green-50/60",
    emptyLabel: "Nothing completed yet",
    emptyHint:  "Finished tasks will appear here",
  },
};

// ── Priority Picker ───────────────────────────────────────────────────────────
function PriorityPicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const colorClass = PRIORITY_COLORS_LIGHT[value] || "text-gray-500 bg-gray-100";
  const dot        = PRIORITY_DOT[value]           || "#8E92A4";

  return (
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border border-transparent transition-all hover:opacity-90 active:scale-95 ${colorClass}`}
      >
        <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: dot }} />
        {value}
        <ChevronDown
          className={`h-3 w-3 opacity-60 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1.5 z-50 w-40 bg-white border border-[#E4E6EF] rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.10)] overflow-hidden">
          {PRIORITY_LABELS.map(p => {
            const cls = PRIORITY_COLORS_LIGHT[p] || "text-gray-500 bg-gray-100";
            const d   = PRIORITY_DOT[p]           || "#8E92A4";
            const sel = value === p;
            return (
              <button
                key={p}
                type="button"
                onClick={() => { onChange(p); setOpen(false); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-medium transition-colors ${
                  sel ? `${cls} font-semibold` : "text-[#1B1C22] hover:bg-[#F4F5F7]"
                }`}
              >
                <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: d }} />
                <span className="flex-1 text-left">{p}</span>
                {sel && <Check className="h-3 w-3 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Column ────────────────────────────────────────────────────────────────────
const Column = memo(function Column({ id, tasks }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  const addTask = useBoardStore(s => s.addTask);

  const config = COLUMN_CONFIG[id];
  if (!config) return null;

  const [isAdding,    setIsAdding]    = useState(false);
  const [newTitle,    setNewTitle]    = useState("");
  const [newDesc,     setNewDesc]     = useState("");
  const [newPriority, setNewPriority] = useState("Medium");
  const [submitting,  setSubmitting]  = useState(false);

  const titleRef = useRef(null);

  // Reset and close form
  const resetForm = useCallback(() => {
    setIsAdding(false);
    setNewTitle("");
    setNewDesc("");
    setNewPriority("Medium");
    setSubmitting(false);
  }, []);

  // Open form and auto-focus title
  const openForm = useCallback(() => {
    setIsAdding(true);
    setTimeout(() => titleRef.current?.focus(), 50);
  }, []);

  // Submit — real data to boardStore → MongoDB
  const handleAddTask = useCallback(async (e) => {
    e.preventDefault();
    const trimmed = newTitle.trim();
    if (!trimmed || submitting) return;

    setSubmitting(true);
    await addTask(trimmed, newPriority, {
      column:      id,
      description: newDesc.trim() || "",
    });
    // resetForm also clears submitting
    resetForm();
  }, [newTitle, newDesc, newPriority, submitting, addTask, id, resetForm]);

  // Escape key closes the inline form
  useEffect(() => {
    if (!isAdding) return;
    function handler(e) { if (e.key === "Escape") resetForm(); }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isAdding, resetForm]);

  const sortableIds = tasks.filter(t => !t.pending).map(t => t.id);
  const isEmpty     = tasks.length === 0;
  const hasOverflow = tasks.length > 5;

  return (
    <div
      className={`relative rounded-2xl border border-[#E4E6EF] flex flex-col
        h-[560px] md:h-[640px] overflow-hidden transition-all duration-300
        ${config.glowColor}
        ${isOver ? config.dropBorder : "bg-[#F4F5F7]"}`}
    >

      {/* ── Column Header ── */}
      <div className={`flex items-center justify-between px-4 md:px-5 py-3 md:py-4 flex-shrink-0 ${config.headerBg}`}>
        <div className="flex items-center gap-2 md:gap-3">
          {/* Live count badge — real tasks.length, never cached */}
          <div className={`w-7 h-7 rounded-full bg-white flex items-center justify-center font-bold text-[12px] ${config.textColor}`}>
            {tasks.length}
          </div>
          <h2 className="font-semibold text-[13px] md:text-[15px] text-white">
            {config.title}
          </h2>
        </div>
        <button
          onClick={openForm}
          aria-label={`Add task to ${config.title}`}
          className="w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center text-white hover:bg-white/20 active:scale-95 transition-all"
        >
          <Plus className="w-4 md:w-5 h-4 md:h-5" />
        </button>
      </div>

      {/* ── Scrollable Task Area ── */}
      <div
        ref={setNodeRef}
        className="flex-1 overflow-y-auto px-3 md:px-4 py-3 md:py-4 space-y-2 md:space-y-3"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >

        {/* ── Inline Add Task Form ── */}
        {isAdding && (
          <form
            onSubmit={handleAddTask}
            className="bg-white p-3 md:p-4 rounded-2xl border border-[#5243F0]/40 shadow-[0_4px_16px_rgba(82,67,240,0.10)]"
          >
            {/* Title */}
            <input
              ref={titleRef}
              type="text"
              placeholder="Task title…"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              maxLength={120}
              className="w-full text-[13px] md:text-[15px] font-bold text-[#1B1C22] mb-3 outline-none bg-transparent placeholder:text-[#B0B4C8]"
            />

            {/* Description */}
            <textarea
              placeholder="Description (optional)"
              value={newDesc}
              onChange={e => setNewDesc(e.target.value)}
              rows={2}
              maxLength={500}
              className="w-full text-[12px] md:text-[13px] text-[#8E92A4] mb-3 outline-none resize-none bg-transparent placeholder:text-[#C7C9DE] border-b border-[#E4E6EF] pb-2"
            />

            {/* Priority */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#B0B4C8]">
                Priority
              </span>
              <PriorityPicker value={newPriority} onChange={setNewPriority} />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
              <p className="text-[10px] text-[#C7C9DE]">
                <kbd className="px-1 py-0.5 rounded bg-[#F4F5F7] text-[#B0B4C8] font-bold text-[9px]">Esc</kbd> to cancel
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-3 py-1 text-xs font-semibold text-[#8E92A4] hover:bg-[#F4F5F7] rounded-lg flex items-center gap-1 transition-colors"
                >
                  <X className="w-3 h-3" /> Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newTitle.trim() || submitting}
                  className="px-3 py-1 text-xs font-semibold bg-[#5243F0] hover:bg-[#4537D6] disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg transition-all active:scale-95"
                >
                  {submitting ? "Adding…" : "Add Task"}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* ── Empty State ── */}
        {isEmpty && !isAdding && (
          <div
            className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed py-12 px-6 text-center h-full transition-all ${
              isOver
                ? "border-[#5243F0]/40 bg-[#5243F0]/5"
                : "border-[#E4E6EF] bg-transparent"
            }`}
          >
            <p className="text-sm font-bold text-[#B0B4C8]">
              {isOver ? "Drop here ↓" : config.emptyLabel}
            </p>
            {!isOver && (
              <>
                <p className="mt-1 text-xs text-[#C7C9DE]">{config.emptyHint}</p>
                <button
                  onClick={openForm}
                  className="mt-4 px-6 py-3 bg-white border border-[#E4E6EF] text-[#8E92A4] rounded-xl text-sm font-semibold hover:bg-[#F4F5F7] hover:text-[#1B1C22] transition-all shadow-sm w-full active:scale-95"
                >
                  + Add Task
                </button>
              </>
            )}
          </div>
        )}

        {/* ── Task Cards ── */}
        <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
          <div className={`space-y-2 md:space-y-3 ${hasOverflow ? "pb-8" : "pb-1"}`}>
            {tasks.map(task => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        </SortableContext>

        {hasOverflow && (
          <p className="text-center text-[10px] font-bold uppercase tracking-widest text-[#C7C9DE] pt-1 pb-2">
            ↓ scroll for more
          </p>
        )}
      </div>
    </div>
  );
});

export default Column;
