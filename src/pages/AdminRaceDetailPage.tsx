import { Navigate } from "react-router-dom";
import { ROUTES } from "../router/routes";

export default function AdminRaceDetailPage() {
  return <Navigate to={ROUTES.ADMIN_TOURNAMENT_LIST} replace />;
}
