import { useState, useEffect, useReducer } from "react";
import { cn } from "../../lib/utils";
import { TournamentService } from "../../services/TournamentService";
import { JockeyService } from "../../services/JockeyService.ts";
import type {
  TournamentRegistrationResponse as TournamentRegistration,
  RaceItem,
} from "../../types/tournament";
import type { Jockey } from "../../types/jockey";
import type { Invitation } from "../../types/invitation";

export interface JockeyRosterManagementProps {
  registrations: TournamentRegistration[];
  jockeys: Jockey[];
  invitations: Invitation[];
  onInviteJockey: (raceId: string, jockeyId: string, horseId: string) => void;
  onConfirmPairing: (invId: string) => void;
  onCancelInvite: (invId: string) => void;
  jockeysPagination: { page: number; limit: number; total: number; totalPages: number };
  loadAllInvitations: () => Promise<void>;
}

export function JockeyRosterManagement({
  registrations,
  jockeys,
  invitations,
  onInviteJockey,
  onConfirmPairing,
  onCancelInvite,
  jockeysPagination,
  loadAllInvitations,
}: JockeyRosterManagementProps) {
  const [activeTab, setActiveTab] = useState<"invite" | "invitations">("invite");
  const [step, setStep] = useState<"select-horse" | "select-race" | "select-jockey">("select-horse");
  const [selectedReg, setSelectedReg] = useState<TournamentRegistration | null>(null);
  const [selectedJockeyIds, setSelectedJockeyIds] = useState<number[]>([]);
  const [raceState, dispatchRace] = useReducer(
    (
      state: { loading: boolean; races: RaceItem[]; selectedRace: RaceItem | null },
      action:
        | { type: "LOADING" }
        | { type: "LOADED"; races: RaceItem[] }
        | { type: "ERROR" }
        | { type: "SELECT_RACE"; race: RaceItem | null }
    ) => {
      switch (action.type) {
        case "LOADING": return { loading: true, races: [], selectedRace: null };
        case "LOADED": return { loading: false, races: action.races, selectedRace: null };
        case "ERROR": return { loading: false, races: [], selectedRace: null };
        case "SELECT_RACE": return { ...state, selectedRace: action.race };
        default: return state;
      }
    },
    { loading: false, races: [] as RaceItem[], selectedRace: null as RaceItem | null }
  );

  const [localJockeyPage, setLocalJockeyPage] = useState(jockeysPagination.page);
  const [localJockeysPagination, setLocalJockeysPagination] = useState(jockeysPagination);
  const [browsingJockeys, setBrowsingJockeys] = useState<Jockey[]>(jockeys);
  const [jockeyLoading, setJockeyLoading] = useState(false);

  const handleJockeyPageChange = (newPage: number) => {
    setJockeyLoading(true);
    setLocalJockeyPage(newPage);
    JockeyService.getJockeys({ page: newPage, limit: 10 })
      .then((res) => {
        setBrowsingJockeys(res.data ?? []);
        setLocalJockeysPagination(res.pagination);
      })
      .catch(() => setBrowsingJockeys([]))
      .finally(() => setJockeyLoading(false));
  };

  const [inviteFilter, setInviteFilter] = useState<string>("all");

  const approved = registrations.filter(
    (r: TournamentRegistration) => r.status === "approved"
  );

  useEffect(() => {
    if (!selectedReg) return;
    dispatchRace({ type: "LOADING" });
    TournamentService.getTournamentRaces(selectedReg.tournament.id)
      .then((res) => dispatchRace({ type: "LOADED", races: res.data ?? [] }))
      .catch(() => dispatchRace({ type: "ERROR" }));
  }, [selectedReg]);

  useEffect(() => {
    if (activeTab === "invitations") {
      loadAllInvitations();
    }
  }, [activeTab, loadAllInvitations]);

  const handleSelectHorse = (reg: TournamentRegistration) => {
    setSelectedReg(reg);
    setStep("select-race");
  };

  const handleSelectRace = (race: RaceItem) => {
    dispatchRace({ type: "SELECT_RACE", race });
    setStep("select-jockey");
  };

  const handleBack = () => {
    if (step === "select-race") {
      setSelectedReg(null);
      setStep("select-horse");
    } else if (step === "select-jockey") {
      dispatchRace({ type: "SELECT_RACE", race: null });
      setStep("select-race");
    }
  };

  const toggleJockey = (id: number) => {
    setSelectedJockeyIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSendInvites = async () => {
    if (!raceState.selectedRace || !selectedReg) return;
    for (const jockeyId of selectedJockeyIds) {
      await onInviteJockey(raceState.selectedRace.id, String(jockeyId), selectedReg.horse.id);
    }
    setSelectedJockeyIds([]);
    dispatchRace({ type: "LOADED", races: [] });
    setSelectedReg(null);
    setStep("select-horse");
  };

  const filteredInvitations = invitations.filter((inv) => {
    if (inviteFilter === "all") return true;
    return inv.status === inviteFilter;
  });

  const statusBadgeClass = (status: string) =>
    cn(
      "text-[8px] font-black uppercase px-1.5 py-0.5 rounded border",
      status === "confirmed" && "bg-emerald-50 border-emerald-200 text-emerald-800",
      status === "accepted" && "bg-blue-50 border-blue-200 text-blue-800",
      status === "pending" && "bg-amber-50 border-amber-200 text-amber-800",
      status === "declined" && "bg-rose-50 border-rose-200 text-rose-800",
      status === "superseded" && "bg-slate-50 border-slate-200 text-slate-400"
    );

  const resetStep = () => {
    setSelectedReg(null);
    dispatchRace({ type: "SELECT_RACE", race: null });
    dispatchRace({ type: "LOADED", races: [] });
    setSelectedJockeyIds([]);
    setStep("select-horse");
  };

  return (
    <div className="py-5 max-w-6xl mx-auto">
      <h2 className="text-xl font-black text-[#064E3B] mb-4">Jockey Roster</h2>

      <div className="flex gap-1 mb-6 bg-slate-100 rounded-xl p-2 w-fit">
        <button
          onClick={() => { setActiveTab("invite"); resetStep(); }}
          className={cn(
            "px-4 py-2 text-sm font-bold rounded-lg transition-all",
            activeTab === "invite"
              ? "bg-white text-[#064E3B] shadow-lg"
              : "text-slate-500 hover:text-slate-700"
          )}
        >
          Invite Jockey
        </button>
        <button
          onClick={() => setActiveTab("invitations")}
          className={cn(
            "px-4 py-2 text-sm font-bold rounded-lg transition-all",
            activeTab === "invitations"
              ? "bg-white text-[#064E3B] shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          )}
        >
          Invitations
          {invitations.filter((i) => i.status === "pending").length > 0 && (
            <div className="ml-1.5 bg-amber-400 text-amber-900 px-1.5 py-0.5 rounded-full text-sm">
              {invitations.filter((i) => i.status === "pending").length}
            </div>
          )}
        </button>
      </div>

      {activeTab === "invite" && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            {step !== "select-horse" && (
              <button
                onClick={handleBack}
                className="text-sm font-bold text-slate-400 hover:text-slate-600"
              >
                ← Back
              </button>
            )}
            <div className="flex items-center gap-1.5 text-sm font-bold text-slate-400">
              <span className={cn(step === "select-horse" && "text-[#064E3B]")}>1. Horse</span>
              <span>/</span>
              <span className={cn(step === "select-race" && "text-[#064E3B]")}>2. Race</span>
              <span>/</span>
              <span className={cn(step === "select-jockey" && "text-[#064E3B]")}>3. Jockey</span>
            </div>
          </div>

          {step === "select-horse" && (
            <div>
              <p className="text-xs text-slate-500 mb-3 font-semibold">
                Select a registered horse to invite a jockey for
              </p>
              {approved.length === 0 ? (
                <p className="text-xs text-slate-400 italic">
                  No approved registrations yet. Register a horse for a tournament first.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {approved.map((reg) => {
                    const horse = reg.horse;
                    const tournament = reg.tournament;
                    if (!horse || !tournament) return null;
                    const hasConfirmed = invitations.some(
                      (i) =>
                        i.horse.id === reg.horse.id &&
                        i.tournamentId === reg.tournament.id &&
                        i.status === "confirmed"
                    );
                    return (
                      <button
                        key={reg.id}
                        onClick={() => !hasConfirmed && handleSelectHorse(reg)}
                        disabled={hasConfirmed}
                        className={cn(
                          "text-left bg-white border rounded-xl p-4 shadow-xs transition-all",
                          hasConfirmed
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:border-[#064E3B] hover:shadow-md cursor-pointer"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-bold text-sm text-[#064E3B]">
                              {horse.name}
                            </h4>
                            <p className="text-[10px] text-slate-400">
                              {tournament.name}
                            </p>
                          </div>
                          {hasConfirmed ? (
                            <span className="bg-emerald-50 text-emerald-800 text-[8px] font-black uppercase px-2 py-0.5 rounded">
                              Locked
                            </span>
                          ) : (
                            <span className="text-[10px] text-[#064E3B] font-bold">
                              Select →
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {step === "select-race" && (
            <div>
              {selectedReg && (
                <div className="mb-3 text-xs text-slate-500">
                  <span className="font-semibold">{selectedReg.horse.name}</span>
                  {" in "}
                  <span className="font-semibold">{selectedReg.tournament.name}</span>
                </div>
              )}
              <p className="text-xs text-slate-500 mb-3 font-semibold">
                Select a race to invite a jockey for
              </p>
              {raceState.loading ? (
                <p className="text-xs text-slate-400">Loading races...</p>
              ) : raceState.races.length === 0 ? (
                <p className="text-xs text-slate-400 italic">
                  No races available for this tournament.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {raceState.races.map((race) => (
                    <button
                      key={race.id}
                      onClick={() => handleSelectRace(race)}
                      className="text-left bg-white border rounded-xl p-4 shadow-xs hover:border-[#064E3B] hover:shadow-md transition-all cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-sm text-[#064E3B]">
                            {race.name}
                          </h4>
                          <p className="text-[10px] text-slate-400">
                            {race.roundName} — {new Date(race.scheduledAt).toLocaleString()}
                          </p>
                          <p className="text-[9px] text-slate-400">
                            {race.distanceMeters}m · {race.trackCondition} · {race.venue}
                          </p>
                        </div>
                        <span className="text-[10px] text-[#064E3B] font-bold">
                          Select →
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {step === "select-jockey" && (
            <div>
              {selectedReg && raceState.selectedRace && (
                <div className="mb-3 text-xs text-slate-500">
                  <span className="font-semibold">{selectedReg.horse.name}</span>
                  {" → "}
                  <span className="font-semibold">{raceState.selectedRace.name}</span>
                  {" — "}
                  <span className="font-semibold">{selectedReg.tournament.name}</span>
                </div>
              )}
              <p className="text-xs text-slate-500 mb-3 font-semibold">
                Select jockeys to invite
              </p>

              {jockeyLoading ? (
                <p className="text-sm text-slate-400">Loading jockeys...</p>
              ) : browsingJockeys.length === 0 ? (
                <p className="text-sm text-slate-400 italic">No jockeys available.</p>
              ) : (
                <>
                  <div className="h-full bg-white rounded-xl border">
                    {browsingJockeys.map((j) => (
                      <div
                        key={j.id}
                        onClick={() => toggleJockey(j.id)}
                        className={cn(
                          "p-3 flex items-center justify-between cursor-pointer",
                          selectedJockeyIds.includes(j.id) && "bg-emerald-50/50"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={selectedJockeyIds.includes(j.id)}
                            readOnly
                            className="accent-[#064E3B]"
                          />
                          <div>
                            <p className="font-bold text-slate-800 text-sm">
                              {j.fullName}
                            </p>
                            <p className="text-[10px] text-slate-400">{j.club}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-3 border-t">
                    <span className="text-[10px] text-slate-500">
                      {selectedJockeyIds.length} selected
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={resetStep}
                        className="rounded-md bg-white text-slate-500 border px-3.5 py-1.5 text-xs font-bold hover:bg-slate-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSendInvites}
                        disabled={selectedJockeyIds.length === 0}
                        className="rounded-md bg-[#064E3B] text-white px-3.5 py-1.5 text-xs font-bold disabled:opacity-40 hover:bg-[#043E2F]"
                      >
                        Send Invites ({selectedJockeyIds.length})
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <span className="text-[9px] text-slate-400">
                      Page {localJockeyPage} of {localJockeysPagination.totalPages} ({localJockeysPagination.total} jockeys)
                    </span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleJockeyPageChange(localJockeyPage - 1)}
                        disabled={localJockeyPage <= 1}
                        className="px-2 py-1 text-[10px] font-bold rounded border text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        ← Prev
                      </button>
                      <button
                        onClick={() => handleJockeyPageChange(localJockeyPage + 1)}
                        disabled={localJockeyPage >= localJockeysPagination.totalPages}
                        className="px-2 py-1 text-[10px] font-bold rounded border text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        Next →
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === "invitations" && (
        <div>
          <div className="flex gap-1 mb-4 bg-slate-100 rounded-lg p-1 w-fit">
            {["all", "pending", "accepted", "confirmed", "declined", "superseded"].map(
              (f) => (
                <button
                  key={f}
                  onClick={() => setInviteFilter(f)}
                  className={cn(
                    "px-3 py-1.5 text-[10px] font-bold rounded-md transition-all capitalize",
                    inviteFilter === f
                      ? "bg-white text-[#064E3B] shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  )}
                >
                  {f}
                </button>
              )
            )}
          </div>

          {filteredInvitations.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No invitations found.</p>
          ) : (
            <div className="space-y-2">
              {filteredInvitations.map((inv) => (
                <div
                  key={inv.id}
                  className="bg-white border rounded-xl p-4 shadow-xs flex items-center justify-between"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#064E3B]">
                        {inv.horse.name}
                      </span>
                      <span className="text-slate-300 text-[10px]">→</span>
                      <span className="font-semibold text-xs text-slate-700">
                        {inv.jockey.fullName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[9px] text-slate-400">
                        {inv.tournament ?? ""}
                      </span>
                      {inv.raceTime && (
                        <>
                          <span className="text-slate-200">·</span>
                          <span className="text-[9px] text-slate-400">
                            {new Date(inv.raceTime).toLocaleString()}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={statusBadgeClass(inv.status)}>
                      {inv.status}
                    </span>
                    {inv.status === "accepted" && (
                      <button
                        onClick={() => onConfirmPairing(inv.id)}
                        className="rounded bg-emerald-600 text-white px-2.5 py-1 text-[10px] font-bold hover:bg-emerald-700"
                      >
                        Confirm
                      </button>
                    )}
                    {inv.status === "pending" && (
                      <button
                        onClick={() => onCancelInvite(inv.id)}
                        className="text-rose-600 text-[10px] font-bold hover:text-rose-800"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
