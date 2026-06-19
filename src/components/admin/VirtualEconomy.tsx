import { Settings, ShieldCheck } from "lucide-react";
import type { ToastType } from "../../pages/AdminPage";

export default function VirtualEconomy({
  addToast,
}: {
  addToast: (m: string, t?: ToastType) => void;
}) {
  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto h-full">
      <div className="border-b border-[#064E3B]/10 pb-4">
        <h2 className="text-xl font-black font-headline text-[#064E3B]">
          Prediction Engine Console
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Oversee the platform's closed-loop virtual token simulation
          (UC-AD-09).
        </p>
      </div>

      <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-rose-900 text-sm">
            Active Simulation Constraints Enforced
          </h4>
          <p className="text-xs text-rose-700 mt-1 leading-relaxed">
            BR-BET-01 strictly prohibits fiat extraction. The system
            automatically severs unauthorized external webhook or real-world
            cashout integrations.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border rounded-2xl p-4 shadow-sm text-center">
          <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
            Global Escrow Pool
          </span>
          <span className="text-2xl font-black font-label text-[#064E3B]">
            45,200
          </span>
          <p className="text-[9px] text-slate-500 mt-1">
            Tokens locked in active predictions
          </p>
        </div>
        <div className="bg-white border rounded-2xl p-4 shadow-sm text-center">
          <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
            Circulating Volume
          </span>
          <span className="text-2xl font-black font-label text-indigo-600">
            1.2M
          </span>
          <p className="text-[9px] text-slate-500 mt-1">
            Total genesis and IAP tokens
          </p>
        </div>
        <div className="bg-white border rounded-2xl p-4 shadow-sm text-center">
          <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
            House Multiplier
          </span>
          <span className="text-2xl font-black font-label text-emerald-600">
            1.0x
          </span>
          <p className="text-[9px] text-slate-500 mt-1">
            Current base reward scale
          </p>
        </div>
      </div>

      <div className="bg-white border rounded-2xl p-5 shadow-sm space-y-4">
        <h3 className="font-bold text-sm text-[#064E3B] border-b pb-2 flex items-center gap-2">
          <Settings className="w-4 h-4" /> Configure Engine Parameters
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1.5">
                Max Stake Ceiling (Per User)
              </label>
              <input
                type="number"
                defaultValue="5000"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-label outline-none focus:border-[#064E3B]"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1.5">
                Default Reward Multiplier
              </label>
              <input
                type="number"
                step="0.1"
                defaultValue="1.0"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-label outline-none focus:border-[#064E3B]"
              />
            </div>
            <button
              onClick={() =>
                addToast(
                  "Virtual economy parameters successfully updated.",
                  "success"
                )
              }
              className="bg-[#064E3B] text-white text-xs font-bold px-4 py-2 rounded-lg shadow-sm hover:bg-[#043E2F]"
            >
              Apply Configurations
            </button>
          </div>

          <div className="border-l pl-6 space-y-3">
            <h4 className="text-xs font-bold text-slate-700">
              Recent Security Audits
            </h4>
            <div className="space-y-2">
              <div className="p-2 border border-emerald-100 bg-emerald-50 rounded text-[10px] text-emerald-800 font-label">
                [12:00] Token Genesis Drop (1000) applied cleanly to verified
                Spectator 'user_881'.
              </div>
              <div className="p-2 border border-rose-100 bg-rose-50 rounded text-[10px] text-rose-800 font-label">
                [11:42] WARN: Invalid negative multiplier entry attempt
                rejected. State reverted.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
