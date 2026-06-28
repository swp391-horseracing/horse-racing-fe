import { CheckCircle2, XCircle, AlertTriangle, Activity } from "lucide-react";
import { cn } from "../../lib/utils";
import type { Toast } from "../../types/referee";

interface ToastContainerProps {
  toasts: Toast[];
}

const typeStyles = {
  success: {
    container: "bg-emerald-50 border-emerald-300 text-emerald-900",
    icon: "text-emerald-600",
    Icon: CheckCircle2,
  },
  error: {
    container: "bg-rose-50 border-rose-300 text-rose-900",
    icon: "text-rose-600",
    Icon: XCircle,
  },
  warning: {
    container: "bg-amber-50 border-amber-300 text-amber-900",
    icon: "text-amber-600",
    Icon: AlertTriangle,
  },
  info: {
    container: "bg-indigo-50 border-indigo-300 text-indigo-900",
    icon: "text-indigo-600",
    Icon: Activity,
  },
};

export function ToastContainer({ toasts }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[200] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => {
        const styles = typeStyles[t.type];
        const Icon = styles.Icon;
        return (
          <div
            key={t.id}
            className={cn(
              "p-3.5 rounded-xl border shadow-xl backdrop-blur-md flex items-start gap-2.5 pointer-events-auto transform animate-in slide-in-from-top duration-200 text-xs font-semibold",
              styles.container
            )}
          >
            <span className="shrink-0 mt-0.5">
              <Icon className={cn("w-4 h-4", styles.icon)} />
            </span>
            <span>{t.message}</span>
          </div>
        );
      })}
    </div>
  );
}
