import { useState, useRef, useEffect } from "react";
import {
  X, Trash2, UserPlus, Copy, Check,
  AlignLeft, FolderKanban, ChevronDown,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  PRIORITY_CONFIG,
  PRIORITY_KEYS,
} from "@/constants/priority";
import { api } from "@/lib/api";

export { PRIORITY_CONFIG, PRIORITY_KEYS };

function UsersIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2
           M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8
           M23 21v-2a4 4 0 0 0-3-3.87
           M16 3.13a4 4 0 0 1 0 7.75"
      />
    </svg>
  );
}

function isEmail(str) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(str));
}

function avatarInitials(email) {
  return String(email).split("@")[0].slice(0, 2).toUpperCase();
}

async function sendInviteEmails(projectId, emailList) {
  if (!emailList.length) return;
  const results = await Promise.allSettled(
    emailList.map(email =>
      api.post("/invites/send", { email, projectId })
    )
  );
  const failed = results.filter(r => r.status === "rejected").length;
  if (failed > 0) console.warn(`[invites] ${failed} invite(s) failed to send`);
}

export default function ProjectModal({ project, onSave, onClose }) {
  const isEdit = !!project;

  const [name,        setName]        = useState(project?.name        || "");
  const [description, setDescription] = useState(project?.description || "");
  const [priority,    setPriority]    = useState(project?.priority    || "Medium");
  const [activeTab,   setActiveTab]   = useState("general");
  const [invites,     setInvites]     = useState(() => (project?.invites || []).filter(isEmail));
  const [emailInput,  setEmailInput]  = useState("");
  const [emailError,  setEmailError]  = useState("");
  const [saving,      setSaving]      = useState(false);
  const [copied,      setCopied]      = useState(false);

  const nameRef  = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { nameRef.current?.focus(); }, []);

  useEffect(() => {
    function onKey(e) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function addInvite() {
    const email = emailInput.trim().toLowerCase();
    if (!email) return;
    if (!isEmail(email)) { setEmailError("Enter a valid email address"); return; }
    if (invites.includes(email)) { setEmailError("Already added"); return; }
    setInvites(prev => [...prev, email]);
    setEmailInput("");
    setEmailError("");
    inputRef.current?.focus();
  }

  function removeInvite(email) {
    setInvites(prev => prev.filter(m => m !== email));
  }

  function copyLink() {
    const link = `${window.location.origin}/invite?token=${project?._id || ""}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) { nameRef.current?.focus(); return; }
    setSaving(true);

    try {
      const savedProject = await onSave(
        {
          _id:         project?._id,
          name:        name.trim(),
          description: description.trim(),
          priority,
          color:       PRIORITY_CONFIG[priority]?.color || "#F59E0B",
          invites,
        },
        isEdit
      );

      if (savedProject?._id && invites.length > 0) {
        await sendInviteEmails(savedProject._id, invites);
      }
    } catch (err) {
      console.error("[ProjectModal] save failed:", err);
    } finally {
      setSaving(false);
    }
  }

  const cfg = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG["Medium"];

  const TABS = [
    { key: "general", label: "General" },
    { key: "members", label: invites.length > 0 ? `Members (${invites.length})` : "Members" },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="bg-white border border-[#E4E6EF] rounded-2xl w-full max-w-md shadow-[0_32px_80px_rgba(0,0,0,0.16)] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-[#E4E6EF]">
          <div className="flex items-center gap-3">
            <div
              className="h-10 w-10 rounded-xl grid place-items-center shadow-sm shrink-0 transition-colors duration-300"
              style={{ backgroundColor: cfg.color }}
            >
              <FolderKanban className="h-5 w-5 text-white" strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#1B1C22]">
                {isEdit ? "Edit Project" : "New Project"}
              </h2>
              <p className="text-xs text-[#8E92A4]">
                {isEdit ? "Update details and members" : "Set up your new project"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-xl grid place-items-center text-[#8E92A4] hover:bg-[#F4F5F7] hover:text-[#1B1C22] transition-all"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* ── Tabs ── */}
        <div className="flex border-b border-[#E4E6EF] px-6 gap-6">
          {TABS.map(tab => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`py-3 text-sm font-semibold border-b-2 transition-all ${
                activeTab === tab.key
                  ? "border-[#5243F0] text-[#5243F0]"
                  : "border-transparent text-[#8E92A4] hover:text-[#1B1C22]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="px-6 py-5 space-y-5 max-h-[60vh] overflow-y-auto">

            {/* ══ GENERAL TAB ══ */}
            {activeTab === "general" && (
              <>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#8E92A4]">
                    Project Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    ref={nameRef}
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Marketing Website"
                    required
                    maxLength={100}
                    className="w-full h-11 px-4 rounded-xl bg-[#F4F5F7] border border-[#E4E6EF] text-[#1B1C22] placeholder:text-[#B0B4C8] text-sm focus:outline-none focus:border-[#5243F0] focus:ring-[3px] focus:ring-[#5243F0]/10 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#8E92A4] flex items-center gap-1.5">
                    <AlignLeft className="h-3 w-3" /> Description
                  </label>
                  <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="What is this project about?"
                    rows={3}
                    maxLength={500}
                    className="w-full px-4 py-3 rounded-xl bg-[#F4F5F7] border border-[#E4E6EF] text-[#1B1C22] placeholder:text-[#B0B4C8] text-sm resize-none focus:outline-none focus:border-[#5243F0] focus:ring-[3px] focus:ring-[#5243F0]/10 transition-all"
                  />
                  <p className="text-right text-[10px] text-[#C7C9DE]">{description.length}/500</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#8E92A4]">
                    Project Priority
                  </label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className={`w-full flex items-center justify-between gap-2 h-11 px-4 rounded-xl border text-sm font-semibold transition-all focus:outline-none focus:ring-[3px] focus:ring-[#5243F0]/10 ${cfg.bg} ${cfg.text} ${cfg.border}`}
                      >
                        <span className="flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: cfg.color }} />
                          {priority}
                        </span>
                        <ChevronDown className="h-4 w-4 opacity-60" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      className="w-[--radix-dropdown-menu-trigger-width] p-1 rounded-xl border border-[#E4E6EF] shadow-[0_8px_32px_rgba(0,0,0,0.12)] bg-white"
                      sideOffset={6}
                    >
                      {PRIORITY_KEYS.map(p => {
                        const c   = PRIORITY_CONFIG[p];
                        const sel = priority === p;
                        return (
                          <DropdownMenuItem
                            key={p}
                            onSelect={() => setPriority(p)}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-sm font-medium transition-colors ${
                              sel
                                ? `${c.bg} ${c.text} font-semibold`
                                : "text-[#1B1C22] hover:bg-[#F4F5F7] focus:bg-[#F4F5F7]"
                            }`}
                          >
                            <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                            <span className="flex-1">{p}</span>
                            {sel && <Check className="h-3.5 w-3.5 shrink-0" />}
                          </DropdownMenuItem>
                        );
                      })}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="rounded-xl bg-[#F4F5F7] border border-[#E4E6EF] p-3 flex items-center gap-3">
                  <div
                    className="h-9 w-9 rounded-xl grid place-items-center shrink-0 transition-colors duration-300"
                    style={{ backgroundColor: cfg.color }}
                  >
                    <FolderKanban className="h-4 w-4 text-white" strokeWidth={2} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[#1B1C22] truncate">
                      {name || <span className="text-[#B0B4C8]">Project name</span>}
                    </p>
                    <div className="mt-0.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                        {priority}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-[#C7C9DE] shrink-0">Preview</span>
                </div>
              </>
            )}

            {/* ══ MEMBERS TAB ══ */}
            {activeTab === "members" && (
              <>
                {isEdit && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#8E92A4]">
                      Invite Link
                    </label>
                    <div className="flex items-center gap-2 h-11 px-3 rounded-xl bg-[#F4F5F7] border border-[#E4E6EF]">
                      <p className="flex-1 text-xs text-[#8E92A4] truncate font-mono">
                        {window.location.origin}/invite/{project._id}
                      </p>
                      <button
                        type="button"
                        onClick={copyLink}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all shrink-0 ${
                          copied
                            ? "bg-green-50 text-green-600 border-green-200"
                            : "bg-white border-[#E4E6EF] text-[#5243F0] hover:bg-[#5243F0] hover:text-white hover:border-[#5243F0]"
                        }`}
                      >
                        {copied ? <><Check className="h-3 w-3" /> Copied!</> : <><Copy className="h-3 w-3" /> Copy</>}
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#8E92A4]">
                    Invite by Email
                  </label>
                  <div className="flex gap-2">
                    <input
                      ref={inputRef}
                      type="email"
                      value={emailInput}
                      onChange={e => { setEmailInput(e.target.value); setEmailError(""); }}
                      onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addInvite(); } }}
                      placeholder="colleague@example.com"
                      className="flex-1 h-11 px-4 rounded-xl bg-[#F4F5F7] border border-[#E4E6EF] text-[#1B1C22] placeholder:text-[#B0B4C8] text-sm focus:outline-none focus:border-[#5243F0] focus:ring-[3px] focus:ring-[#5243F0]/10 transition-all"
                    />
                    <button
                      type="button"
                      onClick={addInvite}
                      className="h-11 px-4 rounded-xl bg-[#5243F0] hover:bg-[#4537D6] text-white text-sm font-semibold flex items-center gap-1.5 transition-all shrink-0 shadow-[0_4px_12px_rgba(82,67,240,0.28)] active:scale-95"
                    >
                      <UserPlus className="h-4 w-4" />
                      Add
                    </button>
                  </div>
                  {emailError && <p className="text-xs text-red-500">{emailError}</p>}
                </div>

                {invites.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 rounded-xl border-2 border-dashed border-[#E4E6EF]">
                    <UsersIcon className="h-9 w-9 text-[#C7C9DE] mb-2" />
                    <p className="text-sm font-semibold text-[#B0B4C8]">No invites yet</p>
                    <p className="text-xs text-[#C7C9DE] mt-1">Add emails above to invite people</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#8E92A4]">
                      {invites.length} Pending Invite{invites.length !== 1 ? "s" : ""}
                    </p>
                    {invites.map(email => (
                      <div
                        key={email}
                        className="flex items-center gap-3 p-3 rounded-xl bg-[#F4F5F7] border border-[#E4E6EF] group hover:border-[#C7C9DE] transition-all"
                      >
                        <div
                          className="h-8 w-8 rounded-full grid place-items-center text-white text-[11px] font-bold shrink-0"
                          style={{
                            backgroundColor:
                              Object.values(PRIORITY_CONFIG)[email.charCodeAt(0) % PRIORITY_KEYS.length].color,
                          }}
                        >
                          {avatarInitials(email)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[#1B1C22] truncate">{email}</p>
                          <p className="text-[10px] text-[#8E92A4]">Pending invite</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeInvite(email)}
                          className="h-7 w-7 rounded-lg grid place-items-center text-[#B0B4C8] hover:bg-red-50 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

          </div>

          {/* ── Footer ── */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-[#E4E6EF] bg-[#F9FAFB]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm text-[#8E92A4] hover:text-[#1B1C22] hover:bg-white border border-transparent hover:border-[#E4E6EF] transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || saving}
              className="px-5 py-2 rounded-xl bg-[#5243F0] hover:bg-[#4537D6] text-white text-sm font-semibold flex items-center gap-2 transition-all shadow-[0_4px_14px_rgba(82,67,240,0.3)] disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
            >
              {saving
                ? <><span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Saving…</>
                : isEdit ? "Save Changes" : "Create Project"
              }
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
