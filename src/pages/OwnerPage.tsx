import React, { useState } from "react";
import UserLayout from "../layouts/UserLayout";
import { ROUTES } from "../router/routes.tsx";
import { useOwner } from "../hooks/useOwner.ts";
import { useJockeyRaces } from "../hooks/useJockeyRaces.ts";
import { cn } from "../lib/utils";
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Activity,
} from "lucide-react";

// Modals
import { AddHorseModal } from "../components/owner/AddHorseModal";
import { RegisterTournamentModal } from "../components/owner/RegisterTournamentModal";
import { InviteJockeyModal } from "../components/owner/InviteJockeyModal";

// Newly Extracted Sub-Components
import { OwnerDashBoardOverview } from "../components/owner/OwnerDashBoardOverview";
import { HorseManagement } from "../components/owner/HorseManagement";
import { RaceRegister } from "../components/owner/RaceRegister";
import { JockeyRosterManagement } from "../components/owner/JockeyRosterManagement";
import { OwnerScheduleView } from "../components/owner/OwnerScheduleView";

type ToastType = "success" | "error" | "warning" | "info";
type Toast = { id: number; message: string; type: ToastType };

export default function OwnerPage() {
  const [active, setActive] = useState<string>(ROUTES.OWNER_DASHBOARD);

  const {
    pagination,
    setPage,
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
    const rawBirthDate = data.get("birth_date") as string;
    const rawWeight = data.get("weight_kg") as string;
    const healthStatusVal = (data.get("health_status") as string) || "Healthy";

    const payload = {
      name,
      breed: data.get("breed") as string,
      birthDate: rawBirthDate,
      weightKg: rawWeight,
      healthStatus: healthStatusVal,
    };

    try {
      await addHorse(payload);
      setShowAddHorse(false);
      addToast(`Horse "${name}" registered successfully!`, "success");
    } catch (err: unknown) {
      const axiosError = err as {
        response?: { data?: { message?: string | string[] } };
      };
      const serverMessage = axiosError?.response?.data?.message;
      const formattedError = Array.isArray(serverMessage)
        ? serverMessage.join(", ")
        : serverMessage;

      addToast(formattedError || "Failed to save horse details.", "error");
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
    } catch (err: unknown) {
      const error = err as Error;
      addToast(error.message || "Cannot retire horse", "error");
    }
  };

  const handleRegisterTournament = async (
    horseId: string,
    tournamentId: number
  ) => {
    const horse = horses.find((h) => h.id === horseId);
    const tournament = tournaments.find((t) => t.id === tournamentId);
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
        horseId,
        tournamentId,
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

  const handleInviteJockeys = async (jockeyIds: number[]) => {
    if (jockeyIds.length === 0 || !selectedTournamentId || !selectedHorseId)
      return;
    try {
      await inviteJockeys(jockeyIds, selectedTournamentId, selectedHorseId);
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
          <OwnerDashBoardOverview
            horses={horses}
            tournaments={tournaments}
            registrations={registrations}
            invitations={invitations}
            jockeys={jockeys}
            pagination={pagination}
            setPage={setPage}
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
            pagination={pagination}
            setPage={setPage}
          />
        );
      case "/owner/raceRegister":
        return (
          <RaceRegister
            horses={horses}
            tournaments={tournaments}
            registrations={registrations}
            onOpenRegisterModal={(h, t) => {
              setSelectedHorseId(h);
              setSelectedTournamentId(t);
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

        {/* Separated Modals */}
        <AddHorseModal
          isOpen={showAddHorse}
          onClose={() => setShowAddHorse(false)}
          onSubmit={handleAddHorse}
        />

        <RegisterTournamentModal
          key={`register-modal-${showRegisterTournament}-${selectedHorseId}-${selectedTournamentId}`}
          isOpen={showRegisterTournament}
          onClose={() => setShowRegisterTournament(false)}
          horses={horses}
          tournaments={tournaments}
          initialHorseId={selectedHorseId}
          initialTournamentId={selectedTournamentId}
          onSubmit={handleRegisterTournament}
        />

        <InviteJockeyModal
          isOpen={showInviteJockey}
          onClose={() => setShowInviteJockey(false)}
          jockeys={jockeys}
          onDispatch={handleInviteJockeys}
        />
      </div>
    </UserLayout>
  );
}
