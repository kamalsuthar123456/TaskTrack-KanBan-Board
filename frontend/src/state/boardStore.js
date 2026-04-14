import { create } from "zustand";
import { api }    from "@/lib/api";


// ── Column UI config ──────────────────────────────────────────────────────────
export const COLUMN_CONFIG = [
  {
    id:        "todo",
    title:     "To Do",
    color:     "bg-[#3B82F6]",
    textColor: "text-[#3B82F6]",
    emptyText: "No tasks yet",
    emptySub:  "Add your first task to get started",
  },
  {
    id:        "inprogress",
    title:     "In Progress",
    color:     "bg-[#F59E0B]",
    textColor: "text-[#F59E0B]",
    emptyText: "Nothing in progress",
    emptySub:  "Drag a task here or add a new one",
  },
  {
    id:        "review",
    title:     "Review",
    color:     "bg-[#A855F7]",
    textColor: "text-[#A855F7]",
    emptyText: "No tasks in review",
    emptySub:  "Move tasks here for review",
  },
  {
    id:        "done",
    title:     "Done",
    color:     "bg-[#10B981]",
    textColor: "text-[#10B981]",
    emptyText: "Nothing completed yet",
    emptySub:  "Finished tasks will appear here",
  },
];


// ── Priority normalization ────────────────────────────────────────────────────
const VALID_PRIORITIES = ["Low", "Medium", "High", "Critical", "Important"];

function normalizePriority(p) {
  if (!p) return "Low";
  const cap =
    String(p).charAt(0).toUpperCase() + String(p).slice(1).toLowerCase();
  return VALID_PRIORITIES.includes(cap) ? cap : "Low";
}


// ── Task normalizer ───────────────────────────────────────────────────────────
function normalizeTask(t) {
  return {
    id:           t._id || t.id,
    title:        t.title || "",
    description:  t.description || "",
    priority:     normalizePriority(t.priority),
    column:       t.column || "todo",
    assignee:     t.assignee || null,
    createdBy:    t.createdBy || null,
    dueDate:      t.dueDate || null,
    tags:         Array.isArray(t.tags) ? t.tags : [],
    commentsList: Array.isArray(t.commentsList) ? t.commentsList : [],
    comments:     typeof t.comments === "number" ? t.comments : 0,
    checks:       typeof t.checks === "number" ? t.checks : 0,
    order:        typeof t.order === "number" ? t.order : 0,
    createdAt:    t.createdAt || new Date().toISOString(),
    updatedAt:    t.updatedAt || null,
    pending:      false,
  };
}


// ── Persist helpers ───────────────────────────────────────────────────────────
const LS_PROJECT_KEY = "tasktrack_active_project";

function persistProject(project) {
  try {
    if (project) localStorage.setItem(LS_PROJECT_KEY, JSON.stringify(project));
    else localStorage.removeItem(LS_PROJECT_KEY);
  } catch (_) {}
}

