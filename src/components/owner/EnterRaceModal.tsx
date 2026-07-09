import { useState, useEffect, useCallback, startTransition } from "react";
import { Layers, X, AlertTriangle } from "lucide-react";
import type { HorseOption } from "../../hooks/useOwner";

interface EnterRaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  raceName: string;
  laneCount: number;
  currentEntryCount: number;
  horseOptions: HorseOption[];
  onSubmit: (horseId: string) => Promise<void>;
}

export function EnterRaceModal({
  isOpen,
  onClose,
  raceName,
  laneCount,
  currentEntryCount,
  horseOptions,
  onSubmit,
}: EnterRaceModalProps) {
  const [horseId, setHorseId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      startTransition(() => {
        setHorseId("");
        setSubmitting(false);
        setError(null);
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

  const selectedHorse = horseOptions.find((h) => h.id === horseId);
  const selectionIneligible = selectedHorse && !selectedHorse.eligible;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!horseId || isFull || submitting || selectionIneligible) return;
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit(horseId);
      onClose();
    } catch (err: unknown) {
      const axiosError = err as {
        response?: { data?: { message?: string } };
      };
      setError(axiosError?.response?.data?.message || "Failed to enter race.");
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
            {horseOptions.length > 0 ? (
              <select
                value={horseId}
                onChange={(e) => setHorseId(e.target.value)}
                required
                disabled={isFull || submitting}
                className="w-full bg-slate-50 border rounded-md p-2.5 text-xs disabled:opacity-50"
              >
                <option value="" disabled>
                  -- Choose Horse --
                </option>
                {horseOptions.map((h) => (
                  <option key={h.id} value={h.id} disabled={!h.eligible}>
                    {h.name}
                    {!h.eligible ? ` (${h.reason ?? "Ineligible"})` : ""}
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-xs text-slate-400 italic">
                No eligible horses. Register a horse for this tournament first.
              </p>
            )}

            {selectionIneligible && selectedHorse?.reason && (
              <div className="mt-2 flex items-center gap-1.5 text-xs text-amber-700">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                <span>{selectedHorse.reason}</span>
              </div>
            )}
          </div>

          {isFull && (
            <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-700 font-medium">
              This race is full. No available slots.
            </div>
          )}

          {error && (
            <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
              {error}
            </div>
          )}

          <div className="flex gap-2 justify-end pt-2 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-md border px-3 py-1.5 text-xs hover:bg-slate-50 disabled:opacity-40"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!horseId || isFull || submitting || selectionIneligible}
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
