import { useState, useEffect } from "react";
import type { ToastType } from "../../types/referee";
import useAdminRegistration from "../../hooks/admin/useAdminRegistration";
import { AdminService } from "../../services/AdminService";
import { RaceService } from "../../services/RaceService";
import type { RaceListItem } from "../../types/race";

export default function RegistryApprovals({
  addToast,
}: {
  addToast: (m: string, t?: ToastType) => void;
}) {
  const [activeTab, setActiveTab] = useState<"entries" | "assign-referee">(
    "entries"
  );

  return (
    <div className="p-6 space-y-5 max-w-7xl mx-auto h-full">
      <div className="border-b border-[#064E3B]/10 pb-4">
        <h2 className="text-xl font-black font-headline text-[#064E3B]">
          Registry & Approvals
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Manage tournament entries and referee assignments.
        </p>
      </div>

      <div className="flex gap-6 border-b border-slate-200">
        <button
          onClick={() => setActiveTab("entries")}
          className={`pb-2 text-sm font-bold transition-colors ${
            activeTab === "entries"
              ? "text-[#064E3B] border-b-2 border-[#064E3B]"
              : "text-slate-400 hover:text-slate-600"
          }`}
        >
          Tournament Entries
        </button>
        <button
          onClick={() => setActiveTab("assign-referee")}
          className={`pb-2 text-sm font-bold transition-colors ${
            activeTab === "assign-referee"
              ? "text-[#064E3B] border-b-2 border-[#064E3B]"
              : "text-slate-400 hover:text-slate-600"
          }`}
        >
          Assign Referee
        </button>
      </div>

      {activeTab === "entries" ? (
        <TournamentEntriesTab addToast={addToast} />
      ) : (
        <AssignRefereeTab addToast={addToast} />
      )}
    </div>
  );
}

