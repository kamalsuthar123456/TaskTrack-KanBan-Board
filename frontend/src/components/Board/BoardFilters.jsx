import { useState, useCallback, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

// ── Tab definitions — keys match BoardPage getFilteredTasks() switch ─────────
const TABS = [
  { key: "total",      label: "All Tasks"    },
  { key: "inprogress", label: "In Progress"  },
  { key: "due",        label: "Due / Urgent" },
  { key: "completed",  label: "Completed"    },
];

const SORT_OPTIONS = ["Newest", "Oldest", "Priority", "Alphabetical"];

export default function BoardFilters({
  activeTab,      
  setActiveTab,   
  onSortChange,   
  taskCounts,
}) {
  const [sort,     setSort]     = useState("Newest");
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef(null);

  // ── Close sort dropdown on outside click ─────────────────────────────────
  useEffect(() => {
    if (!sortOpen) return;
    function handler(e) {
      if (sortRef.current && !sortRef.current.contains(e.target)) setSortOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [sortOpen]);

  const handleSort = useCallback((option) => {
    setSort(option);
    setSortOpen(false);
    onSortChange?.(option);
  }, [onSortChange]);

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-[#E4E6EF] bg-white px-6 gap-2 md:gap-0">

      {/* ── Tabs ── */}
      <div className="flex items-center gap-4 md:gap-8 overflow-x-auto w-full md:w-auto hide-scrollbar">
        {TABS.map(tab => {
          const isActive = activeTab === tab.key;
          const count = taskCounts?.[tab.key];

          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`relative flex items-center gap-1.5 py-3 md:py-4 text-[13px] md:text-[14px] font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
                isActive
                  ? "text-[#5243F0] font-semibold"
                  : "text-[#8E92A4] hover:text-[#1B1C22]"
              }`}
            >
              {tab.label}

              {count !== undefined && (
                <span className={`text-[10px] py-0.5 px-2 rounded-full font-bold transition-colors ${
                  isActive
                    ? "bg-[#5243F0]/10 text-[#5243F0]"
                    : "bg-[#F4F5F7] text-[#8E92A4]"
                }`}>
                  {count}
                </span>
              )}

              {/* Active underline indicator */}
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#5243F0] rounded-t-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* ── Sort Dropdown — hidden on mobile ── */}
      <div ref={sortRef} className="hidden md:flex items-center gap-2 text-sm py-4 relative flex-shrink-0">
        <span className="text-[#8E92A4] font-medium text-[13px]">Sort by</span>
        <button
          onClick={() => setSortOpen(p => !p)}
          className="flex items-center gap-1.5 text-[#1B1C22] border border-[#E4E6EF] rounded-xl px-3 py-1.5 hover:bg-[#F4F5F7] transition-colors font-semibold text-[13px]"
        >
          {sort}
          <ChevronDown
            className={`w-3.5 h-3.5 text-[#8E92A4] transition-transform duration-200 ${sortOpen ? "rotate-180" : ""}`}
            strokeWidth={2.5}
          />
        </button>

        {sortOpen && (
          <div className="absolute right-0 top-full mt-1.5 w-44 bg-white border border-[#E4E6EF] rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.10)] z-50 overflow-hidden">
            {SORT_OPTIONS.map(option => {
              const isSelected = sort === option;
              return (
                <button
                  key={option}
                  onClick={() => handleSort(option)}
                  className={`w-full flex items-center justify-between px-4 py-2.5 text-[13px] transition-colors ${
                    isSelected
                      ? "bg-[#5243F0]/8 text-[#5243F0] font-semibold"
                      : "text-[#1B1C22] hover:bg-[#F4F5F7]"
                  }`}
                >
                  {option}
                  {isSelected && <Check className="h-3.5 w-3.5 shrink-0" />}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
