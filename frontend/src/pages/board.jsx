import { useEffect, useState, useCallback, useMemo } from "react";
import { useLocation } from "wouter";
import {
  DndContext, DragOverlay, closestCorners,
  MouseSensor, TouchSensor, PointerSensor, KeyboardSensor,
  useSensor, useSensors,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import AppLayout       from "@/components/Layout/AppLayout";
import BoardFilters    from "@/components/Board/BoardFilters";
import Column          from "@/components/Board/Column";
import TaskCard        from "@/components/Board/TaskCard";
import TaskDetailPanel from "@/components/Board/TaskDetailPanel";
import QuickTask       from "@/components/Board/QuickTask";
import { useBoardStore } from "@/state/boardStore";
import { auth }          from "@/state/auth";
import { useToast }      from "@/hooks/use-toast";

const COLUMNS = ["todo", "inprogress", "review", "done"];
const COLUMN_LABELS = {
  todo: "To Do", inprogress: "In Progress", review: "Review", done: "Done",
};
const TAB_COLUMN_FILTER = {
  total: null, inprogress: ["inprogress"], due: null, completed: ["done"],
};

const LS_TAB_KEY = "tasktrack_active_tab";
function loadPersistedTab() {
  try { return localStorage.getItem(LS_TAB_KEY) || "total"; } catch { return "total"; }
}
function persistTab(tab) {
  try { localStorage.setItem(LS_TAB_KEY, tab); } catch (_) {}
}

export default function BoardPage() {
  const [, setLocation]                   = useLocation();
  const [activeId, setActiveId]           = useState(null);
  const [selectedTask, setSelectedTask]   = useState(null);
  const [showQuickTask, setShowQuickTask] = useState(false);
  const [activeTab, setActiveTab]         = useState(loadPersistedTab);
  const [sortBy, setSortBy]               = useState("Newest");

  const {
    tasks, moveTask, currentProject, activeProject,
    isLoadingProject, fetchTasks, fetchProjects,
    projectsValidated, projectAccessError,
  } = useBoardStore();

  const project = currentProject || activeProject || null;
  const { toast } = useToast();

  const handleSetActiveTab = useCallback((tab) => {
    setActiveTab(tab);
    persistTab(tab);
  }, []);

  useEffect(() => {
    if (!auth.isAuthenticated()) setLocation("/login");
  }, [setLocation]);

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (!projectsValidated) return;
    if (!project?._id) return;
    fetchTasks(project._id);
  }, [project?._id, projectsValidated]);

  useEffect(() => {
    if (!selectedTask) return;
    const fresh = tasks.find(t => t.id === selectedTask.id);
    if (fresh) setSelectedTask(fresh);
  }, [tasks]);

  const sensors = useSensors(
    useSensor(MouseSensor,    { activationConstraint: { distance: 10 } }),
    useSensor(TouchSensor,    { activationConstraint: { delay: 250, tolerance: 5 } }),
    useSensor(PointerSensor,  { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const filteredTasks = useMemo(() => {
    let result;
    switch (activeTab) {
      case "completed":
        result = tasks.filter(t => t.column === "done");
        break;
      case "due":
        result = tasks.filter(
          t => t.priority === "Critical" || t.priority === "High" || t.priority === "Important"
        );
        break;
      case "inprogress":
        result = tasks.filter(t => t.column === "inprogress");
        break;
      default:
        result = tasks;
    }

    const PRIORITY_ORDER = { Critical: 0, Important: 1, High: 2, Medium: 3, Low: 4 };

    switch (sortBy) {
      case "Oldest":
        return [...result].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      case "Priority":
        return [...result].sort(
          (a, b) => (PRIORITY_ORDER[a.priority] ?? 5) - (PRIORITY_ORDER[b.priority] ?? 5)
        );
      case "Alphabetical":
        return [...result].sort((a, b) => a.title.localeCompare(b.title));
      default:
        return [...result].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  }, [tasks, activeTab, sortBy]);

  const taskCounts = useMemo(() => ({
    total:      tasks.length,
    inprogress: tasks.filter(t => t.column === "inprogress").length,
    due:        tasks.filter(t => ["Critical", "High", "Important"].includes(t.priority)).length,
    completed:  tasks.filter(t => t.column === "done").length,
  }), [tasks]);

  const handleDragStart = useCallback((event) => {
    const task = tasks.find(t => t.id === event.active.id);
    if (!task || task.pending) return;
    setActiveId(event.active.id);
  }, [tasks]);

  const handleDragEnd = useCallback(async ({ active, over }) => {
    setActiveId(null);
    if (!over) return;
    const task = tasks.find(t => t.id === active.id);
    if (!task || task.pending) return;

    let targetColumn = over.id;
    if (!COLUMNS.includes(targetColumn)) {
      const overTask = tasks.find(t => t.id === over.id);
      if (!overTask) return;
      targetColumn = overTask.column;
    }
    if (task.column === targetColumn) return;

    const res = await moveTask(task.id, targetColumn);
    if (res?.ok) {
      toast({ title: "Task moved", description: `Moved to ${COLUMN_LABELS[targetColumn]}` });
    } else {
      toast({
        variant: "destructive",
        title: "Move failed",
        description: res?.error || "Could not move task.",
      });
    }
  }, [tasks, moveTask, toast]);

  const handleDragCancel      = useCallback(() => setActiveId(null), []);
  const handleTaskClick       = useCallback(task => setSelectedTask(task), []);
  const handleQuickTaskToggle = useCallback(() => setShowQuickTask(p => !p), []);

  const activeTask     = activeId ? tasks.find(t => t.id === activeId && !t.pending) : null;
  const visibleColumns = TAB_COLUMN_FILTER[activeTab] || COLUMNS;

  return (
    <AppLayout onCreateTask={handleQuickTaskToggle}>
      <div className={`transition-all duration-300 ${selectedTask ? "mr-80" : ""}`}>
        <div className="pt-0 pb-6">

          {isLoadingProject && (
            <div className="flex h-64 items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#5243F0] border-t-transparent" />
                <p className="text-sm text-[#8E92A4]">Loading board...</p>
              </div>
            </div>
          )}

          {!isLoadingProject && projectAccessError === "not_member" && (
            <div className="flex h-64 flex-col items-center justify-center text-[#8E92A4]">
              <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl border border-red-200 bg-red-50 shadow-sm">
                <svg className="h-6 w-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
              </div>
              <p className="text-base font-semibold text-[#1B1C22]">Project access removed</p>
              <p className="mt-1 text-sm text-[#8E92A4]">You no longer have access to this project. Select another from the sidebar.</p>
            </div>
          )}

          {!isLoadingProject && !project && projectAccessError !== "not_member" && (
            <div className="flex h-64 flex-col items-center justify-center text-[#8E92A4]">
              <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl border border-[#E4E6EF] bg-white shadow-sm">
                <svg
                  className="h-6 w-6 text-[#B0B4C8]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M3 7h18M3 12h18M3 17h18"
                  />
                </svg>
              </div>
              <p className="text-base font-semibold text-[#1B1C22]">Select or create a project</p>
              <p className="mt-1 text-sm text-[#8E92A4]">Use the sidebar on the left to get started</p>
            </div>
          )}

          {!isLoadingProject && project && projectAccessError !== "not_member" && (
            <>
              <BoardFilters
                activeTab={activeTab}
                setActiveTab={handleSetActiveTab}
                onSortChange={setSortBy}
                taskCounts={taskCounts}
              />

              {showQuickTask && (
                <div className="px-6 mb-4 mt-4">
                  <QuickTask onClose={() => setShowQuickTask(false)} />
                </div>
              )}

              <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDragCancel={handleDragCancel}
              >
                <div
                  className={`px-6 mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 ${
                    visibleColumns.length === 1
                      ? "xl:grid-cols-1 max-w-lg"
                      : "xl:grid-cols-4"
                  }`}
                >
                  {visibleColumns.map(columnId => (
                    <Column
                      key={columnId}
                      id={columnId}
                      tasks={filteredTasks.filter(t => t.column === columnId)}
                      onTaskClick={handleTaskClick}
                    />
                  ))}
                </div>

                <DragOverlay dropAnimation={null}>
                  {activeTask ? (
                    <div className="rotate-2 scale-105 opacity-95 pointer-events-none drop-shadow-xl">
                      <TaskCard task={activeTask} isOverlay />
                    </div>
                  ) : null}
                </DragOverlay>
              </DndContext>
            </>
          )}

        </div>
      </div>

      {selectedTask && (
        <TaskDetailPanel
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </AppLayout>
  );
}