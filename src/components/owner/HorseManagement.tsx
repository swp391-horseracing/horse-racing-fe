import React from "react";
import { Plus, Trash2 } from "lucide-react";
import { cn } from "../../lib/utils";
import type { Horse } from "../../hooks/useOwner";

export interface HorseManagementProps {
  horses: Horse[];
  isHorseLocked: (id: string) => boolean;
  onRetire: (id: string) => void;
  onOpenAddModal: () => void;
  page: number;
  pagination: {
    page: number;
    totalPages: number;
  };
  setPage: React.Dispatch<React.SetStateAction<number>>;
}

export function HorseManagement({
  horses,
  isHorseLocked,
  onRetire,
  onOpenAddModal,
  page,
  pagination,
  setPage,
}: HorseManagementProps) {
  return (
    <div className="p-5 space-y-5 max-w-6xl mx-auto">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h2 className="text-xl font-black text-[#064E3B]">Horse Registry</h2>
          <p className="text-xs text-slate-500 mt-1">
            Manage your stable profiles and retire active horses.
          </p>
        </div>
        <button
          onClick={onOpenAddModal}
          className="flex items-center gap-1 rounded-lg bg-[#064E3B] text-white px-3.5 py-2 text-xs font-bold shadow-xs hover:bg-[#043E2F]"
        >
          <Plus className="w-3.5 h-3.5" /> Add Horse
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {horses
          .filter((h: Horse) => h.status !== "Retired")
          .map((horse: Horse) => {
            const locked = isHorseLocked(horse.id);
            return (
              <div
                key={horse.id}
                className="bg-white border rounded-xl p-4.5 shadow-xs flex flex-col justify-between hover:shadow-md transition"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-sm text-[#064E3B] truncate">
                      {horse.name}
                    </h3>
                    <span
                      className={cn(
                        "text-[8px] font-black uppercase px-2 py-0.5 rounded-full border",
                        locked
                          ? "bg-amber-50 border-amber-200 text-amber-800"
                          : "bg-emerald-50 border-emerald-200 text-emerald-800"
                      )}
                    >
                      {locked ? "Locked" : "Active"}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <div>
                      <span className="text-slate-400 block text-[8px] uppercase">
                        Breed
                      </span>
                      <span className="font-bold text-slate-700">
                        {horse.breed}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[8px] uppercase">
                        Gender
                      </span>
                      <span className="font-bold text-slate-700">
                        {horse.gender}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => onRetire(horse.id)}
                  disabled={locked}
                  className="mt-4 w-full flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 hover:border-rose-300 text-slate-500 hover:text-rose-600 py-2 transition disabled:opacity-40"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Retire Horse
                </button>
              </div>
            );
          })}
      </div>
      {pagination.totalPages > 1 && (
        <div className="flex items-center gap-2 pt-3">
          <button
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
            className="border rounded-lg px-3 py-1"
          >
            Prev
          </button>

          <span>
            {pagination.page} / {pagination.totalPages}
          </span>

          <button
            disabled={page >= pagination.totalPages}
            onClick={() => setPage(page + 1)}
            className="border rounded-lg px-3 py-1"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
