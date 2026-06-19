import {
  ClipboardCheck,
  Calendar,
  TrendingUp,
  Lock,
  Activity,
} from "lucide-react";
import { cn } from "../../lib/utils";

export default function ControlCenterOverview({
  setActiveTab,
}: {
  setActiveTab: (t: string) => void;
}) {
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
        {[
          {
            label: "Pending Approvals",
            val: "14",
            icon: <ClipboardCheck />,
            action: "/admin/registry",
            color: "text-[#D97706]",
            bg: "bg-[#D97706]/10",
          },
          {
            label: "Active Tournaments",
            val: "3",
            icon: <Calendar />,
            action: "/admin/tournaments",
            color: "text-[#064E3B]",
            bg: "bg-[#064E3B]/10",
          },
          {
            label: "System Alerts",
            val: "2",
            icon: <Lock />,
            action: "/admin/access",
            color: "text-rose-600",
            bg: "bg-rose-100",
          },
          {
            label: "Escrowed Tokens",
            val: "1.2M",
            icon: <TrendingUp />,
            action: "/admin/economy",
            color: "text-indigo-600",
            bg: "bg-indigo-100",
          },
        ].map((stat, idx) => (
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
              <Lock className="w-4 h-4" /> Admin Audit Log
            </h3>
            <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-bold uppercase">
              Live
            </span>
          </div>
          <div className="space-y-3">
            {[
              {
                action: "Account Suspended",
                target: "Jockey_092",
                admin: "Admin_01",
                time: "10 mins ago",
              },
              {
                action: "Role Upgraded",
                target: "User_44 (To Referee)",
                admin: "Admin_01",
                time: "1 hour ago",
              },
              {
                action: "Results Published",
                target: "Race #421",
                admin: "Admin_03",
                time: "3 hours ago",
              },
            ].map((log, i) => (
              <div
                key={i}
                className="flex justify-between items-center text-xs p-2.5 bg-slate-50 rounded-xl border border-slate-100"
              >
                <div>
                  <p className="font-bold text-slate-800">{log.action}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Target: {log.target} • By {log.admin}
                  </p>
                </div>
                <span className="text-[9px] font-label text-slate-400 font-bold">
                  {log.time}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-[#064E3B]/10 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-2">
            <h3 className="font-bold font-headline text-md text-[#064E3B] flex items-center gap-2">
              <Activity className="w-4 h-4" /> Required Actions
            </h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center p-3 border border-amber-200 bg-amber-50 rounded-xl">
              <div>
                <p className="text-xs font-bold text-amber-800">
                  Pending Results Publication
                </p>
                <p className="text-[10px] text-amber-600 mt-0.5">
                  Race #112 concluded. Referee report waiting for sign-off.
                </p>
              </div>
              <button
                onClick={() => setActiveTab("/admin/tournaments")}
                className="text-[10px] font-bold bg-amber-600 text-white px-3 py-1.5 rounded-lg shadow-sm hover:bg-amber-700"
              >
                Review
              </button>
            </div>

            <div className="flex justify-between items-center p-3 border border-indigo-200 bg-indigo-50 rounded-xl">
              <div>
                <p className="text-xs font-bold text-indigo-800">
                  7 Registration Profiles Pending
                </p>
                <p className="text-[10px] text-indigo-600 mt-0.5">
                  Horse Owners and Jockeys awaiting verification.
                </p>
              </div>
              <button
                onClick={() => setActiveTab("/admin/registry")}
                className="text-[10px] font-bold bg-indigo-600 text-white px-3 py-1.5 rounded-lg shadow-sm hover:bg-indigo-700"
              >
                Verify
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
