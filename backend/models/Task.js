import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true, maxlength: 120 },
  description: { type: String, default: "", maxlength: 2000 },
  priority: {
    type:    String,
    enum:    ["Low", "Medium", "High", "Critical", "Important"],
    default: "Low",
  },
  column: {
    type:    String,
    enum:    ["todo", "inprogress", "review", "done"],
    default: "todo",
  },
  project:   { type: mongoose.Schema.Types.ObjectId, ref: "Project",  required: true },
  assignee:  { type: mongoose.Schema.Types.ObjectId, ref: "User",     default: null },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User",     required: true },
  dueDate:   { type: Date,     default: null },
  tags:      [{ type: String, trim: true }],
  comments:  { type: Number,   default: 0 },
  checks:    { type: Number,   default: 0 },
  avatars:   [{ type: String }],
  order:     { type: Number,   default: 0 },
}, { timestamps: true });

// Fast lookups by project + column (most common query pattern)
TaskSchema.index({ project: 1, column: 1 });
TaskSchema.index({ project: 1, order:  1 });

export default mongoose.model("Task", TaskSchema);
