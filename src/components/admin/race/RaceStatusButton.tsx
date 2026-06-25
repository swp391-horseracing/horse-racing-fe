import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { RACE_STATUS_FLOW, STATUS_LABELS } from "./raceStatus";

type Props = {
  currentStatus: string;
  onStatusChange: (status: string) => void;
  actionLoading?: boolean;
};

export default function RaceStatusButton({
  currentStatus,
  onStatusChange,
  actionLoading,
}: Props) {
  const [open, setOpen] = useState(false);

  const available = RACE_STATUS_FLOW[currentStatus] ?? [];

  if (available.length === 0) return null;

  return (
    <div className="relative">
      <button
        type="button"
        disabled={actionLoading}
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex items-center gap-1 text-xs font-bold bg-amber-600 text-white px-3 py-2 rounded-lg hover:bg-amber-700 transition disabled:opacity-50"
      >
        Update Status
        <ChevronDown className="w-3 h-3" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white border rounded-xl shadow-lg z-20 overflow-hidden">
          {available.map((status) => (
            <button
              key={status}
              type="button"
              disabled={actionLoading}
              onClick={async () => {
                await onStatusChange(status);
                setOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 disabled:opacity-50"
            >
              {STATUS_LABELS[status] ?? status.replaceAll("_", " ")}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 text-slate-500"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
