import { useState, useEffect, useCallback, startTransition } from "react";
import { Layers, X } from "lucide-react";

interface EnterRaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  raceName: string;
  laneCount: number;
  currentEntryCount: number;
  eligibleHorses: { id: string; name: string }[];
  onSubmit: (horseId: string) => Promise<void>;
}

export function EnterRaceModal({
  isOpen,
  onClose,
  raceName,
  laneCount,
  currentEntryCount,
  eligibleHorses,
  onSubmit,
}: EnterRaceModalProps) {
  const [horseId, setHorseId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      startTransition(() => {
        setHorseId("");
        setSubmitting(false);
      });
    }
  }, [isOpen]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  if (!isOpen) return null;

  const slotsAvailable = laneCount - currentEntryCount;
  const isFull = slotsAvailable <= 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!horseId || isFull || submitting) return;
    setSubmitting(true);
    try {
      await onSubmit(horseId);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
      onKeyDown={handleKeyDown}
    >
      <div
        className="bg-white rounded-xl border p-5 max-w-sm w-full shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="enter-race-title"
      >
        <div className="flex items-center justify-between border-b pb-2.5 mb-4">
          <h3
            id="enter-race-title"
            className="font-bold text-base text-[#064E3B]"
          >
            Enter Race
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mb-4 p-3 rounded-lg bg-[#064E3B]/5 border border-[#064E3B]/10">
          <p className="text-sm font-bold text-[#064E3B] truncate">
            {raceName}
          </p>
          <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Layers className="h-3.5 w-3.5" />
              {currentEntryCount} / {laneCount} slots filled
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
              Select Horse
            </label>
            {eligibleHorses.length > 0 ? (
              <select
                value={horseId}
                onChange={(e) => setHorseId(e.target.value)}
                required
                disabled={isFull}
                className="w-full bg-slate-50 border rounded-md p-2.5 text-xs disabled:opacity-50"
              >
                <option value="" disabled>
                  -- Choose Horse --
                </option>
                {eligibleHorses.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name}
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-xs text-slate-400 italic">
                No eligible horses. Register a horse for this tournament first.
              </p>
            )}
          </div>

          {isFull && (
            <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-700 font-medium">
              This race is full. No available slots.
            </div>
          )}

          <div className="flex gap-2 justify-end pt-2 border-t">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border px-3 py-1.5 text-xs hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!horseId || isFull || submitting}
              className="rounded-md bg-[#064E3B] text-white px-3.5 py-1.5 text-xs font-bold hover:bg-[#043E2F] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {submitting ? "Entering..." : "Enter Race"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
