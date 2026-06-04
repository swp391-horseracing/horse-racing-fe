import { useState } from "react";
import UserLayout from "../layouts/UserLayout";
import { ROUTES } from "../router/routes.tsx";
import { useOwnerData } from "../hooks/useOwnerData.ts";
import type {
  Horse,
  Tournament,
  TournamentRegistration,
  Jockey,
  Invitation,
} from "../hooks/useOwnerData.ts";
import { cn } from "../lib/utils";
import {
  Plus,
  Trash2,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  Trophy,
  AlertTriangle,
} from "lucide-react";

type ToastType = "success" | "error" | "warning" | "info";
type Toast = { id: number; message: string; type: ToastType };

export default function OwnerPage() {
  const [active, setActive] = useState<string>(ROUTES.OWNER_DASHBOARD);

  // Custom Hook for Owner Data & Actions
  const {
    horses,
    tournaments,
    registrations,
    jockeys,
    invitations,
    loading,
    addHorse,
    retireHorse,
    registerTournament,
    inviteJockeys,
    confirmPairing,
    cancelInvite,
  } = useOwnerData();

  // UI States
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [showAddHorse, setShowAddHorse] = useState(false);
  const [showRegisterTournament, setShowRegisterTournament] = useState(false);
  const [showInviteJockey, setShowInviteJockey] = useState(false);

  // Selection state
  const [selectedHorseId, setSelectedHorseId] = useState<number | null>(null);
  const [selectedTournamentId, setSelectedTournamentId] = useState<
    number | null
  >(null);

  // Helper function to trigger notification toasts
  const addToast = (message: string, type: ToastType = "success") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  // Helper to dynamically calculate horse age (BR-HORSE-07)
  const calculateAge = (dobString: string): number => {
    const birthDate = new Date(dobString);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  // Check if horse is locked in tournament commitments (BR-HORSE-06)
  const isHorseLocked = (horseId: number): boolean => {
    return registrations.some(
      (r) =>
        r.horseId === horseId &&
        ["Pending Approval", "Approved", "Waitlisted"].includes(r.status)
    );
  };

  // UC-HO-03: Register New Horse
  const handleAddHorse = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = data.get("name") as string;
    const breed = data.get("breed") as string;
    const dob = data.get("dob") as string;
    const gender = data.get("gender") as "Stallion" | "Mare" | "Gelding";
    const microchipId = data.get("microchipId") as string;
    const associationCode = data.get("associationCode") as string;

    if (
      horses.some(
        (h) =>
          h.name.toLowerCase() === name.toLowerCase() && h.status !== "Retired"
      )
    ) {
      addToast(
        "Duplicate Name: An active horse already shares this name.",
        "error"
      );
      return;
    }

    try {
      await addHorse({
        name,
        breed,
        dob,
        gender,
        microchipId,
        associationCode,
      });
      setShowAddHorse(false);
      addToast(`Horse "${name}" registered successfully!`, "success");
    } catch {
      addToast("Failed to save horse details.", "error");
    }
  };

  // UC-HO-03: Retire Horse (Soft Delete)
  const handleRetireHorse = async (id: number) => {
    if (isHorseLocked(id)) {
      addToast(
        "Action Blocked: Horse has active tournament commitments.",
        "warning"
      );
      return;
    }
    const success = await retireHorse(id);
    if (success) {
      addToast("Horse status set to Retired.", "info");
    } else {
      addToast("Failed to retire horse.", "error");
    }
  };

  // UC-HO-02: Register Horse for Tournament
  const handleRegisterTournament = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    if (!selectedHorseId || !selectedTournamentId) return;

    const horse = horses.find((h) => h.id === selectedHorseId);
    const tournament = tournaments.find((t) => t.id === selectedTournamentId);

    if (!horse || !tournament) return;

    if (horse.breed !== tournament.allowedBreed) {
      addToast(
        `Eligibility Failure: Requires breed "${tournament.allowedBreed}".`,
        "error"
      );
      return;
    }

    const age = calculateAge(horse.dob);
    if (age < tournament.minAge || age > tournament.maxAge) {
      addToast(
        `Eligibility Failure: Age must be ${tournament.minAge}-${tournament.maxAge} years.`,
        "error"
      );
      return;
    }

    const isFull = tournament.currentCount >= tournament.maxCapacity;
    const status: "Pending Approval" | "Waitlisted" = isFull
      ? "Waitlisted"
      : "Pending Approval";

    try {
      await registerTournament(selectedHorseId, selectedTournamentId, status);
      setShowRegisterTournament(false);
      addToast(
        isFull
          ? "Tournament full. Joined waitlist successfully."
          : "Registration submitted for Admin approval.",
        isFull ? "warning" : "success"
      );
    } catch {
      addToast("Failed to submit tournament registration.", "error");
    }
  };

  // UC-HO-04: Select / Invite Jockeys
  const handleInviteJockeys = async (
    jockeyIds: number[],
    tournamentId: number,
    horseId: number
  ) => {
    if (jockeyIds.length === 0) return;

    try {
      await inviteJockeys(jockeyIds, tournamentId, horseId);
      setShowInviteJockey(false);
      addToast(
        `Dispatched invitations to ${jockeyIds.length} Jockey(s).`,
        "success"
      );
    } catch {
      addToast("Failed to dispatch riding invitations.", "error");
    }
  };

  // UC-HO-05: Lock Pairing & Supersede others
  const handleConfirmPairing = async (invId: number) => {
    const success = await confirmPairing(invId);
    if (success) {
      addToast("Jockey-horse pairing confirmed & locked.", "success");
    } else {
      addToast("Failed to confirm jockey pairing.", "error");
    }
  };

  // UC-HO-05: Cancel Invitation
  const handleCancelInvite = async (invId: number) => {
    const success = await cancelInvite(invId);
    if (success) {
      addToast("Invitation cancelled.", "info");
    } else {
      addToast("Failed to cancel invitation.", "error");
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64 text-sm text-slate-400 font-body">
          <Clock className="w-5 h-5 animate-spin mr-2" /> Loading stable
          records...
        </div>
      );
    }

    switch (active) {
      case ROUTES.OWNER_DASHBOARD:
        return (
          <DashboardOverview
            horses={horses}
            tournaments={tournaments}
            registrations={registrations}
            invitations={invitations}
            jockeys={jockeys}
            setActiveTab={setActive}
          />
        );
      case "/owner/horseManagement":
        return (
          <HorseManagement
            horses={horses}
            isHorseLocked={isHorseLocked}
            onRetire={handleRetireHorse}
            onOpenAddModal={() => setShowAddHorse(true)}
          />
        );
      case "/owner/raceRegister":
        return (
          <RaceRegister
            horses={horses}
            tournaments={tournaments}
            registrations={registrations}
            onOpenRegisterModal={(horseId, tournamentId) => {
              setSelectedHorseId(horseId ?? null);
              setSelectedTournamentId(tournamentId ?? null);
              setShowRegisterTournament(true);
            }}
          />
        );
      case "/owner/jockeys":
        return (
          <JockeyRosterManagement
            horses={horses}
            registrations={registrations}
            tournaments={tournaments}
            jockeys={jockeys}
            invitations={invitations}
            onOpenInviteModal={(horseId, tournamentId) => {
              setSelectedHorseId(horseId);
              setSelectedTournamentId(tournamentId);
              setShowInviteJockey(true);
            }}
            onConfirmPairing={handleConfirmPairing}
            onCancelInvite={handleCancelInvite}
          />
        );
      case "/owner/schedule":
        return (
          <HorseScheduleView
            horses={horses}
            registrations={registrations}
            tournaments={tournaments}
          />
        );
      default:
        return null;
    }
  };

  return (
    <UserLayout activeKey={active} onActiveKeyChange={setActive}>
      <div className="h-full w-full relative flex flex-col overflow-hidden bg-[#F4F6F5]">
        {/* Simple Toast Alerts Container */}
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none font-body">
          {toasts.map((t) => (
            <div
              key={t.id}
              className={cn(
                "p-3 rounded-lg border shadow-lg backdrop-blur-md flex items-center gap-2 pointer-events-auto transform animate-in slide-in-from-top duration-200 text-xs font-semibold",
                t.type === "success" &&
                  "bg-emerald-50 border-emerald-200 text-emerald-950",
                t.type === "error" &&
                  "bg-rose-50 border-rose-200 text-rose-955",
                t.type === "warning" &&
                  "bg-amber-50 border-amber-200 text-amber-950",
                t.type === "info" &&
                  "bg-indigo-50 border-indigo-200 text-indigo-955"
              )}
            >
              {t.type === "success" && (
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              )}
              {t.type === "error" && (
                <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              {t.type === "warning" && (
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              )}
              {t.type === "info" && (
                <Activity className="w-4 h-4 text-indigo-600 shrink-0" />
              )}
              <span>{t.message}</span>
            </div>
          ))}
        </div>

        {/* Content Panel */}
        <div className="flex-1 overflow-y-auto min-h-0">{renderContent()}</div>

        {/* MODAL 1: Add Horse */}
        {showAddHorse && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-xl border border-slate-100 p-5 max-w-md w-full shadow-xl font-body">
              <div className="flex items-center justify-between border-b pb-2.5 mb-4">
                <h3 className="font-bold text-base text-[#064E3B]">
                  Add Horse to Roster
                </h3>
                <button
                  onClick={() => setShowAddHorse(false)}
                  className="text-slate-400 hover:text-slate-650 text-sm"
                >
                  ✕
                </button>
              </div>
              <form onSubmit={handleAddHorse} className="space-y-3.5">
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="col-span-2">
                    <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                      Horse Name
                    </label>
                    <input
                      required
                      name="name"
                      type="text"
                      className="w-full bg-slate-50 border rounded-md p-2 text-xs outline-hidden focus:border-[#064E3B]"
                      placeholder="Enter name"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                      Breed
                    </label>
                    <select
                      required
                      name="breed"
                      className="w-full bg-slate-50 border rounded-md p-2 text-xs outline-hidden focus:border-[#064E3B]"
                    >
                      <option value="Thoroughbred">Thoroughbred</option>
                      <option value="Arabian">Arabian</option>
                      <option value="Quarter Horse">Quarter Horse</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                      Gender
                    </label>
                    <select
                      required
                      name="gender"
                      className="w-full bg-slate-50 border rounded-md p-2 text-xs outline-hidden focus:border-[#064E3B]"
                    >
                      <option value="Stallion">Stallion</option>
                      <option value="Mare">Mare</option>
                      <option value="Gelding">Gelding</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                      Date of Birth
                    </label>
                    <input
                      required
                      name="dob"
                      type="date"
                      className="w-full bg-slate-50 border rounded-md p-2 text-xs outline-hidden focus:border-[#064E3B]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                      Microchip ID
                    </label>
                    <input
                      required
                      name="microchipId"
                      type="text"
                      pattern="\d{15}"
                      className="w-full bg-slate-50 border rounded-md p-2 text-xs outline-hidden focus:border-[#064E3B]"
                      placeholder="15 digits"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                      Breeding Association Code
                    </label>
                    <input
                      required
                      name="associationCode"
                      type="text"
                      className="w-full bg-slate-50 border rounded-md p-2 text-xs outline-hidden focus:border-[#064E3B]"
                      placeholder="e.g. TB-USA-884"
                    />
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-2 border-t">
                  <button
                    type="button"
                    onClick={() => setShowAddHorse(false)}
                    className="rounded-md border px-3 py-1.5 text-xs text-slate-550 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-md bg-[#064E3B] text-white px-3.5 py-1.5 text-xs font-bold hover:bg-[#043E2F]"
                  >
                    Save Horse
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 2: Register for Tournament */}
        {showRegisterTournament && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-xl border border-slate-100 p-5 max-w-sm w-full shadow-xl font-body">
              <div className="flex items-center justify-between border-b pb-2.5 mb-4">
                <h3 className="font-bold text-base text-[#064E3B]">
                  Tournament Registration
                </h3>
                <button
                  onClick={() => setShowRegisterTournament(false)}
                  className="text-slate-400 hover:text-slate-650 text-sm"
                >
                  ✕
                </button>
              </div>
              <form onSubmit={handleRegisterTournament} className="space-y-4">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                    Select Stable Entry
                  </label>
                  <select
                    value={selectedHorseId ?? ""}
                    onChange={(e) => setSelectedHorseId(Number(e.target.value))}
                    required
                    className="w-full bg-slate-50 border rounded-md p-2.5 text-xs outline-hidden"
                  >
                    <option value="" disabled>
                      -- Choose Horse --
                    </option>
                    {horses
                      .filter((h) => h.status === "Active")
                      .map((h) => (
                        <option key={h.id} value={h.id}>
                          {h.name} ({h.breed})
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                    Target Tournament
                  </label>
                  <select
                    value={selectedTournamentId ?? ""}
                    onChange={(e) =>
                      setSelectedTournamentId(Number(e.target.value))
                    }
                    required
                    className="w-full bg-slate-50 border rounded-md p-2.5 text-xs outline-hidden"
                  >
                    <option value="" disabled>
                      -- Choose Tournament --
                    </option>
                    {tournaments
                      .filter((t) => t.status === "Registration Open")
                      .map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name} ({t.allowedBreed} only)
                        </option>
                      ))}
                  </select>
                </div>

                <div className="flex gap-2 justify-end pt-2 border-t">
                  <button
                    type="button"
                    onClick={() => setShowRegisterTournament(false)}
                    className="rounded-md border px-3 py-1.5 text-xs text-slate-550 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-md bg-[#064E3B] text-white px-3.5 py-1.5 text-xs font-bold hover:bg-[#043E2F]"
                  >
                    Submit
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 3: Hire / Select Jockey */}
        {showInviteJockey && selectedHorseId && selectedTournamentId && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-xl border border-slate-100 p-5 max-w-md w-full shadow-xl font-body">
              <div className="flex items-center justify-between border-b pb-2.5 mb-3">
                <h3 className="font-bold text-base text-[#064E3B]">
                  Select Jockeys to Invite
                </h3>
                <button
                  onClick={() => setShowInviteJockey(false)}
                  className="text-slate-400 hover:text-slate-655 text-sm"
                >
                  ✕
                </button>
              </div>
              <JockeyInviteSelector
                jockeys={jockeys}
                onDispatch={(selectedIds) => {
                  handleInviteJockeys(
                    selectedIds,
                    selectedTournamentId,
                    selectedHorseId
                  );
                }}
              />
            </div>
          </div>
        )}
      </div>
    </UserLayout>
  );
}