function TournamentEntriesTab({
  addToast,
}: {
  addToast: (m: string, t?: ToastType) => void;
}) {
  const {
    registrations,
    loading,
    error,
    pagination,
    setPagination,
    loadRegistrations,
    updateRegistration,
  } = useAdminRegistration();
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  const handleAction = async (
    regId: string,
    status: "approved" | "rejected"
  ) => {
    setProcessingIds((prev) => new Set(prev).add(regId));
    try {
      await updateRegistration(regId, { status });
      addToast(
        status === "approved"
          ? "Horse entry approved."
          : "Horse entry rejected.",
        status === "approved" ? "success" : "error"
      );
    } catch {
      addToast("Failed to update registration.", "error");
    } finally {
      setProcessingIds((prev) => {
        const next = new Set(prev);
        next.delete(regId);
        return next;
      });
    }
  };

  const pendingEntries = registrations.filter((r) => r.status === "pending");

  return (
    <div className="grid grid-cols-1 gap-6">
      <div className="bg-white border rounded-2xl p-5 shadow-sm space-y-4">
        <h3 className="font-bold text-sm text-[#064E3B] border-b pb-2">
          Pending Tournament Entries
        </h3>

        {loading && (
          <p className="text-xs text-slate-400 text-center py-8">
            Loading entries...
          </p>
        )}

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl">
            <p className="text-[10px] text-rose-700">{error}</p>
            <button
              onClick={() => loadRegistrations()}
              className="text-[10px] text-rose-600 underline mt-1"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && pendingEntries.length === 0 && (
          <p className="text-xs text-slate-400 text-center py-8">
            No pending entries.
          </p>
        )}

        <div className="space-y-3">
          {pendingEntries.map((reg) => {
            const isProcessing = processingIds.has(reg.id);
            return (
              <div
                key={reg.id}
                className="p-4 border border-slate-100 bg-slate-50 rounded-xl space-y-3"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-bold text-slate-800">
                      Horse: {reg.horse.name} ({reg.horse.breed})
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Target: {reg.tournament.name}
                    </p>
                  </div>
                  <span className="bg-amber-100 text-amber-800 text-[9px] px-2 py-0.5 rounded font-black uppercase">
                    Pending
                  </span>
                </div>

                <div className="text-[10px] bg-white p-2 rounded border border-slate-100 font-label text-slate-600">
                  <p>Owner ID: {reg.horse.ownerId}</p>
                  <p>
                    Submitted: {new Date(reg.submittedAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    disabled={isProcessing}
                    onClick={() => handleAction(reg.id, "approved")}
                    className="flex-1 bg-[#064E3B] text-white text-xs font-bold py-1.5 rounded-lg shadow-sm hover:bg-[#043E2F] disabled:opacity-50"
                  >
                    {isProcessing ? "..." : "Approve"}
                  </button>
                  <button
                    disabled={isProcessing}
                    onClick={() => handleAction(reg.id, "rejected")}
                    className="flex-1 bg-white border border-slate-200 text-rose-600 text-xs font-bold py-1.5 rounded-lg hover:bg-slate-50 disabled:opacity-50"
                  >
                    Reject
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {pagination.totalPages > 1 && (
          <div className="flex items-center gap-2 pt-3">
            <button
              disabled={pagination.page <= 1}
              onClick={() =>
                setPagination((prev) => ({
                  ...prev,
                  page: prev.page - 1,
                }))
              }
              className="border rounded-lg px-3 py-1 text-xs disabled:opacity-50"
            >
              Prev
            </button>
            <span className="text-sm text-slate-600">
              {pagination.page} / {pagination.totalPages}
            </span>
            <button
              disabled={pagination.page >= pagination.totalPages}
              onClick={() =>
                setPagination((prev) => ({
                  ...prev,
                  page: prev.page + 1,
                }))
              }
              className="border rounded-lg px-3 py-1 text-xs disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function AssignRefereeTab({
  addToast,
}: {
  addToast: (m: string, t?: ToastType) => void;
}) {
  const [races, setRaces] = useState<RaceListItem[]>([]);
  const [referees, setReferees] = useState<any[]>([]);
  const [selectedRaceId, setSelectedRaceId] = useState<string>("");
  const [selectedRefereeId, setSelectedRefereeId] = useState<string>("");
  const [currentAssignment, setCurrentAssignment] = useState<any | null>(null);
  const [loadingRaces, setLoadingRaces] = useState(true);
  const [loadingReferees, setLoadingReferees] = useState(true);
  const [loadingAssignment, setLoadingAssignment] = useState(false);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    let cancelled = false;
    RaceService.getRaces({ limit: 100 })
      .then((data) => {
        if (!cancelled) setRaces(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!cancelled) addToast("Failed to load races.", "error");
      })
      .finally(() => {
        if (!cancelled) setLoadingRaces(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let cancelled = false;
    AdminService.getUsers(undefined, undefined, "referee", 1, 100)
      .then((res: any) => {
        if (!cancelled) setReferees(res?.data ?? []);
      })
      .catch(() => {
        if (!cancelled) addToast("Failed to load referees.", "error");
      })
      .finally(() => {
        if (!cancelled) setLoadingReferees(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selectedRaceId) return;
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoadingAssignment(true);
    AdminService.getRaceReferee(selectedRaceId)
      .then((data: any) => {
        if (!cancelled) {
          if (data && data.referee) {
            setCurrentAssignment(data);
            setSelectedRefereeId(data.referee.id);
          } else {
            setCurrentAssignment(null);
            setSelectedRefereeId("");
          }
        }
      })
      .catch(() => {
        if (!cancelled) {
          setCurrentAssignment(null);
          setSelectedRefereeId("");
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingAssignment(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedRaceId]);

  const handleAssign = async () => {
    if (!selectedRaceId || !selectedRefereeId) {
      addToast("Please select a race and a referee.", "warning");
      return;
    }
    if (!selectedRaceAssignable) {
      addToast("Race must be in scheduled or pre-race status.", "warning");
      return;
    }
    setAssigning(true);
    try {
      await AdminService.assignRaceReferee(selectedRaceId, selectedRefereeId);
      addToast("Referee assigned successfully.", "success");
      const updated = await AdminService.getRaceReferee(selectedRaceId);
      if (updated && updated.referee) setCurrentAssignment(updated);
    } catch {
      addToast("Failed to assign referee.", "error");
    } finally {
      setAssigning(false);
    }
  };

  const assignableStatuses = new Set(["scheduled", "pre_race"]);
  const assignableRaces = races.filter((r) => assignableStatuses.has(r.status));
  const selectedRace = races.find((r) => r.id === selectedRaceId);
  const selectedRaceAssignable =
    selectedRace && assignableStatuses.has(selectedRace.status);

  return (
    <div className="grid grid-cols-1 gap-6">
      <div className="bg-white border rounded-2xl p-5 shadow-sm space-y-5">
        <h3 className="font-bold text-sm text-[#064E3B] border-b pb-2">
          Assign Referee to Race
        </h3>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">
              Race
            </label>
            {loadingRaces ? (
              <p className="text-xs text-slate-400">Loading races...</p>
            ) : (
              <select
                value={selectedRaceId}
                onChange={(e) => {
                  setSelectedRaceId(e.target.value);
                  setCurrentAssignment(null);
                  setSelectedRefereeId("");
                }}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#064E3B]/20"
              >
                <option value="">-- Select a race --</option>
                {assignableRaces.map((race) => (
                  <option key={race.id} value={race.id}>
                    {race.name} — {race.venue} ({race.status})
                  </option>
                ))}
              </select>
            )}
            {!loadingRaces && (
              <p className="text-[10px] text-slate-400 mt-1">
                Showing {assignableRaces.length} of {races.length} races (only
                scheduled/pre-race are eligible).
              </p>
            )}
          </div>

          {selectedRaceId && (
            <div className="bg-slate-50 rounded-xl p-3 space-y-2">
              <p className="text-xs font-bold text-slate-600">
                Current Assignment
              </p>
              {loadingAssignment ? (
                <p className="text-xs text-slate-400">Loading...</p>
              ) : currentAssignment ? (
                <div className="flex items-center gap-2 text-xs text-slate-700">
                  <span className="bg-[#064E3B]/10 text-[#064E3B] px-2 py-0.5 rounded font-medium">
                    {currentAssignment.referee.fullName}
                  </span>
                  <span className="text-slate-400">
                    (since{" "}
                    {new Date(
                      currentAssignment.assignedAt
                    ).toLocaleDateString()}
                    )
                  </span>
                </div>
              ) : (
                <p className="text-xs text-slate-400">No referee assigned.</p>
              )}
              {selectedRace && (
                <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-200">
                  {selectedRace.name} — {selectedRace.venue} —{" "}
                  {new Date(selectedRace.scheduledAt).toLocaleDateString()}
                </div>
              )}
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">
              Referee
            </label>
            {loadingReferees ? (
              <p className="text-xs text-slate-400">Loading referees...</p>
            ) : (
              <select
                value={selectedRefereeId}
                onChange={(e) => setSelectedRefereeId(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#064E3B]/20"
              >
                <option value="">-- Select a referee --</option>
                {referees.map((ref: any) => (
                  <option key={ref.id} value={ref.id}>
                    {ref.fullName ?? ref.full_name} ({ref.email})
                  </option>
                ))}
              </select>
            )}
            {referees.length === 0 && !loadingReferees && (
              <p className="text-xs text-slate-400 mt-1">No referees found.</p>
            )}
          </div>

          <button
            disabled={assigning || !selectedRaceId || !selectedRefereeId}
            onClick={handleAssign}
            className="w-full bg-[#064E3B] text-white text-xs font-bold py-2 rounded-lg shadow-sm hover:bg-[#043E2F] disabled:opacity-50 transition-colors"
          >
            {assigning ? "Assigning..." : "Assign Referee"}
          </button>
        </div>
      </div>
    </div>
  );
}
