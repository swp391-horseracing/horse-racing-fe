import { ROUTES } from "../../router/routes.tsx";
import { Trophy, TrendingUp, Mail, Award, Calendar } from "lucide-react";
import type { Invitation } from "../../types/invitation.ts";

export interface JockeyHorse {
  id: string | number;
  name: string;
  breed?: string;
  gender?: string;
  owner?: string;
  ownerId?: string;
  status?: string;
  performance?: string;
}

interface DashboardOverviewProps {
  data: Invitation[];
  setActiveTab: (k: string) => void;
  horseList: JockeyHorse[];
}

export function JockeyDashboardOverview({
  data,
  setActiveTab,
  horseList,
}: DashboardOverviewProps) {
  const pendingInvites = data.filter((inv) => inv.status === "pending");
  const activeRaces = data.filter((inv) => inv.status === "accepted");

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-7xl w-full mx-auto font-body h-full">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-[#064E3B]/10 rounded-2xl p-5 hover:shadow-lg transition-all duration-300 relative group overflow-hidden shadow-sm">
          <div className="absolute right-0 bottom-0 translate-y-4 translate-x-4 opacity-5 group-hover:scale-110 duration-500 text-[#064E3B]">
            <Trophy className="w-12 h-12 text-current" />
          </div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-555 font-bold text-xs tracking-wider uppercase">
              Jockey Win Rate
            </span>
            <span className="p-2 rounded-xl bg-[#064E3B]/10 text-[#064E3B]">
              <Trophy className="w-4 h-4 text-current" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-headline text-[#064E3B] tracking-tight">
              33.3%
            </span>
            <span className="text-xs text-emerald-700 font-bold flex items-center gap-0.5">
              ▲ +2.4%
            </span>
          </div>
          <p className="text-xs text-slate-555 mt-2 font-body font-medium">
            Ranked #14 of 120 Pro Jockeys
          </p>
        </div>

        <div className="bg-white border border-[#064E3B]/10 rounded-2xl p-5 hover:shadow-lg transition-all duration-300 relative group overflow-hidden shadow-sm">
          <div className="absolute right-0 bottom-0 translate-y-4 translate-x-4 opacity-5 group-hover:scale-110 duration-500 text-[#D97706]">
            <TrendingUp className="w-12 h-12 text-current" />
          </div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-555 font-bold text-xs tracking-wider uppercase">
              Total Earnings
            </span>
            <span className="p-2 rounded-xl bg-[#D97706]/10 text-[#D97706]">
              <TrendingUp className="w-4 h-4 text-current" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-headline text-[#064E3B] tracking-tight">
              $142,500
            </span>
            <span className="text-xs text-slate-500 font-semibold font-body">
              (70% Owner split)
            </span>
          </div>
          <p className="text-xs text-slate-505 mt-2 font-body font-medium">
            84 Career Turf Starts (28 Wins, 18 Seconds)
          </p>
        </div>

        <div className="bg-white border border-[#064E3B]/10 rounded-2xl p-5 hover:shadow-lg transition-all duration-300 relative group overflow-hidden shadow-sm">
          <div className="absolute right-0 bottom-0 translate-y-4 translate-x-4 opacity-5 group-hover:scale-110 duration-500 text-[#064E3B]">
            <Mail className="w-12 h-12 text-current" />
          </div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-555 font-bold text-xs tracking-wider uppercase">
              Ride Invitations
            </span>
            <span className="p-2 rounded-xl bg-[#064E3B]/10 text-[#064E3B]">
              <Mail className="w-4 h-4 text-current" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-headline text-[#064E3B] tracking-tight">
              {pendingInvites.length} Pending
            </span>
            {pendingInvites.length > 0 && (
              <span className="animate-pulse h-2.5 w-2.5 rounded-full bg-[#D97706]"></span>
            )}
          </div>
          <p
            className="text-xs text-[#D97706] font-bold mt-2 hover:underline cursor-pointer"
            onClick={() => setActiveTab(ROUTES.JOCKEY_INVITATIONS)}
          >
            Inspect pending owner offers →
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-[#064E3B]/10 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold font-headline text-lg text-[#064E3B]">
                Win Rate Performance Trend
              </h3>
              <p className="text-xs text-slate-555 font-medium">
                Turf win percentages for the past 5 months
              </p>
            </div>
            <div className="flex gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold bg-[#064E3B]/10 text-[#064E3B] border border-[#064E3B]/20">
                2026 Season
              </span>
            </div>
          </div>

          <div className="h-64 relative flex flex-col justify-between">
            <div className="absolute inset-0 grid grid-rows-4 pointer-events-none">
              {[75, 50, 25, 0].map((val) => (
                <div
                  key={val}
                  className="border-t border-slate-100 text-[9px] font-label text-slate-400 pt-1 flex items-start"
                >
                  {val}%
                </div>
              ))}
            </div>
            <div className="w-full h-48 mt-4 relative">
              <svg
                className="w-full h-full overflow-visible"
                viewBox="0 0 600 200"
              >
                <defs>
                  <linearGradient
                    id="chartGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#064E3B" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#064E3B" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  d="M 40,180 L 40,150 Q 160,130 280,95 T 520,40 L 520,180 Z"
                  fill="url(#chartGradient)"
                />
                <path
                  d="M 40,150 Q 160,130 280,95 T 520,40"
                  fill="none"
                  stroke="#064E3B"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
                <circle
                  cx="40"
                  cy="150"
                  r="6"
                  fill="#EAB308"
                  stroke="#064E3B"
                  strokeWidth="2.5"
                />
                <circle
                  cx="160"
                  cy="130"
                  r="6"
                  fill="#EAB308"
                  stroke="#064E3B"
                  strokeWidth="2.5"
                />
                <circle
                  cx="280"
                  cy="95"
                  r="6"
                  fill="#EAB308"
                  stroke="#064E3B"
                  strokeWidth="2.5"
                />
                <circle
                  cx="400"
                  cy="68"
                  r="6"
                  fill="#EAB308"
                  stroke="#064E3B"
                  strokeWidth="2.5"
                />
                <circle
                  cx="520"
                  cy="40"
                  r="6"
                  fill="#EAB308"
                  stroke="#064E3B"
                  strokeWidth="2.5"
                />
              </svg>
            </div>
            <div className="flex justify-between text-xs text-slate-505 font-bold px-4">
              <span>Jan</span>
              <span>Feb</span>
              <span>Mar</span>
              <span>Apr</span>
              <span>May (Now)</span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-[#064E3B]/10 rounded-2xl p-5 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <h3 className="font-bold text-md font-headline text-[#064E3B] flex items-center gap-2">
                <span className="text-[#D97706]">
                  <Award className="w-5 h-5 text-current" />
                </span>{" "}
                Registry Standings
              </h3>
              <span className="text-[9px] font-label text-slate-400 font-bold uppercase">
                Performance
              </span>
            </div>

            <div className="space-y-2.5">
              {horseList.map((horse: JockeyHorse, idx: number) => (
                <div
                  key={horse.id}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:border-slate-200 transition"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-xs font-black w-5 text-center block font-label text-slate-400">
                      #{idx + 1}
                    </span>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs truncate text-slate-700 font-semibold">
                        {horse.name}
                      </span>
                      <span className="text-[10px] text-slate-455 truncate">
                        {horse.breed || "Thoroughbred"} •{" "}
                        {horse.gender || "Gelding"}
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-[#064E3B] font-label block">
                      {horse.owner || horse.ownerId}
                    </span>
                    <span className="text-[9px] text-slate-400 font-semibold block">
                      {horse.status || "Active"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white border border-[#064E3B]/10 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <h3 className="font-bold font-headline text-[#064E3B] text-md flex items-center gap-2">
              <span className="text-[#064E3B]">
                <Calendar className="w-4 h-4 text-current" />
              </span>{" "}
              Your Confirmed Agenda
            </h3>
            <span className="rounded bg-[#064E3B]/10 text-[#064E3B] font-bold px-2.5 py-0.5 text-[9px] uppercase border border-[#064E3B]/20 font-label">
              {activeRaces.length} Confirmed
            </span>
          </div>

          <div className="space-y-3">
            {activeRaces.length === 0 ? (
              <div className="text-center py-8 text-slate-455 text-xs">
                No confirmed active races. Navigate to "Invitations" to accept
                incoming offers.
              </div>
            ) : (
              activeRaces.map((r) => (
                <div
                  key={r.id}
                  className="p-3.5 rounded-xl border border-slate-100 bg-[#F4F6F5]/40 flex items-center justify-between gap-4 shadow-sm hover:border-[#064E3B]/10 duration-200"
                >
                  <div>
                    <p className="font-bold text-[#064E3B] text-sm font-headline">
                      Horse #{r.horseId}
                    </p>
                    <p className="text-xs text-slate-555 font-medium mt-0.5">
                      Race #{r.raceId}
                    </p>
                    <span className="text-[10px] text-[#D97706] font-bold mt-1 block">
                      Owner #{r.ownerId}
                    </span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="inline-block text-[9px] bg-slate-150 border border-slate-200 text-slate-655 font-black px-2 py-0.5 rounded-full mb-1 font-label">
                      Gate 5 • Turf
                    </span>
                    <p className="text-xs text-slate-600 font-black font-label">
                      {r.invitedAt}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
