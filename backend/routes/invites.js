import express    from "express";
import crypto     from "crypto";
import { Resend } from "resend";
import Invite     from "../models/Invite.js";
import Project    from "../models/Project.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

let _resend = null;
function getResend() {
  if (!_resend) {
    const key = process.env.RESEND_API_KEY;
    if (!key) throw new Error("RESEND_API_KEY is not set in .env");
    _resend = new Resend(key);
  }
  return _resend;
}

const FRONTEND   = process.env.FRONTEND_URL || "http://localhost:3000";
const FROM_EMAIL = process.env.FROM_EMAIL   || "onboarding@resend.dev";

// ── POST /api/invites/send ──────────────────────────────────────
router.post("/send", protect, async (req, res) => {
  try {
    const { email, projectId } = req.body;

    if (!email || !projectId)
      return res.status(400).json({ message: "email and projectId are required" });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email))
      return res.status(400).json({ message: "Invalid email address" });

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });

    const isOwner  = project.owner?.toString()   === req.user._id.toString();
    const isMember = project.members?.some(m => m.toString() === req.user._id.toString());
    if (!isOwner && !isMember)
      return res.status(403).json({ message: "Not authorized to invite to this project" });

    const existing = await Invite.findOne({
      email: email.toLowerCase(),
      project: projectId,
      status: "pending",
    });
    if (existing)
      return res.status(200).json({ message: "Invite already sent", alreadySent: true });

    const token = crypto.randomBytes(32).toString("hex");
    await Invite.create({
      email:     email.toLowerCase(),
      project:   projectId,
      invitedBy: req.user._id,
      token,
    });

    const inviteLink = `${FRONTEND}/invite?token=${token}`;
    const senderName = req.user.name || req.user.email;

    const { error } = await getResend().emails.send({
      from:    FROM_EMAIL,
      to:      email,
      subject: `${senderName} invited you to "${project.name}" on TaskTrack`,
      html:    buildEmailHTML({ senderName, projectName: project.name, inviteLink }),
    });

    if (error) {
      await Invite.findOneAndDelete({ token });
      console.error("[invite/send] Resend error:", error);
      return res.status(500).json({ message: "Failed to send email", error: error.message });
    }

    res.status(200).json({ message: "Invite sent successfully" });

  } catch (err) {
    console.error("[invite/send]", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ── GET /api/invites/preview?token=xxx ─────────────────────────
router.get("/preview", async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ message: "Token required" });

    const invite = await Invite
      .findOne({ token })
      .populate("project",   "name description color")
      .populate("invitedBy", "name email");

    if (!invite)
      return res.status(404).json({ message: "Invalid invite link" });

    if (invite.status === "accepted")
      return res.status(200).json({ message: "already_accepted", status: "accepted", project: invite.project });

    if (invite.status === "expired" || invite.expiresAt < new Date())
      return res.status(410).json({ message: "This invite link has expired" });

    res.json({
      email:     invite.email,
      project:   invite.project,
      invitedBy: invite.invitedBy,
      status:    invite.status,
      expiresAt: invite.expiresAt,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── POST /api/invites/accept ────────────────────────────────────
router.post("/accept", protect, async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ message: "Token required" });

    const invite = await Invite.findOne({ token });

    if (!invite)
      return res.status(404).json({ message: "Invalid invite link" });

    if (invite.status === "accepted")
      return res.status(200).json({ message: "Already a member", projectId: invite.project });

    if (invite.status === "expired" || invite.expiresAt < new Date()) {
      await Invite.findByIdAndUpdate(invite._id, { status: "expired" });
      return res.status(410).json({ message: "Invite link has expired" });
    }

    await Project.findByIdAndUpdate(
      invite.project,
      { $addToSet: { members: req.user._id } },
      { new: true }
    );

    invite.status = "accepted";
    await invite.save();

    res.status(200).json({
      message:   "Successfully joined the project!",
      projectId: invite.project,
    });

  } catch (err) {
    console.error("[invite/accept]", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ── Email HTML builder ──────────────────────────────────────────
function buildEmailHTML({ senderName, projectName, inviteLink }) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#F4F5F7;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="max-width:520px;width:100%;">
        <tr><td style="background:#5243F0;border-radius:16px 16px 0 0;padding:28px 32px;text-align:center;">
          <span style="color:#fff;font-size:20px;font-weight:800;">📋 TaskTrack</span>
        </td></tr>
        <tr><td style="background:#fff;padding:32px;border-left:1px solid #E4E6EF;border-right:1px solid #E4E6EF;">
          <h1 style="color:#1B1C22;font-size:22px;font-weight:800;margin:0 0 8px;">You've been invited! 🎉</h1>
          <p style="color:#8E92A4;font-size:15px;line-height:1.7;margin:0 0 24px;">
            <strong style="color:#1B1C22;">${senderName}</strong> has invited you to collaborate on
          </p>
          <div style="background:#F4F5F7;border:1px solid #E4E6EF;border-radius:12px;padding:16px 20px;margin-bottom:28px;">
            <p style="margin:0;font-size:17px;font-weight:800;color:#5243F0;">${projectName}</p>
            <p style="margin:4px 0 0;font-size:12px;color:#8E92A4;">TaskTrack Kanban Project</p>
          </div>
          <div style="text-align:center;margin-bottom:24px;">
            <a href="${inviteLink}"
               style="display:inline-block;background:#5243F0;color:#fff;text-decoration:none;
                      padding:14px 36px;border-radius:50px;font-weight:700;font-size:15px;
                      box-shadow:0 4px 18px rgba(82,67,240,0.35);">
              Accept Invitation →
            </a>
          </div>
          <p style="color:#B0B4C8;font-size:12px;text-align:center;margin:0;">
            Or copy: <a href="${inviteLink}" style="color:#5243F0;">${inviteLink}</a>
          </p>
        </td></tr>
        <tr><td style="background:#F9FAFB;border:1px solid #E4E6EF;border-top:none;border-radius:0 0 16px 16px;padding:16px 32px;text-align:center;">
          <p style="color:#C7C9DE;font-size:11px;margin:0;">
            This link expires in 7 days. If you didn't expect this, safely ignore this email.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export default router;
