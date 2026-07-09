import React, { useState, useEffect, startTransition } from "react";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import type { Horse, Tournament } from "../../hooks/useOwner";

interface RegisterTournamentModalProps {
  isOpen: boolean;
  onClose: () => void;
  horses: Horse[];
  tournaments: Tournament[];
  initialHorseId: string | null;
  initialTournamentId: number | null;
  onSubmit: (horseId: string, tournamentId: number) => Promise<void>;
}

type SubmitStatus =
  | { type: "idle" }
  | { type: "loading" }
  | { type: "success"; message: string }
  | { type: "error"; message: string };

export function RegisterTournamentModal({
  isOpen,
  onClose,
  horses,
  tournaments,
  initialHorseId,
  initialTournamentId,
  onSubmit,
}: RegisterTournamentModalProps) {
  const [horseId, setHorseId] = useState<string>(initialHorseId ?? "");
  const [tournId, setTournId] = useState<number | "">(
    initialTournamentId ?? ""
  );
  const [status, setStatus] = useState<SubmitStatus>({ type: "idle" });

  useEffect(() => {
    if (isOpen) {
      startTransition(() => {
        setHorseId(initialHorseId ?? "");
        setTournId(initialTournamentId ?? "");
        setStatus({ type: "idle" });
      });
    }
  }, [isOpen, initialHorseId, initialTournamentId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!horseId || !tournId) return;
    setStatus({ type: "loading" });
    try {
      await onSubmit(horseId, Number(tournId));
      setStatus({
        type: "success",
        message: "Registration submitted for admin approval.",
      });
    } catch (err: unknown) {
      const axiosError = err as {
        response?: { data?: { message?: string } };
      };
      setStatus({
        type: "error",
        message:
          axiosError?.response?.data?.message ||
          "Failed to submit tournament registration.",
      });
    }
  };

  const isRetired = (h: Horse) => h.status === "Retired" || h.isRetired;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl border p-5 max-w-sm w-full shadow-xl">
        <div className="flex items-center justify-between border-b pb-2.5 mb-4">
          <h3 className="font-bold text-base text-[#064E3B]">
            Tournament Registration
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            ✕
          </button>
        </div>

        {status.type === "success" && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 font-medium flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            {status.message}
          </div>
        )}

        {status.type === "error" && (
          <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {status.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
              Select Horse
            </label>
            <select
              value={horseId}
              onChange={(e) => setHorseId(e.target.value)}
              required
              disabled={status.type === "loading"}
              className="w-full bg-slate-50 border rounded-md p-2.5 text-xs disabled:opacity-50"
            >
              <option value="" disabled>
                -- Choose Horse --
              </option>
              {horses.map((h) => {
                const retired = isRetired(h);
                return (
                  <option key={h.id} value={h.id} disabled={retired}>
                    {h.name} ({h.breed}){retired ? " — Retired" : ""}
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
              Select Tournament
            </label>
            <select
              value={tournId}
              onChange={(e) => setTournId(Number(e.target.value))}
              required
              disabled={status.type === "loading"}
              className="w-full bg-slate-50 border rounded-md p-2.5 text-xs disabled:opacity-50"
            >
              <option value="" disabled>
                -- Choose Tournament --
              </option>
              {tournaments
                .filter((t) => t.status === "registration_open")
                .map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
            </select>
          </div>

          <div className="flex gap-2 justify-end pt-2 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={status.type === "loading"}
              className="rounded-md border px-3 py-1.5 text-xs hover:bg-slate-50 disabled:opacity-40"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!horseId || !tournId || status.type === "loading"}
              className="rounded-md bg-[#064E3B] text-white px-3.5 py-1.5 text-xs font-bold hover:bg-[#043E2F] disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              {status.type === "loading" ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
