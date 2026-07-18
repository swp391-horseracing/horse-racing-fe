import { useEffect, useState, useCallback } from "react";
import {
  Ticket,
  Trophy,
  Clock,
  Target,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { useAuthContext } from "../../contexts/AuthContext";
import { PredictionService } from "../../services/PredictionService";
import type { Prediction } from "../../types/prediction";
import type { RaceEntry } from "../../types/race";
import { useToast } from "../../hooks/useToast";
import { ToastContainer } from "../ui/toast";

interface PredictionsSidebarProps {
  raceId: string;
  raceStatus?: string;
  raceName?: string;
  entries?: RaceEntry[];
  firstHorseName?: string;
  onPredictionChange: (horseName: string | null) => void;
  isSimulating?: boolean;
  elapsedMs?: number;
}

const POSITION_LABELS: Record<number, string> = {
  1: "1st Place",
  2: "2nd Place",
  3: "3rd Place",
};

const POSITION_EMOJI: Record<number, string> = {
  1: "🥇",
  2: "🥈",
  3: "🥉",
};

/** Generate deterministic mock odds from prediction ID hash */
function getMockOdds(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) | 0;
  }
  const numerators = [2, 3, 5, 7, 4, 9, 6, 8, 11, 15];
  const denominators = [1, 1, 2, 2, 1, 4, 1, 3, 4, 8];
  const idx = Math.abs(hash) % numerators.length;
  return `${numerators[idx]}/${denominators[idx]}`;
}

/** Evaluate fractional odds to return multiplier */
function evalOdds(oddsStr: string): number {
  const parts = oddsStr.split("/");
  if (parts.length === 2) {
    const num = parseFloat(parts[0]);
    const den = parseFloat(parts[1]);
    return 1 + num / den;
  }
  return 1.0;
}

/** Generate deterministic mock token amount from prediction ID hash */
function getMockTokens(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 37 + id.charCodeAt(i)) | 0;
  }
  const amounts = [50, 100, 150, 200, 250, 300, 500, 75, 125, 350];
  return amounts[Math.abs(hash) % amounts.length];
}

