import { useState, useMemo } from "react";
import UserLayout from "../layouts/UserLayout";
import { ROUTES } from "../router/routes.tsx";
import { useOwner } from "../hooks/useOwner.ts";
import type {
  Horse,
  Tournament,
  TournamentRegistration,
  Jockey,
  Invitation,
} from "../hooks/useOwner.ts";
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
  MapPin,
  ArrowUpRight,
  CalendarDays,
  Flag,
} from "lucide-react";

// Import Abstracted Components
import { ScheduleLayout } from "../components/schedule/ScheduleLayout";
import { ScheduleCalendar } from "../components/schedule/ScheduleCalendar";

// Import the Jockey Races Hook for the Schedule
import { useJockeyRaces, type MyRide } from "../hooks/useJockeyRaces.ts";

type ToastType = "success" | "error" | "warning" | "info";
type Toast = { id: number; message: string; type: ToastType };

export default function OwnerPage() {
  const [active, setActive] = useState<string>(ROUTES.OWNER_DASHBOARD);

  // Use the real Owner Hook (No Mock Data)
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
  } = useOwner();

  // Use the Jockey Races Hook for the Schedule (Works for Owners too via /me/races)
  const { rides: ownerRides, loading: ridesLoading } = useJockeyRaces();

  const [toasts, setToasts] = useState<Toast[]>([]);
  const [showAddHorse, setShowAddHorse] = useState(false);
  const [showRegisterTournament, setShowRegisterTournament] = useState(false);
  const [showInviteJockey, setShowInviteJockey] = useState(false);

  const [selectedHorseId, setSelectedHorseId] = useState<string | null>(null);
  const [selectedTournamentId, setSelectedTournamentId] = useState<
    number | null
  >(null);

  const addToast = (message: string, type: ToastType = "success") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(
      () => setToasts((prev) => prev.filter((t) => t.id !== id)),
      3000
    );
  };

  const calculateAge = (dobString: string): number => {
    const birthDate = new Date(dobString);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    )
      age--;
    return age;
  };

  const isHorseLocked = (horseId: string): boolean =>
    registrations.some(
      (r) =>
        r.horseId === horseId &&
        ["Pending Approval", "Approved", "Waitlisted"].includes(r.status)
    );

  const handleAddHorse = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = data.get("name") as string;
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
        breed: data.get("breed"),
        dob: data.get("dob"),
        gender: data.get("gender"),
        microchipId: "123",
        associationCode: data.get("associationCode"),
      });
      setShowAddHorse(false);
      addToast(`Horse "${name}" registered successfully!`, "success");
    } catch {
      addToast("Failed to save horse details.", "error");
    }
  };

  const handleRetireHorse = async (id: string) => {
    if (isHorseLocked(id)) {
      addToast(
        "Action Blocked: Horse has active tournament commitments.",
        "warning"
      );
      return;
    }
    try {
      await retireHorse(id);
      addToast("Horse status set to Retired.", "info");

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      addToast(error.message || "Cannot retire horse", "error");
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
    try {
      await registerTournament(
        selectedHorseId,
        selectedTournamentId,
        isFull ? "Waitlisted" : "Pending Approval"
      );
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
    horseId: string
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
    if (await confirmPairing(invId))
      addToast("Jockey-horse pairing confirmed & locked.", "success");
    else addToast("Failed to confirm jockey pairing.", "error");
  };

  const handleCancelInvite = async (invId: number) => {
    if (await cancelInvite(invId)) addToast("Invitation cancelled.", "info");
    else addToast("Failed to cancel invitation.", "error");
  };

  const renderContent = () => {
    if (loading)
      return (
        <div className="flex items-center justify-center h-64 text-sm text-slate-400">
          <Clock className="w-5 h-5 animate-spin mr-2" /> Loading...
        </div>
      );

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
            onOpenRegisterModal={(h, t) => {
              setSelectedHorseId(h ?? null);
              setSelectedTournamentId(t ?? null);
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
            onOpenInviteModal={(h, t) => {
              setSelectedHorseId(h);
              setSelectedTournamentId(t);
              setShowInviteJockey(true);
            }}
            onConfirmPairing={handleConfirmPairing}
            onCancelInvite={handleCancelInvite}
          />
        );
      case "/owner/schedule":
        // Use the Jockey Schedule View but pass the Owner's rides
        return <OwnerScheduleView rides={ownerRides} loading={ridesLoading} />;
      default:
        return null;
    }
  };

  return (
    <UserLayout activeKey={active} onActiveKeyChange={setActive}>
      <div className="h-full w-full relative flex flex-col overflow-hidden bg-[#F4F6F5]">
        {/* Toasts */}
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
          {toasts.map((t) => (
            <div
              key={t.id}
              className={cn(
                "p-3 rounded-lg border shadow-lg backdrop-blur-md flex items-center gap-2 pointer-events-auto animate-in slide-in-from-top duration-200 text-xs font-semibold",
                t.type === "success" &&
                  "bg-emerald-50 border-emerald-200 text-emerald-950",
                t.type === "error" &&
                  "bg-rose-50 border-rose-200 text-rose-950",
                t.type === "warning" &&
                  "bg-amber-50 border-amber-200 text-amber-955",
                t.type === "info" &&
                  "bg-indigo-50 border-indigo-200 text-indigo-950"
              )}
            >
              {t.type === "success" && (
                <CheckCircle className="w-4 h-4 text-emerald-600" />
              )}
              {t.type === "error" && (
                <XCircle className="w-4 h-4 text-rose-600" />
              )}
              {t.type === "warning" && (
                <AlertTriangle className="w-4 h-4 text-amber-600" />
              )}
              {t.type === "info" && (
                <Activity className="w-4 h-4 text-indigo-600" />
              )}
              <span>{t.message}</span>
            </div>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto min-h-0">{renderContent()}</div>

        {/* Modals */}
        {showAddHorse && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-xl border p-5 max-w-md w-full shadow-xl">
              <div className="flex items-center justify-between border-b pb-2.5 mb-4">
                <h3 className="font-bold text-base text-[#064E3B]">
                  Add Horse to Roster
                </h3>
                <button
                  onClick={() => setShowAddHorse(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              </div>
              <form onSubmit={handleAddHorse} className="space-y-3.5">
                <div className="grid grid-cols-2 gap-3.5">
                  <input
                    required
                    name="name"
                    type="text"
                    className="col-span-2 bg-slate-50 border rounded-md p-2 text-xs"
                    placeholder="Horse Name"
                  />
                  <select
                    required
                    name="breed"
                    className="bg-slate-50 border rounded-md p-2 text-xs"
                  >
                    <option value="Thoroughbred">Thoroughbred</option>
                    <option value="Arabian">Arabian</option>
                    <option value="Quarter Horse">Quarter Horse</option>
                  </select>
                  <select
                    required
                    name="gender"
                    className="bg-slate-50 border rounded-md p-2 text-xs"
                  >
                    <option value="Stallion">Stallion</option>
                    <option value="Mare">Mare</option>
                    <option value="Gelding">Gelding</option>
                  </select>
                  <input
                    required
                    name="dob"
                    type="date"
                    className="bg-slate-50 border rounded-md p-2 text-xs"
                  />
                  <input
                    required
                    name="associationCode"
                    type="text"
                    className="col-span-2 bg-slate-50 border rounded-md p-2 text-xs"
                    placeholder="Association Code"
                  />
                </div>
                <div className="flex gap-2 justify-end pt-2 border-t">
                  <button
                    type="button"
                    onClick={() => setShowAddHorse(false)}
                    className="rounded-md border px-3 py-1.5 text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-md bg-[#064E3B] text-white px-3.5 py-1.5 text-xs font-bold"
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showRegisterTournament && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-xl border p-5 max-w-sm w-full shadow-xl">
              <div className="flex items-center justify-between border-b pb-2.5 mb-4">
                <h3 className="font-bold text-base text-[#064E3B]">
                  Tournament Registration
                </h3>
                <button
                  onClick={() => setShowRegisterTournament(false)}
                  className="text-slate-400"
                >
                  ✕
                </button>
              </div>
              <form onSubmit={handleRegisterTournament} className="space-y-4">
                <select
                  value={selectedHorseId ?? ""}
                  onChange={(e) => setSelectedHorseId(e.target.value)}
                  required
                  className="w-full bg-slate-50 border rounded-md p-2.5 text-xs"
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
                <select
                  value={selectedTournamentId ?? ""}
                  onChange={(e) =>
                    setSelectedTournamentId(Number(e.target.value))
                  }
                  required
                  className="w-full bg-slate-50 border rounded-md p-2.5 text-xs"
                >
                  <option value="" disabled>
                    -- Choose Tournament --
                  </option>
                  {tournaments
                    .filter((t) => t.status === "Registration Open")
                    .map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                </select>
                <div className="flex gap-2 justify-end pt-2 border-t">
                  <button
                    type="button"
                    onClick={() => setShowRegisterTournament(false)}
                    className="rounded-md border px-3 py-1.5 text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-md bg-[#064E3B] text-white px-3.5 py-1.5 text-xs font-bold"
                  >
                    Submit
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showInviteJockey && selectedHorseId && selectedTournamentId && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-xl border p-5 max-w-md w-full shadow-xl">
              <div className="flex items-center justify-between border-b pb-2.5 mb-3">
                <h3 className="font-bold text-base text-[#064E3B]">
                  Select Jockeys
                </h3>
                <button
                  onClick={() => setShowInviteJockey(false)}
                  className="text-slate-400"
                >
                  ✕
                </button>
              </div>
              <JockeyInviteSelector
                jockeys={jockeys}
                onDispatch={(ids) =>
                  handleInviteJockeys(
                    ids,
                    selectedTournamentId,
                    selectedHorseId
                  )
                }
              />
            </div>
          </div>
        )}
      </div>
    </UserLayout>
  );
}

// ─── Components (Shortened & Cleaned) ──────────────────────────────────────────

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
    <div className="p-5 space-y-5 max-w-6xl mx-auto">
      <div>
        <h2 className="text-xl font-black text-[#064E3B]">Owner Dashboard</h2>
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
        <div className="bg-white border rounded-xl p-4 lg:col-span-2 shadow-xs">
          <div className="border-b pb-2 flex justify-between items-center">
            <h3 className="font-bold text-sm text-[#064E3B]">
              Stable Roster Overview
            </h3>
            <button
              onClick={() => setActiveTab("/owner/horseManagement")}
              className="text-[10px] font-bold text-indigo-600 hover:underline"
            >
              Manage
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
                    <p className="font-bold text-slate-800">{horse.name}</p>
                    <p className="text-slate-400 text-[10px]">
                      {horse.breed} • {horse.gender}
                    </p>
                  </div>
                  <span className="bg-emerald-50 text-emerald-800 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded border border-emerald-200">
                    {horse.status}
                  </span>
                </div>
              ))}
          </div>
        </div>

        <div className="bg-white border rounded-xl p-4 shadow-xs">
          <h3 className="font-bold text-sm text-[#064E3B] flex items-center gap-1 border-b pb-2">
            <Trophy className="w-4 h-4 text-amber-500" /> Elite Jockeys
          </h3>
          <div className="space-y-2 mt-3">
            {jockeys.slice(0, 3).map((j) => (
              <div
                key={j.id}
                className="p-2.5 bg-slate-50/50 rounded-lg flex items-center justify-between text-xs border"
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

function HorseManagement({
  horses,
  isHorseLocked,
  onRetire,
  onOpenAddModal,
}: {
  horses: Horse[];
  isHorseLocked: (id: string) => boolean;
  onRetire: (id: string) => void;
  onOpenAddModal: () => void;
}) {
  return (
    <div className="p-5 space-y-5 max-w-6xl mx-auto">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h2 className="text-xl font-black text-[#064E3B]">Horse Registry</h2>
          <p className="text-xs text-slate-500 mt-1">
            Manage your stable profiles and retire active horses.
          </p>
        </div>
        <button
          onClick={onOpenAddModal}
          className="flex items-center gap-1 rounded-lg bg-[#064E3B] text-white px-3.5 py-2 text-xs font-bold shadow-xs hover:bg-[#043E2F]"
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
                        "text-[8px] font-black uppercase px-2 py-0.5 rounded-full border",
                        locked
                          ? "bg-amber-50 border-amber-200 text-amber-800"
                          : "bg-emerald-50 border-emerald-200 text-emerald-800"
                      )}
                    >
                      {locked ? "Locked" : "Active"}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <div>
                      <span className="text-slate-400 block text-[8px] uppercase">
                        Breed
                      </span>
                      <span className="font-bold text-slate-700">
                        {horse.breed}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[8px] uppercase">
                        Gender
                      </span>
                      <span className="font-bold text-slate-700">
                        {horse.gender}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => onRetire(horse.id)}
                  disabled={locked}
                  className="mt-4 w-full flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 hover:border-rose-300 text-slate-500 hover:text-rose-600 py-2 transition disabled:opacity-40"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Retire Horse
                </button>
              </div>
            );
          })}
      </div>
    </div>
  );
}

