import { useState, useEffect, useRef } from "react";
import { cn } from "../../lib/utils";
import type { Entry, Invitation } from "../../hooks/useOwner";
import { useNavigate, useSearchParams } from "react-router-dom";
import { StatusBadge, JOCKEY_ROSTER_STATUS_STYLES } from "../ui/StatusBadge";
import { ToastContainer } from "../ui/toast";
import { useToast } from "../../hooks/useToast";
import {
  deriveEntryStatus,
  resolveEntryStatusLabel,
} from "../../utils/entryStatus";

const SIDEBAR_PAGE_SIZE = 8;
const AWAITING_STATUSES = new Set([
  "awaiting_jockey",
  "awaiting_owner",
  "awaiting_referee",
]);

interface JockeyRosterManagementProps {
  invitations: Invitation[];
  allEntries: Entry[];
  loadInvitations: (
    raceId: string,
    status?: "pending" | "approved" | "rejected"
  ) => Promise<void>;
  confirmPairing: (raceId: string, invitationId: string) => Promise<void>;
  cancelInvite: (raceId: string, invitationId: string) => Promise<boolean>;
}

export function JockeyRosterManagement({
  invitations,
  allEntries,
  loadInvitations,
  confirmPairing,
  cancelInvite,
}: JockeyRosterManagementProps) {
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [subTab, setSubTab] = useState<"detail" | "invitation">("detail");
  const [sidebarPage, setSidebarPage] = useState(1);

  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlSelectedEntryId = searchParams.get("selected");
  const tabParam = searchParams.get("tab");
  const { toasts, addToast } = useToast(3000);
  // Entries still awaiting a jockey pairing (any of the three "not yet
  // confirmed" sub-states). Previously checked invitation.status ===
  // "confirmed", a value that invitation.status can never hold, so this
  // filter was always a no-op. Also previously checked `!== "confirmed"`
  // directly, which wrongly admitted terminal states (withdrawn/scratched/
  // disqualified/did_not_finish) — those aren't "confirmed" either, but
  // they're not awaiting anything and shouldn't show a "Find Jockey" button.
  //
  // Filtered from allEntries (the full, unpaginated list) rather than a
  // paginated page — filtering a single page first would make entries
  // appear/disappear from this list depending on which page happened to be
  // showing, independent of whether they actually need a jockey.
  const entriesWithoutJockey = allEntries.filter((entry) =>
    AWAITING_STATUSES.has(
      deriveEntryStatus({
        entryStatus: entry.entryStatus,
        jockeyId: entry.jockeyId,
        confirmedAt: entry.confirmedAt,
      })
    )
  );

  const sidebarTotalPages = Math.max(
    1,
    Math.ceil(entriesWithoutJockey.length / SIDEBAR_PAGE_SIZE)
  );
  const clampedSidebarPage = Math.min(sidebarPage, sidebarTotalPages);
  const pagedEntriesWithoutJockey = entriesWithoutJockey.slice(
    (clampedSidebarPage - 1) * SIDEBAR_PAGE_SIZE,
    clampedSidebarPage * SIDEBAR_PAGE_SIZE
  );

  // Related invitations for selected entry
  const selectedEntry =
    allEntries.find((e) => e.entryId === selectedEntryId) ?? null;
  const relatedInvitations = selectedEntry
    ? invitations.filter((inv) => inv.horse.id === selectedEntry.horseId)
    : [];

  const handleFindJockey = (entry: Entry) => {
    navigate(`/owner/entries/${entry.entryId}/send-invites`);
  };

  const handleConfirm = async (inv: Invitation) => {
    try {
      await confirmPairing(inv.raceId, inv.id);
      addToast("Pairing confirmed successfully.", "success");
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "Failed to confirm pairing.";
      addToast(message, "error");
    }
  };

  const handleCancel = async (inv: Invitation) => {
    try {
      await cancelInvite(inv.raceId, inv.id);
      addToast("Invitation cancelled successfully.", "success");
    } catch {
      addToast("Failed to cancel invitation.", "error");
    }
  };

  const toPascalCase = (str: string): string => {
    if (!str) return "";
    return str
      .split(/[_\s-]+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  // entryId from URL available for future redirect handling

  const handleSubTabChange = async (tab: "detail" | "invitation") => {
    setSubTab(tab);
    if (tab === "invitation" && selectedEntry?.raceId) {
      await loadInvitations(selectedEntry.raceId);
    }
  };

  // Auto-select entry from URL query param (returning from SendInvitesPage)
  const autoSelectDone = useRef(false);
  useEffect(() => {
    if (autoSelectDone.current) return;
    if (!urlSelectedEntryId || allEntries.length === 0) return;

    const entry = allEntries.find((e) => e.entryId === urlSelectedEntryId);
    if (!entry) return;

    autoSelectDone.current = true;
    const timer = setTimeout(() => {
      setSelectedEntryId(entry.entryId);
      if (tabParam === "invitation" && entry.raceId) {
        setSubTab("invitation");
        void loadInvitations(entry.raceId);
      }

      // Clear auto-select query parameters to clean the URL
      const newParams = new URLSearchParams(searchParams);
      newParams.delete("selected");
      newParams.delete("tab");
      setSearchParams(newParams, { replace: true });
    }, 0);
    return () => clearTimeout(timer);
  }, [
    urlSelectedEntryId,
    tabParam,
    allEntries,
    loadInvitations,
    searchParams,
    setSearchParams,
  ]);

  return (
    <div className="max-w-6xl mx-auto p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-8 border-b pb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary!">
            {toPascalCase("jockey roster")}
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage your tournament entries and jockey invitations
          </p>
        </div>
      </div>
      <ToastContainer toasts={toasts} />

      <div className="flex w-full gap-6 flex-1 min-h-0">
        {/* Left Sidebar - Entries List */}
        <div className="w-1/3 border border-slate-200 bg-white rounded-2xl overflow-hidden flex flex-col shadow-xs">
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {entriesWithoutJockey.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center p-8 h-full">
                <p className="text-slate-400">
                  {toPascalCase("no pending entries")}
                </p>
              </div>
            ) : (
              pagedEntriesWithoutJockey.map((entry) => {
                const isSelected = selectedEntry?.entryId === entry.entryId;
                const hasJockey = !!entry.jockeyName && entry.jockeyName !== "";

                return (
                  <div
                    key={entry.entryId}
                    onClick={() => {
                      setSelectedEntryId(entry.entryId);
                      setSubTab("detail");
                    }}
                    className={cn(
                      "px-5 py-4 hover:bg-slate-50 cursor-pointer transition-all flex items-center justify-between gap-4",
                      isSelected && "bg-emerald-50/70"
                    )}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-[#064E3B] truncate text-sm">
                        {entry.horseName}
                      </div>
                      <div className="text-xs text-slate-500 truncate mt-0.5">
                        {entry.raceName}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      {!hasJockey && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFindJockey(entry);
                          }}
                          className="px-3 py-1 text-[10px] font-bold rounded-xl bg-[#064E3B] text-white hover:bg-[#043E2F] transition-colors"
                        >
                          {toPascalCase("find jockey")}
                        </button>
                      )}
                      {entry.pendingCount > 0 && (
                        <div className="px-2 py-0.5 text-[9px] font-bold rounded-lg bg-amber-100 text-amber-800 border border-amber-200">
                          {toPascalCase("pending")}
                        </div>
                      )}
                      {entry.responsesCount > 0 && (
                        <div className="px-2 py-0.5 text-[9px] font-bold rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-200">
                          {entry.responsesCount}{" "}
                          {toPascalCase(
                            entry.responsesCount > 1 ? "responses" : "response"
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
          {sidebarTotalPages > 1 && (
            <div className="flex items-center justify-center gap-3 p-4 border-t bg-slate-50">
              <button
                disabled={clampedSidebarPage <= 1}
                onClick={() => setSidebarPage(clampedSidebarPage - 1)}
                className="rounded-lg border bg-white px-3 py-1 text-xs font-semibold disabled:opacity-50 hover:bg-slate-100 transition"
              >
                {toPascalCase("prev")}
              </button>

              <span className="text-xs text-muted-foreground">
                {clampedSidebarPage} / {sidebarTotalPages}
              </span>

              <button
                disabled={clampedSidebarPage >= sidebarTotalPages}
                onClick={() => setSidebarPage(clampedSidebarPage + 1)}
                className="rounded-lg border bg-white px-3 py-1 text-xs font-semibold disabled:opacity-50 hover:bg-slate-100 transition"
              >
                {toPascalCase("next")}
              </button>
            </div>
          )}
        </div>

        {/* Right Panel - Detail + Invitation Sub Tabs */}
        <div className="flex-1 border border-slate-200 bg-white rounded-2xl overflow-hidden flex flex-col shadow-xs">
          {selectedEntry ? (
            <>
              {/* Sub Tabs inside Detail */}
              <div className="inline-flex rounded-xl bg-slate-100 p-1 mx-6 mt-6 self-start">
                <button
                  onClick={() => setSubTab("detail")}
                  className={cn(
                    "rounded-lg px-6 py-1.5 text-xs font-bold transition-all",
                    subTab === "detail"
                      ? "bg-white text-[#064E3B] shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  )}
                >
                  {toPascalCase("detail")}
                </button>
                <button
                  onClick={() => handleSubTabChange("invitation")}
                  className={cn(
                    "rounded-lg px-6 py-1.5 text-xs font-bold transition-all",
                    subTab === "invitation"
                      ? "bg-white text-[#064E3B] shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  )}
                >
                  {toPascalCase("invitation")}
                </button>
              </div>

              {subTab === "detail" ? (
                <div className="flex-1 p-6 overflow-y-auto space-y-6">
                  <div className="flex items-start justify-between border-b pb-4">
                    <div>
                      <div className="text-2xl font-extrabold text-[#064E3B]">
                        {selectedEntry.horseName}
                      </div>
                      <div className="text-slate-600 mt-1 text-sm font-semibold">
                        {selectedEntry.raceName}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        {new Date(selectedEntry.scheduleAt).toLocaleString(
                          "en-GB"
                        )}{" "}
                        • {selectedEntry.venue}
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedEntryId(null)}
                      className="text-slate-400 hover:text-slate-600 text-lg p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Status Badges */}
                  <div className="flex flex-wrap gap-2.5">
                    {!selectedEntry.jockeyName && (
                      <button
                        onClick={() => handleFindJockey(selectedEntry)}
                        className="px-4 py-1.5 text-xs font-bold rounded-xl bg-[#064E3B] text-white hover:bg-[#043E2F] transition-colors"
                      >
                        {toPascalCase("find jockey")}
                      </button>
                    )}
                    {selectedEntry.pendingCount > 0 && (
                      <div className="px-4 py-1.5 text-xs font-bold rounded-xl bg-amber-100 text-amber-800 border border-amber-200">
                        {toPascalCase("pending")}
                      </div>
                    )}
                    {selectedEntry.responsesCount > 0 && (
                      <div className="px-4 py-1.5 text-xs font-bold rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-200">
                        {selectedEntry.responsesCount}{" "}
                        {toPascalCase(
                          selectedEntry.responsesCount > 1
                            ? "responses"
                            : "response"
                        )}
                      </div>
                    )}
                    {selectedEntry.entryStatus && (
                      <div className="px-4 py-1.5 text-xs font-bold rounded-xl bg-slate-100 text-slate-700 border border-slate-200">
                        {toPascalCase("entry")}:{" "}
                        {resolveEntryStatusLabel(selectedEntry)}
                      </div>
                    )}
                  </div>

                  {/* Jockey Section */}
                  {selectedEntry.jockeyName ? (
                    <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 flex items-center justify-between">
                      <div>
                        <div className="uppercase text-[10px] tracking-wider text-emerald-700 font-bold mb-1">
                          {toPascalCase("assigned jockey")}
                        </div>
                        <div className="text-xl font-extrabold text-emerald-900">
                          {selectedEntry.jockeyName}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-8 text-center">
                      <p className="text-slate-500 font-semibold">
                        {toPascalCase("no jockey assigned yet")}
                      </p>
                      <button
                        onClick={() => handleFindJockey(selectedEntry)}
                        className="mt-3 text-xs font-bold text-[#064E3B] hover:underline"
                      >
                        {toPascalCase("select a jockey now")} →
                      </button>
                    </div>
                  )}

                  {/* Detailed Information Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50/50 border border-slate-200 rounded-xl p-5">
                      <div className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-3">
                        {toPascalCase("race info")}
                      </div>
                      <div className="space-y-2.5 text-sm">
                        <div className="flex justify-between border-b border-slate-100 pb-1.5">
                          <span className="text-slate-400 text-xs">
                            {toPascalCase("race name")}
                          </span>
                          <span className="font-semibold text-slate-800">
                            {selectedEntry.raceName}
                          </span>
                        </div>
                        <div className="flex justify-between border-b border-slate-100 pb-1.5">
                          <span className="text-slate-400 text-xs">
                            {toPascalCase("scheduled")}
                          </span>
                          <span className="font-semibold text-slate-800">
                            {new Date(selectedEntry.scheduleAt).toLocaleString(
                              "en-GB"
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between pb-1">
                          <span className="text-slate-400 text-xs">
                            {toPascalCase("venue")}
                          </span>
                          <span className="font-semibold text-slate-800">
                            {selectedEntry.venue}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-50/50 border border-slate-200 rounded-xl p-5">
                      <div className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-3">
                        {toPascalCase("entry details")}
                      </div>
                      <div className="space-y-2.5 text-sm">
                        <div className="flex justify-between border-b border-slate-100 pb-1.5">
                          <span className="text-slate-400 text-xs">
                            {toPascalCase("distance")}
                          </span>
                          <span className="font-semibold text-slate-800">
                            {selectedEntry.distanceMeters} meters
                          </span>
                        </div>
                        <div className="flex justify-between border-b border-slate-100 pb-1.5">
                          <span className="text-slate-400 text-xs">
                            {toPascalCase("lane number")}
                          </span>
                          <span className="font-semibold text-slate-800">
                            #{selectedEntry.laneNumber}
                          </span>
                        </div>
                        <div className="flex justify-between pb-1">
                          <span className="text-slate-400 text-xs">
                            {toPascalCase("weight")}
                          </span>
                          <span className="font-semibold text-slate-800">
                            {selectedEntry.weightKg} kg
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-50/50 border border-slate-200 rounded-xl p-5 col-span-2">
                      <div className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-3">
                        {toPascalCase("status overview")}
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="text-slate-400 text-[10px] uppercase font-bold">
                            {toPascalCase("entry status")}
                          </div>
                          <div className="font-semibold text-slate-800 capitalize mt-0.5">
                            {resolveEntryStatusLabel(selectedEntry)}
                          </div>
                        </div>
                        <div>
                          <div className="text-slate-400 text-[10px] uppercase font-bold">
                            {toPascalCase("race status")}
                          </div>
                          <div className="font-semibold text-slate-800 capitalize mt-0.5">
                            {toPascalCase(selectedEntry.raceStatus)}
                          </div>
                        </div>
                        {selectedEntry.confirmedAt && (
                          <div>
                            <div className="text-slate-400 text-[10px] uppercase font-bold">
                              {toPascalCase("confirmed at")}
                            </div>
                            <div className="font-semibold text-slate-800 mt-0.5">
                              {new Date(
                                selectedEntry.confirmedAt
                              ).toLocaleDateString("en-GB")}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Invitation Sub-tab Content */
                <div className="flex-1 p-6 overflow-y-auto space-y-4">
                  <div className="font-bold text-[#064E3B] text-lg border-b pb-3 flex justify-between items-center">
                    <span>{toPascalCase("invitations for this entry")}</span>
                    {selectedEntry.jockeyName ? (
                      <span className="text-xs font-semibold text-emerald-600 shrink-0">
                        Assigned: {selectedEntry.jockeyName}
                      </span>
                    ) : (
                      <button
                        onClick={() => handleFindJockey(selectedEntry)}
                        className="px-3 py-1 text-xs font-bold rounded-xl bg-[#064E3B] text-white hover:bg-[#043E2F] transition-colors"
                      >
                        {toPascalCase("invite jockey")}
                      </button>
                    )}
                  </div>
                  {relatedInvitations.length === 0 ? (
                    <div className="text-center py-16 text-slate-400 border border-dashed rounded-2xl">
                      {toPascalCase("no invitations yet for this entry")}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {relatedInvitations.map((inv) => (
                        <div
                          key={inv.id}
                          className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-4 hover:shadow-xs transition"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-[#064E3B] truncate text-sm">
                                {inv.horse.name}
                              </span>
                              <span className="text-slate-300 text-xs">→</span>
                              <span className="font-bold text-slate-700 truncate text-sm">
                                {inv.jockey.fullName}
                              </span>
                            </div>
                            <div className="text-xs text-slate-500 mt-1">
                              {inv.raceName && `${inv.raceName} • `}
                              {inv.tournament}
                              {inv.raceTime &&
                                ` • ${new Date(inv.raceTime).toLocaleString("en-GB")}`}
                            </div>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <StatusBadge
                              status={inv.status}
                              styleMap={JOCKEY_ROSTER_STATUS_STYLES}
                              label={toPascalCase(inv.status)}
                              size="xs"
                              className="rounded uppercase"
                            />
                            {inv.status === "accepted" &&
                              !selectedEntry.jockeyId && (
                              <button
                                onClick={() => handleConfirm(inv)}
                                className="rounded-xl bg-emerald-600 px-3 py-1 text-xs font-bold text-white hover:bg-emerald-700 shadow-sm transition"
                              >
                                {toPascalCase("confirm")}
                              </button>
                            )}
                            {inv.status === "pending" && (
                              <button
                                onClick={() => handleCancel(inv)}
                                className="rounded-xl bg-rose-500 px-3 py-1 text-xs font-bold text-white hover:bg-rose-600 shadow-sm transition"
                              >
                                {toPascalCase("cancel")}
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-center p-8 bg-slate-50/50">
              <div>
                <p className="text-slate-400 font-bold text-lg">
                  {toPascalCase("select an entry")}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Choose a stable entry on the left to review details and jockey
                  pairings
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
