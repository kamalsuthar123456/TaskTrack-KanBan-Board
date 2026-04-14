import { useState, memo, useCallback, useEffect } from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard, FolderKanban, AlertCircle,
  Columns, Calendar, Plus, ChevronDown,
  ChevronRight, Users, LogOut, MoreHorizontal,
  Pencil, Trash2, AlertTriangle, Menu, X,
} from "lucide-react";
import { auth }            from "@/state/auth";
import { useBoardStore }   from "@/state/boardStore";
import { PRIORITY_CONFIG } from "./ProjectModal";

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: FolderKanban,    label: "Projects",  href: "/projects"  },
  { icon: AlertCircle,     label: "Issues",    href: "/issues"    },
  { icon: Columns,         label: "Boards",    href: "/board"     },
  { icon: Calendar,        label: "Calendar",  href: "/calendar"  },
];

const TEAMS = ["Design", "Development", "Marketing"];

function DeleteConfirm({ projectName, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div
        className="bg-white rounded-2xl border border-[#E4E6EF] p-6 w-full max-w-sm shadow-[0_24px_64px_rgba(0,0,0,0.15)]"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="h-10 w-10 rounded-xl bg-red-50 grid place-items-center shrink-0">
            <AlertTriangle className="h-5 w-5 text-red-500" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#1B1C22]">Delete Project</h3>
            <p className="text-xs text-[#8E92A4]">This action cannot be undone</p>
          </div>
        </div>
        <p className="text-sm text-[#8E92A4] mb-5">
          Are you sure you want to delete{" "}
          <span className="font-semibold text-[#1B1C22]">"{projectName}"</span>?
          All tasks inside will be permanently deleted.
        </p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-xl text-sm text-[#8E92A4] hover:bg-[#F4F5F7] border border-[#E4E6EF] transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-xl text-sm font-semibold bg-red-500 hover:bg-red-600 text-white transition-all shadow-[0_4px_12px_rgba(239,68,68,0.3)] active:scale-95"
          >
            Delete Project
          </button>
        </div>
      </div>
    </div>
  );
}

function InlineRename({ project, onRename, onCancel }) {
  const [val, setVal] = useState(project.name);

  function commit() {
    const trimmed = val.trim();
    if (trimmed && trimmed !== project.name) onRename(trimmed);
    else onCancel();
  }

  return (
    <input
      autoFocus
      value={val}
      onChange={e => setVal(e.target.value)}
      onBlur={commit}
      onKeyDown={e => {
        if (e.key === "Enter")  { e.preventDefault(); commit(); }
        if (e.key === "Escape") { e.preventDefault(); onCancel(); }
      }}
      maxLength={100}
      className="flex-1 min-w-0 bg-white/20 text-white text-sm font-semibold rounded-lg px-2 py-0.5 outline-none border border-white/40 placeholder:text-white/50"
      onClick={e => e.stopPropagation()}
    />
  );
}

const Sidebar = memo(function Sidebar({
  onProjectSelect,
  onCreateProject,
  onEditProject,
  onDeleteProject,
  onRenameProject,
}) {
  const {
    projects        = [],
    loadingProjects = false,
    activeProject,
    setActiveProject,
    fetchProjects,
    fetchTasks,
  } = useBoardStore();

  const [location]                      = useLocation();
  const [isOpen,       setIsOpen]       = useState(false);
  const [expandTeams,  setExpandTeams]  = useState(true);
  const [menuState,    setMenuState]    = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [renamingId,   setRenamingId]   = useState(null);

  const user = auth.getUser();

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleLogout = useCallback(() => {
    auth.logout();
    window.location.href = "/";
  }, []);

  function closeMenu() { setMenuState(null); }
  function closeSidebar() { setIsOpen(false); }

  function openMenu(e, project) {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setMenuState(
      menuState?.id === project._id
        ? null
        : { id: project._id, project, x: rect.right + 8, y: rect.top }
    );
  }

  function handleRename(projectId, newName) {
    onRenameProject?.(projectId, newName);
    setRenamingId(null);
  }

  function handleProjectClick(project) {
    setActiveProject?.(project);
    onProjectSelect?.(project);
    fetchTasks(project._id);
    closeSidebar();
    closeMenu();
  }

  const userInitial = user?.name?.[0]?.toUpperCase() ?? "U";

  return (
    <>
      <button
        onClick={() => setIsOpen(p => !p)}
        aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
        className="lg:hidden fixed top-5 left-4 z-50 p-2 rounded-xl bg-[#5243F0] text-white shadow-lg hover:bg-[#4537D6] transition-all"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* ── Mobile overlay ── */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-30" onClick={closeSidebar} />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={`
          fixed left-0 top-0 h-screen w-60 flex flex-col bg-[#5243F0] z-40
          transition-transform duration-300
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        {/* Logo */}
        <Link
          href="/"
          onClick={closeSidebar}
          className="flex items-center gap-3 px-5 py-5 border-b border-white/[0.12] shrink-0 hover:bg-white/5 transition-colors"
        >
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-white/20 ring-1 ring-white/30 shrink-0">
            <Columns className="h-4 w-4 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <p className="font-bold text-sm text-white leading-none">TaskTrack</p>
            <p className="text-[9px] uppercase tracking-widest text-white/50 mt-0.5">Kanban Board</p>
          </div>
        </Link>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "none" }}>

          {/* Navigation */}
          <nav className="px-3 pt-4 space-y-0.5">
            {NAV_ITEMS.map(({ icon: Icon, label, href }) => {
              const active =
                location === href ||
                (href === "/board" && location.startsWith("/board"));
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={closeSidebar}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                    active
                      ? "bg-white/20 text-white font-semibold"
                      : "text-white/60 hover:bg-white/[0.12] hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" strokeWidth={active ? 2.5 : 2} />
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* Projects */}
          <div className="px-3 mt-6">
            <div className="flex items-center justify-between px-3 mb-2">
              <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold">
                Projects
              </span>
              <button
                onClick={onCreateProject}
                aria-label="Create new project"
                className="h-5 w-5 rounded-md bg-white/15 flex items-center justify-center text-white/60 hover:bg-white/25 hover:text-white transition-all"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>

            <div className="space-y-0.5">
              {loadingProjects ? (
                [1, 2, 3].map(i => (
                  <div key={i} className="h-8 rounded-xl bg-white/10 animate-pulse mx-1" />
                ))
              ) : projects.length === 0 ? (
                <div className="px-3 py-4 text-center">
                  <p className="text-[11px] text-white/40">No projects yet</p>
                  <button
                    onClick={onCreateProject}
                    className="mt-2 text-[11px] text-white/60 hover:text-white transition-all"
                  >
                    + Create your first project
                  </button>
                </div>
              ) : (
                projects.map(project => {
                  const pCfg    = PRIORITY_CONFIG[project.priority] || PRIORITY_CONFIG["Medium"];
                  const isActive = activeProject?._id === project._id;

                  return (
                    <div key={project._id} className="relative group/item">
                      <button
                        onClick={() => handleProjectClick(project)} // ✅ uses unified handler
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-all text-left pr-9 ${
                          isActive
                            ? "bg-white/20 text-white font-semibold"
                            : "text-white/60 hover:bg-white/[0.12] hover:text-white/90"
                        }`}
                      >
                        <span
                          className="h-2.5 w-2.5 rounded-full shrink-0 ring-1 ring-white/20"
                          style={{ backgroundColor: pCfg.color }}
                          title={project.priority}
                        />
                        {renamingId === project._id ? (
                          <InlineRename
                            project={project}
                            onRename={name => handleRename(project._id, name)}
                            onCancel={() => setRenamingId(null)}
                          />
                        ) : (
                          <span className="truncate flex-1">{project.name}</span>
                        )}
                      </button>

                      {renamingId !== project._id && (
                        <button
                          onClick={e => openMenu(e, project)}
                          className="absolute right-1.5 top-1/2 -translate-y-1/2 h-6 w-6 rounded-lg grid place-items-center text-transparent group-hover/item:text-white/60 hover:!text-white hover:bg-white/20 transition-all"
                          aria-label="Project options"
                        >
                          <MoreHorizontal className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Teams */}
          <div className="px-3 mt-6 pb-4">
            <button
              onClick={() => setExpandTeams(p => !p)}
              className="flex items-center justify-between w-full px-3 mb-2"
            >
              <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold">
                Teams
              </span>
              {expandTeams
                ? <ChevronDown  className="h-3 w-3 text-white/40" />
                : <ChevronRight className="h-3 w-3 text-white/40" />
              }
            </button>
            {expandTeams && (
              <div className="space-y-0.5 px-3">
                {TEAMS.map(team => (
                  <div
                    key={team}
                    className="flex items-center gap-2 py-1.5 px-1 rounded-lg text-white/50 hover:text-white/80 hover:bg-white/10 cursor-pointer transition-all"
                  >
                    <Users className="h-3.5 w-3.5 shrink-0" />
                    <span className="text-sm">{team}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* User + Logout */}
        <div className="px-3 py-4 border-t border-white/[0.12] shrink-0">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 transition-all group cursor-pointer text-left"
          >
            <div className="h-8 w-8 rounded-full bg-white/20 ring-1 ring-white/30 grid place-items-center shrink-0">
              <span className="text-xs font-bold text-white">{userInitial}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white/80 truncate">{user?.name || "User"}</p>
              <p className="text-[10px] text-white/45 truncate">{user?.email || ""}</p>
            </div>
            <LogOut className="h-3.5 w-3.5 text-white/30 group-hover:text-red-300 transition-all shrink-0" />
          </button>
        </div>
      </aside>

      {/* Kebab dropdown */}
      {menuState && (
        <>
          <div className="fixed inset-0 z-[55]" onClick={closeMenu} />
          <div
            className="fixed z-[56] w-44 bg-white border border-[#E4E6EF] rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.14)] overflow-hidden"
            style={{ left: menuState.x, top: menuState.y }}
          >
            <button
              onClick={() => { setRenamingId(menuState.id); closeMenu(); }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-[#1B1C22] hover:bg-[#F4F5F7] transition-colors"
            >
              <Pencil className="h-3.5 w-3.5 text-[#5243F0]" />
              Rename
            </button>
            <button
              onClick={() => { onEditProject(menuState.project); closeMenu(); }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-[#1B1C22] hover:bg-[#F4F5F7] transition-colors"
            >
              <FolderKanban className="h-3.5 w-3.5 text-[#8E92A4]" />
              Edit Details
            </button>
            <div className="h-px bg-[#F4F5F7]" />
            <button
              onClick={() => { setDeleteTarget(menuState.project); closeMenu(); }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete Project
            </button>
          </div>
        </>
      )}

      {deleteTarget && (
        <DeleteConfirm
          projectName={deleteTarget.name}
          onConfirm={() => {
            onDeleteProject(deleteTarget._id);
            setDeleteTarget(null);
          }}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </>
  );
});

export default Sidebar;