function RaceRegister({
  tournaments,
  onOpenRegisterModal,
}: {
  horses: Horse[];
  tournaments: Tournament[];
  registrations: TournamentRegistration[];
  onOpenRegisterModal: (
    horseId?: string | null,
    tournamentId?: number | null
  ) => void;
}) {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<
    "All" | "Live now" | "Registration open" | "Upcoming" | "Completed"
  >("All");

  const filtered = tournaments.filter((t) => {
    const matchSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.allowedBreed.toLowerCase().includes(search.toLowerCase());
    const statusMap: Record<string, string[]> = {
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
    return matchSearch && statusMap[activeFilter].includes(t.status);
  });

  return (
    <div className="p-5 space-y-5 max-w-6xl mx-auto">
      <h2 className="text-xl font-black text-[#064E3B]">
        Race & Tournament Registration
      </h2>

      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            type="text"
            placeholder="Search tournaments..."
            className="w-full pl-9 pr-4 py-2.5 text-[13px] bg-white border rounded-xl outline-none focus:border-[#064E3B]"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {["All", "Live now", "Registration open", "Upcoming", "Completed"].map(
          (tab) => (
            <button
              key={tab}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onClick={() => setActiveFilter(tab as any)}
              className={cn(
                "px-4 py-1.5 rounded-full text-[13px] font-bold border",
                activeFilter === tab
                  ? "bg-slate-800 text-white"
                  : "bg-white text-slate-600 border-slate-200"
              )}
            >
              {tab}
            </button>
          )
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((t) => (
          <div
            key={t.id}
            className="bg-white rounded-2xl border p-5 flex flex-col hover:shadow-md transition"
          >
            <h3 className="font-black text-[17px] text-[#064E3B] mb-2">
              {t.name}
            </h3>
            <div className="flex items-center gap-1.5 text-[13px] text-slate-500 mb-4">
              <MapPin className="w-3.5 h-3.5" /> Ho Chi Minh City
            </div>
            {t.status === "Registration Open" && (
              <button
                onClick={() => onOpenRegisterModal(null, t.id)}
                className="w-full rounded-xl border bg-white py-3 text-[13px] font-bold hover:bg-slate-50 flex items-center justify-center gap-1.5"
              >
                Register horse <ArrowUpRight className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

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
  onOpenInviteModal: (horseId: string, tournamentId: number) => void;
  onConfirmPairing: (invId: number) => void;
  onCancelInvite: (invId: number) => void;
}) {
  const approved = registrations.filter((r) => r.status === "Approved");

  return (
    <div className="p-5 space-y-5 max-w-6xl mx-auto">
      <h2 className="text-xl font-black text-[#064E3B]">Jockey Roster</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {approved.map((reg) => {
          const horse = horses.find((h) => h.id === reg.horseId);
          const tournament = tournaments.find((t) => t.id === reg.tournamentId);
          if (!horse || !tournament) return null;

          const invites = invitations.filter(
            (i) =>
              i.horseId === reg.horseId && i.tournamentId === reg.tournamentId
          );
          const locked = invites.find((i) => i.status === "Confirmed");

          return (
            <div
              key={reg.id}
              className="bg-white border rounded-xl p-4 shadow-xs"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-bold text-sm text-[#064E3B]">
                    {horse.name}
                  </h4>
                  <p className="text-[10px] text-slate-400">
                    {tournament.name}
                  </p>
                </div>
                {locked ? (
                  <span className="bg-emerald-50 text-emerald-800 text-[8px] font-black uppercase px-2 py-0.5 rounded">
                    Locked
                  </span>
                ) : (
                  <button
                    onClick={() => onOpenInviteModal(horse.id, tournament.id)}
                    className="rounded-lg bg-[#064E3B] text-white px-2.5 py-1.5 text-[10px] font-bold"
                  >
                    Hire Jockey
                  </button>
                )}
              </div>

              <div className="space-y-1.5 pt-2 mt-3 border-t">
                {invites.map((inv) => {
                  const jockey = jockeys.find((j) => j.id === inv.jockeyId);
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
                          {jockey?.club}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "text-[8px] font-black uppercase px-1.5 py-0.5 rounded border",
                            inv.status === "Confirmed" &&
                              "bg-emerald-50 text-emerald-800",
                            inv.status === "Pending" &&
                              "bg-amber-50 text-amber-800"
                          )}
                        >
                          {inv.status}
                        </span>
                        {inv.status === "Accepted" && !locked && (
                          <button
                            onClick={() => onConfirmPairing(inv.id)}
                            className="rounded bg-emerald-600 text-white px-2 py-0.5 text-[9px] font-bold"
                          >
                            Lock
                          </button>
                        )}
                        {inv.status === "Pending" && (
                          <button
                            onClick={() => onCancelInvite(inv.id)}
                            className="text-rose-600 text-[10px] font-bold"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function JockeyInviteSelector({
  jockeys,
  onDispatch,
}: {
  jockeys: Jockey[];
  onDispatch: (ids: number[]) => void;
}) {
  const [selected, setSelected] = useState<number[]>([]);
  const toggle = (id: number) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );

  return (
    <div className="space-y-3">
      <div className="max-h-56 overflow-y-auto divide-y">
        {jockeys.map((j) => (
          <div
            key={j.id}
            onClick={() => toggle(j.id)}
            className={cn(
              "p-2 flex items-center justify-between cursor-pointer rounded-lg my-1 border",
              selected.includes(j.id)
                ? "bg-emerald-50/50 border-[#064E3B]"
                : "bg-white"
            )}
          >
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selected.includes(j.id)}
                onChange={() => {}}
              />
              <div>
                <p className="font-bold text-slate-800">{j.name}</p>
                <p className="text-[10px] text-slate-400">{j.club}</p>
              </div>
            </div>
            <span className="font-bold text-[#064E3B]">{j.winRate}</span>
          </div>
        ))}
      </div>
      <div className="border-t pt-3 flex items-center justify-between">
        <span className="text-[10px] text-slate-500">
          {selected.length} Selected
        </span>
        <button
          onClick={() => onDispatch(selected)}
          disabled={selected.length === 0}
          className="rounded-md bg-[#064E3B] text-white px-3.5 py-1.5 text-xs font-bold disabled:opacity-40"
        >
          Send
        </button>
      </div>
    </div>
  );
}

// ── OwnerScheduleView (Uses Jockey Rides Hook Data) ──────────────────────────

function OwnerScheduleView({
  rides,
  loading,
}: {
  rides: MyRide[];
  loading: boolean;
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "All" | "scheduled" | "live" | "completed"
  >("All");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedRideId, setSelectedRideId] = useState<string | null>(null);

  const filteredRides = useMemo(() => {
    const lower = search.toLowerCase();
    return rides.filter((r) => {
      const matchSearch =
        !lower ||
        r.name.toLowerCase().includes(lower) ||
        r.ride.toLowerCase().includes(lower) ||
        r.name.toLowerCase().includes(lower);
      const matchStatus = statusFilter === "All" || r.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [rides, search, statusFilter]);

  const raceDays = useMemo(() => {
    return filteredRides.map((r) => {
      const d = new Date(r.scheduledAt);
      return new Date(d.getFullYear(), d.getMonth(), d.getDate());
    });
  }, [filteredRides]);

  const selectedRide = rides.find((r) => r.id === selectedRideId) || null;

  if (loading)
    return (
      <div className="p-6 text-center text-slate-500">Loading Schedule...</div>
    );

  return (
    <div className="flex-1 overflow-y-auto p-6 max-w-7xl w-full mx-auto font-body h-full custom-scrollbar bg-[#F4F6F5]">
      <div className="flex-shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold font-headline text-[#064E3B]">
              Owner Schedule
            </h2>
            <p className="text-xs text-slate-500 font-semibold mt-1">
              Upcoming races for your horses.
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
          {[
            { key: "All", label: "All Races" },
            { key: "scheduled", label: "Scheduled" },
            { key: "live", label: "Live" },
            { key: "completed", label: "Completed" },
          ].map((item) => (
            <button
              key={item.key}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onClick={() => setStatusFilter(item.key as any)}
              className={cn(
                "px-4 py-2.5 rounded-xl border text-xs font-bold transition shadow-xs",
                statusFilter === item.key
                  ? "bg-[#064E3B] text-white border-[#064E3B]"
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <ScheduleLayout
        panelOpen={!!selectedRide}
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
                  ? `Schedule for ${selectedDate.toLocaleDateString()}`
                  : "All Races"}
              </span>
            </div>
            <div className="divide-y divide-slate-100 flex-1">
              {filteredRides.length > 0 ? (
                filteredRides.map((ride) => (
                  <button
                    key={ride.id}
                    onClick={() =>
                      setSelectedRideId(
                        ride.id === selectedRideId ? null : ride.id
                      )
                    }
                    className={cn(
                      "w-full p-4 text-left hover:bg-slate-50 transition flex items-center justify-between",
                      selectedRideId === ride.id &&
                        "bg-[#064E3B]/5 border-l-4 border-l-[#064E3B]"
                    )}
                  >
                    <div>
                      <p className="font-bold text-sm text-[#064E3B]">
                        {ride.name}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        {ride.distanceMeters} • {ride.laneNumber}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded uppercase",
                        ride.status === "live"
                          ? "bg-rose-100 text-rose-700"
                          : ride.status === "completed"
                            ? "bg-slate-100 text-slate-600"
                            : "bg-emerald-100 text-emerald-700"
                      )}
                    >
                      {ride.status}
                    </span>
                  </button>
                ))
              ) : (
                <div className="p-8 text-center text-xs text-slate-400 font-medium">
                  No races found.
                </div>
              )}
            </div>
          </div>
        }
        detailSlot={
          selectedRide && (
            <div className="bg-white border rounded-xl p-6 shadow-lg h-full overflow-y-auto">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-black text-[#064E3B]">
                    {selectedRide.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {selectedRide.horseOwner}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedRideId(null)}
                  className="text-slate-400 hover:text-slate-600"
                ></button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-slate-50 rounded-lg">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">
                    Horse
                  </span>
                  <span className="text-lg font-bold text-slate-800">
                    {selectedRide.ride}
                  </span>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">
                    Time
                  </span>
                  <span className="text-lg font-bold text-slate-800">
                    {new Date(selectedRide.scheduledAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <MapPin className="w-4 h-4" /> {selectedRide.venue}
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Flag className="w-4 h-4" /> {selectedRide.distanceMeters}m
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Activity className="w-4 h-4" /> {selectedRide.trackCondition}
                </div>
              </div>
            </div>
          )
        }
      />
    </div>
  );
}
