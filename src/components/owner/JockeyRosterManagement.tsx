import { useState } from "react";
import { cn } from "../../lib/utils";
import { formatStatus } from "../../utils/statusFormat";
import { type Entry, useOwner } from "../../hooks/useOwner.ts";
import { useNavigate } from "react-router-dom";

export function JockeyRosterManagement() {
  const { invitations, entries, loadInvitations } = useOwner();
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
  const [subTab, setSubTab] = useState<"detail" | "invitation">("detail");

  const navigate = useNavigate();
  // Entries without confirmed jockey
  const entriesWithoutJockey = entries.filter((entry) => {
    const hasConfirmed = invitations.some(
      (i) => i.horse.id === entry.horseId && i.status === "confirmed"
    );
    return !hasConfirmed;
  });

  // Related invitations for selected entry
  const relatedInvitations = selectedEntry
    ? invitations.filter((inv) => inv.horse.id === selectedEntry.horseId)
    : [];

  const handleFindJockey = (entry: Entry) => {
    navigate(`/entries/${entry.entryId}/send-invites`);
  };

  const statusBadgeClass = (status: string) =>
    cn(
      "rounded border px-1.5 py-0.5 text-[8px] font-black uppercase",
      status === "confirmed" &&
        "border-emerald-200 bg-emerald-50 text-emerald-800",
      status === "accepted" && "border-blue-200 bg-blue-50 text-blue-800",
      status === "pending" && "border-amber-200 bg-amber-50 text-amber-800",
      status === "declined" && "border-rose-200 bg-rose-50 text-rose-800",
      status === "superseded" && "border-slate-200 bg-slate-50 text-slate-400"
    );

  const handleSubTabChange = async (tab: "detail" | "invitation") => {
    setSubTab(tab);
    if (tab === "invitation" && selectedEntry?.raceId) {
      await loadInvitations(selectedEntry.raceId);
    }
  };

  return (
    <div className="mx-auto max-w-7xl border-slate-200 bg-slate-50">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#064E3B]">Jockey Roster</h2>
          <p className="mt-1 text-sm text-slate-500">
            Manage entries and invitations
          </p>
        </div>
      </div>

      <div className="flex w-full gap-6 h-[calc(100vh-220px)]">
        {/* Left Sidebar - Entries List */}
        <div className="w-5/12 border border-slate-200 bg-white rounded-3xl overflow-hidden flex flex-col">
          <div className="flex-1">
            {entriesWithoutJockey.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-8">
                <p className="text-slate-400">No pending entries</p>
              </div>
            ) : (
              entriesWithoutJockey.map((entry) => {
                const isSelected = selectedEntry?.entryId === entry.entryId;
                const hasJockey = !!entry.jockeyName && entry.jockeyName !== "";

                return (
                  <div
                    key={entry.entryId}
                    onClick={() => {
                      setSelectedEntry(entry);
                      setSubTab("detail");
                    }}
                    className={cn(
                      "px-5 py-5 hover:bg-slate-50 cursor-pointer transition-all flex items-center gap-4",
                      isSelected && "bg-emerald-50"
                    )}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-[#064E3B] truncate">
                        {entry.horseName}
                      </div>
                      <div className="text-xs text-slate-500 truncate">
                        {entry.raceName}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      {!hasJockey && (
                        <button
                          onClick={() => {
                            handleFindJockey(entry);
                          }}
                          className="px-3 py-0.5 text-[10px] font-bold rounded-full bg-primary text-white"
                        >
                          find jockey
                        </button>
                      )}
                      {entry.pendingCount > 0 && (
                        <div className="px-3 py-0.5 text-[10px] font-bold rounded-full bg-amber-100 text-amber-700">
                          {entry.pendingCount} pending
                        </div>
                      )}
                      {entry.responsesCount > 0 && (
                        <div className="px-3 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-700">
                          {entry.responsesCount} response
                          {entry.responsesCount > 1 ? "s" : ""}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Panel - Detail + Invitation Sub Tabs */}
        <div className="flex-1 border border-slate-200 bg-white rounded-3xl overflow-hidden flex flex-col">
          {selectedEntry ? (
            <>
              {/* Sub Tabs inside Detail */}
              <div className="mb-6 inline-flex rounded-2xl bg-slate-100 mx-6 mt-6">
                <button
                  onClick={() => setSubTab("detail")}
                  className={cn(
                    "rounded-xl px-6 py-2 text-sm font-bold transition-all border-1 border-primary",
                    subTab === "detail"
                      ? "bg-white text-[#064E3B] shadow"
                      : "text-slate-500 hover:text-slate-700"
                  )}
                >
                  Detail
                </button>
                <button
                  onClick={() => handleSubTabChange("invitation")}
                  className={cn(
                    "ml-2 rounded-xl px-6 py-2 text-sm font-bold transition-all border-1 border-primary",
                    subTab === "invitation"
                      ? "bg-white text-[#064E3B] shadow"
                      : "text-slate-500 hover:text-slate-700"
                  )}
                >
                  Invitation
                </button>
              </div>

              {subTab === "detail" ? (
                <div className="flex-1 p-8 overflow-auto">
                  <div className="mb-8">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-3xl font-black text-[#064E3B]">
                          {selectedEntry.horseName}
                        </div>
                        <div className="text-slate-600 mt-1 text-lg">
                          {selectedEntry.raceName}
                        </div>
                        <div className="text-sm text-slate-500 mt-1">
                          {new Date(selectedEntry.scheduleAt).toLocaleString()}{" "}
                          • {selectedEntry.venue}
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedEntry(null)}
                        className="text-xl text-slate-400 hover:text-slate-600"
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  {/* Status Badges */}
                  <div className="flex flex-wrap gap-3 mb-8">
                    {!selectedEntry.jockeyName && (
                      <div className="px-5 py-2 text-sm font-bold rounded-2xl bg-primary text-white">
                        Find jockey
                      </div>
                    )}
                    {selectedEntry.pendingCount > 0 && (
                      <div className="px-5 py-2 text-sm font-bold rounded-2xl bg-amber-100 text-amber-700">
                        {selectedEntry.pendingCount} pending invite
                      </div>
                    )}
                    {selectedEntry.responsesCount > 0 && (
                      <div className="px-5 py-2 text-sm font-bold rounded-2xl bg-emerald-100 text-emerald-700">
                        {selectedEntry.responsesCount} response
                        {selectedEntry.responsesCount > 1 ? "s" : ""}
                      </div>
                    )}
                    {selectedEntry.entryStatus && (
                      <div className="px-5 py-2 text-sm font-bold rounded-2xl bg-slate-100 text-slate-700 border-1 border-black">
                        {selectedEntry.entryStatus}
                      </div>
                    )}
                  </div>

                  {/* Jockey Section */}
                  {selectedEntry.jockeyName ? (
                    <div className="bg-emerald-50 border border-emerald-100 rounded-3xl mb-8">
                      <div className="uppercase text-xs tracking-widest text-emerald-700 font-bold mb-2">
                        ASSIGNED JOCKEY
                      </div>
                      <div className="text-2xl font-bold text-emerald-900">
                        {selectedEntry.jockeyName}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-50 border border-dashed border-slate-300 rounded-3xl p-10 text-center mb-8">
                      <p className="text-slate-500 text-lg">
                        No jockey assigned yet
                      </p>
                      <p className="text-xs text-slate-400 mt-2">
                        (Jockey selection will go here)
                      </p>
                    </div>
                  )}

                  {/* Detailed Information Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white border rounded-2xl">
                      <div className="text-xs uppercase tracking-widest text-slate-500 mb-2">
                        Race Info
                      </div>
                      <div className="space-y-3">
                        <div>
                          <div className="text-xs text-slate-500">
                            Race Name
                          </div>
                          <div className="font-medium">
                            {selectedEntry.raceName}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-500">
                            Scheduled
                          </div>
                          <div className="font-medium">
                            {new Date(
                              selectedEntry.scheduleAt
                            ).toLocaleString()}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-500">Venue</div>
                          <div className="font-medium">
                            {selectedEntry.venue}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white border rounded-2xl">
                      <div className="text-xs uppercase tracking-widest text-slate-500 mb-2">
                        Entry Details
                      </div>
                      <div className="space-y-3">
                        <div>
                          <div className="text-xs text-slate-500">Distance</div>
                          <div className="font-medium">
                            {selectedEntry.distanceMeters} meters
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-500">
                            Lane Number
                          </div>
                          <div className="font-medium">
                            #{selectedEntry.laneNumber}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-500">Weight</div>
                          <div className="font-medium">
                            {selectedEntry.weightKg} kg
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white border rounded-2xl col-span-2">
                      <div className="text-xs uppercase tracking-widest text-slate-500 mb-3">
                        Status
                      </div>
                      <div className="flex gap-6">
                        <div>
                          <div className="text-xs text-slate-500">
                            Entry Status
                          </div>
                          <div className="font-medium capitalize">
                            {selectedEntry.entryStatus}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-500">
                            Race Status
                          </div>
                          <div className="font-medium capitalize">
                            {selectedEntry.raceStatus}
                          </div>
                        </div>
                        {selectedEntry.confirmedAt && (
                          <div>
                            <div className="text-xs text-slate-500">
                              Confirmed At
                            </div>
                            <div className="font-medium">
                              {new Date(
                                selectedEntry.confirmedAt
                              ).toLocaleString()}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Invitation Sub-tab Content */
                <div className="flex-1 p-8 overflow-auto">
                  <div className="font-bold text-lg mb-6">
                    Invitations for this entry
                  </div>
                  {relatedInvitations.length === 0 ? (
                    <div className="text-center py-16 text-slate-400 border border-dashed rounded-2xl">
                      No invitations yet for this entry
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {relatedInvitations.map((inv) => (
                        <div
                          key={inv.id}
                          className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-5"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3">
                              <span className="font-bold text-[#064E3B] truncate">
                                {inv.horse.name}
                              </span>
                              <span className="text-slate-300">→</span>
                              <span className="font-medium text-slate-700 truncate">
                                {inv.jockey.fullName}
                              </span>
                            </div>
                            <div className="text-xs text-slate-500 mt-1.5">
                              {inv.raceName && `${inv.raceName} • `}
                              {inv.tournament}
                              {inv.raceTime &&
                                ` • ${new Date(inv.raceTime).toLocaleString()}`}
                            </div>
                          </div>
                          <span className={statusBadgeClass(inv.status)}>
                            {formatStatus(inv.status)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-center px-8">
              <div>
                <p className="text-slate-400 text-lg">Select an entry</p>
                <p className="text-sm text-slate-500 mt-2">
                  to view details and invitations
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
