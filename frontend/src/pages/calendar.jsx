import { useState, useMemo, useCallback } from "react";
import AppLayout         from "@/components/Layout/AppLayout";
import { useBoardStore } from "@/state/boardStore";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";

const DAYS    = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
const MONTHS  = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

// Priority → event pill color
const PRIORITY_PILL = {
  Critical:  "bg-red-50    text-red-600    border-red-200",
  Important: "bg-purple-50 text-purple-600 border-purple-200",
  High:      "bg-orange-50 text-orange-600 border-orange-200",
  Medium:    "bg-amber-50  text-amber-600  border-amber-200",
  Low:       "bg-blue-50   text-blue-600   border-blue-200",
};

export default function CalendarPage() {
  const { tasks } = useBoardStore();

  const today  = new Date();
  const [year,  setYear]  = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  // ── Navigate months ───────────────────────────────────────────────────────
  const goToPrev = useCallback(() => {
    setMonth(m => { if (m === 0) { setYear(y => y - 1); return 11; } return m - 1; });
  }, []);

  const goToNext = useCallback(() => {
    setMonth(m => { if (m === 11) { setYear(y => y + 1); return 0; } return m + 1; });
  }, []);

  const goToToday = useCallback(() => {
    setYear(today.getFullYear());
    setMonth(today.getMonth());
  }, []);

  // ── Build calendar grid ───────────────────────────────────────────────────
  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    // Get day-of-week offset (Mon=0 ... Sun=6)
    const startOffset = (firstDay.getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrev  = new Date(year, month, 0).getDate();

    const cells = [];

    // Previous month tail
    for (let i = startOffset - 1; i >= 0; i--) {
      cells.push({
        date:           new Date(year, month - 1, daysInPrev - i),
        isCurrentMonth: false,
      });
    }
    // Current month
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({ date: new Date(year, month, d), isCurrentMonth: true });
    }
    // Next month head — fill to complete 5 rows (35 cells)
    const remaining = 35 - cells.length;
    for (let d = 1; d <= remaining; d++) {
      cells.push({ date: new Date(year, month + 1, d), isCurrentMonth: false });
    }
    return cells;
  }, [year, month]);

  // ── Map real tasks to their dueDate calendar day ──────────────────────────
  // Only tasks with a dueDate appear on the calendar
  const tasksByDate = useMemo(() => {
    const map = {};
    tasks.forEach(t => {
      if (!t.dueDate) return;
      const d   = new Date(t.dueDate);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      if (!map[key]) map[key] = [];
      map[key].push(t);
    });
    return map;
  }, [tasks]);

  function dateKey(date) {
    return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  }

  function isToday(date) {
    return (
      date.getDate()     === today.getDate()     &&
      date.getMonth()    === today.getMonth()    &&
      date.getFullYear() === today.getFullYear()
    );
  }

  return (
    <AppLayout>
      <div className="pt-0 pb-6">
        <div className="px-6 pt-4 flex flex-col" style={{ minHeight: "calc(100vh - 80px)" }}>

          <div className="flex-1 rounded-2xl border border-[#E4E6EF] bg-white shadow-sm p-5 flex flex-col">

            {/* ── Header ── */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-3">
              <div>
                <h2 className="text-2xl font-bold text-[#1B1C22] tracking-tight">
                  {MONTHS[month]} {year}
                </h2>
                <p className="text-xs text-[#8E92A4] mt-0.5">
                  {tasks.filter(t => t.dueDate).length} tasks with due dates
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={goToPrev}
                  className="p-2 rounded-xl bg-[#F4F5F7] border border-[#E4E6EF] hover:bg-[#E4E6EF] transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 text-[#8E92A4]" />
                </button>
                <button
                  onClick={goToToday}
                  className="px-4 py-2 rounded-xl bg-[#F4F5F7] border border-[#E4E6EF] text-sm font-semibold text-[#1B1C22] hover:bg-[#E4E6EF] transition-colors"
                >
                  Today
                </button>
                <button
                  onClick={goToNext}
                  className="p-2 rounded-xl bg-[#F4F5F7] border border-[#E4E6EF] hover:bg-[#E4E6EF] transition-colors"
                >
                  <ChevronRight className="w-4 h-4 text-[#8E92A4]" />
                </button>
              </div>
            </div>

            {/* ── Calendar grid ── */}
            <div className="flex-1 flex flex-col border border-[#E4E6EF] rounded-2xl overflow-hidden">

              {/* Day headers */}
              <div className="grid grid-cols-7 bg-[#F4F5F7] border-b border-[#E4E6EF]">
                {DAYS.map(day => (
                  <div
                    key={day}
                    className="py-3 text-[10px] font-bold text-[#8E92A4] text-center tracking-widest uppercase"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Day cells */}
              <div className="grid grid-cols-7 flex-1 bg-[#E4E6EF] gap-px">
                {calendarDays.map(({ date, isCurrentMonth }, i) => {
                  const todayCell  = isToday(date);
                  const dayTasks   = tasksByDate[dateKey(date)] || [];
                  const hasTasks   = dayTasks.length > 0;

                  return (
                    <div
                      key={i}
                      className={`bg-white p-2 md:p-3 min-h-[90px] md:min-h-[110px] transition-colors ${
                        isCurrentMonth
                          ? hasTasks
                            ? "hover:bg-[#F4F5F7]"
                            : "hover:bg-[#F9FAFB]"
                          : "bg-[#FAFAFA]"
                      }`}
                    >
                      {/* Day number */}
                      <div className="flex justify-end mb-1.5">
                        <span className={`text-[13px] font-bold w-7 h-7 flex items-center justify-center rounded-full transition-colors ${
                          todayCell
                            ? "bg-[#5243F0] text-white shadow-sm"
                            : isCurrentMonth
                              ? "text-[#1B1C22]"
                              : "text-[#C7C9DE]"
                        }`}>
                          {date.getDate()}
                        </span>
                      </div>

                      {/* Real task pills — from task.dueDate */}
                      <div className="space-y-1">
                        {dayTasks.slice(0, 2).map(task => (
                          <div
                            key={task.id}
                            title={task.title}
                            className={`text-[10px] md:text-[11px] px-1.5 py-0.5 rounded-lg font-semibold truncate border cursor-pointer transition-opacity hover:opacity-80 ${
                              PRIORITY_PILL[task.priority] || "bg-[#F4F5F7] text-[#8E92A4] border-[#E4E6EF]"
                            }`}
                          >
                            {task.title}
                          </div>
                        ))}
                        {/* Overflow indicator */}
                        {dayTasks.length > 2 && (
                          <div className="text-[9px] font-bold text-[#8E92A4] pl-1">
                            +{dayTasks.length - 2} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── Empty state — no tasks have due dates ── */}
            {tasks.length > 0 && tasks.every(t => !t.dueDate) && (
              <div className="mt-4 flex items-center gap-2 text-[#8E92A4] text-sm bg-[#F4F5F7] rounded-xl px-4 py-3 border border-[#E4E6EF]">
                <CalendarDays className="h-4 w-4 shrink-0" />
                <span>No tasks have due dates set. Add due dates in task details to see them here.</span>
              </div>
            )}

          </div>
        </div>
      </div>
    </AppLayout>
  );
}
