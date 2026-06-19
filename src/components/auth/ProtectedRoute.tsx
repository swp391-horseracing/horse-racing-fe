import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useUserProfile } from "../../hooks/useUserProfile";
import useAuth from "../../hooks/useAuth";
import { ROUTES } from "../../router/routes";

const ROLE_HOME: Record<string, string> = {
  admin: ROUTES.ADMIN_DASHBOARD,
  jockey: ROUTES.JOCKEY_DASHBOARD,
  horse_owner: ROUTES.OWNER_DASHBOARD,
  spectator: ROUTES.SPECTATOR_DASHBOARD,
};

interface ProtectedRouteProps {
  allowedRoles: string[];
}

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { user, loading } = useUserProfile();
  const navigate = useNavigate();
  const token = useAuth().getToken();

  useEffect(() => {
    if (!token) {
      navigate(ROUTES.LOGIN, { replace: true });
      return;
    }

    if (loading) return;

    if (!user || !allowedRoles.includes(user.role)) {
      const home = ROLE_HOME[user?.role || ""] || ROUTES.DASHBOARD;
      navigate(home, { replace: true });
    }
  }, [user, loading, token, allowedRoles, navigate]);

  if (!token) return null;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
      </div>
    );
  }

  if (!user || !allowedRoles.includes(user.role)) return null;

  return <Outlet />;
}
