export const PRIORITY_CONFIG = {
  Critical:          { color: "#EF4444", bg: "bg-red-50",    text: "text-red-600",    border: "border-red-200"    },
  High:              { color: "#F97316", bg: "bg-orange-50", text: "text-orange-600", border: "border-orange-200" },
  Medium:            { color: "#F59E0B", bg: "bg-amber-50",  text: "text-amber-600",  border: "border-amber-200"  },
  Low:               { color: "#10B981", bg: "bg-green-50",  text: "text-green-600",  border: "border-green-200"  },
  "Maybe Important": { color: "#6366F1", bg: "bg-indigo-50", text: "text-indigo-600", border: "border-indigo-200" },
  Backlog:           { color: "#8E92A4", bg: "bg-gray-50",   text: "text-gray-500",   border: "border-gray-200"   },
};

export const PRIORITY_KEYS = Object.keys(PRIORITY_CONFIG);

export const PRIORITY_LABELS = ["Low", "Medium", "High", "Critical"];

export const PRIORITY_COLORS_LIGHT = {
  // Capitalized keys (DB format)
  Low:      "text-emerald-700 bg-emerald-50 border-emerald-200",
  Medium:   "text-amber-700   bg-amber-50   border-amber-200",
  High:     "text-orange-700  bg-orange-50  border-orange-200",
  Critical: "text-red-700     bg-red-50     border-red-200",
  // Lowercase keys (legacy / QuickTask format) — same colors
  low:      "text-emerald-700 bg-emerald-50 border-emerald-200",
  medium:   "text-amber-700   bg-amber-50   border-amber-200",
  high:     "text-orange-700  bg-orange-50  border-orange-200",
  critical: "text-red-700     bg-red-50     border-red-200",
};

// ─── Dot colors for PriorityPicker (Column inline form) ──────────────────────
export const PRIORITY_DOT = {
  Low:      "#10B981",   
  Medium:   "#F59E0B",   
  High:     "#F97316",
  Critical: "#EF4444",
};

export const PRIORITY_CONFIG_DARK = {
  Low:      { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20", dot: "bg-emerald-500" },
  Medium:   { bg: "bg-amber-500/10",   text: "text-amber-400",   border: "border-amber-500/20",   dot: "bg-amber-500"   },
  High:     { bg: "bg-orange-500/10",  text: "text-orange-400",  border: "border-orange-500/20",  dot: "bg-orange-500"  },
  Critical: { bg: "bg-red-500/10",     text: "text-red-400",     border: "border-red-500/20",     dot: "bg-red-500"     },
};
