import { Calendar, Flag } from "lucide-react";
import type { ToastType } from "../../pages/AdminPage";

export default function TournamentRaceManager({
  addToast,
}: {
  addToast: (m: string, t?: ToastType) => void;
}) {
  return (
    <div className="p-6 space-y-5 max-w-7xl mx-auto h-full">
      <div className="border-b border-[#064E3B]/10 pb-4 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black font-headline text-[#064E3B]">
            Tournament & Track Operations
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Manage schedules, assign referees, and publish results.
          </p>
        </div>
        <button className="bg-[#064E3B] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm hover:bg-[#043E2F] flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5" /> Create Tournament
        </button>
      </div>

      <div className="bg-gradient-to-r from-amber-50 to-amber-100/50 border border-amber-200 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h3 className="font-bold text-amber-900 text-sm flex items-center gap-2">
            <Flag className="w-4 h-4" /> Results Pending Publication
          </h3>
          <p className="text-[11px] text-amber-700 mt-1">
            Referee 'Ref_Smith' has submitted the final report for Race #42
            (Concluded).
          </p>
        </div>
        <button
          onClick={() =>
            addToast(
              "Results Published. Virtual Economy updated (BR-BET-04).",
              "success"
            )
          }
          className="bg-amber-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md hover:bg-amber-700 shrink-0"
        >
          Publish Official Results
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-[#064E3B] border-b pb-2">
            Upcoming Scheduled Races
          </h3>

          <div className="p-4 border border-slate-200 rounded-xl space-y-3 relative overflow-hidden">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-bold text-[#064E3B] text-sm">
                  Championship Stakes - Round 1
                </p>
                <p className="text-[10px] text-slate-500">
                  Scheduled: 14:00 PM Tomorrow
                </p>
              </div>
              <span className="bg-slate-100 text-slate-500 border border-slate-200 px-2 py-0.5 text-[9px] font-black uppercase rounded">
                Scheduled
              </span>
            </div>

            <div className="bg-slate-50 p-2.5 rounded border border-slate-100 flex justify-between items-center text-xs">
              <span className="font-bold text-slate-600">Starting Lanes:</span>
              <span className="text-emerald-600 font-bold font-label">
                8/8 Filled
              </span>
            </div>

            <div className="flex items-center gap-3 border-t border-slate-100 pt-3">
              <div className="flex-1">
                <label className="text-[9px] uppercase font-bold text-slate-400 block mb-1">
                  Assigned Referee
                </label>
                <select className="w-full bg-slate-50 border border-slate-200 text-xs p-2 rounded-lg outline-none font-semibold text-slate-700">
                  <option>Ref_Smith (Active)</option>
                  <option>Ref_Jones (Active)</option>
                </select>
              </div>
              <button
                onClick={() =>
                  addToast("Referee assigned successfully.", "success")
                }
                className="mt-4 bg-[#064E3B]/10 text-[#064E3B] hover:bg-[#064E3B]/20 text-[10px] font-bold px-3 py-2 rounded-lg transition"
              >
                Update
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white border rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-[#064E3B] border-b pb-2">
            Active Tournaments
          </h3>

          <div className="p-4 border border-slate-100 bg-slate-50 rounded-xl space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-bold text-slate-800 text-sm">
                  Elite Turf Season
                </p>
                <p className="text-[10px] text-slate-500">
                  Max Capacity: 120 Horses
                </p>
              </div>
              <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 text-[9px] font-black uppercase rounded">
                Registration Open
              </span>
            </div>
            <p className="text-xs text-slate-600 font-medium">
              Currently accepting Owner submissions. 45/120 slots filled.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() =>
                  addToast(
                    "Tournament lifecycle shifted to Registration Closed.",
                    "info"
                  )
                }
                className="text-xs font-bold bg-white border border-slate-200 text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-100"
              >
                Close Registration
              </button>
              <button
                onClick={() =>
                  addToast("Entering parameter edit mode.", "info")
                }
                className="text-xs font-bold bg-white border border-slate-200 text-[#064E3B] px-3 py-1.5 rounded-lg hover:bg-slate-100"
              >
                Edit Params
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
