import mongoose from "mongoose";

const InviteSchema = new mongoose.Schema({
  email:     { type: String, required: true, lowercase: true, trim: true },
  project:   { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
  invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User",    required: true },
  token:     { type: String, required: true, unique: true },
  status:    { type: String, enum: ["pending", "accepted", "expired"], default: "pending" },
  expiresAt: { type: Date,   default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
}, { timestamps: true });

// Auto-index for fast token lookups
InviteSchema.index({ token: 1 });
InviteSchema.index({ email: 1, project: 1 });

export default mongoose.model("Invite", InviteSchema);