function loadPersistedProject() {
  try {
    const raw = localStorage.getItem(LS_PROJECT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (_) {
    return null;
  }
}


// ── Extract HTTP status from error (FIXED regex) ──────────────────────────────
function getErrorStatus(err) {
  if (err?.response?.status) return err.response.status;
  if (err?.status)           return err.status;
  // Fixed: was \\\\b which never matched anything
  const match = String(err?.message || "").match(/\b(4\d{2}|5\d{2})\b/);
  return match ? Number(match[1]) : null;
}


// ── Store ─────────────────────────────────────────────────────────────────────
export const useBoardStore = create((set, get) => ({
  tasks:              [],
  currentProject:     loadPersistedProject(),
  activeProject:      loadPersistedProject(),
  isLoadingProject:   false,
  projectAccessError: null,
  projectsValidated:  false,

  projects:        [],
  loadingProjects: false,


  getColumns() {
    const { tasks } = get();
    return COLUMN_CONFIG.map(col => ({
      ...col,
      count: tasks.filter(t => t.column === col.id && !t.pending).length,
    }));
  },

  columnCount: columnId =>
    get().tasks.filter(t => t.column === columnId && !t.pending).length,

  setProject(project) {
    persistProject(project);
    set({ currentProject: project, activeProject: project, tasks: [], projectAccessError: null });
  },

  setActiveProject(project) {
    persistProject(project);
    set({ activeProject: project, currentProject: project, tasks: [], projectAccessError: null });
  },

  clearProject() {
    persistProject(null);
    set({
      currentProject:     null,
      activeProject:      null,
      tasks:              [],
      isLoadingProject:   false,
      projectAccessError: null,
    });
  },

  resetTasks() {
    set({ tasks: [] });
  },


  async fetchTasks(projectId) {
    const pid = projectId || get().currentProject?._id;
    if (!pid) return { ok: false, error: "No project ID" };

    if (!get().projectsValidated) {
      return { ok: false, error: "Projects not validated yet" };
    }

    set({ isLoadingProject: true, projectAccessError: null });
    try {
      const data   = await api.get(`/tasks/project/${pid}`);
      const sorted = [...data].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      set({ tasks: sorted.map(normalizeTask), isLoadingProject: false });
      return { ok: true };
    } catch (err) {
      const status = getErrorStatus(err);

      if (status === 403) {
        persistProject(null);
        set({
          isLoadingProject:   false,
          tasks:              [],
          currentProject:     null,
          activeProject:      null,
          projectAccessError: "not_member",
        });
        console.error("[fetchTasks] Not a project member — cleared stale project");
        return { ok: false, error: "Not a project member", status: 403 };
      }

      set({ isLoadingProject: false });
      console.error("[fetchTasks]", err.message);
      return { ok: false, error: err.message, status };
    }
  },


  async fetchProjects() {
    set({ loadingProjects: true });
    try {
      const data = await api.get("/projects");

      const { currentProject } = get();
      let validatedProject = currentProject;

      if (currentProject) {
        const stillMember = data.some(p => p._id === currentProject._id);
        if (!stillMember) {
          persistProject(null);
          validatedProject = null;
          console.warn("[fetchProjects] Persisted project not in user's list — cleared");
        }
      }

      set({
        projects:           data,
        loadingProjects:    false,
        projectsValidated:  true,
        currentProject:     validatedProject,
        activeProject:      validatedProject,
        projectAccessError: validatedProject ? null : (currentProject ? "not_member" : null),
        tasks:              validatedProject ? get().tasks : [],
      });

      return { ok: true };
    } catch (err) {
      set({ loadingProjects: false, projectsValidated: true });
      console.error("[fetchProjects]", err.message);
      return { ok: false, error: err.message };
    }
  },


  async createProject(payload) {
    try {
      const project = await api.post("/projects", payload);
      set(s => ({ projects: [project, ...s.projects] }));
      return { ok: true, project };
    } catch (err) {
      console.error("[createProject]", err.message);
      return { ok: false, error: err.message };
    }
  },

  async updateProject(projectId, updates) {
    try {
      const project = await api.patch(`/projects/${projectId}`, updates);
      set(s => {
        const nextActive  = s.activeProject?._id  === projectId ? project : s.activeProject;
        const nextCurrent = s.currentProject?._id === projectId ? project : s.currentProject;
        persistProject(nextCurrent);
        return {
          projects:       s.projects.map(p => (p._id === projectId ? project : p)),
          activeProject:  nextActive,
          currentProject: nextCurrent,
        };
      });
      return { ok: true, project };
    } catch (err) {
      console.error("[updateProject]", err.message);
      return { ok: false, error: err.message };
    }
  },

  async deleteProject(projectId) {
    const prev = get().projects;
    set(s => {
      const isActive = s.activeProject?._id === projectId;
      const next = {
        projects:       prev.filter(p => p._id !== projectId),
        activeProject:  isActive ? null : s.activeProject,
        currentProject: s.currentProject?._id === projectId ? null : s.currentProject,
        tasks:          s.currentProject?._id === projectId ? [] : s.tasks,
      };
      if (isActive) persistProject(null);
      return next;
    });
    try {
      await api.delete(`/projects/${projectId}`);
      return { ok: true };
    } catch (err) {
      set({ projects: prev });
      console.error("[deleteProject]", err.message);
      return { ok: false, error: err.message };
    }
  },

  async addTask(title, priority, extra = {}) {
    const { currentProject } = get();
    if (!currentProject?._id) return { ok: false, error: "No project selected" };

    const safePriority = normalizePriority(priority);
    const tempId       = `temp-${Date.now()}`;
    const targetColumn = extra.column || "todo";

    const optimistic = {
      id:           tempId,
      title:        title.trim(),
      description:  extra.description || "",
      priority:     safePriority,
      column:       targetColumn,
      assignee:     null,
      createdBy:    null,
      dueDate:      null,
      tags:         [],
      commentsList: [],
      comments:     0,
      checks:       0,
      order:        0,
      pending:      true,
      createdAt:    new Date().toISOString(),
      updatedAt:    null,
    };
    set(s => ({ tasks: [optimistic, ...s.tasks] }));

    try {
      const task = await api.post("/tasks", {
        title:       title.trim(),
        description: extra.description?.trim() || "",
        priority:    safePriority,
        column:      targetColumn,
        projectId:   currentProject._id,
        ...(extra.dueDate  && { dueDate:  extra.dueDate }),
        ...(extra.tags     && { tags:     extra.tags }),
        ...(extra.assignee && { assignee: extra.assignee }),
      });
      set(s => ({
        tasks: s.tasks.map(t => (t.id === tempId ? normalizeTask(task) : t)),
      }));
      return { ok: true, task: normalizeTask(task) };
    } catch (err) {
      set(s => ({ tasks: s.tasks.filter(t => t.id !== tempId) }));
      console.error("[addTask]", err.message);
      return { ok: false, error: err.message };
    }
  },

  async moveTask(taskId, column) {
    const prevTasks  = get().tasks;
    const prevColumn = prevTasks.find(t => t.id === taskId)?.column;

    set(s => ({
      tasks: s.tasks.map(t =>
        t.id === taskId ? { ...t, column, pending: true } : t
      ),
    }));

    try {
      const task = await api.patch(`/tasks/${taskId}`, { column });
      set(s => ({
        tasks: s.tasks.map(t => (t.id === taskId ? normalizeTask(task) : t)),
      }));
      return { ok: true };
    } catch (err) {
      set(s => ({
        tasks: s.tasks.map(t =>
          t.id === taskId ? { ...t, column: prevColumn, pending: false } : t
        ),
      }));
      console.error("[moveTask]", err.message);
      return { ok: false, error: err.message };
    }
  },

  async reorderTasks(taskId, overId, columnId) {
    const tasks    = get().tasks;
    const colTasks = tasks
      .filter(t => t.column === columnId)
      .sort((a, b) => a.order - b.order);

    const oldIndex = colTasks.findIndex(t => t.id === taskId);
    const newIndex = colTasks.findIndex(t => t.id === overId);
    if (oldIndex === -1 || newIndex === -1) return { ok: false };

    const reordered    = [...colTasks];
    const [moved]      = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);
    const withNewOrder = reordered.map((t, i) => ({ ...t, order: i }));

    set(s => ({
      tasks: s.tasks.map(t => withNewOrder.find(r => r.id === t.id) || t),
    }));

    try {
      await api.patch("/tasks/reorder", {
        tasks: withNewOrder.map(t => ({ id: t.id, order: t.order })),
      });
      return { ok: true };
    } catch (err) {
      set(s => ({
        tasks: s.tasks.map(t => tasks.find(p => p.id === t.id) || t),
      }));
      console.error("[reorderTasks]", err.message);
      return { ok: false, error: err.message };
    }
  },

  async updateTask(taskId, updates) {
    const safeUpdates = updates.priority
      ? { ...updates, priority: normalizePriority(updates.priority) }
      : updates;
    const prevTask = get().tasks.find(t => t.id === taskId);

    set(s => ({
      tasks: s.tasks.map(t =>
        t.id === taskId ? { ...t, ...safeUpdates, pending: true } : t
      ),
    }));

    try {
      const task = await api.patch(`/tasks/${taskId}`, safeUpdates);
      set(s => ({
        tasks: s.tasks.map(t => (t.id === taskId ? normalizeTask(task) : t)),
      }));
      return { ok: true, task: normalizeTask(task) };
    } catch (err) {
      set(s => ({
        tasks: s.tasks.map(t => (t.id === taskId ? prevTask : t)),
      }));
      console.error("[updateTask]", err.message);
      return { ok: false, error: err.message };
    }
  },

  async deleteTask(taskId) {
    const prevTasks = get().tasks;
    set(s => ({ tasks: s.tasks.filter(t => t.id !== taskId) }));
    try {
      await api.delete(`/tasks/${taskId}`);
      return { ok: true };
    } catch (err) {
      set({ tasks: prevTasks });
      console.error("[deleteTask]", err.message);
      return { ok: false, error: err.message };
    }
  },
}));