function formatPlacedAt(dateString: string): string {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "Unknown";
  return date.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

type TicketStatus = "live" | "won" | "lost" | "preview";

function getTicketStatus(
  prediction: Prediction | null,
  isPreview: boolean
): TicketStatus {
  if (isPreview) return "preview";
  if (!prediction) return "preview";
  if (prediction.isCorrect === true) return "won";
  if (prediction.isCorrect === false) return "lost";
  return "live";
}

const STATUS_CONFIG: Record<
  TicketStatus,
  { label: string; bg: string; text: string; icon: React.ReactNode }
> = {
  live: {
    label: "LIVE",
    bg: "bg-emerald-100",
    text: "text-emerald-700",
    icon: <Sparkles size={12} />,
  },
  won: {
    label: "WON",
    bg: "bg-amber-100",
    text: "text-amber-700",
    icon: <CheckCircle2 size={12} />,
  },
  lost: {
    label: "LOST",
    bg: "bg-red-100",
    text: "text-[#991B1B]",
    icon: <XCircle size={12} />,
  },
  preview: {
    label: "PREVIEW",
    bg: "bg-slate-100",
    text: "text-slate-500",
    icon: <AlertCircle size={12} />,
  },
};

export function PredictionsSidebar({
  raceId,
  raceStatus,
  raceName,
  entries,
  firstHorseName,
  onPredictionChange,
  isSimulating = false,
  elapsedMs = 0,
}: PredictionsSidebarProps) {
  const { user } = useAuthContext();
  const { toasts, addToast } = useToast();

  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [loading, setLoading] = useState(false);
  const [isPreview, setIsPreview] = useState(false);

  const [isPicking, setIsPicking] = useState(false);
  const [selectedEntryId, setSelectedEntryId] = useState("");
  const [selectedPosition, setSelectedPosition] = useState(1);
  const [tokens, setTokens] = useState<number>(100);
  const [submitting, setSubmitting] = useState(false);

  const isSpectator = user?.role === "spectator";
  const isRaceStarted =
    isSimulating ||
    elapsedMs > 0 ||
    !["scheduled", "pre_race"].includes(raceStatus || "");

  const canPlacePrediction = isSpectator && !prediction && !isRaceStarted;

  const loadPrediction = useCallback(async () => {
    if (!raceId) return;

    // Non-spectators get preview mode
    if (!user || !isSpectator) {
      setIsPreview(true);
      const isRaceScheduled =
        raceStatus === "scheduled" || raceStatus === "pre_race";
      if (isRaceScheduled) {
        setPrediction((prev) => {
          if (prev && prev.race.id === raceId) {
            onPredictionChange(prev.predictedEntry.horseName);
            return prev;
          }
          onPredictionChange(null);
          return null;
        });
      } else if (firstHorseName) {
        setPrediction((prev) => {
          if (prev && prev.race.id === raceId) return prev;
          const mock = {
            id: "preview-mock-id-00000001",
            race: {
              id: raceId,
              name: raceName || "Race",
              distanceMeters: 0,
              scheduledAt: new Date().toISOString(),
              venue: "",
              status: raceStatus || "draft",
            },
            predictedEntry: {
              entryId: "preview-entry",
              horseName: firstHorseName,
            },
            predictedPosition: 1,
            placedAt: new Date().toISOString(),
            isCorrect: null,
            rewardAmount: null as unknown as string,
          };
          onPredictionChange(firstHorseName);
          return mock;
        });
      }
      return;
    }

    // Spectators: fetch real prediction
    setLoading(true);
    try {
      const data = await PredictionService.getMyPredictions({
        page: 1,
        limit: 50,
      });
      const match = data.data.find((p) => p.race.id === raceId);
      setPrediction(match || null);
      setIsPreview(false);
      onPredictionChange(match?.predictedEntry.horseName || null);
    } catch {
      setPrediction(null);
      setIsPreview(false);
      onPredictionChange(null);
    } finally {
      setLoading(false);
    }
  }, [
    raceId,
    user,
    isSpectator,
    firstHorseName,
    raceName,
    raceStatus,
    onPredictionChange,
  ]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadPrediction();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadPrediction]);

  const showPickingForm = isPicking && !isRaceStarted;

  const startPicking = () => {
    if (isRaceStarted) return;
    setSelectedEntryId(prediction?.predictedEntry.entryId || "");
    setSelectedPosition(prediction?.predictedPosition || 1);
    setTokens((prediction as any)?.tokens || 100);
    setIsPicking(true);
  };

  const handleInlineSubmit = async () => {
    if (isRaceStarted) {
      addToast(
        "The race has already started. Predictions are locked.",
        "error"
      );
      setIsPicking(false);
      return;
    }
    if (!selectedEntryId) {
      addToast("Please select a horse entry.", "warning");
      return;
    }
    if (tokens < 10) {
      addToast("Minimum token placement is 10.", "warning");
      return;
    }

    const horseName =
      (entries || []).find((e) => e.id === selectedEntryId)?.name || "Unknown";

    // Non-spectators (Admin showcase flow) bypasses backend role check and mocks success
    if (!isSpectator) {
      setSubmitting(true);
      setTimeout(() => {
        setPrediction({
          id: `preview-mock-id-${Date.now()}`,
          race: {
            id: raceId,
            name: raceName || "Race",
            distanceMeters: 0,
            scheduledAt: new Date().toISOString(),
            venue: "",
            status: raceStatus || "draft",
          },
          predictedEntry: {
            entryId: selectedEntryId,
            horseName: horseName,
          },
          predictedPosition: selectedPosition,
          placedAt: new Date().toISOString(),
          isCorrect: null,
          rewardAmount: null as unknown as string,
          tokens: tokens, // Store user inputted tokens locally
        } as any);
        onPredictionChange(horseName);
        setIsPicking(false);
        setSubmitting(false);
        addToast("Showcase prediction placed successfully!", "success");
      }, 350);
      return;
    }

    try {
      setSubmitting(true);
      await PredictionService.placePrediction(
        raceId,
        selectedEntryId,
        selectedPosition
      );

      addToast(
        prediction
          ? "Prediction updated successfully!"
          : "Prediction placed successfully!",
        "success"
      );

      onPredictionChange(horseName);
      setIsPicking(false);
      loadPrediction();
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

  const ticketStatus = getTicketStatus(prediction, isPreview);
  const statusCfg = STATUS_CONFIG[ticketStatus];

  // Dynamic calculation for Est. Return
  const selectedHorseOdds = selectedEntryId
    ? getMockOdds(selectedEntryId)
    : "N/A";
  const estReturnMultiplier = selectedEntryId
    ? evalOdds(selectedHorseOdds)
    : 1.0;
  const estimatedReturn = Math.round(tokens * estReturnMultiplier);

  return (
    <>
      <div className="flex flex-col h-full overflow-hidden">
        {/* Sidebar Header */}
        <div className="shrink-0 h-11 px-4 flex items-center justify-between bg-gradient-to-r from-[#064E3B] to-[#065F46] text-white">
          <div className="flex items-center gap-2">
            <Ticket size={14} className="text-[#D4AF37]" />
            <span className="text-[11px] font-bold uppercase tracking-wider">
              My Prediction
            </span>
          </div>
          {!showPickingForm && (!prediction || isPreview) && !isRaceStarted && (
            <button
              onClick={startPicking}
              className="inline-flex items-center gap-1 rounded bg-[#D4AF37] hover:bg-[#c59f2f] text-slate-900 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider transition-colors shadow-xs cursor-pointer animate-pulse"
            >
              {prediction && isPreview ? "Change" : "Predict"}
            </button>
          )}
        </div>

        {/* Content — scrollable */}
        <div className="flex-1 overflow-y-auto p-3 bg-slate-50">
          {loading ? (
            <div className="flex items-center justify-center py-6">
              <div className="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
              <span className="ml-2 text-xs text-slate-500">Loading…</span>
            </div>
          ) : showPickingForm ? (
            /* ─── Inline Prediction Form ─── */
            <div className="flex flex-col gap-3 bg-white p-3.5 rounded-xl border border-slate-200/60 shadow-xs transition-all duration-300 ease-in-out animate-in fade-in slide-in-from-top-1">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-bold text-[#064E3B] uppercase tracking-wider flex items-center gap-1.5">
                  <Trophy size={13} className="text-[#D4AF37]" />
                  Select Runner
                </span>
                <button
                  onClick={() => setIsPicking(false)}
                  className="text-[10px] font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              {/* Horse Selector Dropdown & Odds Indicator */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Horse Entry
                  </label>
                  {selectedEntryId && (
                    <span className="text-[10px] font-extrabold text-[#D4AF37] bg-slate-900/90 px-1.5 py-0.5 rounded">
                      Odds: {selectedHorseOdds}
                    </span>
                  )}
                </div>
                <select
                  value={selectedEntryId}
                  onChange={(e) => setSelectedEntryId(e.target.value)}
                  className="w-full text-xs font-bold bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#064E3B] cursor-pointer"
                >
                  <option value="">-- Choose a horse --</option>
                  {(entries || []).map((entry) => (
                    <option key={entry.id} value={entry.id}>
                      {entry.name}{" "}
                      {entry.jockeyName ? `(Jockey: ${entry.jockeyName})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Token Input with Estimated Return */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Place Tokens
                  </label>
                  {selectedEntryId && (
                    <span className="text-[10px] font-bold text-emerald-600">
                      Est. Payout: +{estimatedReturn.toLocaleString()}
                    </span>
                  )}
                </div>
                <input
                  type="number"
                  min="10"
                  max="100000"
                  value={tokens}
                  onChange={(e) =>
                    setTokens(Math.max(0, parseInt(e.target.value, 10) || 0))
                  }
                  className="w-full text-xs font-bold bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#064E3B]"
                />
              </div>

              {/* Position selector buttons */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Target Finish Position
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 1, label: "1st" },
                    { value: 2, label: "2nd" },
                    { value: 3, label: "3rd" },
                  ].map((pos) => (
                    <button
                      key={pos.value}
                      type="button"
                      onClick={() => setSelectedPosition(pos.value)}
                      className={`py-1.5 rounded-lg text-xs font-extrabold transition cursor-pointer ${
                        selectedPosition === pos.value
                          ? "bg-[#064E3B] text-white shadow-xs"
                          : "bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200"
                      }`}
                    >
                      {pos.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit button */}
              <button
                type="button"
                disabled={submitting}
                onClick={handleInlineSubmit}
                className="w-full mt-1.5 py-2 rounded-lg bg-[#064E3B] hover:bg-[#065F46] disabled:opacity-50 text-white text-xs font-bold transition cursor-pointer shadow-sm text-center flex items-center justify-center gap-1.5"
              >
                {submitting ? "Submitting..." : "Confirm Prediction"}
              </button>
            </div>
          ) : prediction ? (
            /* ─── Ticket Receipt ─── */
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden transition-all duration-300 ease-in-out">
              {/* Ticket header with dashed border */}
              <div className="px-3 py-2.5 bg-gradient-to-r from-slate-50 to-slate-100 border-b border-dashed border-slate-300 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Ticket size={12} className="text-[#064E3B]" />
                  <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wide">
                    Prediction Slip
                  </span>
                </div>
                {ticketStatus !== "preview" && (
                  <span
                    className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold ${statusCfg.bg} ${statusCfg.text}`}
                  >
                    {statusCfg.icon}
                    {statusCfg.label}
                  </span>
                )}
              </div>

              {/* Horse details */}
              <div className="px-3 py-2.5 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-base">
                    {POSITION_EMOJI[prediction.predictedPosition] || "🏇"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-xs text-[#064E3B] truncate">
                      {prediction.predictedEntry.horseName}
                    </p>
                    <p className="text-[10px] text-slate-500 font-medium">
                      {POSITION_LABELS[prediction.predictedPosition] ||
                        `Position ${prediction.predictedPosition}`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Bet specs grid */}
              <div className="px-3 py-2 grid grid-cols-2 gap-y-1.5 border-b border-slate-100">
                <div className="flex items-center gap-1.5">
                  <Target size={11} className="text-slate-400" />
                  <span className="text-[9px] text-slate-500 uppercase font-semibold">
                    Position
                  </span>
                </div>
                <p className="text-[11px] font-bold text-right text-slate-700">
                  {POSITION_LABELS[prediction.predictedPosition] ||
                    `#${prediction.predictedPosition}`}
                </p>

                <div className="flex items-center gap-1.5">
                  <Trophy size={11} className="text-[#D4AF37]" />
                  <span className="text-[9px] text-slate-500 uppercase font-semibold">
                    Odds
                  </span>
                </div>
                <p className="text-[11px] font-bold text-right text-slate-700">
                  {prediction.id
                    ? getMockOdds(prediction.id)
                    : selectedHorseOdds}
                </p>

                <div className="flex items-center gap-1.5">
                  <Sparkles size={11} className="text-amber-500" />
                  <span className="text-[9px] text-slate-500 uppercase font-semibold">
                    Tokens
                  </span>
                </div>
                <p className="text-[11px] font-bold text-right text-slate-700">
                  {(prediction as any).tokens
                    ? (prediction as any).tokens.toLocaleString()
                    : getMockTokens(prediction.id).toLocaleString()}
                </p>
              </div>

              {/* Payout row (for won predictions) */}
              {prediction.rewardAmount && (
                <div className="px-3 py-2 bg-amber-50 border-b border-amber-100 flex items-center justify-between">
                  <span className="text-[9px] text-amber-700 uppercase font-bold tracking-wide">
                    Payout
                  </span>
                  <span className="text-xs font-black text-amber-700">
                    +{Number(prediction.rewardAmount).toLocaleString()} Tokens
                  </span>
                </div>
              )}

              {/* Timestamp footer */}
              <div className="px-3 py-1.5 flex items-center gap-1.5 bg-slate-50">
                <Clock size={10} className="text-slate-400" />
                <span className="text-[9px] text-slate-400 font-medium">
                  Placed {formatPlacedAt(prediction.placedAt)}
                </span>
              </div>
            </div>
          ) : canPlacePrediction ? (
            /* ─── No prediction yet, offer to place one ─── */
            <div className="flex flex-col items-center text-center py-4 px-2 transition-all duration-300 ease-in-out">
              <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center mb-2">
                <Ticket size={18} className="text-[#064E3B]" />
              </div>
              <p className="text-xs font-bold text-slate-700 mb-1">
                No Prediction Placed
              </p>
              <p className="text-[10px] text-slate-500 mb-3 leading-relaxed">
                Pick your winner before the race starts!
              </p>
              <button
                onClick={startPicking}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#064E3B] text-white px-3 py-1.5 text-[11px] font-bold hover:bg-[#065F46] transition-colors"
              >
                <Trophy size={12} className="text-[#D4AF37]" />
                Place Prediction
              </button>
            </div>
          ) : (
            /* ─── No prediction and can't place ─── */
            <div className="flex flex-col items-center text-center py-4 px-2 transition-all duration-300 ease-in-out">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mb-2">
                <Ticket size={18} className="text-slate-400" />
              </div>
              <p className="text-xs font-bold text-slate-600 mb-1">
                No Prediction
              </p>
              <p className="text-[10px] text-slate-500 leading-relaxed">
                Predictions can only be placed before the race starts.
              </p>
            </div>
          )}
        </div>
      </div>

      <ToastContainer toasts={toasts} />
    </>
  );
}
