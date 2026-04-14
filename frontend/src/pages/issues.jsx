import { useMemo, useState } from "react";
import AppLayout         from "@/components/Layout/AppLayout";
import { useBoardStore } from "@/state/boardStore";
import {
  AlertCircle, AlertTriangle, CheckCircle2,
  MessageSquare, Filter, Search, X,
} from "lucide-react";

const PRIORITY_BADGE = {
  Critical:  "bg-red-100    text-red-700    border border-red-200",
  Important: "bg-purple-50  text-purple-600 border border-purple-200",
  High:      "bg-orange-50  text-orange-600 border border-orange-200",
  Medium:    "bg-blue-50    text-blue-600   border border-blue-200",
  Low:       "bg-gray-100   text-gray-600   border border-gray-200",
};

const STATUS_BADGE = {
  todo:       "bg-gray-100   text-gray-600   border border-gray-200",
  inprogress: "bg-indigo-50  text-indigo-600 border border-indigo-200",
  review:     "bg-purple-50  text-purple-600 border border-purple-200",
  done:       "bg-green-50   text-green-600  border border-green-200",
};

const STATUS_LABEL = {
  todo:       "OPEN",
  inprogress: "IN PROGRESS",
  review:     "IN REVIEW",
  done:       "CLOSED",
};

// Icon per column
function IssueIcon({ column }) {
  if (column === "done")
    return <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" strokeWidth={2.5} />;
  if (column === "inprogress" || column === "review")
    return <AlertTriangle className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" strokeWidth={2.5} />;
  return <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" strokeWidth={2.5} />;
}

