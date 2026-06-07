import React, { useState } from "react";
import { cn } from "../../lib/utils";
import type { Jockey } from "../../hooks/useOwner";

interface InviteJockeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  jockeys: Jockey[];
  onDispatch: (ids: number[]) => void;
}

export function InviteJockeyModal({
  isOpen,
  onClose,
  jockeys,
  onDispatch,
}: InviteJockeyModalProps) {
  const [selected, setSelected] = useState<number[]>([]);

  if (!isOpen) return null;

  const toggle = (id: number) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );

  const handleDispatch = () => {
    onDispatch(selected);
    setSelected([]); // reset after sending
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl border p-5 max-w-md w-full shadow-xl">
        <div className="flex items-center justify-between border-b pb-2.5 mb-3">
          <h3 className="font-bold text-base text-[#064E3B]">Select Jockeys</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            ✕
          </button>
        </div>

        <div className="space-y-3">
          <div className="max-h-56 overflow-y-auto divide-y">
            {jockeys.map((j) => (
              <div
                key={j.id}
                onClick={() => toggle(j.id)}
                className={cn(
                  "p-2 flex items-center justify-between cursor-pointer rounded-lg my-1 border",
                  selected.includes(j.id)
                    ? "bg-emerald-50/50 border-[#064E3B]"
                    : "bg-white hover:bg-slate-50"
                )}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selected.includes(j.id)}
                    readOnly
                  />
                  <div>
                    <p className="font-bold text-slate-800">{j.name}</p>
                    <p className="text-[10px] text-slate-400">{j.club}</p>
                  </div>
                </div>
                <span className="font-bold text-[#064E3B]">{j.winRate}</span>
              </div>
            ))}
          </div>
          <div className="border-t pt-3 flex items-center justify-between">
            <span className="text-[10px] text-slate-500">
              {selected.length} Selected
            </span>
            <button
              onClick={handleDispatch}
              disabled={selected.length === 0}
              className="rounded-md bg-[#064E3B] text-white px-3.5 py-1.5 text-xs font-bold disabled:opacity-40 hover:bg-[#043E2F]"
            >
              Send Invites
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
