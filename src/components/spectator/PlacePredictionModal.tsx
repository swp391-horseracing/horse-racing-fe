import { useState, useMemo, useEffect, useCallback } from "react";
import { X, Trophy, ArrowRight, Coins, Wallet } from "lucide-react";

import { PredictionService } from "../../services/PredictionService";
import { fetchRaceEntries } from "../../hooks/useRaces";
import type { RaceEntry } from "../../types/race";

export interface PreselectedEntry {
  id: string;
  name: string;
  jockeyName: string;
  laneNumber: string;
}

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
  onPlaced?: (data: {
    entryId: string;
    horseName: string;
    predictedPosition: number;
  }) => void;
  preselectedEntry?: PreselectedEntry | null;
  predictedEntryIds?: string[];
  existingPredictionCount?: number;
  balance?: number;
  predictionMinStake?: number;
}

const POSITIONS = [
  { value: 1, label: "1st" },
  { value: 2, label: "2nd" },
  { value: 3, label: "3rd" },
];

const STAKE_STEP = 10;

export function PlacePredictionModal({
  raceId,
  raceName,
  entries,
  open,
  onClose,
  onSuccess,
  addToast,
  onPlaced,
  preselectedEntry,
  predictedEntryIds,
  existingPredictionCount = 0,
  balance = 0,
  predictionMinStake = 10,
}: PlacePredictionModalProps) {
  const [selectedEntryId, setSelectedEntryId] = useState<string>(
    () => preselectedEntry?.id ?? ""
  );
  const [selectedPosition, setSelectedPosition] = useState<number>(1);
  const [stakeAmount, setStakeAmount] = useState<number>(predictionMinStake);
  const [submitting, setSubmitting] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const maxStake = Math.max(predictionMinStake, balance);

  const filterEntries = useCallback(
    (list: RaceEntry[]) =>
      list.filter((e) => !predictedEntryIds?.includes(e.id)),
    [predictedEntryIds]
  );

  const [localEntries, setLocalEntries] = useState<RaceEntry[]>(() =>
    open ? filterEntries(entries) : []
  );

  useEffect(() => {
    if (!open) return;
    let cancelled = false;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLocalEntries(filterEntries(entries));

    if (preselectedEntry) {
      const match = filterEntries(entries).find(
        (e) => e.name === preselectedEntry.name
      );
      if (match) {
        setSelectedEntryId(match.id);
        setConfirming(false);
      }
    }

    fetchRaceEntries(raceId)
      .then((data) => {
        if (!cancelled) {
          const fetched = filterEntries(data);
          setLocalEntries(fetched);
          if (preselectedEntry) {
            const match = fetched.find((e) => e.name === preselectedEntry.name);
            if (match) {
              setSelectedEntryId(match.id);
              setConfirming(false);
            }
          }
        }
      })
      .catch((err) => {
        console.error("Failed to fetch race entries for prediction:", err);
        addToast("Failed to fetch race entries.", "error");
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, raceId, preselectedEntry]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setStakeAmount(predictionMinStake);
    }, 0);
    return () => clearTimeout(timer);
  }, [predictionMinStake, open]);

  const entryMap = useMemo(
    () => new Map(localEntries.map((e) => [e.id, e.name])),
    [localEntries]
  );

  if (!open) return null;

  const preselectedName =
    preselectedEntry?.name ?? entryMap.get(selectedEntryId) ?? "Unknown";

  const stakeError =
    stakeAmount < predictionMinStake
      ? `Minimum stake is ${predictionMinStake}`
      : stakeAmount > balance
        ? "Insufficient balance"
        : null;

  const handleConfirmClick = () => {
    if (!selectedEntryId) {
      addToast("Please select a horse entry.", "warning");
      return;
    }
    if (stakeError) {
      addToast(stakeError, "warning");
      return;
    }
    setConfirming(true);
  };

  const handleSubmit = async () => {
    if (!selectedEntryId) {
      addToast("Please select a horse entry.", "warning");
      return;
    }
    if (stakeError) {
      addToast(stakeError, "warning");
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
      const horseName = preselectedName;
      addToast("Prediction added successfully!", "success");
      onPlaced?.({
        entryId: selectedEntryId,
        horseName,
        predictedPosition: selectedPosition,
      });
      setSelectedEntryId("");
      setSelectedPosition(1);
      setStakeAmount(predictionMinStake);
      onSuccess();
      onClose();
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
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black text-slate-500 bg-slate-100 rounded-full px-2 py-1">
              {existingPredictionCount} / 3
            </span>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-1">Race</p>
            <p className="font-headline font-bold text-[#064E3B] text-base">
              {raceName}
            </p>
          </div>

          <div>
            <label className="block font-label text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              {preselectedEntry ? "Selected Entry" : "Select Entry"}
            </label>
            {preselectedEntry ? (
              <div className="flex items-center justify-between p-3.5 border border-[#064E3B] bg-[#064E3B]/5 ring-1 ring-[#064E3B] rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="h-4 w-4 rounded-full bg-[#064E3B]" />
                  <div>
                    <span className="text-sm font-bold text-slate-700">
                      {preselectedEntry.name}
                    </span>
                    {preselectedEntry.jockeyName && (
                      <span className="text-xs text-slate-400 ml-2">
                        (J: {preselectedEntry.jockeyName})
                      </span>
                    )}
                  </div>
                </div>
                <span className="font-label text-[10px] font-bold text-slate-400">
                  Lane {preselectedEntry.laneNumber}
                </span>
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {localEntries.map((entry) => (
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
            )}
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

          <div>
            <label className="block font-label text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Coins className="w-3.5 h-3.5" />
                  Stake Amount
                </span>
                <span className="text-[#064E3B] text-sm font-black">
                  {stakeAmount} PTS
                </span>
              </div>
            </label>
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-400 min-w-[28px]">
                {predictionMinStake}
              </span>
              <input
                type="range"
                min={predictionMinStake}
                max={maxStake}
                step={STAKE_STEP}
                value={stakeAmount}
                onChange={(e) => setStakeAmount(Number(e.target.value))}
                className="flex-1 h-2 rounded-full appearance-none cursor-pointer bg-slate-200 accent-[#064E3B] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#064E3B] [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white"
              />
              <span className="text-xs font-bold text-slate-400 min-w-[32px] text-right">
                {maxStake}
              </span>
            </div>
            <div className="flex items-center justify-between mt-1.5">
              <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                <Wallet className="w-3 h-3" />
                Balance: {balance} PTS
              </div>
              {stakeError && (
                <span className="text-[10px] font-bold text-rose-500">
                  {stakeError}
                </span>
              )}
            </div>
          </div>

          {confirming ? (
            <div className="space-y-3">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-center">
                <p className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                  Are you sure?
                </p>
                <p className="text-sm font-bold text-amber-700 mt-1">
                  {preselectedName} →{" "}
                  {{ 1: "1st", 2: "2nd", 3: "3rd" }[selectedPosition]} position
                </p>
                <p className="text-xs text-amber-600 mt-1">
                  Stake: {stakeAmount} PTS
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setConfirming(false)}
                  className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex-1 bg-[#064E3B] text-white font-bold text-sm py-3 rounded-xl hover:bg-[#043E2F] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {submitting ? "Submitting..." : "Yes, Confirm"}
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={handleConfirmClick}
              disabled={submitting || !!stakeError}
              className="w-full bg-[#064E3B] text-white font-bold text-sm py-3 rounded-xl hover:bg-[#043E2F] hover:shadow-lg transition-all flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              Confirm Prediction
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
