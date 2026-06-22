import React from "react";
import { Plus, Trash2 } from "lucide-react";
import { cn } from "../../lib/utils";
import type { Horse } from "../../types/horse.ts";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../router/routes.tsx";

export interface HorseManagementProps {
  horses: Horse[];
  isHorseLocked: (id: string) => boolean;
  onRetire: (id: string) => void;
  onOpenAddModal: () => void;
  pagination: {
    page: number;
    totalPages: number;
  };
  setPage: React.Dispatch<React.SetStateAction<number>>;
}

function HorseRow({
  horse,
  isLocked,
  onRetire,
}: {
  horse: Horse;
  isLocked: boolean;
  onRetire: (id: string) => void;
}) {
  const navigate = useNavigate();
  return (
    <div className="group flex items-center justify-between px-6 py-5 border-b last:border-b-0 hover:bg-slate-50/70 transition-all">
      <div className="flex items-center gap-5 flex-1 min-w-0">
        {/* Avatar */}
        <div className="h-12 w-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
          <img
            src={horse.imageUrl || "/placeholder.jpg"}
            alt={horse.name}
            className="h-full w-full object-cover"
          />
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(`/horses/${horse.id}`)}>
              <h3 className="font-bold text-lg truncate hover:underline">
                {horse.name}
              </h3>
            </button>
            <span
              className={cn(
                "text-xs font-semibold px-3 py-1 rounded-full border",
                isLocked
                  ? "bg-amber-100 border-amber-200 text-amber-700"
                  : "bg-emerald-100 border-emerald-200 text-emerald-700"
              )}
            >
              {isLocked ? "Locked" : "Active"}
            </span>
          </div>

          <div className="flex items-center gap-6 text-sm text-muted-foreground mt-1">
            <span>{horse.breed}</span>
            <span>
              {horse.birthDate
                ? `${new Date().getFullYear() - new Date(horse.birthDate).getFullYear()} years old`
                : "N/A"}
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={() => navigate(ROUTES.TOURNAMENTS)}
          disabled={isLocked}
          className="flex items-center gap-2 px-5 py-1 text-sm font-semibold border border-primary text-primary hover:bg-primary hover:text-white rounded-xl transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Register
        </button>

        <button
          onClick={() => onRetire(horse.id)}
          disabled={isLocked}
          className="flex items-center gap-2 px-5 py-1 text-sm font-semibold border border-rose-200  text-rose-600 hover:bg-rose-600 hover:text-white rounded-xl transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Trash2 className="w-4 h-4" />
          Retire
        </button>
      </div>
    </div>
  );
}

export function HorseManagement({
  horses,
  isHorseLocked,
  onRetire,
  onOpenAddModal,
  pagination,
  setPage,
}: HorseManagementProps) {
  const activeHorses = horses.filter((h) => h.status !== "Retired");

  return (
    <div className="max-w-6xl mx-auto p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 border-b pb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight !text-primary">
            Horse Manager
          </h2>
          <p className="text-muted-foreground mt-1">
            Manage your stable profiles and retire active horses
          </p>
        </div>

        <button
          onClick={onOpenAddModal}
          className="flex items-center gap-2 bg-[#064E3B] text-white px-6 py-3 rounded-2xl font-semibold hover:bg-[#043E2F] transition shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Add New Horse
        </button>
      </div>

      {/* List */}
      <div className="bg-white border rounded-2xl overflow-hidden">
        {activeHorses.length > 0 ? (
          <div className="divide-y">
            {activeHorses.map((horse) => (
              <HorseRow
                key={horse.id}
                horse={horse}
                isLocked={isHorseLocked(horse.id)}
                onRetire={onRetire}
              />
            ))}
          </div>
        ) : (
          <div className="py-24 text-center">
            <p className="text-muted-foreground text-lg">
              No active horses in your registry.
            </p>
            <button
              onClick={onOpenAddModal}
              className="mt-4 text-[#064E3B] font-semibold hover:underline"
            >
              Add your first horse →
            </button>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            disabled={pagination.page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-6 py-2 border rounded-xl disabled:opacity-50 hover:bg-muted transition"
          >
            Previous
          </button>

          <span className="px-6 py-2 text-sm font-medium text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages}
          </span>

          <button
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-6 py-2 border rounded-xl disabled:opacity-50 hover:bg-muted transition"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
