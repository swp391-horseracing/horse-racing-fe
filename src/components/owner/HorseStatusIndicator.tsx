import { CheckCircle2, Clock3, AlertCircle } from "lucide-react";
import { cn } from "../../lib/utils";
import { formatStatus } from "../../utils/statusFormat";

export function HorseStatusIndicator({ status }: { status: string }) {
  if (status === "approved") {
    return <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />;
  }

  const styles: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700 border-amber-200",
    rejected: "bg-rose-100 text-rose-700 border-rose-200",
  };

  const icons: Record<string, React.ReactNode> = {
    pending: <Clock3 className="h-3 w-3" />,
    rejected: <AlertCircle className="h-3 w-3" />,
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-black uppercase tracking-wider",
        styles[status] ?? "bg-slate-100 text-slate-600 border-slate-200"
      )}
    >
      {icons[status]}
      {formatStatus(status)}
    </span>
  );
}
