import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import UserLayout from "../layouts/UserLayout";
import useAdminTournament from "../hooks/useAdminTournament";
import TournamentDetail from "../components/admin/tournament/TournamentDetail";

export default function AdminTournamentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    getTournamentDetail,
    selectedTournament,
    loading,
    updateTournament,
    updateTournamentStatus,
  } = useAdminTournament();

  useEffect(() => {
    if (!id) return;
    void getTournamentDetail(id);
  }, [id, getTournamentDetail]);

  if (loading || !selectedTournament) {
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

        <TournamentDetail
          tournament={selectedTournament}
          onUpdate={updateTournament}
          onStatusChange={updateTournamentStatus}
        />
      </div>
    </UserLayout>
  );
}
