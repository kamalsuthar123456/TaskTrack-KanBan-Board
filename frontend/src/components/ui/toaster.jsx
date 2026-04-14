import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { useToast } from "@/hooks/use-toast"

// ── STEP 4: Icon + accent bar config per variant ──────────────────────────────
const VARIANT_CONFIG = {
  destructive: {
    icon:    "❌",
    bar:     "bg-rose-500",
    iconBg:  "bg-rose-100",
  },
  success: {
    icon:    "✅",
    bar:     "bg-emerald-500",
    iconBg:  "bg-emerald-100",
  },
  warning: {
    icon:    "⚠️",
    bar:     "bg-amber-400",
    iconBg:  "bg-amber-100",
  },
  default: {
    icon:    "ℹ️",
    bar:     "bg-indigo-500",
    iconBg:  "bg-indigo-100",
  },
}

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(({ id, title, description, action, variant, ...props }) => {
        // ── STEP 4b: Resolve config — fallback to default ──────────────────
        const cfg = VARIANT_CONFIG[variant] || VARIANT_CONFIG.default

        return (
          <Toast key={id} variant={variant} {...props}>
            {/* ── STEP 4c: Icon circle ───────────────────────────────────── */}
            <div className={`ml-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-base ${cfg.iconBg}`}>
              {cfg.icon}
            </div>

            {/* ── Text content ──────────────────────────────────────────── */}
            <div className="flex-1 min-w-0">
              {title       && <ToastTitle>{title}</ToastTitle>}
              {description && <ToastDescription>{description}</ToastDescription>}
            </div>

            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