// ─── Component 1: DashboardOverview ──────────────────────────────────────────

function DashboardOverview({
  horses,
  tournaments,
  registrations,
  invitations,
  jockeys,
  setActiveTab,
}: {
  horses: Horse[];
  tournaments: Tournament[];
  registrations: TournamentRegistration[];
  invitations: Invitation[];
  jockeys: Jockey[];
  setActiveTab: (tab: string) => void;
}) {
  const activeHorsesCount = horses.filter((h) => h.status === "Active").length;
  const pendingRegCount = registrations.filter(
    (r) => r.status === "Pending Approval"
  ).length;
  const pendingInvCount = invitations.filter(
    (i) => i.status === "Pending"
  ).length;

  return (
    <div className="p-5 space-y-5 max-w-6xl mx-auto font-body">
      <div>
        <h2 className="text-xl font-black text-[#064E3B] tracking-tight">
          Owner Dashboard
        </h2>
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
            val: `${tournaments.filter((t) => t.status === "Registration Open").length} Active`,
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
        <div className="bg-white border rounded-xl p-4 lg:col-span-2 shadow-xs space-y-3">
          <div className="border-b pb-2 flex justify-between items-center">
            <h3 className="font-bold text-sm text-[#064E3B]">
              Stable Roster Overview
            </h3>
            <button
              onClick={() => setActiveTab("/owner/horseManagement")}
              className="text-[10px] font-bold text-indigo-600 hover:underline"
            >
              Manage Stables
            </button>
          </div>
          <div className="divide-y text-xs">
            {horses
              .filter((h) => h.status !== "Retired")
              .map((horse) => (
                <div
                  key={horse.id}
                  className="py-2.5 flex items-center justify-between"
                >
                  <div>
                    <p className="font-bold text-slate-850">{horse.name}</p>
                    <p className="text-slate-400 text-[10px]">
                      {horse.breed} • {horse.gender}
                    </p>
                  </div>
                  <span className="bg-emerald-50 text-emerald-850 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded border border-emerald-150">
                    {horse.status}
                  </span>
                </div>
              ))}
          </div>
        </div>

        <div className="bg-white border rounded-xl p-4 shadow-xs space-y-3">
          <div className="border-b pb-2">
            <h3 className="font-bold text-sm text-[#064E3B] flex items-center gap-1">
              <Trophy className="w-4 h-4 text-amber-500" />
              Elite Jockeys
            </h3>
          </div>
          <div className="space-y-2">
            {jockeys.slice(0, 3).map((j) => (
              <div
                key={j.id}
                className="p-2.5 bg-slate-50/50 rounded-lg flex items-center justify-between text-xs border border-slate-100"
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
    </div>
  );
}

// ─── Component 2: HorseManagement ────────────────────────────────────────────

function HorseManagement({
  horses,
  isHorseLocked,
  onRetire,
  onOpenAddModal,
}: {
  horses: Horse[];
  isHorseLocked: (id: number) => boolean;
  onRetire: (id: number) => void;
  onOpenAddModal: () => void;
}) {
  return (
    <div className="p-5 space-y-5 max-w-6xl mx-auto font-body">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h2 className="text-xl font-black text-[#064E3B] tracking-tight">
            Horse Registry
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Manage your stable profiles, view horse details, and retire active horses.
          </p>
        </div>
        <button
          onClick={onOpenAddModal}
          className="flex items-center gap-1 rounded-lg bg-[#064E3B] text-white px-3.5 py-2 text-xs font-bold shadow-xs hover:bg-[#043E2F] transition"
        >
          <Plus className="w-3.5 h-3.5" /> Add Horse
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {horses
          .filter((h) => h.status !== "Retired")
          .map((horse) => {
            const locked = isHorseLocked(horse.id);

            return (
              <div
                key={horse.id}
                className="bg-white border rounded-xl p-4.5 shadow-xs flex flex-col justify-between hover:shadow-md transition"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-bold text-sm text-[#064E3B] truncate">
                      {horse.name}
                    </h3>
                    <span
                      className={cn(
                        "text-[8px] font-black uppercase px-2 py-0.5 rounded-full border shrink-0",
                        locked
                          ? "bg-amber-50 border-amber-200 text-amber-800"
                          : "bg-emerald-50 border-emerald-200 text-emerald-800"
                      )}
                    >
                      {locked ? "Locked" : "Active"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[10px] pb-1">
                    <div>
                      <span className="text-slate-400 block font-semibold uppercase text-[8px]">
                        Breed
                      </span>
                      <span className="font-bold text-slate-700">
                        {horse.breed}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-semibold uppercase text-[8px]">
                        Gender
                      </span>
                      <span className="font-bold text-slate-700">
                        {horse.gender}
                      </span>
                    </div>
                    <div className="col-span-2 mt-1">
                      <span className="text-slate-400 block font-semibold uppercase text-[8px]">
                        Microchip ID
                      </span>
                      <span className="font-bold text-slate-755 font-label">
                        {horse.microchipId}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-3.5 border-t mt-4 text-xs justify-end">
                  <button
                    onClick={() => onRetire(horse.id)}
                    disabled={locked}
                    className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 hover:border-rose-250 text-slate-500 hover:text-rose-650 py-2 transition disabled:opacity-40 disabled:hover:border-slate-200 disabled:hover:text-slate-500"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Retire Horse</span>
                  </button>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}

// ─── Component 2.5: RaceRegister ─────────────────────────────────────────────

function RaceRegister({
  horses,
  tournaments,
  registrations,
  onOpenRegisterModal,
}: {
  horses: Horse[];
  tournaments: Tournament[];
  registrations: TournamentRegistration[];
  onOpenRegisterModal: (horseId?: number | null, tournamentId?: number | null) => void;
}) {
  const openTournaments = tournaments.filter((t) => t.status === "Registration Open");

  return (
    <div className="p-5 space-y-5 max-w-6xl mx-auto font-body">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h2 className="text-xl font-black text-[#064E3B] tracking-tight">
            Race & Tournament Registration
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Register your active horses for upcoming events and monitor application statuses.
          </p>
        </div>
        <button
          onClick={() => onOpenRegisterModal(null, null)}
          className="flex items-center gap-1.5 rounded-lg bg-[#064E3B] text-white px-3.5 py-2 text-xs font-bold shadow-xs hover:bg-[#043E2F] transition"
        >
          <Plus className="w-3.5 h-3.5" /> Register Entry
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Open Events */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-bold text-sm text-[#064E3B]">Upcoming Tournaments</h3>
          {openTournaments.length === 0 ? (
            <div className="bg-white border rounded-xl p-8 text-center text-slate-400">
              <Trophy className="w-7 h-7 mx-auto mb-2 text-slate-300" />
              <p className="text-xs font-semibold">No tournaments currently open for registration.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {openTournaments.map((t) => (
                <div key={t.id} className="bg-white border rounded-xl p-4 shadow-xs flex flex-col justify-between hover:shadow-md transition">
                  <div className="space-y-3.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex gap-2 items-center">
                        <div className="p-1.5 bg-emerald-50 text-[#064E3B] rounded-lg border border-emerald-100">
                          <Trophy className="w-4 h-4" />
                        </div>
                        <h4 className="font-bold text-xs text-slate-800 line-clamp-1">
                          {t.name}
                        </h4>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[10px] bg-slate-50/50 p-2 rounded-lg border border-slate-100">
                      <div>
                        <span className="text-slate-400 block font-semibold uppercase text-[8px]">
                          Allowed Breed
                        </span>
                        <span className="font-bold text-slate-700">
                          {t.allowedBreed}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-semibold uppercase text-[8px]">
                          Age Requirement
                        </span>
                        <span className="font-bold text-slate-700">
                          {t.minAge} - {t.maxAge} years
                        </span>
                      </div>
                      <div className="col-span-2 mt-1 border-t pt-1 border-slate-100 flex justify-between items-center text-[9px]">
                        <span className="text-slate-400 font-semibold uppercase text-[8px]">
                          Capacity Slots
                        </span>
                        <span className="font-bold text-[#064E3B]">
                          {t.currentCount} / {t.maxCapacity} Registered
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3.5 border-t">
                    <button
                      onClick={() => onOpenRegisterModal(null, t.id)}
                      className="w-full rounded-lg bg-[#064E3B] text-white py-2 text-xs font-bold hover:bg-[#043E2F] transition text-center shadow-xs"
                    >
                      Register for Race
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Applications */}
        <div className="space-y-4">
          <h3 className="font-bold text-sm text-[#064E3B]">Your Applications</h3>
          {registrations.length === 0 ? (
            <div className="bg-white border rounded-xl p-8 text-center text-slate-400">
              <Activity className="w-7 h-7 mx-auto mb-2 text-slate-300" />
              <p className="text-xs font-semibold">No tournament registration submissions.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {[...registrations].reverse().map((reg) => {
                const horse = horses.find((h) => h.id === reg.horseId);
                const tour = tournaments.find((t) => t.id === reg.tournamentId);
                return (
                  <div key={reg.id} className="p-3.5 bg-white border rounded-xl shadow-xs space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-xs text-slate-800">{horse?.name ?? "Unknown Horse"}</h4>
                        <p className="text-[10px] text-slate-400 truncate max-w-[150px]">{tour?.name ?? "Unknown Event"}</p>
                      </div>
                      <span
                        className={cn(
                          "text-[8px] font-black uppercase px-2 py-0.5 rounded border",
                          reg.status === "Approved" && "bg-emerald-50 border-emerald-200 text-emerald-800",
                          reg.status === "Pending Approval" && "bg-amber-50 border-amber-200 text-amber-800",
                          reg.status === "Waitlisted" && "bg-indigo-50 border-indigo-200 text-indigo-800",
                          reg.status === "Withdrawn" && "bg-slate-100 border-slate-200 text-slate-500"
                        )}
                      >
                        {reg.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Component 3: JockeyRosterManagement ─────────────────────────────────────

function JockeyRosterManagement({
  horses,
  registrations,
  tournaments,
  jockeys,
  invitations,
  onOpenInviteModal,
  onConfirmPairing,
  onCancelInvite,
}: {
  horses: Horse[];
  registrations: TournamentRegistration[];
  tournaments: Tournament[];
  jockeys: Jockey[];
  invitations: Invitation[];
  onOpenInviteModal: (horseId: number, tournamentId: number) => void;
  onConfirmPairing: (invId: number) => void;
  onCancelInvite: (invId: number) => void;
}) {
  const approvedRegistrations = registrations.filter(
    (r) => r.status === "Approved"
  );

  return (
    <div className="p-5 space-y-5 max-w-6xl mx-auto font-body">
      <div className="border-b pb-4">
        <h2 className="text-xl font-black text-[#064E3B] tracking-tight">
          Jockey Roster
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Hire jockeys for approved tournament runs and finalize pairings.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-bold text-sm text-[#064E3B]">Approved Entries</h3>
          {approvedRegistrations.length === 0 ? (
            <div className="bg-white border rounded-xl p-8 text-center text-slate-400">
              <Clock className="w-7 h-7 mx-auto mb-2 text-slate-355" />
              <p className="text-xs font-semibold">
                No approved horse entries.
              </p>
            </div>
          ) : (
            approvedRegistrations.map((reg) => {
              const horse = horses.find((h) => h.id === reg.horseId);
              const tournament = tournaments.find(
                (t) => t.id === reg.tournamentId
              );
              const matchingInvites = invitations.filter(
                (i) =>
                  i.horseId === reg.horseId &&
                  i.tournamentId === reg.tournamentId
              );
              const lockedJockey = matchingInvites.find(
                (i) => i.status === "Accepted"
              );

              if (!horse || !tournament) return null;

              return (
                <div
                  key={reg.id}
                  className="bg-white border rounded-xl p-4 shadow-xs space-y-3.5"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-[#064E3B]">
                        {horse.name}
                      </h4>
                      <p className="text-[10px] text-slate-450">
                        {tournament.name}
                      </p>
                    </div>
                    {lockedJockey ? (
                      <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[8px] font-black uppercase px-2 py-0.5 rounded">
                        Pairing Locked
                      </span>
                    ) : (
                      <button
                        onClick={() =>
                          onOpenInviteModal(horse.id, tournament.id)
                        }
                        className="rounded-lg bg-[#064E3B] text-white px-2.5 py-1.5 text-[10px] font-bold hover:bg-[#043E2F] transition shadow-xs"
                      >
                        Hire Jockey
                      </button>
                    )}
                  </div>

                  <div className="space-y-1.5 pt-2 border-t text-xs">
                    <span className="text-[9px] font-extrabold uppercase text-slate-400 tracking-wider block">
                      Sent Invitations
                    </span>
                    {matchingInvites.length === 0 ? (
                      <p className="text-[10px] text-slate-400 italic">
                        No invitations sent yet.
                      </p>
                    ) : (
                      matchingInvites.map((inv) => {
                        const jockey = jockeys.find(
                          (j) => j.id === inv.jockeyId
                        );
                        return (
                          <div
                            key={inv.id}
                            className="p-2 bg-slate-50 border rounded-lg flex items-center justify-between"
                          >
                            <div>
                              <p className="font-bold text-slate-700 text-xs">
                                {jockey?.name}
                              </p>
                              <span className="text-[9px] text-slate-400">
                                Club: {jockey?.club}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span
                                className={cn(
                                  "text-[8px] font-black uppercase px-1.5 py-0.5 rounded border",
                                  inv.status === "Accepted" &&
                                    "bg-emerald-50 border-emerald-200 text-emerald-800",
                                  inv.status === "Pending" &&
                                    "bg-amber-50 border-amber-200 text-amber-800",
                                  inv.status === "Declined" &&
                                    "bg-rose-50 border-rose-200 text-rose-800",
                                  inv.status === "Superseded" &&
                                    "bg-slate-100 border-slate-200 text-slate-450"
                                )}
                              >
                                {inv.status}
                              </span>

                              {inv.status === "Accepted" && !lockedJockey && (
                                <button
                                  onClick={() => onConfirmPairing(inv.id)}
                                  className="rounded bg-emerald-600 hover:bg-emerald-700 text-white px-2 py-0.5 text-[9px] font-extrabold"
                                >
                                  Lock Pairing
                                </button>
                              )}

                              {inv.status === "Pending" && (
                                <button
                                  onClick={() => onCancelInvite(inv.id)}
                                  className="text-rose-600 hover:text-rose-850 text-[10px] font-bold"
                                >
                                  Cancel
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="bg-white border rounded-xl p-4 shadow-xs h-fit space-y-3">
          <h3 className="font-bold text-sm text-[#064E3B] border-b pb-2">
            Bidding & Rules
          </h3>
          <ul className="space-y-2.5 text-[11px] text-slate-550 leading-relaxed list-disc list-inside">
            <li>
              <strong>Multiple Bids:</strong> Invite multiple Jockeys for the
              same horse.
            </li>
            <li>
              <strong>Cascade Supersede:</strong> Locking a Jockey cancels all
              other invites.
            </li>
            <li>
              <strong>Expiry:</strong> Invites expire in 48 hours automatically.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// ─── Component 4: JockeyInviteSelector ───────────────────────────────────────

function JockeyInviteSelector({
  jockeys,
  onDispatch,
}: {
  jockeys: Jockey[];
  onDispatch: (selectedIds: number[]) => void;
}) {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const toggleSelection = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-3">
      <div className="max-h-56 overflow-y-auto divide-y pr-1">
        {jockeys.map((j) => {
          const isSelected = selectedIds.includes(j.id);
          return (
            <div
              key={j.id}
              onClick={() => toggleSelection(j.id)}
              className={cn(
                "p-2 flex items-center justify-between cursor-pointer rounded-lg my-1 border text-xs transition-all",
                isSelected
                  ? "bg-emerald-50/50 border-[#064E3B]"
                  : "bg-white border-transparent hover:bg-slate-50"
              )}
            >
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => {}}
                  className="rounded text-[#064E3B] focus:ring-[#064E3B]"
                />
                <div>
                  <p className="font-bold text-slate-850">{j.name}</p>
                  <p className="text-[10px] text-slate-400">{j.club}</p>
                </div>
              </div>
              <div className="text-right text-[11px]">
                <span className="font-bold text-[#064E3B] block">
                  {j.winRate} WR
                </span>
                <span className="text-[9px] text-slate-450 block">
                  {j.totalRuns} Matches
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-t pt-3 flex items-center justify-between">
        <span className="text-[10px] text-slate-550 font-semibold">
          {selectedIds.length} Selected
        </span>
        <button
          onClick={() => onDispatch(selectedIds)}
          disabled={selectedIds.length === 0}
          className="rounded-md bg-[#064E3B] text-white px-3.5 py-1.5 text-xs font-semibold shadow-xs hover:bg-[#043E2F] disabled:opacity-40"
        >
          Send Invite(s)
        </button>
      </div>
    </div>
  );
}

// ─── Component 5: HorseScheduleView ──────────────────────────────────────────

function HorseScheduleView({
  horses,
  registrations,
  tournaments,
}: {
  horses: Horse[];
  registrations: TournamentRegistration[];
  tournaments: Tournament[];
}) {
  const confirmedRegs = registrations.filter((r) => r.status === "Approved");
  const pendingRegs = registrations.filter((r) =>
    ["Pending Approval", "Waitlisted"].includes(r.status)
  );

  return (
    <div className="p-5 space-y-5 max-w-6xl mx-auto font-body">
      <div className="border-b pb-4">
        <h2 className="text-xl font-black text-[#064E3B] tracking-tight">
          Run Schedule
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Review approved and pending race registrations.
        </p>
      </div>

      <div className="space-y-5">
        <div className="space-y-2.5">
          <h3 className="font-bold text-sm text-[#064E3B] flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            Scheduled Matches
          </h3>
          {confirmedRegs.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No scheduled runs.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {confirmedRegs.map((reg) => {
                const horse = horses.find((h) => h.id === reg.horseId);
                const tour = tournaments.find((t) => t.id === reg.tournamentId);
                return (
                  <div
                    key={reg.id}
                    className="p-3 bg-white border border-emerald-200 rounded-lg flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-bold text-[#064E3B]">{horse?.name}</p>
                      <p className="text-[10px] text-slate-450">{tour?.name}</p>
                    </div>
                    <span className="bg-emerald-50 text-emerald-800 text-[8px] font-black uppercase px-2 py-0.5 rounded border border-emerald-150">
                      Confirmed
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="space-y-2.5 pt-3 border-t">
          <h3 className="font-bold text-sm text-slate-700 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-amber-500" />
            Pending Applications
          </h3>
          {pendingRegs.length === 0 ? (
            <p className="text-xs text-slate-400 italic">
              No pending applications.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {pendingRegs.map((reg) => {
                const horse = horses.find((h) => h.id === reg.horseId);
                const tour = tournaments.find((t) => t.id === reg.tournamentId);
                return (
                  <div
                    key={reg.id}
                    className="p-3 bg-[#F4F6F5]/40 border rounded-lg flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-bold text-slate-700">{horse?.name}</p>
                      <p className="text-[10px] text-slate-450">{tour?.name}</p>
                    </div>
                    <span
                      className={cn(
                        "text-[8px] font-black uppercase px-2 py-0.5 rounded border",
                        reg.status === "Waitlisted"
                          ? "bg-indigo-50 border-indigo-200 text-indigo-800"
                          : "bg-amber-50 border-amber-200 text-amber-800"
                      )}
                    >
                      {reg.status}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
