import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, User } from "lucide-react";
import UserLayout from "../layouts/UserLayout";
import type { RaceEntry } from "../types/race";
import type { AssignedReferee } from "../types/referee";
import useAdminRace from "../hooks/admin/useAdminRace";
import { AdminService } from "../services/AdminService";
import { fetchRaceEntries } from "../hooks/useRaces";
import { STATUS_LABELS } from "../components/admin/race/raceStatus";
import { StatusBadge, RACE_STATUS_STYLES } from "../components/ui/StatusBadge";
import RaceForm, { type RaceFormData } from "../components/admin/race/RaceForm";
import RaceStatusButton from "../components/admin/race/RaceStatusButton";
import NotFoundContent from "../components/ui/NotFoundContent";

export default function AdminRaceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const addToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const {
    selectedRace,
    loading,
    actionLoading,
    error,
    getRaceDetail,
    updateRace,
    updateRaceStatus,
    clearSelectedRace,
  } = useAdminRace();

  const [raceEditing, setRaceEditing] = useState(false);
  const [raceReferee, setRaceReferee] = useState<AssignedReferee | null>(null);
  const [raceEntries, setRaceEntries] = useState<RaceEntry[]>([]);
  const [showRefereePicker, setShowRefereePicker] = useState(false);
  const [availableReferees, setAvailableReferees] = useState<
    { id: string; fullName: string; email?: string }[]
  >([]);
  const [refereesLoading, setRefereesLoading] = useState(false);
  const [selectedRefereeId, setSelectedRefereeId] = useState("");

  useEffect(() => {
    if (!id) return;
    clearSelectedRace();
    void getRaceDetail(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (!id) return;
    let ignore = false;
    AdminService.getRaceReferee(id)
      .then((data) => {
        if (ignore) return;
        const ref = data?.referee
          ? {
              id: data.referee.id,
              fullName: data.referee.fullName,
              email: data.referee.email,
              assignedAt: data.assignedAt,
            }
          : data?.id
            ? {
                id: data.id,
                fullName: data.fullName,
                email: data.email,
                assignedAt: data.assignedAt,
              }
            : null;
        setRaceReferee(ref);
      })
      .catch(() => {
        if (!ignore) setRaceReferee(null);
      });
    fetchRaceEntries(id)
      .then((data) => {
        if (!ignore) setRaceEntries(data);
      })
      .catch(() => {
        if (!ignore) setRaceEntries([]);
      });
    return () => {
      ignore = true;
    };
  }, [id]);

  const handleUpdateRace = async (
    data: RaceFormData
  ): Promise<string | null> => {
    if (!id) return "No active race.";
    if (!data.scheduledAt) return "Schedule date is required.";
    const scheduledDate = new Date(data.scheduledAt);
    if (Number.isNaN(scheduledDate.getTime())) return "Invalid schedule date.";

    const payload: Record<string, unknown> = {
      name: data.name,
      raceNumber: data.raceNumber,
      courseDistanceId: data.trackDistanceId,
      distanceMeters: data.distanceMeters,
      trackCondition: data.trackCondition,
      scheduleAt: scheduledDate.toISOString(),
      venue: data.venue,
      laneCount: data.laneCount,
    };
    const res = await updateRace(id, payload);
    if (res.success === false) {
      addToast(res.error || "Failed to update race.", "error");
      return res.error ?? "Failed to update race.";
    }
    addToast("Race updated successfully.", "success");
    setRaceEditing(false);
    await getRaceDetail(id);
    return null;
  };

  const handleRaceStatusChange = async (status: string) => {
    if (!id) return;
    const result = await updateRaceStatus(id, status);
    if (result === true) {
      addToast("Race status updated.", "success");
      await getRaceDetail(id);
    } else {
      addToast(result || "Failed to update race status.", "error");
    }
  };

  const loadReferees = async () => {
    setRefereesLoading(true);
    setSelectedRefereeId("");
    try {
      const res = await AdminService.getUsers(
        undefined,
        undefined,
        "referee",
        1,
        100
      );
      const list = res?.data ?? [];
      setAvailableReferees(
        list.map((u: any) => ({
          id: u.id,
          fullName: u.fullName,
          email: u.email,
        }))
      );
    } catch {
      setAvailableReferees([]);
    } finally {
      setRefereesLoading(false);
    }
  };

  const handleAssignReferee = async () => {
    if (!id || !selectedRefereeId) return;
    try {
      await AdminService.assignRaceReferee(id, selectedRefereeId);
      addToast("Referee assigned successfully.", "success");
      setShowRefereePicker(false);
      setSelectedRefereeId("");
      const data = await AdminService.getRaceReferee(id);
      setRaceReferee(data?.referee ?? (data?.id ? data : null) ?? null);
    } catch {
      addToast("Failed to assign referee.", "error");
    }
  };

  const handleUnassignReferee = async () => {
    if (!id || !raceReferee) return;
    try {
      await AdminService.unassignRaceReferee(id, raceReferee.id);
      addToast("Referee unassigned successfully.", "success");
      setRaceReferee(null);
      setShowRefereePicker(false);
      setSelectedRefereeId("");
    } catch {
      addToast("Failed to unassign referee.", "error");
    }
  };

  if (error) {
    return <NotFoundContent title="Error" message={error} actionLabel="Go Back" onAction={() => navigate("/admin/tournaments")} />;
  }

  if (loading || !selectedRace) {
    return (
      <div className="flex items-center justify-center h-full p-10">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <UserLayout activeKey="/admin/tournaments">
      <div className="h-full w-full flex flex-col overflow-y-auto p-6 max-w-7xl mx-auto space-y-4">
        {toast && (
          <div
            className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl text-sm font-semibold shadow-lg ${
              toast.type === "success"
                ? "bg-emerald-600 text-white"
                : "bg-rose-600 text-white"
            }`}
          >
            {toast.message}
          </div>
        )}

        <button
          onClick={() => navigate("/admin/tournaments")}
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#064E3B] mb-2 w-fit hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Tournaments
        </button>

        <div className="space-y-5 bg-white border rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center gap-3 border-b pb-4">
            <h2 className="text-xl font-bold text-[#064E3B]">
              {selectedRace.name ?? "Race Detail"}
            </h2>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() =>
                  setRaceEditing((prev) => {
                    if (!prev) {
                      setShowRefereePicker(false);
                      setSelectedRefereeId("");
                    }
                    return !prev;
                  })
                }
                className="px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700"
              >
                {raceEditing ? "Cancel Edit" : "Edit Race"}
              </button>
              <RaceStatusButton
                currentStatus={selectedRace.status}
                onStatusChange={handleRaceStatusChange}
                actionLoading={actionLoading}
              />
            </div>
          </div>

          {raceEditing ? (
            <RaceForm
              initial={{
                name: selectedRace.name,
                distanceMeters: selectedRace.distanceMeters ?? 1200,
                trackCondition: selectedRace.trackCondition ?? "good",
                scheduledAt: selectedRace.scheduledAt ?? "",
                venue: selectedRace.venue ?? "",
                laneCount: selectedRace.laneCount ?? 8,
                raceNumber: selectedRace.raceNumber ?? undefined,
                trackDistanceId: selectedRace.courseDistanceId ?? "",
              }}
              initialTrackId={selectedRace.course?.id ?? ""}
              onClose={() => setRaceEditing(false)}
              onSubmit={handleUpdateRace}
              actionLoading={actionLoading}
            />
          ) : (
            <div className="pt-2 space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Status
                  </p>
                  <StatusBadge
                    status={selectedRace.status}
                    styleMap={RACE_STATUS_STYLES}
                    label={STATUS_LABELS[selectedRace.status] ?? selectedRace.status.replaceAll("_", " ")}
                    className="rounded capitalize font-bold"
                  />
                </div>
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Scheduled
                  </p>
                  <p className="text-xs font-semibold">
                    {selectedRace.scheduledAt
                      ? new Date(selectedRace.scheduledAt).toLocaleString(
                          "en-GB"
                        )
                      : "-"}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Lane Count
                  </p>
                  <p className="text-xs font-semibold">
                    {selectedRace.laneCount ?? "-"}
                  </p>
                </div>

                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Distance
                  </p>
                  <p className="text-xs font-semibold">
                    {(selectedRace.course?.distanceMeters ??
                    selectedRace.distanceMeters)
                      ? `${selectedRace.course?.distanceMeters ?? selectedRace.distanceMeters}m`
                      : "-"}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Track
                  </p>
                  <p className="text-xs font-semibold capitalize">
                    {selectedRace.trackCondition ??
                      selectedRace.course?.surfaceType ??
                      "-"}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Venue
                  </p>
                  <p className="text-xs font-semibold">
                    {selectedRace.venue ?? selectedRace.course?.name ?? "-"}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-800 mb-2">
                  Race Entries
                </h3>
                {raceEntries.length > 0 ? (
                  <div className="border rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b text-slate-500 font-bold uppercase text-[9px] tracking-wider">
                        <tr>
                          <th className="p-3">Horse</th>
                          <th className="p-3">Jockey</th>
                          <th className="p-3">Lane</th>
                          <th className="p-3">Status</th>
                          <th className="p-3">Cloth #</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {raceEntries.map((entry) => (
                          <tr key={entry.id} className="hover:bg-slate-50/50">
                            <td className="p-3 font-semibold text-slate-800">
                              {entry.name}
                            </td>
                            <td className="p-3 text-slate-600">
                              {entry.jockeyName || "-"}
                            </td>
                            <td className="p-3 text-slate-600">
                              {entry.laneNumber || "-"}
                            </td>
                            <td className="p-3">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded capitalize bg-slate-100 text-slate-600">
                                {entry.entryStatus?.replaceAll("_", " ") ?? "-"}
                              </span>
                            </td>
                            <td className="p-3 text-slate-600">
                              {entry.clothNumber ?? "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 py-3">No entries yet.</p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold text-slate-800">Referee</h3>
                  {!showRefereePicker && raceReferee && (
                    <button
                      onClick={() => {
                        setShowRefereePicker(true);
                        void loadReferees();
                      }}
                      className="text-[10px] font-bold text-[#064E3B] underline hover:no-underline"
                    >
                      Change
                    </button>
                  )}
                </div>
                {showRefereePicker ? (
                  <div className="bg-slate-50 rounded-xl p-3 space-y-2">
                    {refereesLoading ? (
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Loading referees...
                      </div>
                    ) : availableReferees.length === 0 ? (
                      <p className="text-xs text-slate-400">
                        No referees available.
                      </p>
                    ) : (
                      <>
                        <select
                          value={selectedRefereeId}
                          onChange={(e) => setSelectedRefereeId(e.target.value)}
                          className="w-full border rounded-lg px-3 py-2 text-xs"
                        >
                          <option value="" disabled>
                            Select a referee...
                          </option>
                          {availableReferees.map((r) => (
                            <option key={r.id} value={r.id}>
                              {r.fullName}
                              {r.email ? ` (${r.email})` : ""}
                            </option>
                          ))}
                        </select>
                        <div className="flex gap-2">
                          <button
                            onClick={handleAssignReferee}
                            disabled={!selectedRefereeId}
                            className="px-3 py-1.5 rounded-lg bg-[#064E3B] text-white text-[10px] font-bold hover:opacity-90 disabled:opacity-50"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => {
                              setShowRefereePicker(false);
                              setSelectedRefereeId("");
                            }}
                            className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-[10px] font-bold hover:bg-slate-100"
                          >
                            Cancel
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ) : raceReferee ? (
                  <div className="bg-slate-50 rounded-xl p-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-bold shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-slate-800 truncate">
                          {raceReferee.fullName}
                        </p>
                        {raceReferee.email && (
                          <span className="text-[11px] text-slate-500 truncate">
                            {raceReferee.email}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400">
                        Assigned:{" "}
                        {raceReferee.assignedAt
                          ? new Date(raceReferee.assignedAt).toLocaleDateString(
                              "en-GB"
                            )
                          : "Recently"}
                      </p>
                    </div>
                    <button
                      onClick={handleUnassignReferee}
                      className="text-[10px] font-bold text-rose-600 underline hover:no-underline shrink-0"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setShowRefereePicker(true);
                      void loadReferees();
                    }}
                    className="w-full border-2 border-dashed border-[#064E3B]/30 rounded-xl py-4 text-sm font-bold text-[#064E3B] hover:bg-[#064E3B]/5 hover:border-[#064E3B]/50 transition-colors flex items-center justify-center gap-2"
                  >
                    <User className="w-4 h-4" />
                    Assign Referee
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </UserLayout>
  );
}
