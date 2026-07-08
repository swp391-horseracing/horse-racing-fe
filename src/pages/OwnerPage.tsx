import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, matchPath } from "react-router-dom";
import UserLayout from "../layouts/UserLayout";
import { ROUTES } from "../router/routes.tsx";
import { useOwner } from "../hooks/useOwner.ts";
import type { Horse } from "../types/horse";
import { Clock, Send } from "lucide-react";
import { useToast } from "../hooks/useToast";
import { ToastContainer } from "../components/ui/toast";

// Modals
import { AddHorseModal } from "../components/owner/AddHorseModal";
import { EditHorseModal } from "../components/owner/EditHorseModal";
import { RegisterTournamentModal } from "../components/owner/RegisterTournamentModal";

// Newly Extracted Sub-Components
import { OwnerDashBoardOverview } from "../components/owner/OwnerDashBoardOverview";
import { HorseManagement } from "../components/owner/HorseManagement";
import { TournamentRegister } from "../components/owner/TournamentRegister";
import { RidingSchedule } from "../components/jockey/RidingSchedule";
import { JockeyRosterManagement } from "../components/owner/JockeyRosterManagement";
import { SendInvitesPage } from "../components/owner/SendInvitesPage";
import { OwnerEntries } from "../components/owner/OwnerEntries";
import { EnterRaceModal } from "../components/owner/EnterRaceModal";

export default function OwnerPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const active = location.pathname;

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
    loadOwnerSchedule,
    scheduleRides,
    scheduleLoading,
    entries,
    enterRace,
    approvedTournamentIds,
    eligibleHorsesByTournament,
  } = useOwner();

  useEffect(() => {
    loadOwnerSchedule();
  }, [registrations, loadOwnerSchedule]);

  const { toasts, addToast } = useToast(3000);
  const [showAddHorse, setShowAddHorse] = useState(false);
  const [editingHorse, setEditingHorse] = useState<Horse | null>(null);
  const [showEditHorse, setShowEditHorse] = useState(false);
  const [showRegisterTournament, setShowRegisterTournament] = useState(false);

  const [selectedHorseId, setSelectedHorseId] = useState<string | null>(null);
  const [selectedTournamentId, setSelectedTournamentId] = useState<
    number | null
  >(null);

  const [enterRaceTarget, setEnterRaceTarget] = useState<{
    raceId: string;
    raceName: string;
    laneCount: number;
    currentEntryCount: number;
    tournamentId: string;
  } | null>(null);

  // Data is already loaded at page start by useOwner's initial effect.
  // Tab switching only changes the rendered view; no re-fetch needed.

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
      navigate("/owner/horseManagement");
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

    const sendInvitesMatch = matchPath(
      "/entries/:entryId/send-invites",
      active
    );
    if (sendInvitesMatch) {
      return <SendInvitesPage />;
    }

    const ownerEntrySendInvitesMatch = matchPath(
      "/owner/entries/:entryId/send-invites",
      active
    );
    if (ownerEntrySendInvitesMatch) {
      return <SendInvitesPage />;
    }

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
            setActiveTab={navigate}
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
      case "/owner/tournamentRegister":
        return (
          <TournamentRegister
            horses={horses}
            tournaments={tournaments}
            registrations={registrations}
            entries={entries}
            onEnterRace={(raceId, raceName, laneCount, tournamentId) => {
              setEnterRaceTarget({
                raceId,
                raceName,
                laneCount,
                currentEntryCount: 0,
                tournamentId,
              });
            }}
            onOpenRegisterModal={(h, t) => {
              setSelectedHorseId(h);
              setSelectedTournamentId(t);
              setShowRegisterTournament(true);
            }}
            onAssignJockey={(entryId) =>
              navigate(`/owner/entries/${entryId}/send-invites`)
            }
          />
        );
      case "/owner/jockeys":
        return <JockeyRosterManagement />;
      case "/owner/entries":
        return <OwnerEntries />;
      case "/owner/schedule":
        return (
          <RidingSchedule
            rides={scheduleRides}
            loading={scheduleLoading}
            userRole="owner"
          />
        );
      default:
        return null;
    }
  };

  return (
    <UserLayout activeKey={active} onActiveKeyChange={navigate}>
      <div className="h-full w-full relative flex flex-col overflow-hidden bg-[#F4F6F5]">
        <ToastContainer toasts={toasts} />

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

        <EnterRaceModal
          isOpen={enterRaceTarget !== null}
          onClose={() => setEnterRaceTarget(null)}
          raceName={enterRaceTarget?.raceName ?? ""}
          laneCount={enterRaceTarget?.laneCount ?? 0}
          currentEntryCount={enterRaceTarget?.currentEntryCount ?? 0}
          eligibleHorses={
            enterRaceTarget?.tournamentId
              ? eligibleHorsesByTournament.get(enterRaceTarget.tournamentId) ??
                []
              : []
          }
          onSubmit={async (horseId) => {
            if (!enterRaceTarget) return;
            try {
              await enterRace(enterRaceTarget.raceId, horseId);
              addToast("Horse entered into race successfully!", "success");
              setEnterRaceTarget(null);
            } catch (err: unknown) {
              const axiosError = err as {
                response?: { data?: { message?: string } };
              };
              addToast(
                axiosError?.response?.data?.message || "Failed to enter race.",
                "error"
              );
              throw err;
            }
          }}
        />
      </div>
    </UserLayout>
  );
}
