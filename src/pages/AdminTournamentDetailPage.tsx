import { Navigate } from "react-router-dom";
import { ROUTES } from "../router/routes";

export default function AdminTournamentDetailPage() {
  return <Navigate to={ROUTES.ADMIN_TOURNAMENT_LIST} replace />;
}
