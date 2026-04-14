import express  from "express";
import Project  from "../models/Project.js";
import Task     from "../models/Task.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// ── GET all projects for logged-in user ──
router.get("/", protect, async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [{ owner: req.user.id }, { members: req.user.id }],
    }).sort({ createdAt: -1 });
    res.json(projects);
  } catch (err) {
    console.error("GET /projects:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ── POST create project ──
router.post("/", protect, async (req, res) => {
  const { name, description, color, priority, invites } = req.body;

  if (!name?.trim()) {
    return res.status(400).json({ message: "Project name is required" });
  }

  try {
    const project = await Project.create({
      name:        name.trim(),
      description: description?.trim() || "",
      color:       color    || "#F59E0B",
      priority:    priority || "Medium",
      owner:       req.user.id,
      members:     [req.user.id],
      invites:     Array.isArray(invites) ? invites : [],
    });
    res.status(201).json(project);
  } catch (err) {
    console.error("POST /projects:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ── PUT update project (owner only) ──
router.put("/:id", protect, async (req, res) => {
  try {
    const { name, description, color, priority, invites } = req.body;

    const updateFields = {};
    if (name        !== undefined) updateFields.name        = name.trim();
    if (description !== undefined) updateFields.description = description.trim();
    if (color       !== undefined) updateFields.color       = color;
    if (priority    !== undefined) updateFields.priority    = priority;
    if (invites     !== undefined) updateFields.invites     = Array.isArray(invites) ? invites : [];

    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, owner: req.user.id },
      updateFields,
      { new: true, runValidators: true }
    );

    if (!project) {
      return res.status(404).json({ message: "Project not found or not authorized" });
    }
    res.json(project);
  } catch (err) {
    console.error("PUT /projects/:id:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ── DELETE project (owner only) + cascade delete tasks ──
router.delete("/:id", protect, async (req, res) => {
  try {
    const project = await Project.findOne({
      _id:   req.params.id,
      owner: req.user.id,
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found or not authorized" });
    }

    await Task.deleteMany({ project: project._id });
    await project.deleteOne();

    res.json({ message: "Project deleted" });
  } catch (err) {
    console.error("DELETE /projects/:id:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;
