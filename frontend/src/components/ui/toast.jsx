import * as React from "react"
import * as ToastPrimitives from "@radix-ui/react-toast"
import { cva } from "class-variance-authority"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

const ToastProvider = ToastPrimitives.Provider

const ToastViewport = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      "fixed bottom-4 right-4 z-[100] flex max-h-screen w-full max-w-[400px] flex-col gap-2",
      className
    )}
    {...props}
  />
))
ToastViewport.displayName = ToastPrimitives.Viewport.displayName

// ── STEP 1: 4 distinct variants — each unique color ───────────────────────────
const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between gap-3 overflow-hidden rounded-2xl border p-4 pr-9 shadow-[0_8px_32px_rgba(0,0,0,0.10)] transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-bottom-full",
  {
    variants: {
      variant: {
        // ℹ️  Default — soft indigo (info/neutral)
        default:     "bg-[#F0EFFE] border-[#C5BFFC] text-[#1B1C22]",
        // ❌ Destructive — deep rose (errors)
        destructive: "bg-[#FFF1F2] border-[#FECDD3] text-[#1B1C22]",
        // ✅ Success — soft emerald (wins)
        success:     "bg-[#ECFDF5] border-[#6EE7B7] text-[#1B1C22]",
        // ⚠️  Warning — soft amber (caution)
        warning:     "bg-[#FFFBEB] border-[#FCD34D] text-[#1B1C22]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Toast = React.forwardRef(({ className, variant, ...props }, ref) => (
  <ToastPrimitives.Root
    ref={ref}
    className={cn(toastVariants({ variant }), className)}
    {...props}
  />
))
Toast.displayName = ToastPrimitives.Root.displayName

const ToastAction = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      "inline-flex h-8 shrink-0 items-center justify-center rounded-xl border border-[#E4E6EF] bg-transparent px-3 text-sm font-medium transition-colors hover:bg-white/60 focus:outline-none disabled:pointer-events-none disabled:opacity-50",
      className
    )}
    {...props}
  />
))
ToastAction.displayName = ToastPrimitives.Action.displayName

// ── STEP 2: Close button — dark on all variants ────────────────────────────────
const ToastClose = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      "absolute right-2 top-2 rounded-lg p-1 text-[#8E92A4] opacity-70 transition-opacity hover:opacity-100 focus:opacity-100 focus:outline-none",
      className
    )}
    toast-close=""
    {...props}
  >
    <X className="h-3.5 w-3.5" />
  </ToastPrimitives.Close>
))
ToastClose.displayName = ToastPrimitives.Close.displayName

// ── STEP 3: Title — variant-aware accent colors ────────────────────────────────
const ToastTitle = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn(
      "text-sm font-bold text-[#1B1C22] [&+div]:text-xs",
      // Variant accent colors via group selector
      "group-[.destructive-toast]:text-rose-700",
      "group-[.success-toast]:text-emerald-700",
      "group-[.warning-toast]:text-amber-700",
      "group-[.default-toast]:text-indigo-700",
      className
    )}
    {...props}
  />
))
ToastTitle.displayName = ToastPrimitives.Title.displayName

// ── STEP 3b: Description — muted but readable on all variants ─────────────────
const ToastDescription = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn("text-xs text-[#6B7280] leading-relaxed", className)}
    {...props}
  />
))
ToastDescription.displayName = ToastPrimitives.Description.displayName

export {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
}
