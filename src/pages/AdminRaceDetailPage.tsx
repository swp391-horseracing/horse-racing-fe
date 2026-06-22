import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import UserLayout from "../layouts/UserLayout";
import useAdminRace from "../hooks/admin/useAdminRace";
import RaceForm, { type RaceFormData } from "../components/admin/race/RaceForm";
import RaceStatusButton from "../components/admin/race/RaceStatusButton";

export default function AdminRaceDetailPage() {
  const { id, tournamentId } = useParams<{
    id: string;
    tournamentId: string;
  }>();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    selectedRace,
    loading,
    actionLoading,
    getRaceDetail,
    createRace,
    updateRace,
    updateRaceStatus,
  } = useAdminRace();

  const [editing, setEditing] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const isCreateMode =
    !!tournamentId && location.pathname.includes("/races/new");

  useEffect(() => {
    if (isCreateMode) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowCreateForm(true);
      return;
    }
    if (id) {
      void getRaceDetail(id);
    }
  }, [id, isCreateMode, getRaceDetail]);

  const handleCreate = async (data: RaceFormData) => {
    if (!tournamentId) return false;
    const res = await createRace(
      tournamentId,
      data as unknown as Record<string, unknown>
    );
    if (res) {
      setShowCreateForm(false);
      navigate(-1);
      return true;
    }
    return false;
  };

  const handleUpdate = async (data: RaceFormData) => {
    if (!id) return false;
    const ok = await updateRace(id, data as unknown as Record<string, unknown>);
    if (ok) {
      setEditing(false);
      await getRaceDetail(id);
    }
    return ok;
  };

  const handleStatusChange = async (status: string) => {
    if (!id) return;
    const ok = await updateRaceStatus(id, status);
    if (ok) {
      await getRaceDetail(id);
    }
  };

  if (loading && !isCreateMode) {
    return (
      <UserLayout>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div className="h-full w-full flex flex-col overflow-y-auto p-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#064E3B] mb-4 w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="space-y-5">
          <div className="flex justify-between items-center gap-3">
            <h2 className="text-2xl font-bold text-[#064E3B]">
              {isCreateMode
                ? "Create Race"
                : (selectedRace?.name ?? "Race Detail")}
            </h2>

            {!isCreateMode && selectedRace && (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditing((prev) => !prev)}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold"
                >
                  {editing ? "Cancel Edit" : "Edit Race"}
                </button>
                <RaceStatusButton
                  currentStatus={selectedRace.status}
                  onStatusChange={handleStatusChange}
                  actionLoading={actionLoading}
                />
              </div>
            )}
          </div>

          {isCreateMode && showCreateForm ? (
            <RaceForm
              onClose={() => {
                setShowCreateForm(false);
                navigate(-1);
              }}
              onSubmit={handleCreate}
              actionLoading={actionLoading}
            />
          ) : editing && selectedRace ? (
            <RaceForm
              initial={{
                name: selectedRace.name,
                roundName: selectedRace.roundName ?? "",
                distanceMeters: selectedRace.distanceMeters ?? 1200,
                trackCondition: selectedRace.trackCondition ?? "good",
                scheduledAt: selectedRace.scheduledAt ?? "",
                venue: selectedRace.venue ?? "",
                laneCount: selectedRace.laneCount ?? 8,
              }}
              onClose={() => setEditing(false)}
              onSubmit={handleUpdate}
              actionLoading={actionLoading}
            />
          ) : !isCreateMode && selectedRace ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Status:</strong>{" "}
                {selectedRace.status.replaceAll("_", " ")}
              </div>
              <div>
                <strong>Round:</strong> {selectedRace.roundName ?? "-"}
              </div>
              <div>
                <strong>Distance:</strong>{" "}
                {selectedRace.distanceMeters
                  ? `${selectedRace.distanceMeters}m`
                  : "-"}
              </div>
              <div>
                <strong>Track Condition:</strong>{" "}
                {selectedRace.trackCondition ?? "-"}
              </div>
              <div>
                <strong>Venue:</strong> {selectedRace.venue ?? "-"}
              </div>
              <div>
                <strong>Lane Count:</strong> {selectedRace.laneCount ?? "-"}
              </div>
              <div>
                <strong>Scheduled:</strong>{" "}
                {selectedRace.scheduledAt
                  ? new Date(selectedRace.scheduledAt).toLocaleString()
                  : "-"}
              </div>
            </div>
          ) : !isCreateMode ? (
            <p className="text-slate-500">Race not found.</p>
          ) : null}
        </div>
      </div>
    </UserLayout>
  );
}
