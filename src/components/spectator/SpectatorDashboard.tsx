import {
  Coins,
  HelpCircle,
  Trophy,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { ROUTES } from "../../router/routes.tsx";

interface SpectatorDashboardProps {
  setActiveTab?: (tab: string) => void;
}

export function SpectatorDashboard({ setActiveTab }: SpectatorDashboardProps) {
  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-8 max-w-7xl w-full mx-auto font-body">
      {/* Header Section */}
      <div>
        <h2 className="font-headline text-3xl text-[#064E3B] mb-2">
          Spectator Overview
        </h2>
        <p className="text-sm text-slate-500 font-medium">
          Welcome back. Here is your current status and racing activity.
        </p>
      </div>

      {/* Bento Grid Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Tokens Card */}
        <div className="bg-white border border-[#064E3B]/10 rounded-2xl p-6 relative overflow-hidden group hover:shadow-lg transition-all duration-300 shadow-sm">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-[#064E3B]/5 rounded-full blur-xl group-hover:bg-[#064E3B]/10 transition-colors"></div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-label text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Tokens
            </h3>
            <span className="p-2 rounded-xl bg-[#064E3B]/10 text-[#064E3B]">
              <Coins className="w-5 h-5" />
            </span>
          </div>
          <div className="font-headline text-4xl font-black text-[#064E3B] flex items-baseline gap-2">
            1,250
            <span className="text-sm font-bold font-body text-slate-500">
              TKNS
            </span>
          </div>
        </div>

        {/* Active Predictions Card */}
        <div className="bg-white border border-[#064E3B]/10 rounded-2xl p-6 relative overflow-hidden group hover:shadow-lg transition-all duration-300 shadow-sm">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-[#EAB308]/5 rounded-full blur-xl group-hover:bg-[#EAB308]/10 transition-colors"></div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-label text-xs font-bold text-slate-400 uppercase tracking-wider">
              Active Predictions
            </h3>
            <span className="p-2 rounded-xl bg-[#EAB308]/10 text-[#EAB308]">
              <HelpCircle className="w-5 h-5" />
            </span>
          </div>
          <div
            className="font-headline text-4xl font-black text-[#064E3B] hover:underline cursor-pointer"
            onClick={() => setActiveTab?.(ROUTES.SPECTATOR_PREDICTIONS)}
          >
            2
          </div>
        </div>

        {/* Recent Wins Card */}
        <div className="bg-white border border-[#064E3B]/10 rounded-2xl p-6 relative overflow-hidden group hover:shadow-lg transition-all duration-300 shadow-sm">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-[#064E3B]/5 rounded-full blur-xl group-hover:bg-[#064E3B]/10 transition-colors"></div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-label text-xs font-bold text-slate-400 uppercase tracking-wider">
              Recent Wins
            </h3>
            <span className="p-2 rounded-xl bg-[#064E3B]/10 text-[#064E3B]">
              <Trophy className="w-5 h-5" />
            </span>
          </div>
          <div className="font-headline text-4xl font-black text-[#064E3B]">
            4
            <span className="text-sm font-bold font-body text-slate-500 ml-2">
              this week
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Links Section */}
        <div className="lg:col-span-1 space-y-6">
          <h3 className="font-bold font-headline text-xl text-[#064E3B] border-b border-slate-100 pb-2">
            Quick Links
          </h3>

          <Link
            to={ROUTES.FEED}
            className="w-full block bg-white border border-slate-100 rounded-xl p-4 hover:border-[#064E3B]/30 hover:shadow-md transition-all group shadow-sm"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-700 group-hover:text-[#064E3B] transition-colors">
                Top Live Races
              </span>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#064E3B] group-hover:translate-x-1 transition-all" />
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Join the action and telemetry in real-time.
            </p>
          </Link>

          <Link
            to={ROUTES.TOURNAMENTS}
            className="block bg-white border border-slate-100 rounded-xl p-4 hover:border-[#064E3B]/30 hover:shadow-md transition-all group shadow-sm"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-700 group-hover:text-[#064E3B] transition-colors">
                Upcoming Tournaments
              </span>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#064E3B] group-hover:translate-x-1 transition-all" />
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Browse and register for major upcoming events.
            </p>
          </Link>
        </div>

        {/* Recent Results Section */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="font-bold font-headline text-xl text-[#064E3B] border-b border-slate-100 pb-2">
            Recent Results
          </h3>
          <div className="space-y-3">
            {/* Race Card 1 */}
            <div className="bg-white border border-slate-100 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative shadow-sm hover:border-[#064E3B]/10 duration-200">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#064E3B]/30 rounded-l-xl"></div>
              <div className="pl-2">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-label text-[10px] font-bold px-2 py-0.5 bg-slate-100 rounded text-slate-550">
                    RACE 12
                  </span>
                  <span className="font-bold font-headline text-[#064E3B] text-base">
                    Dubai World Cup
                  </span>
                </div>
                <p className="text-xs text-slate-600 font-medium">
                  1st: Thunderstrike | 2nd: Midnight Runner
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="px-3 py-1 bg-emerald-50 border border-emerald-250 text-emerald-800 rounded-full font-label text-[10px] font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Confirmed
                </span>
              </div>
            </div>

            {/* Race Card 2 */}
            <div className="bg-white border border-slate-100 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative shadow-sm hover:border-[#064E3B]/10 duration-200">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#064E3B]/30 rounded-l-xl"></div>
              <div className="pl-2">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-label text-[10px] font-bold px-2 py-0.5 bg-slate-100 rounded text-slate-550">
                    RACE 11
                  </span>
                  <span className="font-bold font-headline text-[#064E3B] text-base">
                    Ascot Gold Cup
                  </span>
                </div>
                <p className="text-xs text-slate-600 font-medium">
                  1st: Golden Boy | 2nd: Silver Streak
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="px-3 py-1 bg-emerald-50 border border-emerald-250 text-emerald-800 rounded-full font-label text-[10px] font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Confirmed
                </span>
              </div>
            </div>

            {/* Race Card 3 */}
            <div className="bg-white border border-slate-100 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative shadow-sm hover:border-[#064E3B]/10 duration-200">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#064E3B]/30 rounded-l-xl"></div>
              <div className="pl-2">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-label text-[10px] font-bold px-2 py-0.5 bg-slate-100 rounded text-slate-550">
                    RACE 10
                  </span>
                  <span className="font-bold font-headline text-[#064E3B] text-base">
                    Kentucky Derby Prep
                  </span>
                </div>
                <p className="text-xs text-slate-600 font-medium">
                  1st: Secretariat's Heir | 2nd: Bourbon Legend
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="px-3 py-1 bg-emerald-50 border border-emerald-250 text-emerald-800 rounded-full font-label text-[10px] font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Confirmed
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
