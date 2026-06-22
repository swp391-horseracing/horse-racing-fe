import { useState } from "react";
import { X, Trophy, ArrowRight } from "lucide-react";

function HorseIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M4 16v4h3l1-4" />
      <path d="M10 16v4h3l1-4" />
      <path d="M2 12c0-2 1-3 3-4l2-1c1-3 3-5 7-5 2 0 4 1 5 3l1 2h1c1 0 1 1 1 2v2c0 1-1 2-2 2h-1l-1 2H7l-1-2H5c-2 0-3-1-3-3z" />
    </svg>
  );
}
import { PredictionService } from "../../services/PredictionService";
import type { RaceEntry } from "../../types/race";

interface PlacePredictionModalProps {
  raceId: string;
  raceName: string;
  entries: RaceEntry[];
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  addToast: (
    message: string,
    type: "success" | "error" | "info" | "warning"
  ) => void;
}

const POSITIONS = [
  { value: 1, label: "1st" },
  { value: 2, label: "2nd" },
  { value: 3, label: "3rd" },
];

export function PlacePredictionModal({
  raceId,
  raceName,
  entries,
  open,
  onClose,
  onSuccess,
  addToast,
}: PlacePredictionModalProps) {
  const [selectedEntryId, setSelectedEntryId] = useState<string>("");
  const [selectedPosition, setSelectedPosition] = useState<number>(1);
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const handleSubmit = async () => {
    if (!selectedEntryId) {
      addToast("Please select a horse entry.", "warning");
      return;
    }
    try {
      setSubmitting(true);
      await PredictionService.placePrediction(
        raceId,
        selectedEntryId,
        selectedPosition
      );
      addToast("Prediction placed successfully!", "success");
      setSelectedEntryId("");
      setSelectedPosition(1);
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const error = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      addToast(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to place prediction",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white border border-[#064E3B]/10 rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-[#EAB308]" />
            <h2 className="font-headline font-bold text-[#064E3B] text-lg">
              Place Prediction
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-1">
              Race
            </p>
            <p className="font-headline font-bold text-[#064E3B] text-base">
              {raceName}
            </p>
          </div>

          <div>
            <label className="block font-label text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Select Entry
            </label>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {entries.map((entry) => (
                <label
                  key={entry.id}
                  className={`flex items-center justify-between p-3.5 border rounded-xl cursor-pointer hover:bg-slate-50 transition-all ${
                    selectedEntryId === entry.id
                      ? "border-[#064E3B] bg-[#064E3B]/5 ring-1 ring-[#064E3B]"
                      : "border-slate-100"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="entry"
                      value={entry.id}
                      checked={selectedEntryId === entry.id}
                      onChange={() => setSelectedEntryId(entry.id)}
                      className="text-[#064E3B] focus:ring-[#064E3B] h-4 w-4 border-slate-300"
                    />
                    <HorseIcon className="w-4 h-4 text-slate-400" />
                    <div>
                      <span className="text-sm font-bold text-slate-700">
                        {entry.name}
                      </span>
                      {entry.jockeyName && (
                        <span className="text-xs text-slate-400 ml-2">
                          (J: {entry.jockeyName})
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="font-label text-[10px] font-bold text-slate-400">
                    Lane {entry.laneNumber}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-label text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Predicted Position
            </label>
            <div className="flex gap-3">
              {POSITIONS.map((pos) => (
                <button
                  key={pos.value}
                  type="button"
                  onClick={() => setSelectedPosition(pos.value)}
                  className={`flex-1 py-3 rounded-xl border font-bold text-sm transition-all cursor-pointer ${
                    selectedPosition === pos.value
                      ? "border-[#064E3B] bg-[#064E3B]/5 text-[#064E3B] ring-1 ring-[#064E3B]"
                      : "border-slate-200 text-slate-500 hover:border-slate-300"
                  }`}
                >
                  {pos.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full bg-[#064E3B] text-white font-bold text-sm py-3 rounded-xl hover:bg-[#043E2F] hover:shadow-lg transition-all flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {submitting ? (
              "Submitting..."
            ) : (
              <>
                Confirm Prediction
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
