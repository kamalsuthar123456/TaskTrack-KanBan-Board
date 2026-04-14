import { useMemo, useState, useCallback, useEffect } from "react";
import { useLocation }     from "wouter";
import AppLayout           from "@/components/Layout/AppLayout";
import { useBoardStore }   from "@/state/boardStore";
import { PRIORITY_CONFIG } from "@/components/Layout/ProjectModal";
import {
  FolderDot, Plus, MoreVertical,
  Search, FolderKanban, X,
} from "lucide-react";

// ── Relative time ─────────────────────────────────────────────────────────────
function timeAgo(ts) {
  if (!ts) return "Never";
  const diff = Date.now() - new Date(ts).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (m < 1)  return "Just now";
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  if (d < 7)  return `${d}d ago`;
  return new Date(ts).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function ProjectsPage({
  onCreateProject,
  onEditProject,
  onDeleteProject,
  onProjectSelect,
}) {
  const {
    tasks,
    projects        = [],
    loadingProjects = false,
    activeProject,
    setActiveProject,
    fetchProjects, 
    fetchTasks,
  } = useBoardStore();

  const [, setLocation] = useLocation();
  const [search,    setSearch]    = useState("");
  const [activeTab, setActiveTab] = useState("all");

  // ── STEP 3: Fetch projects on mount if not already loaded ─────────────────
  useEffect(() => {
    fetchProjects();
  }, []);

  const taskCountByProject = useMemo(() => {
    const map = {};
    tasks.forEach(t => {
      const pid = t.project || t.projectId;
      if (pid) map[pid] = (map[pid] || 0) + 1;
    });
    return map;
  }, [tasks]);

  // ── Real completed % per project ──────────────────────────────────────────
  const progressByProject = useMemo(() => {
    const map = {};
    projects.forEach(p => {
      const pid   = p._id;
      const total = tasks.filter(t => (t.project || t.projectId) === pid).length;
      const done  = tasks.filter(t => (t.project || t.projectId) === pid && t.column === "done").length;
      map[pid]    = total > 0 ? Math.round((done / total) * 100) : 0;
    });
    return map;
  }, [tasks, projects]);

  // ── Filter + tab logic ────────────────────────────────────────────────────
  const filteredProjects = useMemo(() => {
    let result = [...projects];
    if (search.trim())
      result = result.filter(p =>
        p.name.toLowerCase().includes(search.trim().toLowerCase())
      );
    if (activeTab === "active")
      result = result.filter(p => (progressByProject[p._id] || 0) < 100);
    if (activeTab === "archived")
      result = result.filter(p => (progressByProject[p._id] || 0) === 100);
    return result;
  }, [projects, search, activeTab, progressByProject]);

  // ── Card click — set active project + navigate to board ──────────────────
  const handleSelect = useCallback((project) => {
    setActiveProject?.(project);
    onProjectSelect?.(project);
    fetchTasks(project._id);
    setLocation("/board");
  }, [setActiveProject, onProjectSelect, fetchTasks, setLocation]);

  return (
    <AppLayout onCreateTask={undefined}>
      <div className="pt-0 pb-6">
        <div className="px-6 pt-4">

          {/* ── Page header ── */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-[#1B1C22] tracking-tight">Projects</h1>
              <p className="text-sm text-[#8E92A4] mt-0.5">
                {projects.length} project{projects.length !== 1 ? "s" : ""} total
              </p>
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              {/* Search */}
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B0B4C8]" />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full bg-[#F4F5F7] border border-[#E4E6EF] rounded-xl pl-10 pr-8 py-2 text-sm text-[#1B1C22] font-medium focus:outline-none focus:border-[#5243F0] focus:ring-[3px] focus:ring-[#5243F0]/10 transition-all placeholder:text-[#B0B4C8]"
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
              {/* New Project button */}
              <button
                onClick={onCreateProject}
                className="flex items-center gap-2 bg-[#5243F0] hover:bg-[#4537D6] text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-[0_4px_14px_rgba(82,67,240,0.3)] active:scale-95 shrink-0"
              >
                <Plus className="w-4 h-4" strokeWidth={2.5} />
                New Project
              </button>
            </div>
          </div>

          {/* ── Tabs ── */}
          <div className="flex items-center gap-2 mb-6 border-b border-[#E4E6EF] pb-0">
            {[
              { key: "all",      label: `All (${projects.length})` },
              { key: "active",   label: "Active"    },
              { key: "archived", label: "Completed" },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all -mb-px ${
                  activeTab === tab.key
                    ? "border-[#5243F0] text-[#5243F0]"
                    : "border-transparent text-[#8E92A4] hover:text-[#1B1C22]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* ── Loading skeleton ── */}
          {loadingProjects && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-56 rounded-2xl bg-[#F4F5F7] animate-pulse border border-[#E4E6EF]" />
              ))}
            </div>
          )}

          {/* ── Empty state ── */}
          {!loadingProjects && filteredProjects.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-[#C7C9DE]">
              <FolderKanban className="h-12 w-12 mb-3 opacity-40" />
              <p className="text-sm font-semibold text-[#B0B4C8]">
                {search ? `No projects matching "${search}"` : "No projects yet"}
              </p>
              {!search && (
                <button
                  onClick={onCreateProject}
                  className="mt-4 px-5 py-2 bg-[#5243F0] text-white text-sm font-semibold rounded-xl hover:bg-[#4537D6] transition-all shadow-sm"
                >
                  + Create your first project
                </button>
              )}
            </div>
          )}

          {/* ── Project cards ── */}
          {!loadingProjects && filteredProjects.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredProjects.map(project => {
                const pCfg     = PRIORITY_CONFIG[project.priority] || PRIORITY_CONFIG["Medium"];
                const count    = taskCountByProject[project._id] || 0;
                const progress = progressByProject[project._id]  || 0;
                const isActive = activeProject?._id === project._id;

                return (
                  <div
                    key={project._id}
                    onClick={() => handleSelect(project)}
                    className={`p-5 rounded-2xl border transition-all bg-white flex flex-col cursor-pointer group ${
                      isActive
                        ? "border-[#5243F0] shadow-[0_4px_20px_rgba(82,67,240,0.15)]"
                        : "border-[#E4E6EF] hover:border-[#C7C9DE] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)]"
                    }`}
                  >
                    {/* Card header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="h-9 w-9 rounded-xl grid place-items-center shrink-0"
                          style={{ backgroundColor: pCfg.color }}
                        >
                          <FolderKanban className="h-4 w-4 text-white" strokeWidth={2} />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-bold text-[15px] text-[#1B1C22] group-hover:text-[#5243F0] transition-colors truncate">
                            {project.name}
                          </h3>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${pCfg.bg} ${pCfg.text} ${pCfg.border}`}>
                            {project.priority}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={e => { e.stopPropagation(); onEditProject?.(project); }}
                        className="p-1.5 rounded-lg text-[#B0B4C8] hover:text-[#1B1C22] hover:bg-[#F4F5F7] transition-all opacity-0 group-hover:opacity-100"
                        aria-label="Edit project"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Description */}
                    <p className="text-[12px] text-[#8E92A4] mb-4 leading-relaxed line-clamp-2 flex-1">
                      {project.description || "No description provided."}
                    </p>

                    {/* Progress bar */}
                    <div className="mb-4">
                      <div className="flex justify-between text-[11px] font-semibold mb-1.5">
                        <span className="text-[#8E92A4]">Progress</span>
                        <span className="text-[#1B1C22]">{progress}%</span>
                      </div>
                      <div className="w-full bg-[#F4F5F7] rounded-full h-1.5">
                        <div
                          className="h-1.5 rounded-full transition-all duration-500"
                          style={{ width: `${progress}%`, backgroundColor: pCfg.color }}
                        />
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-[#F4F5F7]">
                      <div className="flex items-center gap-1.5 text-[#8E92A4]">
                        <FolderDot className="w-3.5 h-3.5" />
                        <span className="text-[12px] font-semibold">{count} task{count !== 1 ? "s" : ""}</span>
                      </div>
                      <span className="text-[11px] text-[#B0B4C8] font-medium">
                        {timeAgo(project.updatedAt || project.createdAt)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </div>
    </AppLayout>
  );
}
