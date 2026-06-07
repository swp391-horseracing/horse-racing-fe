import React, { useState } from "react";
import type { Horse, Tournament } from "../../hooks/useOwner";

interface RegisterTournamentModalProps {
  isOpen: boolean;
  onClose: () => void;
  horses: Horse[];
  tournaments: Tournament[];
  initialHorseId: string | null;
  initialTournamentId: number | null;
  onSubmit: (horseId: string, tournamentId: number) => void;
}

export function RegisterTournamentModal({
  isOpen,
  onClose,
  horses,
  tournaments,
  initialHorseId,
  initialTournamentId,
  onSubmit,
}: RegisterTournamentModalProps) {
  // Initialize state directly from props since the component remounts on key change
  const [horseId, setHorseId] = useState<string>(initialHorseId ?? "");
  const [tournId, setTournId] = useState<number | "">(
    initialTournamentId ?? ""
  );

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (horseId && tournId) {
      onSubmit(horseId, Number(tournId));
    }
  };

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
        <form onSubmit={handleSubmit} className="space-y-4">
          <select
            value={horseId}
            onChange={(e) => setHorseId(e.target.value)}
            required
            className="w-full bg-slate-50 border rounded-md p-2.5 text-xs"
          >
            <option value="" disabled>
              -- Choose Horse --
            </option>
            {horses
              .filter((h) => h.status === "Active")
              .map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name} ({h.breed})
                </option>
              ))}
          </select>
          <select
            value={tournId}
            onChange={(e) => setTournId(Number(e.target.value))}
            required
            className="w-full bg-slate-50 border rounded-md p-2.5 text-xs"
          >
            <option value="" disabled>
              -- Choose Tournament --
            </option>
            {tournaments
              .filter((t) => t.status === "Registration Open")
              .map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
          </select>
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
              className="rounded-md bg-[#064E3B] text-white px-3.5 py-1.5 text-xs font-bold hover:bg-[#043E2F]"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
