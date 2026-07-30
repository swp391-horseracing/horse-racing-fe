import { useState, useEffect } from "react";
import {
  ChevronDown,
  ChevronUp,
  User,
  Loader2,
  Play,
  Edit2,
} from "lucide-react";
import { StatusBadge, RACE_STATUS_STYLES } from "../../ui/StatusBadge";
import { STATUS_LABELS } from "../race/raceStatus";
import type { RaceItem } from "../../../types/tournament";
import type { RaceEntry } from "../../../types/race";
import type { AssignedReferee } from "../../../types/referee";
import { useRaces, fetchRaceEntries } from "../../../hooks/useRaces";
import { AdminService } from "../../../services/AdminService";

type Props = {
  race: RaceItem;
  onRaceUpdated: () => void;
  onEditRace: (race: RaceItem) => void;
  addToast: (msg: string, type?: "success" | "error" | "info") => void;
};

export default function RaceExpandableRow({
  race,
  onRaceUpdated,
  onEditRace,
  addToast,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const [entries, setEntries] = useState<RaceEntry[]>([]);
  const [entriesLoading, setEntriesLoading] = useState(false);
  const [raceReferee, setRaceReferee] = useState<AssignedReferee | null>(null);
  const [raceConfig, setRaceConfig] = useState<{
    firstPlacePoints: number;
    secondPlacePoints: number;
    thirdPlacePoints: number;
  } | null>(null);
  const [showRefereePicker, setShowRefereePicker] = useState(false);
  const [availableReferees, setAvailableReferees] = useState<
    { id: string; fullName: string; email?: string }[]
  >([]);
  const [refereesLoading, setRefereesLoading] = useState(false);
  const [selectedRefereeId, setSelectedRefereeId] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const { startRaces } = useRaces();

  useEffect(() => {
    if (!expanded) return;
    let ignore = false;

    const loadExpandedData = async () => {
      setEntriesLoading(true);
      try {
        const data = await fetchRaceEntries(race.id);
        if (!ignore) setEntries(data);
      } catch {
        if (!ignore) setEntries([]);
      } finally {
        if (!ignore) setEntriesLoading(false);
      }

      try {
        const data = await AdminService.getRaceReferee(race.id);
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
      } catch {
        if (!ignore) setRaceReferee(null);
      }

      try {
        const data = await AdminService.getRaceConfig(race.id);
        if (!ignore)
          setRaceConfig({
            firstPlacePoints: data.firstPlacePoints,
            secondPlacePoints: data.secondPlacePoints,
            thirdPlacePoints: data.thirdPlacePoints,
          });
      } catch {
        if (!ignore) setRaceConfig(null);
      }
    };

    void loadExpandedData();

    return () => {
      ignore = true;
    };
  }, [expanded, race.id]);

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

  const handleStartRace = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setActionLoading(true);
    try {
      await startRaces(race.id);
      addToast("Race started successfully.", "success");
      onRaceUpdated();
    } catch {
      addToast("Failed to start race.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    setActionLoading(true);
    try {
      await AdminService.updateRaceStatus(race.id, newStatus);
      addToast("Race status updated.", "success");
      onRaceUpdated();
    } catch {
      addToast("Failed to update race status.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAssignReferee = async () => {
    if (!selectedRefereeId) return;
    try {
      await AdminService.assignRaceReferee(race.id, selectedRefereeId);
      addToast("Referee assigned successfully.", "success");
      setShowRefereePicker(false);
      setSelectedRefereeId("");
      const data = await AdminService.getRaceReferee(race.id);
      setRaceReferee(data?.referee ?? (data?.id ? data : null) ?? null);
    } catch {
      addToast("Failed to assign referee.", "error");
    }
  };

  const handleUnassignReferee = async () => {
    if (!raceReferee) return;
    try {
      await AdminService.unassignRaceReferee(race.id, raceReferee.id);
      addToast("Referee unassigned successfully.", "success");
      setRaceReferee(null);
    } catch {
      addToast("Failed to unassign referee.", "error");
    }
  };

  const raceNumber = (race as any).raceNumber;

  return (
    <div className="border border-slate-200 rounded-xl bg-white overflow-hidden transition-all shadow-xs">
      {/* Main Row Header */}
      <div
        onClick={() => setExpanded(!expanded)}
        className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-50/80 transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 shrink-0"
          >
            {expanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-xs text-slate-800 truncate">
                {raceNumber ? `#${raceNumber} - ` : ""}
                {race.name}
              </h4>
              <StatusBadge
                status={race.status}
                styleMap={RACE_STATUS_STYLES}
                label={
                  STATUS_LABELS[race.status] ?? race.status.replaceAll("_", " ")
                }
                className="rounded capitalize font-bold text-[9px] px-1.5 py-0.5"
              />
            </div>
            <p className="text-[11px] text-slate-500 truncate mt-0.5">
              {race.scheduledAt
                ? new Date(race.scheduledAt).toLocaleString("en-GB")
                : "Not scheduled"}{" "}
              • {race.venue || "No venue"}
            </p>
          </div>
        </div>

        <div
          className="flex items-center gap-2 shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          {(race.status === "scheduled" || race.status === "pre_race") && (
            <button
              onClick={handleStartRace}
              disabled={actionLoading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-xs disabled:opacity-50"
            >
              <Play className="w-3 h-3 fill-current" /> Start
            </button>
          )}

          <select
            value={race.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            disabled={actionLoading}
            className="border border-slate-200 rounded-lg px-2 py-1 text-[10px] font-semibold bg-slate-50 text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#064E3B]"
          >
            <option value="scheduled">Scheduled</option>
            <option value="pre_race">Pre Race</option>
            <option value="running">Running</option>
            <option value="finished">Finished</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <button
            onClick={() => onEditRace(race)}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600"
            title="Edit Race"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Expanded Details Section */}
      {expanded && (
        <div className="border-t border-slate-100 bg-slate-50/50 p-4 space-y-4">
          {/* Race Metadata & Points Info Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white rounded-xl border border-slate-200 p-3">
              <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Distance & Lanes
              </p>
              <p className="text-xs font-semibold text-slate-800">
                {race.distanceMeters ?? 1200}m • {race.laneCount ?? 8} Lanes
              </p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-3">
              <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Track Condition
              </p>
              <p className="text-xs font-semibold text-slate-800 capitalize">
                {race.trackCondition || "Dry"}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-3">
              <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Venue / Track
              </p>
              <p className="text-xs font-semibold text-slate-800 truncate">
                {race.venue || "Main Arena"}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-3">
              <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Points Config (1st / 2nd / 3rd)
              </p>
              <p className="text-xs font-semibold text-[#064E3B]">
                {raceConfig
                  ? `${raceConfig.firstPlacePoints} / ${raceConfig.secondPlacePoints} / ${raceConfig.thirdPlacePoints} pts`
                  : "9 / 8 / 7 pts"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Entries Section */}
            <div className="md:col-span-2 bg-white rounded-xl border border-slate-200 p-3.5 space-y-2">
              <h5 className="font-bold text-xs text-[#064E3B] flex items-center justify-between">
                <span>Race Entries ({entries.length})</span>
                {entriesLoading && (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-400" />
                )}
              </h5>

              {entriesLoading ? (
                <div className="py-6 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-[#064E3B]" />{" "}
                  Loading entries...
                </div>
              ) : entries.length === 0 ? (
                <p className="text-xs text-slate-400 py-3 text-center">
                  No entries registered for this race.
                </p>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-slate-50 border-b text-slate-500 font-bold uppercase text-[9px]">
                      <tr>
                        <th className="p-2">Horse</th>
                        <th className="p-2">Jockey</th>
                        <th className="p-2">Lane</th>
                        <th className="p-2">Cloth #</th>
                        <th className="p-2">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {entries.map((entry) => (
                        <tr key={entry.id} className="hover:bg-slate-50">
                          <td className="p-2 font-semibold text-slate-800">
                            {entry.name}
                          </td>
                          <td className="p-2 text-slate-600">
                            {entry.jockeyName || "-"}
                          </td>
                          <td className="p-2 text-slate-600">
                            {entry.laneNumber || "-"}
                          </td>
                          <td className="p-2 text-slate-600">
                            {entry.clothNumber ?? "-"}
                          </td>
                          <td className="p-2">
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase bg-slate-100 text-slate-600">
                              {entry.entryStatus?.replaceAll("_", " ") ?? "-"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Referee Section */}
            <div className="bg-white rounded-xl border border-slate-200 p-3.5 space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-bold text-xs text-[#064E3B]">
                    Referee Assignment
                  </h5>
                  {raceReferee && !showRefereePicker && (
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
                  <div className="space-y-2">
                    {refereesLoading ? (
                      <div className="py-4 text-center text-xs text-slate-400 flex items-center justify-center gap-1">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading
                        referees...
                      </div>
                    ) : availableReferees.length === 0 ? (
                      <p className="text-xs text-slate-400 py-2">
                        No available referees found.
                      </p>
                    ) : (
                      <>
                        <select
                          value={selectedRefereeId}
                          onChange={(e) => setSelectedRefereeId(e.target.value)}
                          className="w-full border rounded-lg px-2.5 py-1.5 text-xs bg-slate-50"
                        >
                          <option value="" disabled>
                            Select referee...
                          </option>
                          {availableReferees.map((r) => (
                            <option key={r.id} value={r.id}>
                              {r.fullName} {r.email ? `(${r.email})` : ""}
                            </option>
                          ))}
                        </select>
                        <div className="flex gap-2">
                          <button
                            onClick={handleAssignReferee}
                            disabled={!selectedRefereeId}
                            className="bg-[#064E3B] text-white px-3 py-1 rounded-lg text-[10px] font-bold disabled:opacity-50"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => {
                              setShowRefereePicker(false);
                              setSelectedRefereeId("");
                            }}
                            className="border border-slate-200 text-slate-600 px-3 py-1 rounded-lg text-[10px] font-bold hover:bg-slate-100"
                          >
                            Cancel
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ) : raceReferee ? (
                  <div className="bg-slate-50 rounded-lg p-2.5 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                        <User className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate">
                          {raceReferee.fullName}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate">
                          {raceReferee.email || "Assigned referee"}
                        </p>
                      </div>
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
                    className="w-full border-2 border-dashed border-[#064E3B]/30 rounded-lg py-3 text-xs font-bold text-[#064E3B] hover:bg-[#064E3B]/5 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <User className="w-3.5 h-3.5" /> Assign Referee
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
