import React from "react";
import { Trophy } from "lucide-react";
import type {
  Horse,
  Tournament,
  TournamentRegistration,
  Invitation,
  Jockey,
} from "../../hooks/useOwner";

export interface OwnerDashBoardOverviewProps {
  horses: Horse[];
  tournaments: Tournament[];
  registrations: TournamentRegistration[];
  invitations: Invitation[];
  jockeys: Jockey[];
  setActiveTab: (tab: string) => void;
  pagination: {
    page: number;
    totalPages: number;
  };
  setPage: React.Dispatch<React.SetStateAction<number>>;
}

export function OwnerDashBoardOverview({
  horses,
  tournaments,
  registrations,
  invitations,
  jockeys,
  setActiveTab,
  pagination,
  setPage,
}: OwnerDashBoardOverviewProps) {
  const activeHorsesCount = horses.filter(
    (h: Horse) => h.status === "Active"
  ).length;
  const pendingRegCount = registrations.filter(
    (r: TournamentRegistration) => r.status === "Pending Approval"
  ).length;
  const pendingInvCount = invitations.filter(
    (i: Invitation) => i.status === "Pending"
  ).length;

  return (
    <div className="p-5 space-y-5 max-w-6xl mx-auto">
      <div>
        <h2 className="text-xl font-black text-[#064E3B]">Owner Dashboard</h2>
        <p className="text-xs text-slate-500 mt-1">
          Manage stable profiles, registrations, and jockey invitations.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Active Stable",
            val: `${activeHorsesCount} Horses`,
            action: () => setActiveTab("/owner/horseManagement"),
          },
          {
            label: "Open Events",
            val: `${
              tournaments.filter(
                (t: Tournament) => t.status === "Registration Open"
              ).length
            } Active`,
            action: () => setActiveTab("/owner/raceRegister"),
          },
          {
            label: "Pending Approvals",
            val: `${pendingRegCount} Queued`,
            action: () => setActiveTab("/owner/raceRegister"),
          },
          {
            label: "Pending Invites",
            val: `${pendingInvCount} Sent`,
            action: () => setActiveTab("/owner/jockeys"),
          },
        ].map((card, idx) => (
          <div
            key={idx}
            onClick={card.action}
            className="bg-white border rounded-xl p-4 shadow-xs hover:shadow-md transition cursor-pointer"
          >
            <span className="text-[10px] text-slate-400 uppercase font-bold block">
              {card.label}
            </span>
            <span className="text-base font-extrabold text-[#064E3B] block mt-1.5">
              {card.val}
            </span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="bg-white border rounded-xl p-4 lg:col-span-2 shadow-xs">
          <div className="border-b pb-2 flex justify-between items-center">
            <h3 className="font-bold text-sm text-[#064E3B]">
              Stable Roster Overview
            </h3>
            <button
              onClick={() => setActiveTab("/owner/horseManagement")}
              className="text-[10px] font-bold text-indigo-600 hover:underline"
            >
              Manage
            </button>
          </div>
          <div className="divide-y text-xs">
            {horses
              .filter((h: Horse) => h.status !== "Retired")
              .map((horse: Horse) => (
                <div
                  key={horse.id}
                  className="py-2.5 flex items-center justify-between"
                >
                  <div>
                    <p className="font-bold text-slate-800">{horse.name}</p>
                    <p className="text-slate-400 text-[10px]">
                      {horse.breed} • {horse.gender}
                    </p>
                  </div>
                  <span className="bg-emerald-50 text-emerald-800 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded border border-emerald-200">
                    {horse.status}
                  </span>
                </div>
              ))}
          </div>
        </div>

        <div className="bg-white border rounded-xl p-4 shadow-xs">
          <h3 className="font-bold text-sm text-[#064E3B] flex items-center gap-1 border-b pb-2">
            <Trophy className="w-4 h-4 text-amber-500" /> Elite Jockeys
          </h3>
          <div className="space-y-2 mt-3">
            {jockeys.slice(0, 3).map((j: Jockey) => (
              <div
                key={j.id}
                className="p-2.5 bg-slate-50/50 rounded-lg flex items-center justify-between text-xs border"
              >
                <div>
                  <p className="font-bold text-slate-800">{j.name}</p>
                  <p className="text-[10px] text-slate-400">{j.club}</p>
                </div>
                <div className="text-right">
                  <span className="font-extrabold text-[#064E3B] block">
                    {j.winRate} WR
                  </span>
                  <span className="text-[9px] text-slate-400 block">
                    {j.totalRuns} Starts
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pagination moved cleanly outside of the grid layout */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center gap-2 pt-3">
          <button
            disabled={pagination.page <= 1}
            onClick={() => setPage(pagination.page - 1)}
            className="border rounded-lg px-3 py-1 text-xs font-semibold"
          >
            Prev
          </button>

          <span className="text-xs text-slate-600 font-medium">
            {pagination.page} / {pagination.totalPages}
          </span>

          <button
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => setPage(pagination.page + 1)}
            className="border rounded-lg px-3 py-1 text-xs font-semibold"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
