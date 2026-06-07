import { useState, useMemo, useCallback } from "react";
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
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  MapPin,
  Zap,
  ArrowUpRight,
  ArrowRight,
  CalendarDays,
  Flag,
  Users,
  Syringe,
} from "lucide-react";

// Import Abstracted Components
import { ScheduleLayout } from "../components/schedule/ScheduleLayout";
import { ScheduleCalendar } from "../components/schedule/ScheduleCalendar";
import { ScheduleStatCard } from "../components/schedule/ScheduleStatCard";
import {
  ScheduleDetailFrame,
  type TabConfig,
} from "../components/schedule/ScheduleDetailFrame";

type ToastType = "success" | "error" | "warning" | "info";
type Toast = { id: number; message: string; type: ToastType };

const officialsMock = [
  { initials: "AJ", name: "Arthur Jones", title: "Chief Steward" },
  { initials: "SB", name: "Sarah Baxter", title: "Starter" },
  { initials: "MT", name: "Mark Thompson", title: "Judge" },
];

export default function OwnerPage() {
  const [active, setActive] = useState<string>(ROUTES.OWNER_DASHBOARD);
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

  const [toasts, setToasts] = useState<Toast[]>([]);
  const [showAddHorse, setShowAddHorse] = useState(false);
  const [showRegisterTournament, setShowRegisterTournament] = useState(false);
  const [showInviteJockey, setShowInviteJockey] = useState(false);

  const [selectedHorseId, setSelectedHorseId] = useState<number | null>(null);
  const [selectedTournamentId, setSelectedTournamentId] = useState<
    number | null
  >(null);

  const addToast = (message: string, type: ToastType = "success") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

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

  const isHorseLocked = (horseId: number): boolean => {
    return registrations.some(
      (r) =>
        r.horseId === horseId &&
        ["Pending Approval", "Approved", "Waitlisted"].includes(r.status)
    );
  };

  const handleAddHorse = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = data.get("name") as string;
    const breed = data.get("breed") as string;
    const dob = data.get("dob") as string;
    const gender = data.get("gender") as "Stallion" | "Mare" | "Gelding";
    const associationCode = data.get("associationCode") as string;

    const microchipId = Math.floor(
      100000000000000 + Math.random() * 900000000000000
    ).toString();

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

  const handleConfirmPairing = async (invId: number) => {
    const success = await confirmPairing(invId);
    if (success) {
      addToast("Jockey-horse pairing confirmed & locked.", "success");
    } else {
      addToast("Failed to confirm jockey pairing.", "error");
    }
  };

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
            jockeys={jockeys}
            invitations={invitations}
            onOpenInviteModal={(horseId, tournamentId) => {
              setSelectedHorseId(horseId);
              setSelectedTournamentId(tournamentId);
              setShowInviteJockey(true);
            }}
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
                  "bg-emerald-50 border-emerald-200 text-emerald-955",
                t.type === "error" &&
                  "bg-rose-50 border-rose-200 text-rose-955",
                t.type === "warning" &&
                  "bg-amber-50 border-amber-200 text-amber-955",
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
                  className="text-slate-400 hover:text-slate-655 text-sm"
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
                    className="rounded-md border px-3 py-1.5 text-xs text-slate-555 hover:bg-slate-50"
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
                  className="text-slate-400 hover:text-slate-655 text-sm"
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
                    className="rounded-md border px-3 py-1.5 text-xs text-slate-555 hover:bg-slate-50"
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
        <p className="text-xs text-slate-550 mt-1">
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
              <Trophy className="w-4 h-4 text-amber-500" /> Elite Jockeys
            </h3>
          </div>
          <div className="space-y-2">
            {jockeys.slice(0, 3).map((j) => (
              <div
                key={j.id}
                className="p-2.5 bg-slate-50/50 rounded-lg flex items-center justify-between text-xs border border-slate-100"
              >
                <div>
                  <p className="font-bold text-slate-850">{j.name}</p>
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
          <p className="text-xs text-slate-555 mt-1">
            Manage your stable profiles, view horse details, and retire active
            horses.
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
                  <div className="flex items-start justify-between gap-2">
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
                  </div>
                </div>

                <div className="flex gap-2 pt-3.5 border-t mt-4 text-xs justify-end">
                  <button
                    onClick={() => onRetire(horse.id)}
                    disabled={locked}
                    className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 hover:border-rose-250 text-slate-500 hover:text-rose-655 py-2 transition disabled:opacity-40 disabled:hover:border-slate-200 disabled:hover:text-slate-500"
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

type TournamentFilter =
  | "All"
  | "Live now"
  | "Registration open"
  | "Upcoming"
  | "Completed";

const STATUS_FILTER_MAP: Record<TournamentFilter, Tournament["status"][]> = {
  All: [
    "Registration Open",
    "Registration Closed",
    "Scheduled",
    "Live",
    "Concluded",
  ],
  "Live now": ["Live"],
  "Registration open": ["Registration Open"],
  Upcoming: ["Scheduled", "Registration Closed"],
  Completed: ["Concluded"],
};

function RaceRegister({
  horses,
  tournaments,
  registrations,
  onOpenRegisterModal,
}: {
  horses: Horse[];
  tournaments: Tournament[];
  registrations: TournamentRegistration[];
  onOpenRegisterModal: (
    horseId?: number | null,
    tournamentId?: number | null
  ) => void;
}) {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<TournamentFilter>("All");

  const FILTER_TABS: TournamentFilter[] = [
    "All",
    "Live now",
    "Registration open",
    "Upcoming",
    "Completed",
  ];

  const filteredTournaments = tournaments.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.allowedBreed.toLowerCase().includes(search.toLowerCase());
    const allowedStatuses = STATUS_FILTER_MAP[activeFilter];
    const matchesFilter = allowedStatuses.includes(t.status);
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status: Tournament["status"]) => {
    switch (status) {
      case "Live":
        return (
          <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-blue-600 text-white shadow-sm">
            Live now
          </span>
        );
      case "Registration Open":
        return (
          <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-600 text-white shadow-sm">
            Registration open
          </span>
        );
      case "Scheduled":
      case "Registration Closed":
        return (
          <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
            Upcoming
          </span>
        );
      case "Concluded":
        return (
          <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
            Completed
          </span>
        );
      default:
        return null;
    }
  };

  const getTopRightLabel = (t: Tournament) => {
    if (t.status === "Live")
      return (
        <span className="text-[12px] text-slate-505 font-medium">
          Round 1 of 3
        </span>
      );
    if (t.status === "Registration Open") {
      return (
        <span className="flex items-center gap-1 text-[12px] text-amber-600 font-bold">
          <Clock className="w-3.5 h-3.5" /> 6 days left
        </span>
      );
    }
    if (t.status === "Scheduled" || t.status === "Registration Closed") {
      return (
        <span className="text-[12px] text-slate-505 font-medium">
          Reg. opens in 14d
        </span>
      );
    }
    return (
      <span className="text-[12px] text-slate-555 font-medium">Dec 2025</span>
    );
  };

  const renderCardAction = (t: Tournament) => {
    const myReg = registrations.find((r) => r.tournamentId === t.id);
    const horse = myReg ? horses.find((h) => h.id === myReg.horseId) : null;

    if (t.status === "Live") {
      return (
        <div className="bg-[#064E3B]/5 border border-[#064E3B]/10 rounded-xl p-3.5 flex items-center justify-between">
          {horse ? (
            <span className="text-[12px] text-[#064E3B] font-bold flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-[#064E3B]" /> {horse.name} · Race 3
              at 14:30 today
            </span>
          ) : (
            <span className="text-[12px] text-slate-505 font-medium">
              No active stable entries
            </span>
          )}
          <button className="flex items-center gap-1 text-[13px] font-bold text-[#064E3B] hover:text-[#043E2F] transition">
            View <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      );
    }
    if (t.status === "Registration Open") {
      return (
        <button
          onClick={() => onOpenRegisterModal(null, t.id)}
          className="w-full rounded-xl border border-slate-200 bg-white text-slate-800 py-3 text-[13px] font-bold hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center gap-1.5 shadow-sm"
        >
          Register horse <ArrowUpRight className="w-4 h-4" />
        </button>
      );
    }
    if (t.status === "Scheduled" || t.status === "Registration Closed") {
      return (
        <button className="w-full rounded-xl border border-slate-200 bg-white text-slate-800 py-3 text-[13px] font-bold hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center gap-1.5 shadow-sm">
          View details
        </button>
      );
    }
    if (t.status === "Concluded") {
      return (
        <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 flex items-center justify-between">
          <span className="text-[12px] text-slate-600 font-medium">
            {horse
              ? `${horse.name} — 1st place · $12,000 earned`
              : "Tournament concluded"}
          </span>
          <button className="flex items-center gap-1 text-[13px] font-bold text-slate-850 hover:text-black transition">
            Results <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-5 space-y-5 max-w-6xl mx-auto font-body">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h2 className="text-xl font-black text-[#064E3B] tracking-tight">
            Race & Tournament Registration
          </h2>
          <p className="text-xs text-slate-555 mt-1">
            Register your active horses for upcoming events and monitor
            application statuses.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            type="text"
            placeholder="Search tournaments..."
            className="w-full pl-9 pr-4 py-2.5 text-[13px] bg-white border border-slate-200 rounded-xl outline-none focus:border-[#064E3B] transition shadow-xs"
          />
        </div>
        <button className="flex items-center gap-1.5 px-4 py-2.5 text-[13px] font-bold bg-white border border-slate-200 rounded-xl hover:border-[#064E3B]/40 transition shadow-xs text-slate-700">
          <SlidersHorizontal className="w-4 h-4" /> Filter
        </button>
        <button className="flex items-center gap-1.5 px-4 py-2.5 text-[13px] font-bold bg-white border border-slate-200 rounded-xl hover:border-[#064E3B]/40 transition shadow-xs text-slate-700">
          <ArrowUpDown className="w-4 h-4" /> Sort
        </button>
      </div>

      <div className="flex items-center gap-2 flex-wrap mt-2">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveFilter(tab)}
            className={cn(
              "px-4 py-1.5 rounded-full text-[13px] font-bold transition border",
              activeFilter === tab
                ? "bg-slate-800 text-white border-slate-800"
                : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:text-slate-800"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      <p className="text-[13px] text-slate-500 font-medium mt-4">
        {filteredTournaments.length} tournament
        {filteredTournaments.length !== 1 ? "s" : ""}
      </p>

      {filteredTournaments.length === 0 ? (
        <div className="bg-white border rounded-2xl p-12 text-center text-slate-400 border-dashed">
          <Trophy className="w-8 h-8 mx-auto mb-3 text-slate-300" />
          <p className="text-sm font-semibold text-slate-500">
            No tournaments found
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Try adjusting your search or filter
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTournaments.map((t) => {
            const fillPct = Math.round((t.currentCount / t.maxCapacity) * 100);
            const slotsLeft = t.maxCapacity - t.currentCount;
            const isOpen = t.status === "Registration Open";
            const isConcluded = t.status === "Concluded";

            return (
              <div
                key={t.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-4">
                  {getStatusBadge(t.status)}
                  {getTopRightLabel(t)}
                </div>

                <div className="mb-4">
                  <h3 className="font-black text-[17px] tracking-tight text-[#064E3B] mb-2 leading-tight">
                    {t.name}
                  </h3>
                  <div className="flex items-center gap-1.5 text-[13px] text-slate-505">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span>Ho Chi Minh City, VN</span>
                    <span className="mx-1.5">·</span>
                    <span>15–30 Jun 2026</span>
                  </div>
                </div>

                {isOpen && (
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[12px] text-slate-505 font-medium">
                        {t.currentCount} / {t.maxCapacity} horses registered
                      </span>
                      <span className="text-[12px] font-bold text-emerald-600">
                        {slotsLeft} slots left
                      </span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-emerald-500 transition-all"
                        style={{ width: `${fillPct}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="border-t border-slate-100 mt-4 mb-4" />

                <div className="grid grid-cols-2 gap-4 mb-5">
                  {[
                    { label: "Races", value: isOpen ? "8" : "12" },
                    {
                      label: isOpen
                        ? "Rounds"
                        : isConcluded
                          ? "Horses"
                          : "Max horses",
                      value: isOpen
                        ? "3"
                        : isConcluded
                          ? `${t.currentCount}`
                          : `${t.maxCapacity}`,
                    },
                  ].map((stat) => (
                    <div key={stat.label}>
                      <span className="block text-[11px] font-medium text-slate-505 mb-1">
                        {stat.label}
                      </span>
                      <span className="block text-[15px] font-black text-slate-800">
                        {stat.value}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-auto">{renderCardAction(t)}</div>
              </div>
            );
          })}
        </div>
      )}
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
        <p className="text-xs text-slate-555 mt-1">
          Hire jockeys for approved tournament runs and finalize pairings.
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="font-bold text-sm text-[#064E3B]">Approved Entries</h3>
        {approvedRegistrations.length === 0 ? (
          <div className="bg-white border rounded-xl p-8 text-center text-slate-400">
            <Clock className="w-7 h-7 mx-auto mb-2 text-slate-355" />
            <p className="text-xs font-semibold">No approved horse entries.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {approvedRegistrations.map((reg) => {
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
                  className="bg-white border rounded-xl p-4 shadow-xs space-y-3.5 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-sm text-[#064E3B]">
                          {horse.name}
                        </h4>
                        <p className="text-[10px] text-slate-455 leading-tight mt-0.5">
                          {tournament.name}
                        </p>
                      </div>
                      {lockedJockey ? (
                        <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[8px] font-black uppercase px-2 py-0.5 rounded shrink-0">
                          Pairing Locked
                        </span>
                      ) : (
                        <button
                          onClick={() =>
                            onOpenInviteModal(horse.id, tournament.id)
                          }
                          className="rounded-lg bg-[#064E3B] text-white px-2.5 py-1.5 text-[10px] font-bold hover:bg-[#043E2F] transition shadow-xs shrink-0"
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
                        <div className="space-y-1.5">
                          {matchingInvites.map((inv) => {
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
                                        "bg-emerald-50 border-emerald-200 text-emerald-855",
                                      inv.status === "Pending" &&
                                        "bg-amber-50 border-amber-200 text-amber-855",
                                      inv.status === "Declined" &&
                                        "bg-rose-50 border-rose-200 text-rose-855",
                                      inv.status === "Superseded" &&
                                        "bg-slate-100 border-slate-200 text-slate-455"
                                    )}
                                  >
                                    {inv.status}
                                  </span>

                                  {inv.status === "Accepted" &&
                                    !lockedJockey && (
                                      <button
                                        onClick={() => onConfirmPairing(inv.id)}
                                        className="rounded bg-emerald-600 hover:bg-emerald-700 text-white px-2 py-0.5 text-[9px] font-extrabold"
                                      >
                                        Lock
                                      </button>
                                    )}

                                  {inv.status === "Pending" && (
                                    <button
                                      onClick={() => onCancelInvite(inv.id)}
                                      className="text-rose-600 hover:text-rose-855 text-[10px] font-bold"
                                    >
                                      Cancel
                                    </button>
                                  )}
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
            })}
          </div>
        )}
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
                <span className="text-[9px] text-slate-455 block">
                  {j.totalRuns} Matches
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-t pt-3 flex items-center justify-between">
        <span className="text-[10px] text-slate-555 font-semibold">
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

type ScheduleEntry = {
  regId: number;
  horse: Horse;
  tournament: Tournament;
  registration: TournamentRegistration;
  invitations: Invitation[];
  confirmedJockey: Jockey | null;
  hasPendingInvite: boolean;
  dateKey: string;
};

type DetailTab = "info" | "runners";

const parseLocalDate = (dateStr: string) => {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const mockRaceTime = (tournamentId: number) => {
  const times = ["14:00", "15:30", "16:00", "17:00", "18:30"];
  return times[tournamentId % times.length];
};

const buildMockRunners = (
  horse: Horse,
  confirmedJockey: Jockey | null,
  hasPendingInvite: boolean
) => {
  const sampleRunners = [
    { cloth: 1, horseName: "Northern Star", jockeyName: "D. Patel" },
    { cloth: 2, horseName: "Silver Drift", jockeyName: "M. Larsson" },
    { cloth: 3, horseName: "Iron Cascade", jockeyName: "C. Nguyen" },
    { cloth: 4, horseName: "Desert Wind", jockeyName: "R. Santos" },
    { cloth: 5, horseName: "Dark Current", jockeyName: "T. Evans" },
    { cloth: 6, horseName: "Golden Shore", jockeyName: "A. Kim" },
  ];

  const ours = {
    cloth: 7,
    horseName: horse.name,
    jockeyName: confirmedJockey
      ? confirmedJockey.name
      : hasPendingInvite
        ? "— Invite Pending —"
        : null,
  };

  return [...sampleRunners, ours];
};

const RegStatusBadge = ({
  status,
}: {
  status: TournamentRegistration["status"];
}) => {
  const map: Record<
    TournamentRegistration["status"],
    { cls: string; label: string }
  > = {
    Approved: {
      cls: "bg-emerald-50 border-emerald-200 text-emerald-800",
      label: "Approved",
    },
    "Pending Approval": {
      cls: "bg-amber-50 border-amber-200 text-amber-800",
      label: "Pending",
    },
    Waitlisted: {
      cls: "bg-indigo-50 border-indigo-200 text-indigo-800",
      label: "Waitlisted",
    },
    Withdrawn: {
      cls: "bg-rose-50 border-rose-200 text-rose-800",
      label: "Withdrawn",
    },
  };
  const cfg = map[status] ?? map["Pending Approval"];
  return (
    <span
      className={cn(
        "text-[8px] font-black uppercase px-2 py-0.5 rounded border shrink-0",
        cfg.cls
      )}
    >
      {cfg.label}
    </span>
  );
};

function ScheduleRow({
  entry,
  selected,
  onClick,
}: {
  entry: ScheduleEntry;
  selected: boolean;
  onClick: () => void;
}) {
  const noJockey = !entry.confirmedJockey && !entry.hasPendingInvite;
  const pendingOnly = !entry.confirmedJockey && entry.hasPendingInvite;

  return (
    <button
      onClick={onClick}
      className={cn(
        "group w-full flex flex-col px-4 py-3.5 text-left transition-all border-l-4",
        selected
          ? "bg-[#064E3B]/5 border-l-[#064E3B]"
          : noJockey
            ? "bg-amber-50/60 border-l-[#D97706] hover:bg-amber-50"
            : "border-l-transparent hover:bg-slate-50"
      )}
    >
      <div className="flex items-center justify-between w-full gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <span
            className={cn(
              "font-mono text-sm tracking-tight font-black shrink-0",
              selected ? "text-[#064E3B]" : "text-slate-400"
            )}
          >
            {mockRaceTime(entry.tournament.id)}
          </span>
          <div className="truncate">
            <p
              className={cn(
                "font-bold font-headline text-sm truncate",
                selected ? "text-[#064E3B]" : "text-slate-800"
              )}
            >
              {entry.horse.name}
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5 truncate font-medium">
              {entry.tournament.name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {noJockey && (
            <span className="flex items-center gap-1 text-[8px] font-black uppercase px-2 py-0.5 rounded border bg-amber-50 border-amber-300 text-amber-700">
              <AlertTriangle className="w-2.5 h-2.5" />
              No Jockey
            </span>
          )}
          {pendingOnly && (
            <span className="flex items-center gap-1 text-[8px] font-black uppercase px-2 py-0.5 rounded border bg-indigo-50 border-indigo-200 text-indigo-700">
              <Clock className="w-2.5 h-2.5" />
              Invite Sent
            </span>
          )}
          <RegStatusBadge status={entry.registration.status} />
        </div>
      </div>
    </button>
  );
}

function ScheduleDetailPanel({
  entry,
  onClose,
  onOpenInviteModal,
}: {
  entry: ScheduleEntry;
  onClose: () => void;
  onOpenInviteModal: (horseId: number, tournamentId: number) => void;
}) {
  const [activeTab, setActiveTab] = useState<DetailTab>("info");
  const {
    horse,
    tournament,
    registration,
    confirmedJockey,
    hasPendingInvite,
    invitations,
  } = entry;
  const noJockey = !confirmedJockey && !hasPendingInvite;
  const runners = buildMockRunners(horse, confirmedJockey, hasPendingInvite);

  const tabs: TabConfig<DetailTab>[] = [
    { key: "info", label: "Race Info", icon: <Flag className="w-3.5 h-3.5" /> },
    {
      key: "runners",
      label: "Runner List",
      icon: <Users className="w-3.5 h-3.5" />,
    },
  ];

  return (
    <ScheduleDetailFrame
      title={
        <h2 className="text-2xl font-black font-headline tracking-tight leading-tight text-white">
          {horse.name}
        </h2>
      }
      subtitle={
        <p className="text-white/60 text-xs font-semibold mt-0.5">
          {tournament.name}
        </p>
      }
      headerRight={<RegStatusBadge status={registration.status} />}
      headerClass="bg-[#01251e] p-6 border-b border-[#064E3B]/10 text-white"
      onClose={onClose}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      bannerSlot={
        noJockey ? (
          <div className="flex items-center gap-3 rounded-xl bg-[#D97706]/20 border border-[#D97706]/40 px-4 py-2.5">
            <AlertTriangle className="w-4 h-4 text-[#EAB308] shrink-0" />
            <p className="text-xs font-bold text-[#EAB308] flex-1">
              No jockey assigned — your horse will be listed as{" "}
              <span className="uppercase">Scratched</span> unless you invite a
              jockey before the deadline.
            </p>
            <button
              onClick={() => onOpenInviteModal(horse.id, tournament.id)}
              className="shrink-0 text-[10px] font-black uppercase px-2.5 py-1 rounded-lg bg-[#D97706] text-white hover:bg-amber-500 transition active:scale-95"
            >
              Invite Now →
            </button>
          </div>
        ) : undefined
      }
    >
      {/* Tab: Race Info */}
      {activeTab === "info" && (
        <>
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-widest text-[#064E3B]/60 mb-3">
              Your Entry
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-white border border-[#064E3B]/10 rounded-xl shadow-sm">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                  Horse
                </span>
                <span className="text-base font-black font-headline text-[#064E3B] block mt-1">
                  {horse.name}
                </span>
                <span className="text-xs text-slate-555 mt-0.5 block">
                  {horse.breed} · {horse.gender}
                </span>
              </div>
              <div className="p-4 bg-white border border-[#064E3B]/10 rounded-xl shadow-sm">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                  Jockey
                </span>
                {confirmedJockey ? (
                  <>
                    <span className="text-base font-black font-headline text-[#064E3B] block mt-1">
                      {confirmedJockey.name}
                    </span>
                    <span className="text-xs text-emerald-600 font-bold mt-0.5 block">
                      ✓ Confirmed
                    </span>
                  </>
                ) : hasPendingInvite ? (
                  <>
                    <span className="text-base font-black font-headline text-indigo-700 block mt-1">
                      Invite Pending
                    </span>
                    <span className="text-xs text-slate-500 mt-0.5 block">
                      Awaiting response
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-base font-black font-headline text-rose-600 block mt-1">
                      Unassigned
                    </span>
                    <span className="text-xs text-rose-500 font-bold mt-0.5 block">
                      ⚠ Will be Scratched
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-[10px] font-black uppercase tracking-widest text-[#064E3B]/60 mb-3">
              Event Details
            </h3>
            <div className="bg-white border border-[#064E3B]/10 rounded-xl overflow-hidden shadow-sm">
              <div className="divide-y divide-slate-100 text-sm">
                {[
                  {
                    icon: <Flag className="w-4 h-4" />,
                    label: "Allowed Breed",
                    value: tournament.allowedBreed,
                  },
                  {
                    icon: <Activity className="w-4 h-4" />,
                    label: "Age Range",
                    value: `${tournament.minAge} – ${tournament.maxAge} years`,
                  },
                  {
                    icon: <Users className="w-4 h-4" />,
                    label: "Capacity",
                    value: `${tournament.currentCount} / ${tournament.maxCapacity} horses`,
                  },
                  {
                    icon: <Trophy className="w-4 h-4" />,
                    label: "Prize Fund",
                    value: "$175,000",
                  },
                ].map((row) => (
                  <div
                    key={row.label}
                    className="flex items-center justify-between px-5 py-3"
                  >
                    <span className="text-slate-555 flex items-center gap-2 font-medium">
                      {row.icon}
                      {row.label}
                    </span>
                    <span className="font-bold text-slate-800">
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {invitations.length > 0 && (
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-[#064E3B]/60 mb-3">
                Invitation Status
              </h3>
              <div className="space-y-2">
                {invitations.map((inv) => (
                  <div
                    key={inv.id}
                    className="flex items-center justify-between px-4 py-2.5 bg-[#F4F6F5] rounded-xl border border-slate-100 text-xs"
                  >
                    <span className="font-semibold text-slate-700">
                      Jockey #{inv.jockeyId}
                    </span>
                    <span
                      className={cn(
                        "text-[8px] font-black uppercase px-2 py-0.5 rounded border",
                        inv.status === "Accepted" &&
                          "bg-emerald-50 border-emerald-200 text-emerald-800",
                        inv.status === "Pending" &&
                          "bg-amber-50 border-amber-200 text-amber-800",
                        inv.status === "Declined" &&
                          "bg-rose-50 border-rose-200 text-rose-800",
                        inv.status === "Superseded" &&
                          "bg-slate-100 border-slate-200 text-slate-500"
                      )}
                    >
                      {inv.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="border-t border-slate-100 pt-6">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-[#064E3B]/60 mb-3.5 block">
              Racing Officials Board
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {officialsMock.map((o) => (
                <div
                  key={o.initials}
                  className="flex items-center gap-3.5 rounded-xl border border-[#064E3B]/10 p-3.5 bg-[#F4F6F5]/30"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg shadow-sm bg-white text-[#064E3B] text-xs font-black border border-[#064E3B]/10">
                    {o.initials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-black font-headline text-slate-800 truncate leading-tight">
                      {o.name}
                    </p>
                    <p className="text-[10px] font-semibold text-slate-400 truncate leading-tight mt-1">
                      {o.title}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Tab: Runner List */}
      {activeTab === "runners" && (
        <div>
          <h3 className="text-[10px] font-black uppercase tracking-widest text-[#064E3B]/60 mb-3">
            Confirmed Runner Line-up
          </h3>
          <div className="overflow-hidden rounded-xl border border-[#064E3B]/10 bg-white shadow-sm">
            <table className="w-full text-left">
              <thead className="bg-[#F4F6F5] border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3.5 text-[9px] font-black uppercase tracking-widest text-slate-400 w-16 text-center">
                    Cloth
                  </th>
                  <th className="px-5 py-3.5 text-[9px] font-black uppercase tracking-widest text-slate-400">
                    Horse
                  </th>
                  <th className="px-5 py-3.5 text-[9px] font-black uppercase tracking-widest text-slate-400">
                    Jockey
                  </th>
                  <th className="px-5 py-3.5 text-[9px] font-black uppercase tracking-widest text-slate-400 text-right">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {runners.map((runner, idx) => {
                  const isOurs = runner.horseName === horse.name;
                  const isScratched = isOurs && runner.jockeyName === null;
                  const isPending =
                    isOurs && runner.jockeyName === "— Invite Pending —";

                  return (
                    <tr
                      key={idx}
                      className={cn(
                        "transition-colors",
                        isOurs
                          ? isScratched
                            ? "bg-rose-50/60"
                            : "bg-[#064E3B]/5"
                          : "hover:bg-slate-50/50"
                      )}
                    >
                      <td className="px-5 py-3.5 text-center">
                        <span className="flex h-6 w-6 items-center justify-center rounded-md border border-slate-200 bg-white shadow-sm text-xs font-black text-slate-700 mx-auto">
                          {runner.cloth}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={cn(
                            "font-bold font-headline text-base leading-snug",
                            isOurs ? "text-[#064E3B]" : "text-slate-800",
                            isScratched && "line-through text-rose-400"
                          )}
                        >
                          {runner.horseName}
                        </span>
                        {isOurs && (
                          <span className="ml-2 text-[9px] font-black uppercase bg-[#064E3B]/10 text-[#064E3B] px-1.5 py-0.5 rounded">
                            Your Entry
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 font-medium text-slate-600">
                        {isScratched ? (
                          <span className="text-rose-400 italic text-xs">
                            Not assigned
                          </span>
                        ) : isPending ? (
                          <span className="text-indigo-500 font-semibold text-xs italic">
                            — Invite Pending —
                          </span>
                        ) : (
                          runner.jockeyName
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        {isScratched ? (
                          <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase px-2.5 py-1 rounded-full border bg-rose-50 border-rose-300 text-rose-600">
                            <Syringe className="w-2.5 h-2.5" /> Scratched
                          </span>
                        ) : isPending ? (
                          <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded border bg-indigo-50 border-indigo-200 text-indigo-700">
                            Pending
                          </span>
                        ) : (
                          <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded border bg-emerald-50 border-emerald-200 text-emerald-700">
                            Confirmed
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </ScheduleDetailFrame>
  );
}

// ─── Main HorseScheduleView ───────────────────────────────────────────────────

export function HorseScheduleView({
  horses,
  registrations,
  tournaments,
  jockeys,
  invitations,
  onOpenInviteModal,
}: {
  horses: Horse[];
  registrations: TournamentRegistration[];
  tournaments: Tournament[];
  jockeys: Jockey[];
  invitations: Invitation[];
  onOpenInviteModal: (horseId: number, tournamentId: number) => void;
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "All" | "no-jockey" | "pending-invite" | "confirmed"
  >("All");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedEntryId, setSelectedEntryId] = useState<number | null>(null);

  const allEntries = useMemo<ScheduleEntry[]>(() => {
    return registrations
      .filter((r) => r.status !== "Withdrawn")
      .map((reg) => {
        const horse = horses.find((h) => h.id === reg.horseId);
        const tournament = tournaments.find((t) => t.id === reg.tournamentId);
        if (!horse || !tournament) return null;

        const regInvitations = invitations.filter(
          (i) =>
            i.horseId === reg.horseId && i.tournamentId === reg.tournamentId
        );
        const confirmedInv = regInvitations.find(
          (i) => i.status === "Accepted"
        );
        const confirmedJockey = confirmedInv
          ? (jockeys.find((j) => j.id === confirmedInv.jockeyId) ?? null)
          : null;
        const hasPendingInvite = regInvitations.some(
          (i) => i.status === "Pending"
        );

        const rawDate =
          (tournament as Tournament & { startDate?: string }).startDate ??
          "2026-06-15";
        const d = parseLocalDate(rawDate);
        const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

        return {
          regId: reg.id,
          horse,
          tournament,
          registration: reg,
          invitations: regInvitations,
          confirmedJockey,
          hasPendingInvite,
          dateKey,
        };
      })
      .filter(Boolean) as ScheduleEntry[];
  }, [registrations, horses, tournaments, jockeys, invitations]);

  const counts = useMemo(
    () => ({
      All: allEntries.length,
      "no-jockey": allEntries.filter(
        (e) => !e.confirmedJockey && !e.hasPendingInvite
      ).length,
      "pending-invite": allEntries.filter(
        (e) => !e.confirmedJockey && e.hasPendingInvite
      ).length,
      confirmed: allEntries.filter((e) => !!e.confirmedJockey).length,
    }),
    [allEntries]
  );

  const filteredEntries = useMemo(() => {
    const lower = search.toLowerCase();
    return allEntries.filter((e) => {
      const matchSearch =
        !lower ||
        e.horse.name.toLowerCase().includes(lower) ||
        e.tournament.name.toLowerCase().includes(lower);

      const matchStatus =
        statusFilter === "All" ||
        (statusFilter === "no-jockey" &&
          !e.confirmedJockey &&
          !e.hasPendingInvite) ||
        (statusFilter === "pending-invite" &&
          !e.confirmedJockey &&
          e.hasPendingInvite) ||
        (statusFilter === "confirmed" && !!e.confirmedJockey);

      return matchSearch && matchStatus;
    });
  }, [allEntries, search, statusFilter]);

  const formattedSelectedDate = useMemo(() => {
    if (!selectedDate) return "";
    const yyyy = selectedDate.getFullYear();
    const mm = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const dd = String(selectedDate.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }, [selectedDate]);

  const calendarFilteredEntries = useMemo(() => {
    if (!selectedDate) return filteredEntries;
    return filteredEntries.filter((e) => e.dateKey === formattedSelectedDate);
  }, [filteredEntries, formattedSelectedDate, selectedDate]);

  const raceDays = useMemo(
    () => allEntries.map((e) => parseLocalDate(e.dateKey)),
    [allEntries]
  );

  const selectedEntry = useMemo(
    () => allEntries.find((e) => e.regId === selectedEntryId) ?? null,
    [allEntries, selectedEntryId]
  );

  const handleSelectEntry = useCallback((entry: ScheduleEntry) => {
    setSelectedEntryId((prev) => (prev === entry.regId ? null : entry.regId));
  }, []);

  const panelOpen = selectedEntry !== null;

  return (
    <div className="flex-1 overflow-y-auto p-6 max-w-7xl w-full mx-auto font-body h-full custom-scrollbar bg-[#F4F6F5]">
      <div className="flex-shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold font-headline text-[#064E3B]">
              Run Schedule
            </h2>
            <p className="text-xs text-slate-555 font-semibold mt-1">
              Your horses' upcoming races, jockey assignments, and registration
              statuses
            </p>
          </div>

          <div className="relative w-full sm:w-72 shadow-sm rounded-xl border border-slate-200 bg-white">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search horses, tournaments..."
              className="w-full h-10 rounded-xl bg-transparent pl-10 pr-4 text-xs font-medium outline-none transition focus:border-[#064E3B] placeholder:text-slate-400"
            />
          </div>
        </div>

        <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-3">
          {(["All", "no-jockey", "pending-invite", "confirmed"] as const).map(
            (key) => {
              const labels = {
                All: "All Races",
                "no-jockey": "No Jockey",
                "pending-invite": "Invite Sent",
                confirmed: "Confirmed",
              };
              return (
                <ScheduleStatCard
                  key={key}
                  label={labels[key]}
                  value={counts[key]}
                  active={statusFilter === key}
                  onClick={() => setStatusFilter(key)}
                  liveDot={key === "no-jockey"}
                />
              );
            }
          )}
        </div>
      </div>

      <ScheduleLayout
        panelOpen={panelOpen}
        calendarSlot={
          <ScheduleCalendar
            selectedDate={selectedDate}
            onSelect={setSelectedDate}
            raceDays={raceDays}
          />
        }
        listSlot={
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col">
            <div className="border-b border-slate-100 bg-[#F4F6F5] px-5 py-3 flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-slate-400" />
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                {selectedDate
                  ? `Schedule for ${selectedDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
                  : "All Registered Races"}
              </span>
              {selectedDate && (
                <button
                  onClick={() => setSelectedDate(undefined)}
                  className="ml-auto text-[9px] text-slate-400 hover:text-slate-655 font-bold"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="divide-y divide-slate-100 flex-1">
              {calendarFilteredEntries.length > 0 ? (
                calendarFilteredEntries.map((entry) => (
                  <ScheduleRow
                    key={entry.regId}
                    entry={entry}
                    selected={selectedEntryId === entry.regId}
                    onClick={() => handleSelectEntry(entry)}
                  />
                ))
              ) : (
                <div className="p-8 text-center text-xs text-slate-400 font-medium">
                  {selectedDate
                    ? "No races scheduled on this date."
                    : "No registered races found."}
                </div>
              )}
            </div>
          </div>
        }
        detailSlot={
          selectedEntry && (
            <ScheduleDetailPanel
              entry={selectedEntry}
              onClose={() => setSelectedEntryId(null)}
              onOpenInviteModal={onOpenInviteModal}
            />
          )
        }
      />
    </div>
  );
}
