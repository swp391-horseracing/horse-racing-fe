import { useEffect, useState, useCallback } from "react";
import {
  Ticket,
  Trophy,
  Clock,
  Target,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Coins,
  Wallet,
} from "lucide-react";
import { useAuthContext } from "../../contexts/AuthContext";
import { PredictionService } from "../../services/PredictionService";
import { useWallet } from "../../hooks/useWallet";
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
  onPredictionChange: (horseNames: string[]) => void;
  isSimulating?: boolean;
  elapsedMs?: number;
  predictionMinStake?: number;
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

const STAKE_STEP = 10;

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
    icon: <CheckCircle2 size={12} />,
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
  predictionMinStake = 10,
}: PredictionsSidebarProps) {
  const { user } = useAuthContext();
  const { balance, refetch: refetchWallet } = useWallet();
  const { toasts, addToast } = useToast();

  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(false);
  const [isPreview, setIsPreview] = useState(false);

  const [isPicking, setIsPicking] = useState(false);
  const [selectedEntryId, setSelectedEntryId] = useState("");
  const [selectedPosition, setSelectedPosition] = useState(1);
  const [stakeAmount, setStakeAmount] = useState<number>(predictionMinStake);
  const [submitting, setSubmitting] = useState(false);

  const maxStake = Math.max(predictionMinStake, balance);

  const isSpectator = user?.role === "spectator";
  const isRaceStarted =
    isSimulating ||
    elapsedMs > 0 ||
    !["scheduled", "pre_race"].includes(raceStatus || "");

  const predictedEntryIds = predictions.map((p) => p.predictedEntry.entryId);
  const canPlacePrediction =
    isSpectator && predictions.length === 0 && !isRaceStarted;

  const loadPrediction = useCallback(async () => {
    if (!raceId) return;

    if (!user || !isSpectator) {
      setIsPreview(true);
      const isRaceScheduled =
        raceStatus === "scheduled" || raceStatus === "pre_race";
      if (isRaceScheduled) {
        setPredictions((prev) => {
          if (prev.some((p) => p.race.id === raceId)) {
            onPredictionChange(prev.map((p) => p.predictedEntry.horseName));
            return prev;
          }
          onPredictionChange([]);
          return [];
        });
      } else if (firstHorseName) {
        setPredictions((prev) => {
          if (prev.some((p) => p.race.id === raceId)) return prev;
          const mock = {
            id: "preview-mock-id-00000001",
            race: {
              id: raceId,
              name: raceName || "Race",
              distanceMeters: 0,
              scheduledAt: new Date().toISOString(),
              venue: "",
              status: raceStatus || "draft",
              predictionMinStake,
            },
            predictedEntry: {
              entryId: "preview-entry",
              horseName: firstHorseName,
            },
            predictedPosition: 1,
            placedAt: new Date().toISOString(),
            isCorrect: null,
            rewardAmount: null as unknown as string,
            stakeAmount: 0,
          };
          onPredictionChange([firstHorseName]);
          return [mock];
        });
      }
      return;
    }

    setLoading(true);
    try {
      const data = await PredictionService.getMyPredictions({
        page: 1,
        limit: 50,
      });
      const matched = data.data.filter((p) => p.race.id === raceId);
      setPredictions(matched);
      setIsPreview(false);
      onPredictionChange(matched.map((p) => p.predictedEntry.horseName));
    } catch {
      setPredictions([]);
      setIsPreview(false);
      onPredictionChange([]);
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
    predictionMinStake,
  ]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadPrediction();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadPrediction]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPicking(false);
      setSelectedEntryId("");
      setSelectedPosition(1);
      setStakeAmount(predictionMinStake);
    }, 0);
    return () => clearTimeout(timer);
  }, [raceId, predictionMinStake]);

  const showPickingForm = isPicking && !isRaceStarted;

  const stakeError =
    stakeAmount < predictionMinStake
      ? `Minimum stake is ${predictionMinStake}`
      : stakeAmount > balance
        ? "Insufficient balance"
        : null;

  const startPicking = () => {
    if (isRaceStarted) return;
    setSelectedEntryId("");
    setSelectedPosition(1);
    setStakeAmount(predictionMinStake);
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
    if (stakeError) {
      addToast(stakeError, "warning");
      return;
    }

    const horseName =
      (entries || []).find((e) => e.id === selectedEntryId)?.name || "Unknown";

    if (predictions.length >= 3) {
      addToast("Maximum 3 predictions per race.", "warning");
      setIsPicking(false);
      return;
    }

    const buildPrediction = (id: string): Prediction => ({
      id,
      race: {
        id: raceId,
        name: raceName || "Race",
        distanceMeters: 0,
        scheduledAt: new Date().toISOString(),
        venue: "",
        status: raceStatus || "draft",
        predictionMinStake,
      },
      predictedEntry: {
        entryId: selectedEntryId,
        horseName: horseName,
      },
      predictedPosition: selectedPosition,
      placedAt: new Date().toISOString(),
      isCorrect: null,
      rewardAmount: null as unknown as string,
      stakeAmount,
    });

    if (!isSpectator) {
      setSubmitting(true);
      setTimeout(() => {
        const mock = buildPrediction(`preview-mock-id-${Date.now()}`);
        setPredictions((prev) => {
          const next = [...prev, mock];
          onPredictionChange(next.map((p) => p.predictedEntry.horseName));
          return next;
        });
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
        selectedPosition,
        stakeAmount
      );

      addToast("Prediction added successfully!", "success");

      refetchWallet();
      const newPrediction = buildPrediction(`prediction-local-${Date.now()}`);
      setPredictions((prev) => {
        const next = [...prev, newPrediction];
        onPredictionChange(next.map((p) => p.predictedEntry.horseName));
        return next;
      });
      setIsPicking(false);
    } catch (err: unknown) {
      const error = err as {
        response?: { data?: { message?: string }; status?: number };
        message?: string;
      };
      if (error?.response?.status === 400) {
        addToast(
          error?.response?.data?.message || "Insufficient balance",
          "error"
        );
      } else if (error?.response?.status === 409) {
        addToast(
          error?.response?.data?.message || "Duplicate prediction",
          "error"
        );
      } else {
        addToast(
          error?.response?.data?.message ||
            error?.message ||
            "Failed to place prediction",
          "error"
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

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
          {!showPickingForm && predictions.length < 3 && !isRaceStarted && (
            <button
              onClick={startPicking}
              className="inline-flex items-center gap-1 rounded bg-[#D4AF37] hover:bg-[#c59f2f] text-slate-900 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider transition-colors shadow-xs cursor-pointer animate-pulse"
            >
              {predictions.length > 0 ? "Add Prediction" : "Predict"}
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

              {/* Horse Selector */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Horse Entry
                </label>
                <select
                  value={selectedEntryId}
                  onChange={(e) => setSelectedEntryId(e.target.value)}
                  className="w-full text-xs font-bold bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#064E3B] cursor-pointer"
                >
                  <option value="">-- Choose a horse --</option>
                  {(entries || [])
                    .filter((e) => !predictedEntryIds.includes(e.id))
                    .map((entry) => (
                      <option key={entry.id} value={entry.id}>
                        {entry.name}{" "}
                        {entry.jockeyName
                          ? `(Jockey: ${entry.jockeyName})`
                          : ""}
                      </option>
                    ))}
                </select>
              </div>

              {/* Stake Slider */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Coins size={11} />
                    Stake Amount
                  </label>
                  <span className="text-[11px] font-black text-[#064E3B]">
                    {stakeAmount} PTS
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-bold text-slate-400 min-w-[20px]">
                    {predictionMinStake}
                  </span>
                  <input
                    type="range"
                    min={predictionMinStake}
                    max={maxStake}
                    step={STAKE_STEP}
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(Number(e.target.value))}
                    className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer bg-slate-200 accent-[#064E3B] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#064E3B] [&::-webkit-slider-thumb]:shadow-sm [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white"
                  />
                  <span className="text-[9px] font-bold text-slate-400 min-w-[24px] text-right">
                    {maxStake}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-[9px] text-slate-400 font-medium">
                    <Wallet size={9} />
                    Balance: {balance} PTS
                  </span>
                  {stakeError && (
                    <span className="text-[9px] font-bold text-rose-500">
                      {stakeError}
                    </span>
                  )}
                </div>
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
                disabled={submitting || !!stakeError}
                onClick={handleInlineSubmit}
                className="w-full mt-1.5 py-2 rounded-lg bg-[#064E3B] hover:bg-[#065F46] disabled:opacity-50 text-white text-xs font-bold transition cursor-pointer shadow-sm text-center flex items-center justify-center gap-1.5"
              >
                {submitting ? "Submitting..." : "Confirm Prediction"}
              </button>
            </div>
          ) : predictions.length > 0 ? (
            /* ─── Prediction Tickets ─── */
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between px-0.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Predictions
                </span>
                <span className="text-[10px] font-black text-[#064E3B]">
                  {predictions.length} / 3
                </span>
              </div>
              {predictions.map((prediction) => {
                const ticketStatus = getTicketStatus(prediction, isPreview);
                const statusCfg = STATUS_CONFIG[ticketStatus];
                return (
                  <div
                    key={prediction.id}
                    className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden transition-all duration-300 ease-in-out"
                  >
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
                        <Coins size={11} className="text-amber-500" />
                        <span className="text-[9px] text-slate-500 uppercase font-semibold">
                          Stake
                        </span>
                      </div>
                      <p className="text-[11px] font-bold text-right text-slate-700">
                        {prediction.stakeAmount
                          ? `${prediction.stakeAmount.toLocaleString()} PTS`
                          : "—"}
                      </p>
                    </div>

                    {/* Payout row (for won predictions) */}
                    {prediction.rewardAmount && (
                      <div className="px-3 py-2 bg-amber-50 border-b border-amber-100 flex items-center justify-between">
                        <span className="text-[9px] text-amber-700 uppercase font-bold tracking-wide">
                          Payout
                        </span>
                        <span className="text-xs font-black text-amber-700">
                          +{Number(prediction.rewardAmount).toLocaleString()}{" "}
                          PTS
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
                );
              })}
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
