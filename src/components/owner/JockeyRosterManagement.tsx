import { useState, useEffect } from "react";
import { cn } from "../../lib/utils";
import { type Entry, useOwner } from "../../hooks/useOwner.ts";
import { useParams } from "react-router-dom";
import { Search, ArrowLeft } from "lucide-react";
import { ToastContainer } from "../ui/toast";
import { useToast } from "../../hooks/useToast";

export function JockeyRosterManagement() {
  const {
    invitations,
    entries,
    loadInvitations,
    confirmPairing,
    cancelInvite,
    entriesPagination,
    entriesPage,
    setEntriesPage,
    jockeys,
    loadJockeys,
    inviteJockey,
  } = useOwner();
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
  const [subTab, setSubTab] = useState<"detail" | "invitation">("detail");
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteModalStep, setInviteModalStep] = useState<"select" | "write">(
    "select"
  );

  // Invite Modal State
  const [selectedJockeyId, setSelectedJockeyId] = useState<number | null>(null);
  const [inviteTitle, setInviteTitle] = useState("");
  const [inviteMessage, setInviteMessage] = useState("");
  const [inviting, setInviting] = useState(false);
  const [keyword, setKeyword] = useState("");

  const { entryId } = useParams<{ entryId: string }>();
  const { toasts, addToast } = useToast(3000);
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
    setSelectedEntry(entry);
    setShowInviteModal(true);
    // Reload jockeys when opening the modal for fresh list
    loadJockeys();
  };

  const handleConfirm = (Inv: any) => {
    console.log(Inv);
    confirmPairing(Inv.raceId, Inv.id);
  };

  const handleCancel = (Inv: any) => {
    console.log(Inv);
    cancelInvite(Inv.raceId, Inv.id);
  };

  const filteredJockeys = (() => {
    if (!keyword.trim()) return jockeys;
    const term = keyword.toLowerCase();
    return jockeys.filter(
      (j) =>
        j.fullName.toLowerCase().includes(term) ||
        (j.club && j.club.toLowerCase().includes(term))
    );
  })();

  const selectedJockey = filteredJockeys.find((j) => j.id === selectedJockeyId);

  const handleSendClick = () => {
    if (!selectedJockey) return;
    setInviteModalStep("write");
  };

  const handleConfirmSend = async () => {
    if (!selectedEntry || !selectedJockey) return;

    setInviting(true);

    try {
      await inviteJockey(
        inviteTitle,
        selectedEntry.entryId,
        String(selectedJockey.id),
        selectedEntry.horseId,
        inviteMessage
      );
      addToast("Invitation sent successfully.", "success");
      handleCloseInviteModal();
      // Keep selectedEntry unchanged, subTab will show updated invitation list
      setSubTab("invitation");
    } catch (error) {
      console.error(error);
      addToast("Failed to send invitation. Please try again.", "error");
    } finally {
      setInviting(false);
    }
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

  const toPascalCase = (str: string): string => {
    if (!str) return "";
    return str
      .split(/[_\s-]+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  useEffect(() => {
    if (entryId) {
      console.log("Found entryId in URL, redirecting or handling...");
    }
  }, [entryId]);

  const handleSubTabChange = async (tab: "detail" | "invitation") => {
    setSubTab(tab);
    if (tab === "invitation" && selectedEntry?.raceId) {
      await loadInvitations(selectedEntry.raceId);
    }
  };

  const handleCloseInviteModal = () => {
    setShowInviteModal(false);
    setInviteModalStep("select");
    setSelectedJockeyId(null);
    setInviteTitle("");
    setInviteMessage("");
    setKeyword("");
  };

  return (
    <div className="max-w-6xl mx-auto p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-8 border-b pb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight !text-primary">
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
                          {entry.pendingCount} {toPascalCase("pending")}
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
          {entriesPagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 p-4 border-t bg-slate-50">
              <button
                disabled={entriesPage <= 1}
                onClick={() => setEntriesPage((p) => p - 1)}
                className="rounded-lg border bg-white px-3 py-1 text-xs font-semibold disabled:opacity-50 hover:bg-slate-100 transition"
              >
                {toPascalCase("prev")}
              </button>

              <span className="text-xs text-muted-foreground">
                {entriesPage} / {entriesPagination.totalPages}
              </span>

              <button
                disabled={entriesPage >= entriesPagination.totalPages}
                onClick={() => setEntriesPage((p) => p + 1)}
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
                        {new Date(selectedEntry.scheduleAt).toLocaleString()} •{" "}
                        {selectedEntry.venue}
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedEntry(null)}
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
                        {selectedEntry.pendingCount}{" "}
                        {toPascalCase(
                          selectedEntry.pendingCount > 1
                            ? "pending invites"
                            : "pending invite"
                        )}
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
                        {toPascalCase(selectedEntry.entryStatus)}
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
                            {new Date(
                              selectedEntry.scheduleAt
                            ).toLocaleString()}
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
                            {toPascalCase(selectedEntry.entryStatus)}
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
                              ).toLocaleDateString()}
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
                    <button
                      onClick={() => handleFindJockey(selectedEntry)}
                      className="px-3 py-1 text-xs font-bold rounded-xl bg-[#064E3B] text-white hover:bg-[#043E2F] transition-colors"
                    >
                      {toPascalCase("invite jockey")}
                    </button>
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
                                ` • ${new Date(inv.raceTime).toLocaleString()}`}
                            </div>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className={statusBadgeClass(inv.status)}>
                              {toPascalCase(inv.status)}
                            </span>
                            {inv.status === "accepted" && (
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

      {/* Invite Modal */}
      {showInviteModal && selectedEntry && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-8 shadow-xl">
            {inviteModalStep === "select" ? (
              /* Select Jockey Step */
              <>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-[#064E3B]">
                      Choose jockey
                    </h2>
                    <p className="mt-2 text-sm text-slate-500">
                      Select a jockey for {selectedEntry.horseName} in{" "}
                      {selectedEntry.raceName}.
                    </p>
                  </div>
                  <button
                    onClick={handleCloseInviteModal}
                    className="rounded-full px-3 py-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                  >
                    ✕
                  </button>
                </div>

                {/* Entry Details in Modal */}
                <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <div className="font-semibold text-slate-800 text-lg">
                    {selectedEntry.horseName}
                  </div>
                  <div className="text-sm text-slate-500 mt-1">
                    {selectedEntry.raceName}
                  </div>
                  <div className="text-xs text-slate-400 mt-2">
                    {new Date(selectedEntry.scheduleAt).toLocaleString()} •{" "}
                    {selectedEntry.venue}
                  </div>
                </div>

                {/* Search */}
                <div className="mt-6">
                  <div className="relative">
                    <Search
                      className="absolute left-4 top-3.5 text-slate-400"
                      size={18}
                    />
                    <input
                      value={keyword}
                      onChange={(e) => setKeyword(e.target.value)}
                      placeholder="Search jockey by name or club..."
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-11 py-3 text-sm text-slate-700 outline-none transition focus:border-[#064E3B]"
                    />
                  </div>
                </div>

                {/* Jockey List */}
                <div className="mt-6 max-h-[400px] overflow-auto pr-2 space-y-3">
                  {filteredJockeys.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 py-20 text-center text-sm text-slate-400">
                      No jockeys found.
                    </div>
                  ) : (
                    filteredJockeys.map((jockey) => {
                      const isSelected = selectedJockeyId === jockey.id;
                      return (
                        <button
                          key={jockey.id}
                          type="button"
                          onClick={() => {
                            setSelectedJockeyId(jockey.id);
                            setInviteModalStep("write");
                          }}
                          className={cn(
                            "w-full rounded-3xl border p-5 text-left transition",
                            isSelected
                              ? "border-[#064E3B] bg-emerald-50 shadow-sm"
                              : "border-slate-200 bg-white hover:border-[#064E3B] hover:bg-slate-50"
                          )}
                        >
                          <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-600">
                              {jockey.fullName
                                .split(" ")
                                .map((part) => part[0])
                                .join("")}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="font-semibold text-slate-800 truncate">
                                {jockey.fullName}
                              </div>
                              <div className="text-sm text-slate-500 truncate">
                                {jockey.club || "No club"}
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>

                {/* Footer */}
                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                  <button
                    onClick={handleCloseInviteModal}
                    className="rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSendClick}
                    disabled={!selectedJockeyId}
                    className="rounded-2xl bg-[#064E3B] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#043E2F] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </>
            ) : (
              /* Write Invitation Step */
              <>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-[#064E3B]">
                      Write invitation
                    </h2>
                    <p className="mt-2 text-sm text-slate-500">
                      Send a custom note to {selectedJockey?.fullName} before
                      inviting.
                    </p>
                  </div>
                  <button
                    onClick={() => setInviteModalStep("select")}
                    className="rounded-full px-3 py-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                  >
                    <ArrowLeft size={16} />
                  </button>
                </div>

                <div className="mt-6 space-y-5">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Title
                    </label>
                    <input
                      value={inviteTitle}
                      onChange={(e) => setInviteTitle(e.target.value)}
                      placeholder={`Invitation for ${selectedEntry.raceName}`}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-[#064E3B]"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Message
                    </label>
                    <textarea
                      value={inviteMessage}
                      onChange={(e) => setInviteMessage(e.target.value)}
                      rows={5}
                      placeholder="Write a short message to the jockey..."
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-[#064E3B] resize-y"
                    />
                  </div>
                </div>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <button
                    onClick={() => setInviteModalStep("select")}
                    className="rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleConfirmSend}
                    disabled={inviting}
                    className="rounded-2xl bg-[#064E3B] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#043E2F] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {inviting ? "Sending..." : "Send Invitation"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
