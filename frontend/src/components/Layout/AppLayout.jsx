import { useState, useEffect, useRef } from "react";
import Sidebar        from "./Sidebar";
import Topbar         from "./Topbar";
import ProjectModal   from "./ProjectModal";
import { api }        from "@/lib/api";
import { useBoardStore } from "@/state/boardStore";
import { useToast }   from "@/hooks/use-toast";
import { auth }       from "@/state/auth";
import { useLocation } from "wouter";

export default function AppLayout({ children }) {
  const [projects,         setProjects]         = useState([]);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [editingProject,   setEditingProject]   = useState(null);
  const [loadingProjects,  setLoadingProjects]  = useState(true);

  const {
    currentProject: storeProject,
    setProject,
    fetchTasks,
    resetTasks,
  } = useBoardStore();

  const { toast }       = useToast();
  const [, setLocation] = useLocation();
  const hasFetched      = useRef(false);

  useEffect(() => {
    if (!auth.isAuthenticated()) { setLocation("/login"); return; }
    if (hasFetched.current) return;
    hasFetched.current = true;
    loadProjects();
  }, []);

  async function loadProjects() {
    setLoadingProjects(true);
    try {
      const data = await api.get("/projects");
      setProjects(data);

      if (data.length === 0) {
        setLoadingProjects(false);
        return;
      }

      const persistedId = storeProject?._id;
      const matchedProject = persistedId
        ? data.find(p => p._id === persistedId)
        : null;

      const projectToLoad = matchedProject || data[0];

      setProject(projectToLoad);
      await fetchTasks(projectToLoad._id);
    } catch (err) {
      if (
        err.message?.includes("401") ||
        err.message?.toLowerCase().includes("unauthorized")
      ) {
        auth.logout();
        setLocation("/login");
        return;
      }
      toast({
        variant:     "destructive",
        title:       "Failed to load projects",
        description: err.message,
      });
    } finally {
      setLoadingProjects(false);
    }
  }

  async function handleProjectSelect(project) {
    setProject(project);
    await fetchTasks(project._id);
  }

  async function handleSaveProject(formData, isEdit) {
    try {
      const payload = {
        name:        formData.name,
        description: formData.description,
        priority:    formData.priority,
        color:       formData.color,
        invites:     formData.invites,
      };

      if (isEdit) {
        const updated = await api.put(`/projects/${formData._id}`, payload);
        setProjects(prev => prev.map(p => p._id === updated._id ? updated : p));
        if (storeProject?._id === updated._id) setProject(updated);
        toast({ title: "Project updated!" });
      } else {
        const project = await api.post("/projects", payload);
        setProjects(prev => [project, ...prev]);
        await handleProjectSelect(project);
        toast({ title: "Project created!" });
      }
      closeModal();
    } catch (err) {
      toast({
        variant:     "destructive",
        title:       isEdit ? "Failed to update" : "Failed to create",
        description: err.message,
      });
    }
  }

  async function handleRenameProject(projectId, newName) {
    try {
      const updated = await api.put(`/projects/${projectId}`, { name: newName });
      setProjects(prev => prev.map(p => p._id === updated._id ? updated : p));
      if (storeProject?._id === updated._id) setProject(updated);
      toast({ title: "Project renamed" });
    } catch (err) {
      toast({
        variant:     "destructive",
        title:       "Failed to rename",
        description: err.message,
      });
    }
  }

  async function handleDeleteProject(projectId) {
    try {
      await api.delete(`/projects/${projectId}`);
      const remaining = projects.filter(p => p._id !== projectId);
      setProjects(remaining);
      if (storeProject?._id === projectId) {
        if (remaining.length > 0) {
          await handleProjectSelect(remaining[0]);
        } else {
          setProject(null);
          resetTasks?.();
        }
      }
      toast({ title: "Project deleted" });
    } catch (err) {
      toast({
        variant:     "destructive",
        title:       "Failed to delete project",
        description: err.message,
      });
    }
  }

  function openCreate() { setEditingProject(null); setShowProjectModal(true); }
  function openEdit(project) { setEditingProject(project); setShowProjectModal(true); }
  function closeModal() { setShowProjectModal(false); setEditingProject(null); }

  return (
    <div className="min-h-screen bg-[#F4F5F7] flex">
      <Sidebar
        projects={projects}
        onProjectSelect={handleProjectSelect}
        activeProject={storeProject}
        onCreateProject={openCreate}
        onEditProject={openEdit}
        onDeleteProject={handleDeleteProject}
        onRenameProject={handleRenameProject}
        loading={loadingProjects}
      />

      <div className="flex-1 flex flex-col min-h-screen ml-60">
        <Topbar project={storeProject} />
        <main className="flex-1">
          {loadingProjects ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex flex-col items-center gap-3">
                <div className="h-8 w-8 rounded-full border-2 border-[#5243F0] border-t-transparent animate-spin" />
                <p className="text-sm text-[#8E92A4]">Loading your projects…</p>
              </div>
            </div>
          ) : (
            children
          )}
        </main>
      </div>

      {showProjectModal && (
        <ProjectModal
          project={editingProject}
          onSave={handleSaveProject}
          onClose={closeModal}
        />
      )}
    </div>
  );
}
