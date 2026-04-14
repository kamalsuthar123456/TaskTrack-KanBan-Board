import express  from "express";
import mongoose from "mongoose";
import Task     from "../models/Task.js";
import Project  from "../models/Project.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
const isProd = process.env.NODE_ENV === "production";

// ── Helper: verify user is project owner or member ───────────────────────────
async function isMember(projectId, userId) {
  if (!mongoose.Types.ObjectId.isValid(projectId)) return false;
  const project = await Project.findById(projectId).lean();
  if (!project) return false;
  const uid = userId.toString();
  return (
    project.owner.toString() === uid ||
    (project.members || []).map(m => m.toString()).includes(uid)
  );
}

// ── GET /api/tasks/project/:projectId ────────────────────────────────────────
// Returns all tasks for a project, sorted by order then createdAt
router.get("/project/:projectId", protect, async (req, res) => {
  try {
    const { projectId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(projectId))
      return res.status(400).json({ message: "Invalid project ID" });

    if (!(await isMember(projectId, req.user.id)))
      return res.status(403).json({ message: "Not a project member" });

    const tasks = await Task.find({ project: projectId })
      .populate("assignee",  "name email")
      .populate("createdBy", "name email")
      .sort({ order: 1, createdAt: -1 });

    res.json(tasks);
  } catch (err) {
    console.error("[GET /tasks/project]", err.message);
    res.status(500).json({ message: isProd ? "Server error" : err.message });
  }
});

// ── POST /api/tasks ───────────────────────────────────────────────────────────
// Create a new task — sets order to end of column
router.post("/", protect, async (req, res) => {
  try {
    const {
      title, description, priority, column,
      projectId, assignee, dueDate, tags,
    } = req.body;

    if (!title?.trim())   return res.status(400).json({ message: "Title is required" });
    if (!projectId)       return res.status(400).json({ message: "projectId is required" });

    if (!mongoose.Types.ObjectId.isValid(projectId))
      return res.status(400).json({ message: "Invalid project ID" });

    if (!(await isMember(projectId, req.user.id)))
      return res.status(403).json({ message: "Not a project member" });

    const targetColumn = column || "todo";

    // Set order to end of target column
    const count = await Task.countDocuments({
      project: projectId,
      column:  targetColumn,
    });

    const task = await Task.create({
      title:       title.trim(),
      description: description?.trim() || "",
      priority:    priority    || "Low",
      column:      targetColumn,
      project:     projectId,
      assignee:    assignee    || null,
      createdBy:   req.user.id,
      dueDate:     dueDate     || null,
      tags:        Array.isArray(tags) ? tags : [],
      order:       count,
    });

    const populated = await task.populate([
      { path: "assignee",  select: "name email" },
      { path: "createdBy", select: "name email" },
    ]);

    res.status(201).json(populated);
  } catch (err) {
    console.error("[POST /tasks]", err.message);
    res.status(500).json({ message: isProd ? "Server error" : err.message });
  }
});

// ── PATCH /api/tasks/reorder ──────────────────────────────────────────────────
router.patch("/reorder", protect, async (req, res) => {
  try {
    const { tasks, projectId } = req.body;

    if (!Array.isArray(tasks) || tasks.length === 0)
      return res.status(400).json({ message: "tasks array is required" });

    if (projectId && !(await isMember(projectId, req.user.id)))
      return res.status(403).json({ message: "Not a project member" });

    const invalidId = tasks.find(t => !mongoose.Types.ObjectId.isValid(t.id));
    if (invalidId)
      return res.status(400).json({ message: `Invalid task ID: ${invalidId.id}` });

    await Promise.all(
      tasks.map(({ id, order }) =>
        Task.findByIdAndUpdate(
          id,
          { order: Number(order) },
          { new: true }
        )
      )
    );

    res.json({ message: "Reordered successfully", count: tasks.length });
  } catch (err) {
    console.error("[PATCH /tasks/reorder]", err.message);
    res.status(500).json({ message: isProd ? "Server error" : err.message });
  }
});

// ── PATCH /api/tasks/:id ──────────────────────────────────────────────────────
router.patch("/:id", protect, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: "Invalid task ID" });

    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    if (!(await isMember(task.project, req.user.id)))
      return res.status(403).json({ message: "Not a project member" });

    const ALLOWED = [
      "title", "description", "priority", "column",
      "assignee", "dueDate", "tags", "order",
    ];
    ALLOWED.forEach(field => {
      if (req.body[field] !== undefined) task[field] = req.body[field];
    });

    await task.save();

    const populated = await task.populate([
      { path: "assignee",  select: "name email" },
      { path: "createdBy", select: "name email" },
    ]);

    res.json(populated);
  } catch (err) {
    console.error("[PATCH /tasks/:id]", err.message);
    res.status(500).json({ message: isProd ? "Server error" : err.message });
  }
});

// ── DELETE /api/tasks/:id ─────────────────────────────────────────────────────
router.delete("/:id", protect, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: "Invalid task ID" });

    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    if (!(await isMember(task.project, req.user.id)))
      return res.status(403).json({ message: "Not a project member" });

    await Task.findByIdAndDelete(id);
    res.json({ message: "Task deleted successfully" });
  } catch (err) {
    console.error("[DELETE /tasks/:id]", err.message);
    res.status(500).json({ message: isProd ? "Server error" : err.message });
  }
});

export default router;
