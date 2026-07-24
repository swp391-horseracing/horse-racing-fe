import UserLayout from "../layouts/UserLayout";
import TournamentRaceManager from "../components/admin/TournamentRaceManager";
import { useToast } from "../hooks/useToast";
import { ToastContainer } from "../components/ui/toast";

export default function AdminTournamentDetailPage() {
  const { toasts, addToast } = useToast();

  return (
    <UserLayout activeKey="/admin/tournaments">
      <div className="h-full w-full flex flex-col overflow-hidden">
        <ToastContainer toasts={toasts} />
        <TournamentRaceManager addToast={addToast} />
      </div>
    </UserLayout>
  );
}
