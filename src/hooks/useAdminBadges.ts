import { useState, useEffect } from "react";
import { AdminService } from "../services/AdminService";

export function useAdminBadges(currentRole: string, pathname: string) {
  const [pendingRegistrationsCount, setPendingRegistrationsCount] = useState(0);

  useEffect(() => {
    if (currentRole !== "Admin") return;
    let cancelled = false;

    // Fetch pending tournament registrations
    AdminService.getRegistrations({ status: "pending", limit: 1 })
      .then((res) => {
        if (!cancelled && res.pagination) {
          setPendingRegistrationsCount(res.pagination.total);
        }
      })
      .catch((err) => {
        console.error("Failed to load pending registrations:", err);
      });

    return () => {
      cancelled = true;
    };
  }, [currentRole, pathname]);

  return {
    pendingRegistrationsCount,
  };
}
