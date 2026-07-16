import { CheckCircle2, Clock3, AlertCircle } from "lucide-react";
import { StatusBadge, HORSE_REG_STATUS_STYLES } from "../ui/StatusBadge";
import { formatStatus } from "../../utils/formatters";

export function HorseStatusIndicator({ status }: { status: string }) {
  if (status === "approved") {
    return <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />;
  }

  const icons: Record<string, React.ReactNode> = {
    pending: <Clock3 className="h-3 w-3" />,
    rejected: <AlertCircle className="h-3 w-3" />,
  };

  return (
    <StatusBadge
      status={status}
      styleMap={HORSE_REG_STATUS_STYLES}
      label={formatStatus(status)}
      size="sm"
      icon={icons[status]}
      className="uppercase"
    />
  );
}