// Relative time
function timeAgo(ts) {
  if (!ts) return "";
  const diff = Date.now() - new Date(ts).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (m < 1)  return "just now";
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  if (d < 7)  return `${d}d ago`;
  return new Date(ts).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export default function IssuesPage() {
  const { tasks, currentProject } = useBoardStore();

  const [search,     setSearch]     = useState("");
  const [statusTab,  setStatusTab]  = useState("open");
  const [filterPri,  setFilterPri]  = useState("all");
  const [showFilter, setShowFilter] = useState(false);

  // ── Map real tasks to issues format ───────────────────────────────────────
  const allIssues = useMemo(() =>
    tasks.map(t => ({
      id:        t.id,
      title:     t.title,
      priority:  t.priority,
      column:    t.column,
      status:    STATUS_LABEL[t.column]   || "OPEN",
      comments:  t.comments               || 0,
      createdAt: t.createdAt,
      createdBy: t.createdBy?.name        || "You",
      tags:      t.tags?.slice(0, 2)      || [],
    })),
  [tasks]);

  // ── Filter by tab ─────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let result = statusTab === "closed"
      ? allIssues.filter(i => i.column === "done")
      : allIssues.filter(i => i.column !== "done");

    if (filterPri !== "all")
      result = result.filter(i => i.priority === filterPri);

    if (search.trim())
      result = result.filter(i =>
        i.title.toLowerCase().includes(search.trim().toLowerCase())
      );

    return result;
  }, [allIssues, statusTab, filterPri, search]);

  const openCount   = allIssues.filter(i => i.column !== "done").length;
  const closedCount = allIssues.filter(i => i.column === "done").length;

  return (
    <AppLayout>
      <div className="pt-0 pb-6">
        <div className="px-6 pt-4">

          {/* ── Toolbar ── */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-5">

            {/* Open / Closed tabs */}
            <div className="flex items-center gap-1.5 bg-[#F4F5F7] p-1 rounded-xl border border-[#E4E6EF]">
              <button
                onClick={() => setStatusTab("open")}
                className={`text-sm font-semibold px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                  statusTab === "open"
                    ? "bg-white text-[#5243F0] shadow-sm border border-[#E4E6EF]"
                    : "text-[#8E92A4] hover:text-[#1B1C22]"
                }`}
              >
                <AlertCircle className="w-3.5 h-3.5" />
                {openCount} Open
              </button>
              <button
                onClick={() => setStatusTab("closed")}
                className={`text-sm font-semibold px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                  statusTab === "closed"
                    ? "bg-white text-[#5243F0] shadow-sm border border-[#E4E6EF]"
                    : "text-[#8E92A4] hover:text-[#1B1C22]"
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                {closedCount} Closed
              </button>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              {/* Real-time search */}
              <div className="relative flex-1 md:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B0B4C8]" />
                <input
                  type="text"
                  placeholder="Search issues..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full bg-[#F4F5F7] border border-[#E4E6EF] rounded-xl pl-10 pr-9 py-2.5 text-sm text-[#1B1C22] font-medium focus:outline-none focus:border-[#5243F0] focus:ring-[3px] focus:ring-[#5243F0]/10 transition-all placeholder:text-[#B0B4C8]"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#B0B4C8] hover:text-[#1B1C22]"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Priority filter */}
              <div className="relative">
                <button
                  onClick={() => setShowFilter(p => !p)}
                  className={`p-2.5 border rounded-xl transition-colors ${
                    filterPri !== "all"
                      ? "border-[#5243F0] text-[#5243F0] bg-[#5243F0]/5"
                      : "border-[#E4E6EF] text-[#8E92A4] hover:text-[#1B1C22] bg-[#F4F5F7]"
                  }`}
                >
                  <Filter className="w-4 h-4" />
                </button>
                {showFilter && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowFilter(false)} />
                    <div className="absolute right-0 top-full mt-1.5 z-20 w-40 bg-white border border-[#E4E6EF] rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.10)] overflow-hidden">
                      {["all", "Critical", "High", "Medium", "Low"].map(p => (
                        <button
                          key={p}
                          onClick={() => { setFilterPri(p); setShowFilter(false); }}
                          className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                            filterPri === p
                              ? "bg-[#5243F0]/8 text-[#5243F0] font-semibold"
                              : "text-[#1B1C22] hover:bg-[#F4F5F7]"
                          }`}
                        >
                          {p === "all" ? "All Priorities" : p}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* ── Issues list ── */}
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-[#C7C9DE]">
              <AlertCircle className="h-10 w-10 mb-3 opacity-40" />
              <p className="text-sm font-semibold text-[#B0B4C8]">
                {search ? `No issues matching "${search}"` : `No ${statusTab} issues`}
              </p>
              <p className="text-xs mt-1 text-[#C7C9DE]">
                {!currentProject ? "Select a project to see issues" : "Tasks appear here as issues"}
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filtered.map(issue => (
                <div
                  key={issue.id}
                  className="p-4 md:p-5 rounded-2xl border border-[#E4E6EF] hover:border-[#C7C9DE] hover:shadow-sm flex flex-col md:flex-row items-start md:items-center gap-4 transition-all cursor-pointer bg-white group"
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <IssueIcon column={issue.column} />
                    <div className="min-w-0">
                      <h3 className="font-bold text-[14px] md:text-[15px] text-[#1B1C22] group-hover:text-[#5243F0] mb-1.5 leading-snug transition-colors truncate">
                        {issue.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                        <span className="text-[12px] text-[#8E92A4] font-medium">
                          {timeAgo(issue.createdAt)}
                          {issue.createdBy ? ` · ${issue.createdBy}` : ""}
                        </span>
                        {/* Real tags from task.tags */}
                        {issue.tags.map(tag => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#F4F5F7] text-[#8E92A4] border border-[#E4E6EF]"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 pl-8 md:pl-0">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wide ${PRIORITY_BADGE[issue.priority] || "bg-gray-100 text-gray-500"}`}>
                      {issue.priority?.toUpperCase()}
                    </span>
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wide ${STATUS_BADGE[issue.column] || "bg-gray-100 text-gray-500"}`}>
                      {issue.status}
                    </span>
                    <div className="flex items-center gap-1.5 text-[#B0B4C8]">
                      <MessageSquare className="w-4 h-4" strokeWidth={2} />
                      <span className="text-[13px] font-bold">{issue.comments}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </AppLayout>
  );
}
