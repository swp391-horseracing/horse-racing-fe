import React, { useRef, useState } from "react";
import UserLayout from "../layouts/UserLayout";
import { ROUTES } from "../router/routes.tsx";
import { useOwner } from "../hooks/useOwner.ts";
import { useJockey } from "../hooks/useJockey.ts";
import type { Horse } from "../types/horse";
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
import { EditHorseModal } from "../components/owner/EditHorseModal";
import { RegisterTournamentModal } from "../components/owner/RegisterTournamentModal";

// Newly Extracted Sub-Components
import { OwnerDashBoardOverview } from "../components/owner/OwnerDashBoardOverview";
import { HorseManagement } from "../components/owner/HorseManagement";
import { RaceRegister } from "../components/owner/RaceRegister";
import { RidingSchedule } from "../components/jockey/RidingSchedule";
import { JockeyRosterManagement } from "../components/owner/JockeyRosterManagement";

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
    editHorse,
    retireHorse,
    registerTournament,
    confirmPairing,
    cancelInvite,
    inviteJockey,
    jockeysPagination,
    loadAllInvitations,
  } = useOwner();

  const { rides: ownerRides, loading: ridesLoading } = useJockey();

  const [toasts, setToasts] = useState<Toast[]>([]);
  const [showAddHorse, setShowAddHorse] = useState(false);
  const [editingHorse, setEditingHorse] = useState<Horse | null>(null);
  const [showEditHorse, setShowEditHorse] = useState(false);
  const [showRegisterTournament, setShowRegisterTournament] = useState(false);

  const toastIdRef = useRef(0);

  const [selectedHorseId, setSelectedHorseId] = useState<string | null>(null);
  const [selectedTournamentId, setSelectedTournamentId] = useState<
    number | null
  >(null);

  const addToast = (message: string, type: ToastType = "success") => {
    const id = ++toastIdRef.current;
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
        r.horse.id === horseId && ["pending", "approved"].includes(r.status)
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
      imageUrl: "",
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

  const handleEditHorse = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const id = data.get("horseId") as string;
    const name = data.get("name") as string;

    if (
      horses.some(
        (h) =>
          h.id !== id &&
          h.name.toLowerCase() === name.toLowerCase() &&
          h.status !== "Retired"
      )
    ) {
      addToast(
        "Duplicate Name: Another active horse already shares this name.",
        "error"
      );
      return;
    }

    const payload = {
      name,
      breed: data.get("breed") as string,
      birthDate: data.get("birth_date") as string,
      weightKg: data.get("weight_kg") as string,
      imageUrl: "",
      healthStatus: (data.get("health_status") as string) || "Healthy",
    };

    try {
      await editHorse(id, payload);
      setShowEditHorse(false);
      setEditingHorse(null);
      addToast(`Horse "${name}" updated successfully!`, "success");
    } catch (err: unknown) {
      const axiosError = err as {
        response?: { data?: { message?: string | string[] } };
      };
      const serverMessage = axiosError?.response?.data?.message;
      const formattedError = Array.isArray(serverMessage)
        ? serverMessage.join(", ")
        : serverMessage;

      addToast(formattedError || "Failed to update horse details.", "error");
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
    const tournament = tournaments.find((t) => t.id === String(tournamentId));
    if (!horse || !tournament) return;

    const t = tournament as unknown as Record<string, unknown>;
    if (horse.breed !== t.allowedBreed) {
      addToast(
        `Eligibility Failure: Requires breed "${t.allowedBreed}".`,
        "error"
      );
      return;
    }
    const age = calculateAge(horse.birthDate);
    if (age < (t.minAge as number) || age > (t.maxAge as number)) {
      addToast(
        `Eligibility Failure: Age must be ${t.minAge}-${t.maxAge} years.`,
        "error"
      );
      return;
    }

    const isFull = (t.currentCount as number) >= (t.maxCapacity as number);
    try {
      await registerTournament(String(tournamentId), horseId);
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
            onEdit={(horse) => {
              setEditingHorse(horse);
              setShowEditHorse(true);
            }}
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
            registrations={registrations}
            jockeys={jockeys}
            invitations={invitations}
            onInviteJockey={async (raceId, jockeyId, horseId) => {
              try {
                await inviteJockey(raceId, jockeyId, horseId);
                addToast("Invitation sent to jockey successfully.", "success");
              } catch {
                addToast(
                  "Failed to send invitation. Please try again.",
                  "error"
                );
              }
            }}
            onConfirmPairing={async (invId) => {
              const inv = invitations.find((i) => i.id === invId);
              if (!inv) return;
              try {
                await confirmPairing(inv.raceId, invId);
                addToast(
                  `Pairing confirmed for ${inv.horse?.name ?? inv.horse?.id} with jockey ${inv.jockey?.fullName ?? inv.jockey?.id}.`,
                  "success"
                );
              } catch {
                addToast(
                  "Failed to confirm pairing. Please try again.",
                  "error"
                );
              }
            }}
            onCancelInvite={async (invId) => {
              const inv = invitations.find((i) => i.id === invId);
              if (!inv) return;
              try {
                await cancelInvite(inv.raceId, invId);
                addToast(
                  `Invitation cancelled for ${inv.horse?.name ?? inv.horse?.id} with jockey ${inv.jockey?.fullName ?? inv.jockey?.id}.`,
                  "success"
                );
              } catch {
                addToast(
                  "Failed to cancel invitation. Please try again.",
                  "error"
                );
              }
            }}
            jockeysPagination={jockeysPagination}
            loadAllInvitations={loadAllInvitations}
          />
        );
      case "/owner/schedule":
        return (
          <RidingSchedule
            rides={ownerRides}
            loading={ridesLoading}
            userRole="owner"
          />
        );
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

        <EditHorseModal
          isOpen={showEditHorse}
          onClose={() => {
            setShowEditHorse(false);
            setEditingHorse(null);
          }}
          onSubmit={handleEditHorse}
          initialData={editingHorse}
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
      </div>
    </UserLayout>
  );
}
