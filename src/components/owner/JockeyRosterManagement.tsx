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
  jockeysPagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  loadAllInvitations: () => Promise<void>;
}

export function JockeyRosterManagement({
  registrations,
  jockeys,
  invitations,
  onInviteJockey,
  onCancelInvite,
  jockeysPagination,
  loadAllInvitations,
}: JockeyRosterManagementProps) {
  const [activeTab, setActiveTab] = useState<"invite" | "invitations">(
    "invite"
  );
  const [step, setStep] = useState<
    "select-horse" | "select-race" | "select-jockey"
  >("select-horse");
  const [selectedReg, setSelectedReg] = useState<TournamentRegistration | null>(
    null
  );
  const [selectedJockeyIds, setSelectedJockeyIds] = useState<number[]>([]);
  const [raceState, dispatchRace] = useReducer(
    (
      state: {
        loading: boolean;
        races: RaceItem[];
        selectedRace: RaceItem | null;
      },
      action:
        | { type: "LOADING" }
        | { type: "LOADED"; races: RaceItem[] }
        | { type: "ERROR" }
        | { type: "SELECT_RACE"; race: RaceItem | null }
    ) => {
      switch (action.type) {
        case "LOADING":
          return { loading: true, races: [], selectedRace: null };
        case "LOADED":
          return { loading: false, races: action.races, selectedRace: null };
        case "ERROR":
          return { loading: false, races: [], selectedRace: null };
        case "SELECT_RACE":
          return { ...state, selectedRace: action.race };
        default:
          return state;
      }
    },
    {
      loading: false,
      races: [] as RaceItem[],
      selectedRace: null as RaceItem | null,
    }
  );

  const [localJockeyPage, setLocalJockeyPage] = useState(
    jockeysPagination.page
  );
  const [localJockeysPagination, setLocalJockeysPagination] =
    useState(jockeysPagination);
  const [browsingJockeys, setBrowsingJockeys] = useState<Jockey[]>(jockeys);
  const [jockeyLoading, setJockeyLoading] = useState(false);

  const [inviteFilter, setInviteFilter] = useState<string>("all");

  const approved = registrations.filter(
    (r: TournamentRegistration) => r.status === "approved"
  );

  const pendingCount = invitations.filter((i) => i.status === "pending").length;

  useEffect(() => {
    if (!selectedReg) return;
    dispatchRace({ type: "LOADING" });
    TournamentService.getTournamentRaces(selectedReg.tournament.id)
      .then((res) => dispatchRace({ type: "LOADED", races: res.data ?? [] }))
      .catch(() => dispatchRace({ type: "ERROR" }));
  }, [selectedReg]);

  useEffect(() => {
    loadAllInvitations();
  }, [loadAllInvitations]);

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
    const race = raceState.selectedRace;

    await Promise.all(
      selectedJockeyIds.map((jockeyId) =>
        onInviteJockey(race.id, String(jockeyId), selectedReg.horse.id)
      )
    );

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
      "rounded border px-1.5 py-0.5 text-[8px] font-black uppercase",
      status === "confirmed" &&
        "border-emerald-200 bg-emerald-50 text-emerald-800",
      status === "accepted" && "border-blue-200 bg-blue-50 text-blue-800",
      status === "pending" && "border-amber-200 bg-amber-50 text-amber-800",
      status === "declined" && "border-rose-200 bg-rose-50 text-rose-800",
      status === "superseded" && "border-slate-200 bg-slate-50 text-slate-400"
    );

  const resetStep = () => {
    setSelectedReg(null);
    dispatchRace({ type: "SELECT_RACE", race: null });
    dispatchRace({ type: "LOADED", races: [] });
    setSelectedJockeyIds([]);
    setStep("select-horse");
  };

  return (
    <div className="mx-auto max-w-6xl border-slate-200 bg-slate-50 p-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#064E3B]">Jockey Roster</h2>
          <p className="mt-1 text-sm text-slate-500">
            Manage invites, races, and jockey assignments.
          </p>
        </div>
      </div>

      <div className="mb-6 inline-flex rounded-2xl bg-slate-100 p-1">
        <button
          onClick={() => {
            setActiveTab("invite");
            resetStep();
          }}
          className={cn(
            "rounded-xl px-4 py-2 text-sm font-bold transition-all",
            activeTab === "invite"
              ? "bg-white text-[#064E3B] shadow"
              : "text-slate-500 hover:text-slate-700"
          )}
        >
          Invite Jockey
        </button>

        <button
          onClick={() => setActiveTab("invitations")}
          className={cn(
            "rounded-xl px-4 py-2 text-sm font-bold transition-all",
            activeTab === "invitations"
              ? "bg-white text-[#064E3B] shadow"
              : "text-slate-500 hover:text-slate-700"
          )}
        >
          <div className="flex items-center gap-2">
            <span>Invitations</span>
            {pendingCount > 0 && (
              <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-amber-400 px-2 py-0.5 text-xs font-black text-amber-950">
                {pendingCount}
              </span>
            )}
          </div>
        </button>
      </div>

      {activeTab === "invite" && (
        <div className="space-y-6">
          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
            {step !== "select-horse" && (
              <button
                onClick={handleBack}
                className="text-sm font-bold text-slate-500 hover:text-slate-700"
              >
                ← Back
              </button>
            )}

            <div className="flex items-center gap-2 text-sm font-bold text-slate-400">
              <button
                onClick={() => {
                  setSelectedReg(null);
                  dispatchRace({ type: "SELECT_RACE", race: null });
                  dispatchRace({ type: "LOADED", races: [] });
                  setSelectedJockeyIds([]);
                  setStep("select-horse");
                }}
                className={cn(
                  "transition-all",
                  step === "select-horse"
                    ? "text-[#064E3B]"
                    : "text-slate-400 hover:text-slate-700"
                )}
                disabled={step === "select-horse"}
              >
                1. Horse
              </button>
              <span>/</span>
              <button
                onClick={() => {
                  if (!selectedReg) return;
                  dispatchRace({ type: "SELECT_RACE", race: null });
                  setStep("select-race");
                }}
                className={cn(
                  "transition-all",
                  !selectedReg && "cursor-not-allowed opacity-50",
                  step === "select-race"
                    ? "text-[#064E3B]"
                    : "text-slate-400 hover:text-slate-700"
                )}
                disabled={step === "select-race" || !selectedReg}
              >
                2. Race
              </button>
              <span>/</span>
              <button
                onClick={() => {
                  if (!selectedReg || !raceState.selectedRace) return;
                  setStep("select-jockey");
                }}
                className={cn(
                  "transition-all",
                  (!selectedReg || !raceState.selectedRace) &&
                    "cursor-not-allowed opacity-50",
                  step === "select-jockey"
                    ? "text-[#064E3B]"
                    : "text-slate-400 hover:text-slate-700"
                )}
                disabled={
                  step === "select-jockey" ||
                  !selectedReg ||
                  !raceState.selectedRace
                }
              >
                3. Jockey
              </button>
            </div>
          </div>

          {step === "select-horse" && (
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="mb-4 text-xs font-semibold text-slate-500">
                Select a registered horse to invite a jockey for
              </p>

              {approved.length === 0 ? (
                <p className="text-xs italic text-slate-400">
                  No approved registrations yet. Register a horse for a
                  tournament first.
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
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
                          "rounded-2xl border bg-slate-50 p-4 text-left transition-all",
                          hasConfirmed
                            ? "cursor-not-allowed opacity-50"
                            : "hover:border-[#064E3B] hover:bg-white hover:shadow-md"
                        )}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h4 className="truncate text-sm font-bold text-[#064E3B]">
                              {horse.name}
                            </h4>
                            <p className="mt-1 text-[10px] text-slate-400">
                              {tournament.name}
                            </p>
                          </div>

                          {hasConfirmed ? (
                            <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-[8px] font-black uppercase text-emerald-800">
                              Locked
                            </span>
                          ) : (
                            <span className="shrink-0 text-[10px] font-bold text-[#064E3B]">
                              Select →
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {step === "select-race" && (
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              {selectedReg && (
                <div className="mb-3 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
                  <span className="font-semibold text-slate-700">
                    {selectedReg.horse.name}
                  </span>{" "}
                  in{" "}
                  <span className="font-semibold text-slate-700">
                    {selectedReg.tournament.name}
                  </span>
                </div>
              )}

              <p className="mb-4 text-xs font-semibold text-slate-500">
                Select a race to invite a jockey for
              </p>

              {raceState.loading ? (
                <p className="text-xs text-slate-400">Loading races...</p>
              ) : raceState.races.length === 0 ? (
                <p className="text-xs italic text-slate-400">
                  No races available for this tournament.
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {raceState.races.map((race) => (
                    <button
                      key={race.id}
                      onClick={() => handleSelectRace(race)}
                      className="rounded-2xl border bg-slate-50 p-4 text-left transition-all hover:border-[#064E3B] hover:bg-white hover:shadow-md"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h4 className="truncate text-sm font-bold text-[#064E3B]">
                            {race.name}
                          </h4>
                          <p className="mt-1 text-[10px] text-slate-400">
                            {race.roundName} —{" "}
                            {new Date(race.scheduledAt).toLocaleString()}
                          </p>
                          <p className="mt-1 text-[9px] text-slate-400">
                            {race.distanceMeters}m · {race.trackCondition} ·{" "}
                            {race.venue}
                          </p>
                        </div>

                        <span className="shrink-0 text-[10px] font-bold text-[#064E3B]">
                          Select →
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </section>
          )}

          {step === "select-jockey" && (
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              {selectedReg && raceState.selectedRace && (
                <div className="mb-3 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
                  <span className="font-semibold text-slate-700">
                    {selectedReg.horse.name}
                  </span>{" "}
                  →{" "}
                  <span className="font-semibold text-slate-700">
                    {raceState.selectedRace.name}
                  </span>{" "}
                  —{" "}
                  <span className="font-semibold text-slate-700">
                    {selectedReg.tournament.name}
                  </span>
                </div>
              )}

              <p className="mb-4 text-xs font-semibold text-slate-500">
                Select jockeys to invite
              </p>

              {jockeyLoading ? (
                <p className="text-sm text-slate-400">Loading jockeys...</p>
              ) : browsingJockeys.length === 0 ? (
                <p className="text-sm italic text-slate-400">
                  No jockeys available.
                </p>
              ) : (
                <>
                  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                    {browsingJockeys.map((j) => (
                      <div
                        key={j.id}
                        onClick={() => toggleJockey(j.id)}
                        className={cn(
                          "flex cursor-pointer items-center justify-between px-4 py-3 transition-all hover:bg-slate-50",
                          selectedJockeyIds.includes(j.id) && "bg-emerald-50/60"
                        )}
                      >
                        <label className="flex cursor-pointer items-center gap-3">
                          <input
                            type="checkbox"
                            checked={selectedJockeyIds.includes(j.id)}
                            readOnly
                            className="accent-[#064E3B]"
                          />
                          <div>
                            <p className="text-sm font-bold text-slate-800">
                              {j.fullName}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              {j.club}
                            </p>
                          </div>
                        </label>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4">
                    <span className="text-[10px] text-slate-500">
                      {selectedJockeyIds.length} selected
                    </span>

                    <div className="flex gap-2">
                      <button
                        onClick={resetStep}
                        className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSendInvites}
                        disabled={selectedJockeyIds.length === 0}
                        className="rounded-xl bg-[#064E3B] px-4 py-2 text-xs font-bold text-white hover:bg-[#043E2F] disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Send Invites ({selectedJockeyIds.length})
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-[9px] text-slate-400">
                      Page {localJockeyPage} of{" "}
                      {localJockeysPagination.totalPages} (
                      {localJockeysPagination.total} jockeys)
                    </span>

                    <div className="flex gap-1">
                      <button
                        onClick={() =>
                          handleJockeyPageChange(localJockeyPage - 1)
                        }
                        disabled={localJockeyPage <= 1}
                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-[10px] font-bold text-slate-500 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        ← Prev
                      </button>
                      <button
                        onClick={() =>
                          handleJockeyPageChange(localJockeyPage + 1)
                        }
                        disabled={
                          localJockeyPage >= localJockeysPagination.totalPages
                        }
                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-[10px] font-bold text-slate-500 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        Next →
                      </button>
                    </div>
                  </div>
                </>
              )}
            </section>
          )}
        </div>
      )}

      {activeTab === "invitations" && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 inline-flex rounded-xl bg-slate-100 p-1">
            {["all", "pending", "accepted", "declined"].map((f) => (
              <button
                key={f}
                onClick={() => setInviteFilter(f)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-[10px] font-bold capitalize transition-all",
                  inviteFilter === f
                    ? "bg-white text-[#064E3B] shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                )}
              >
                {f}
              </button>
            ))}
          </div>

          {filteredInvitations.length === 0 ? (
            <p className="text-xs italic text-slate-400">
              No invitations found.
            </p>
          ) : (
            <div className="space-y-2">
              {filteredInvitations.map((inv) => (
                <div
                  key={inv.id}
                  className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-bold text-[#064E3B]">
                        {inv.horse.name}
                      </span>
                      <span className="text-[10px] text-slate-300">→</span>
                      <span className="truncate text-xs font-semibold text-slate-700">
                        {inv.jockey.fullName}
                      </span>
                    </div>

                    <div className="mt-1 flex items-center gap-2">
                      {inv.raceName && (
                        <>
                          <span className="text-[9px] font-medium text-slate-500">
                            {inv.raceName}
                          </span>
                          <span className="text-slate-200">·</span>
                        </>
                      )}
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

                  <div className="flex shrink-0 items-center gap-2">
                    <span className={statusBadgeClass(inv.status)}>
                      {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                    </span>

                    {inv.status === "pending" && (
                      <button
                        onClick={() => onCancelInvite(inv.id)}
                        className="text-[10px] font-bold text-rose-600 hover:text-rose-800"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
