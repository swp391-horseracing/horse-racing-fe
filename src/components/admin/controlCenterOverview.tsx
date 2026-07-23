import { useState, useEffect } from "react";
import {
  ClipboardCheck,
  Calendar,
  Lock,
  Users,
  Loader2,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { AdminService } from "../../services/AdminService";
import { TournamentService } from "../../services/TournamentService";

export default function ControlCenterOverview({
  setActiveTab,
}: {
  setActiveTab: (t: string) => void;
}) {
  const [data, setData] = useState<{
    pendingApprovals: number;
    activeTournaments: number;
    lockedAccounts: number;
    totalUsers: number;
    pendingRegistrations: {
      id: string;
      horse: { name: string; breed: string };
      tournament: { name: string };
      submittedAt: string;
    }[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchDashboard() {
      try {
        const [regCountRes, tourRes, userRes, lockedRes, pendingRegs] =
          await Promise.all([
            AdminService.getRegistrations({ status: "pending", limit: 1 }),
            TournamentService.getTournaments({ status: "ongoing", limit: 1 }),
            AdminService.getUsers(undefined, undefined, undefined, 1, 1),
            AdminService.getUsers(undefined, "locked", undefined, 1, 1),
            AdminService.getRegistrations({ status: "pending", limit: 5 }),
          ]);

        if (cancelled) return;

        setData({
          pendingApprovals: regCountRes.pagination?.total ?? 0,
          activeTournaments: tourRes.pagination?.total ?? 0,
          lockedAccounts: lockedRes.pagination?.total ?? 0,
          totalUsers: userRes.pagination?.total ?? 0,
          pendingRegistrations: pendingRegs.data ?? [],
        });
      } catch {
        if (!cancelled) setError("Failed to load dashboard data");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchDashboard();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="p-6 space-y-6 max-w-7xl mx-auto h-full">
        <div className="border-b border-[#064E3B]/10 pb-4">
          <h2 className="text-2xl font-black font-headline text-[#064E3B] tracking-tight">
            System Control Panel
          </h2>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            High-level overview of platform operations, security logs, and
            pending tasks.
          </p>
        </div>
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-[#064E3B]" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 space-y-6 max-w-7xl mx-auto h-full">
        <div className="border-b border-[#064E3B]/10 pb-4">
          <h2 className="text-2xl font-black font-headline text-[#064E3B] tracking-tight">
            System Control Panel
          </h2>
        </div>
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-xs text-rose-700">
          {error || "Failed to load dashboard data."}
        </div>
      </div>
    );
  }

  const stats = [
    {
      label: "Pending Approvals",
      val: String(data.pendingApprovals),
      icon: <ClipboardCheck />,
      action: "/admin/registry",
      color: "text-[#D97706]",
      bg: "bg-[#D97706]/10",
    },
    {
      label: "Active Tournaments",
      val: String(data.activeTournaments),
      icon: <Calendar />,
      action: "/admin/tournaments",
      color: "text-[#064E3B]",
      bg: "bg-[#064E3B]/10",
    },
    {
      label: "Flagged Accounts",
      val: String(data.lockedAccounts),
      icon: <Lock />,
      action: "/admin/access",
      color: "text-rose-600",
      bg: "bg-rose-100",
    },
    {
      label: "Total Users",
      val: String(data.totalUsers),
      icon: <Users />,
      action: "/admin/access",
      color: "text-indigo-600",
      bg: "bg-indigo-100",
    },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto h-full">
      <div className="border-b border-[#064E3B]/10 pb-4">
        <h2 className="text-2xl font-black font-headline text-[#064E3B] tracking-tight">
          System Control Panel
        </h2>
        <p className="text-xs text-slate-500 font-semibold mt-1">
          High-level overview of platform operations, security logs, and pending
          tasks.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            onClick={() => setActiveTab(stat.action)}
            className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition cursor-pointer relative overflow-hidden group"
          >
            <div
              className={cn(
                "absolute right-0 bottom-0 translate-y-2 translate-x-2 opacity-10 group-hover:scale-110 duration-500",
                stat.color
              )}
            >
              {stat.icon}
            </div>
            <span className="text-[10px] text-slate-400 uppercase font-black block">
              {stat.label}
            </span>
            <span
              className={cn(
                "text-2xl font-black font-headline mt-1.5 block tracking-tight",
                stat.color
              )}
            >
              {stat.val}
            </span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-[#064E3B]/10 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-2 flex justify-between items-center">
            <h3 className="font-bold font-headline text-md text-[#064E3B] flex items-center gap-2">
              <ClipboardCheck className="w-4 h-4" /> Pending Registrations
            </h3>
            <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-bold uppercase">
              {data.pendingApprovals} pending
            </span>
          </div>
          <div className="space-y-3">
            {data.pendingRegistrations.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">
                No pending registrations.
              </p>
            ) : (
              data.pendingRegistrations.slice(0, 5).map((reg) => (
                <div
                  key={reg.id}
                  className="flex justify-between items-center text-xs p-2.5 bg-slate-50 rounded-xl border border-slate-100"
                >
                  <div>
                    <p className="font-bold text-slate-800">
                      {reg.horse?.name ?? "Unknown Horse"}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Tournament: {reg.tournament?.name ?? "N/A"}
                    </p>
                  </div>
                  <span className="text-[9px] font-label text-slate-400 font-bold">
                    {new Date(reg.submittedAt).toLocaleDateString("en-GB")}
                  </span>
                </div>
              ))
            )}
          </div>
          {data.pendingApprovals > 0 && (
            <button
              onClick={() => setActiveTab("/admin/registry")}
              className="text-[10px] font-bold text-[#064E3B] underline hover:no-underline"
            >
              View all {data.pendingApprovals} pending registrations →
            </button>
          )}
        </div>

        <div className="bg-white border border-[#064E3B]/10 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-2">
            <h3 className="font-bold font-headline text-md text-[#064E3B] flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Required Actions
            </h3>
          </div>
          <div className="space-y-2">
            {data.pendingApprovals > 0 && (
              <div className="flex justify-between items-center p-3 border border-amber-200 bg-amber-50 rounded-xl">
                <div>
                  <p className="text-xs font-bold text-amber-800">
                    {data.pendingApprovals} Registration{" "}
                    {data.pendingApprovals === 1 ? "Profile" : "Profiles"}{" "}
                    Pending
                  </p>
                  <p className="text-[10px] text-amber-600 mt-0.5">
                    Horse owners awaiting approval.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab("/admin/registry")}
                  className="text-[10px] font-bold bg-amber-600 text-white px-3 py-1.5 rounded-lg shadow-sm hover:bg-amber-700 shrink-0"
                >
                  Review
                </button>
              </div>
            )}

            {data.activeTournaments > 0 && (
              <div className="flex justify-between items-center p-3 border border-emerald-200 bg-emerald-50 rounded-xl">
                <div>
                  <p className="text-xs font-bold text-emerald-800">
                    {data.activeTournaments} Active{" "}
                    {data.activeTournaments === 1
                      ? "Tournament"
                      : "Tournaments"}
                  </p>
                  <p className="text-[10px] text-emerald-600 mt-0.5">
                    Ongoing tournaments need monitoring.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab("/admin/tournaments")}
                  className="text-[10px] font-bold bg-emerald-600 text-white px-3 py-1.5 rounded-lg shadow-sm hover:bg-emerald-700 shrink-0"
                >
                  View
                </button>
              </div>
            )}

            {data.lockedAccounts > 0 && (
              <div className="flex justify-between items-center p-3 border border-rose-200 bg-rose-50 rounded-xl">
                <div>
                  <p className="text-xs font-bold text-rose-800">
                    {data.lockedAccounts} Flagged{" "}
                    {data.lockedAccounts === 1 ? "Account" : "Accounts"}
                  </p>
                  <p className="text-[10px] text-rose-600 mt-0.5">
                    Locked accounts requiring admin review.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab("/admin/access")}
                  className="text-[10px] font-bold bg-rose-600 text-white px-3 py-1.5 rounded-lg shadow-sm hover:bg-rose-700 shrink-0"
                >
                  Review
                </button>
              </div>
            )}

            {data.pendingApprovals === 0 &&
              data.activeTournaments === 0 &&
              data.lockedAccounts === 0 && (
                <p className="text-xs text-slate-400 text-center py-6">
                  All clear — no pending actions.
                </p>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}
