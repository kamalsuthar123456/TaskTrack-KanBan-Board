import { useState, useEffect, useRef, useCallback } from "react";
import {
  X, Calendar, AlignLeft, Trash2,
  MessageSquare, Send, Clock, User,
} from "lucide-react";
import { useBoardStore } from "@/state/boardStore";
import { useToast }      from "@/hooks/use-toast";
import { auth }          from "@/state/auth";
import { PRIORITY_COLORS_LIGHT } from "@/constants/priority";

// ── Constants ─────────────────────────────────────────────────────────────────
const PRIORITIES = ["low", "medium", "high", "critical"];

const COLUMNS = [
  { key: "todo",       label: "To Do"       },
  { key: "inprogress", label: "In Progress" },
  { key: "review",     label: "Review"      },
  { key: "done",       label: "Done"        },
];

const COLUMN_DOT = {
  todo:       "bg-blue-500",
  inprogress: "bg-orange-500",
  review:     "bg-purple-500",
  done:       "bg-green-500",
};

// ── TaskDetailPanel ───────────────────────────────────────────────────────────
export default function TaskDetailPanel({ task, isOpen, onClose }) {
  const { updateTask, deleteTask } = useBoardStore();
  const { toast }                  = useToast();

  const currentUser = auth.getUser();

  const [form,       setForm]       = useState({ ...task, commentsList: task.commentsList || [] });
  const [saving,     setSaving]     = useState(false);
  const [newComment, setNewComment] = useState("");

  const textareaRef    = useRef(null);
  const commentsEndRef = useRef(null);

  useEffect(() => {
    setForm({ ...task, commentsList: task.commentsList || [] });
  }, [task]);

  useEffect(() => {
    function handleEsc(e) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [form.commentsList]);

  const save = useCallback(async (updates) => {
    setSaving(true);
    const res = await updateTask(task.id, updates);
    setSaving(false);
    if (!res?.ok) toast({ variant: "destructive", title: res?.error || "Save failed" });
  }, [task.id, updateTask, toast]);

  async function handleDelete() {
    const res = await deleteTask(task.id);
    if (res?.ok) { toast({ title: "Task deleted" }); onClose(); }
    else toast({ variant: "destructive", title: res?.error || "Delete failed" });
  }

  function handleAddComment(e) {
    e?.preventDefault();
    const text = newComment.trim();
    if (!text) return;

    const timeString  = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const comment     = { id: Date.now(), author: currentUser?.name || "You", text, time: timeString };
    const updatedList = [...(form.commentsList || []), comment];

    setForm(f => ({ ...f, commentsList: updatedList, comments: updatedList.length }));
    updateTask(task.id, { commentsList: updatedList, comments: updatedList.length });

    setNewComment("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") {
      if (e.shiftKey) {
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height =
              Math.min(textareaRef.current.scrollHeight, 120) + "px";
          }
        }, 0);
      } else {
        e.preventDefault();
        handleAddComment();
      }
    }
  }

  const comments = form.commentsList || [];

  if (!isOpen || !task) return null;

  const priorityKey        = form.priority?.toLowerCase() ?? "";
  const priorityBadgeClass = PRIORITY_COLORS_LIGHT[priorityKey] ||
    "bg-[#F4F5F7] text-[#8E92A4] border-[#E4E6EF]";

  return (
    <>
      {/* ── Backdrop ── */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* ── Slide-over panel ── */}
      <div
        className={`fixed inset-y-0 right-0 w-full sm:w-[460px] bg-white shadow-2xl z-50
          flex flex-col transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E4E6EF] bg-white shrink-0 sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <h3 className="font-bold text-[#1B1C22] text-sm">Task Details</h3>

            <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase border ${priorityBadgeClass}`}>
              {form.priority}
            </span>

            {saving && (
              <span className="flex items-center gap-1 text-[10px] font-bold text-[#5243F0]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#5243F0] animate-pulse" />
                Saving…
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleDelete}
              className="h-7 w-7 rounded-lg grid place-items-center text-[#B0B4C8] hover:bg-rose-50 hover:text-rose-500 transition-all"
              title="Delete task"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={onClose}
              className="h-7 w-7 rounded-lg grid place-items-center text-[#B0B4C8] hover:bg-[#F4F5F7] hover:text-[#1B1C22] transition-all"
              title="Close (Esc)"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* ── Scrollable content ── */}
        <div className="flex-1 overflow-y-auto flex flex-col" style={{ scrollbarWidth: "none" }}>

          <div className="px-6 pt-5 pb-4 space-y-5">

            {/* Title */}
            <div>
              <label className="text-[10px] uppercase tracking-widest text-[#8E92A4] font-bold block mb-1.5">
                Title
              </label>
              <textarea
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                onBlur={() => save({ title: form.title })}
                rows={2}
                className="w-full bg-[#F4F5F7] border border-[#E4E6EF] rounded-xl px-3 py-2 text-sm text-[#1B1C22] focus:outline-none focus:border-[#5243F0] focus:ring-[3px] focus:ring-[#5243F0]/10 resize-none transition-all"
              />
            </div>

            {/* Status */}
            <div>
              <label className="text-[10px] uppercase tracking-widest text-[#8E92A4] font-bold block mb-1.5">
                Status
              </label>
              <div className="flex flex-wrap gap-1.5">
                {COLUMNS.map(col => (
                  <button
                    key={col.key}
                    onClick={() => { save({ column: col.key }); setForm(f => ({ ...f, column: col.key })); }}
                    className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all ${
                      form.column === col.key
                        ? "bg-[#5243F0] text-white border-[#5243F0] shadow-[0_2px_8px_rgba(82,67,240,0.3)]"
                        : "bg-[#F4F5F7] text-[#8E92A4] border-[#E4E6EF] hover:border-[#5243F0] hover:text-[#5243F0]"
                    }`}
                  >
                    {col.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Priority */}
            <div>
              <label className="text-[10px] uppercase tracking-widest text-[#8E92A4] font-bold block mb-1.5">
                Priority
              </label>
              <div className="flex flex-wrap gap-1.5">
                {PRIORITIES.map(p => {
                  const isSelected = form.priority?.toLowerCase() === p;
                  const activeClass = PRIORITY_COLORS_LIGHT[p] || "bg-[#F4F5F7] text-[#8E92A4] border-[#E4E6EF]";
                  return (
                    <button
                      key={p}
                      onClick={() => { save({ priority: p }); setForm(f => ({ ...f, priority: p })); }}
                      className={`px-3 py-1 rounded-lg text-xs font-bold border capitalize transition-all ${
                        isSelected
                          ? activeClass
                          : "bg-[#F4F5F7] text-[#8E92A4] border-[#E4E6EF] hover:border-[#C7C9DE]"
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-[10px] uppercase tracking-widest text-[#8E92A4] font-bold flex items-center gap-1.5 mb-1.5">
                <AlignLeft className="h-3 w-3" /> Description
              </label>
              <textarea
                value={form.description || ""}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                onBlur={() => save({ description: form.description })}
                rows={4}
                placeholder="Add a description..."
                className="w-full bg-[#F4F5F7] border border-[#E4E6EF] rounded-xl px-3 py-2 text-sm text-[#1B1C22] placeholder:text-[#B0B4C8] focus:outline-none focus:border-[#5243F0] focus:ring-[3px] focus:ring-[#5243F0]/10 resize-none transition-all"
              />
            </div>

            {/* Due Date */}
            <div>
              <label className="text-[10px] uppercase tracking-widest text-[#8E92A4] font-bold flex items-center gap-1.5 mb-1.5">
                <Calendar className="h-3 w-3" /> Due Date
              </label>
              <input
                type="date"
                value={form.dueDate ? form.dueDate.split("T")[0] : ""}
                onChange={e => {
                  const val = e.target.value;
                  setForm(f => ({ ...f, dueDate: val }));
                  save({ dueDate: val });
                }}
                className="w-full h-9 px-3 rounded-xl bg-[#F4F5F7] border border-[#E4E6EF] text-sm text-[#1B1C22] focus:outline-none focus:border-[#5243F0] focus:ring-[3px] focus:ring-[#5243F0]/10 transition-all"
              />
            </div>

            {/* Assignee + Status */}
            <div className="grid grid-cols-2 gap-4 pt-1">
              <div>
                <div className="flex items-center gap-1.5 text-[#8E92A4] mb-2">
                  <User className="h-3.5 w-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Assignee</span>
                </div>
                <p className="text-sm font-semibold text-[#1B1C22]">
                  {task.assignee?.name || "Unassigned"}
                </p>
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-[#8E92A4] mb-2">
                  <Clock className="h-3.5 w-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Status</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${COLUMN_DOT[form.column] || "bg-gray-400"}`} />
                  <p className="text-sm font-semibold text-[#1B1C22] capitalize">
                    {COLUMNS.find(c => c.key === form.column)?.label || form.column}
                  </p>
                </div>
              </div>
            </div>

            {/* Created/Updated metadata */}
            <div className="border-t border-[#E4E6EF] pt-4 space-y-2 text-xs">
              <MetaRow label="Created by" value={task.createdBy?.name || "—"} />
              <MetaRow label="Created"    value={task.createdAt ? new Date(task.createdAt).toLocaleDateString("en-GB") : "—"} />
              <MetaRow label="Updated"    value={task.updatedAt ? new Date(task.updatedAt).toLocaleDateString("en-GB") : "—"} />
            </div>
          </div>

          <div className="h-2 bg-[#F4F5F7] w-full shrink-0" />

          {/* ── Comments / Discussion ── */}
          <div className="flex-1 flex flex-col px-6 py-5 bg-white">
            <div className="flex items-center gap-2 mb-5 shrink-0">
              <MessageSquare className="h-4 w-4 text-[#5243F0]" />
              <h3 className="text-sm font-bold text-[#1B1C22]">Discussion</h3>
              <span className="bg-[#F4F5F7] text-[#8E92A4] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#E4E6EF]">
                {comments.length}
              </span>
            </div>

            {comments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-[#C7C9DE]">
                <MessageSquare className="h-8 w-8 mb-2 opacity-40" />
                <p className="text-xs font-semibold text-[#B0B4C8]">No comments yet</p>
                <p className="text-[11px] text-[#C7C9DE] mt-0.5">Be the first to leave a comment</p>
              </div>
            ) : (
              <div className="flex-1 space-y-5 overflow-y-auto pb-2" style={{ scrollbarWidth: "none" }}>
                {comments.map((comment, index) => {
                  const isMe       = comment.author === currentUser?.name;
                  const showAvatar = index === comments.length - 1 ||
                    comments[index + 1]?.author !== comment.author;
                  const showName   = index === 0 ||
                    comments[index - 1]?.author !== comment.author;

                  return (
                    <div key={comment.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                      <div className={`flex gap-2.5 max-w-[85%] ${isMe ? "flex-row-reverse" : ""}`}>
                        <div className="flex-shrink-0 w-7 flex flex-col justify-end pb-1">
                          {showAvatar ? (
                            <div className={`w-7 h-7 rounded-full grid place-items-center text-[11px] font-bold shrink-0 ${
                              isMe
                                ? "bg-[#5243F0] text-white"
                                : "bg-[#F4F5F7] text-[#8E92A4] border border-[#E4E6EF]"
                            }`}>
                              {comment.author?.[0]?.toUpperCase() ?? "?"}
                            </div>
                          ) : (
                            <div className="w-7 h-7" />
                          )}
                        </div>
                        <div className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                          {showName && (
                            <span className="text-[11px] font-medium text-[#B0B4C8] mb-1 mx-1">
                              {isMe ? "You" : comment.author}
                            </span>
                          )}
                          <div className={`px-4 py-2.5 text-[13.5px] leading-relaxed whitespace-pre-wrap break-words ${
                            isMe
                              ? "bg-[#5243F0] text-white rounded-[18px] rounded-br-sm"
                              : "bg-[#F4F5F7] text-[#1B1C22] rounded-[18px] rounded-bl-sm"
                          }`}>
                            {comment.text}
                          </div>
                          {showAvatar && (
                            <span className="text-[10px] text-[#B0B4C8] mt-1 mx-1">{comment.time}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={commentsEndRef} />
              </div>
            )}
          </div>
        </div>

        {/* ── Fixed comment input ── */}
        <div className="px-5 py-4 bg-white border-t border-[#E4E6EF] shrink-0 shadow-[0_-4px_16px_rgba(0,0,0,0.04)]">
          <form onSubmit={handleAddComment} className="flex gap-2.5 items-end">
            <div className="h-8 w-8 rounded-full bg-[#5243F0] grid place-items-center text-white text-xs font-bold shrink-0 mb-1">
              {currentUser?.name?.[0]?.toUpperCase() ?? "U"}
            </div>
            <div className="flex-1 relative flex items-end bg-[#F4F5F7] rounded-2xl border border-transparent focus-within:border-[#5243F0]/30 focus-within:bg-white focus-within:shadow-[0_2px_12px_rgba(82,67,240,0.08)] transition-all overflow-hidden">
              <textarea
                ref={textareaRef}
                value={newComment}
                onChange={e => {
                  setNewComment(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
                }}
                onKeyDown={handleKeyDown}
                placeholder="Add a comment..."
                rows={1}
                className="w-full bg-transparent pl-4 pr-12 py-2.5 text-[13.5px] text-[#1B1C22] placeholder:text-[#B0B4C8] focus:outline-none resize-none min-h-[42px]"
                style={{ scrollbarWidth: "none" }}
              />
              <button
                type="submit"
                disabled={!newComment.trim()}
                className="absolute right-2 bottom-2 w-8 h-8 bg-[#5243F0] text-white rounded-full grid place-items-center hover:bg-[#4537D6] transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
              >
                <Send className="h-3.5 w-3.5 ml-0.5" />
              </button>
            </div>
          </form>
          <p className="text-center text-[10px] text-[#C7C9DE] mt-2">
            <kbd className="px-1 py-0.5 rounded text-[#B0B4C8] font-bold">Enter</kbd> to send ·{" "}
            <kbd className="px-1 py-0.5 rounded text-[#B0B4C8] font-bold">Shift+Enter</kbd> for new line
          </p>
        </div>

      </div>
    </>
  );
}

// ── Metadata row helper ───────────────────────────────────────────────────────
function MetaRow({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[#8E92A4]">{label}</span>
      <span className="text-[#1B1C22] font-medium">{value}</span>
    </div>
  );
}
