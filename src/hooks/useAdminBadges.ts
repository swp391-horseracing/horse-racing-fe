import { useState, useEffect } from "react";
import { AdminService } from "../services/AdminService";

export function useAdminBadges(currentRole: string, pathname: string) {
  const [pendingReportsCount, setPendingReportsCount] = useState(0);
  const [pendingRegistrationsCount, setPendingRegistrationsCount] = useState(0);

  useEffect(() => {
    if (currentRole === "Admin") {
      // Fetch pending race reports
      AdminService.getReports({ resultStatus: "referee_confirmed", limit: 1 })
        .then((res) => {
          if (res.pagination) {
            setPendingReportsCount(res.pagination.total);
          }
        })
        .catch(() => {});

      // Fetch pending tournament registrations
      AdminService.getRegistrations({ status: "pending", limit: 1 })
        .then((res) => {
          if (res.pagination) {
            setPendingRegistrationsCount(res.pagination.total);
          }
        })
        .catch(() => {});
    }
  }, [currentRole, pathname]);

  return {
    pendingReportsCount,
    pendingRegistrationsCount,
  };
}
