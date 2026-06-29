import { Construction, Info, X } from "lucide-react";

interface RejectInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RejectInfoModal({
  isOpen,
  onClose,
}: RejectInfoModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl p-6 shadow-2xl w-full max-w-lg space-y-4 mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <Construction className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <h3 className="font-bold font-headline text-[#064E3B] text-lg">
                Reject Report Flow
              </h3>
              <p className="text-[10px] font-black uppercase text-amber-600">
                Backend Integration Pending
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-3 text-xs text-slate-700 leading-relaxed">
          <p className="font-bold text-slate-900 text-sm">
            How the Rejection Flow Works:
          </p>
          <ol className="list-decimal list-inside space-y-2">
            <li>
              <span className="font-semibold">
                Admin clicks "Reject Report"
              </span>{" "}
              — The system transitions the report status from{" "}
              <code className="bg-slate-200 px-1 rounded text-[10px]">
                referee_confirmed
              </code>{" "}
              back to{" "}
              <code className="bg-slate-200 px-1 rounded text-[10px]">
                draft
              </code>
              .
            </li>
            <li>
              <span className="font-semibold">Race status reverts</span> — The
              race moves back to{" "}
              <code className="bg-slate-200 px-1 rounded text-[10px]">
                under_review
              </code>
              , unlocking all write permissions for the assigned referee.
            </li>
            <li>
              <span className="font-semibold">
                Referee receives a notification
              </span>{" "}
              — The system sends an in-app notification informing the referee
              that their report has been returned for corrections.
            </li>
            <li>
              <span className="font-semibold">
                Referee edits and re-submits
              </span>{" "}
              — The referee can now update placements, violations, and notes,
              then re-sign and submit the corrected report.
            </li>
            <li>
              <span className="font-semibold">Admin reviews again</span> — The
              corrected report re-appears in this dashboard with{" "}
              <code className="bg-slate-200 px-1 rounded text-[10px]">
                referee_confirmed
              </code>{" "}
              status for final approval or another rejection cycle.
            </li>
          </ol>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
          <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-[10px] text-amber-800 leading-relaxed">
            <span className="font-bold">Business Rules enforced:</span>{" "}
            BR-RESULT-04 (Referee Report Finality & Edit) ensures write
            permissions are only restored upon Admin rejection. BR-TOUR-01
            (Linear State Machine) ensures only valid state transitions are
            allowed.
          </p>
        </div>

        <button
          onClick={onClose}
          className="w-full text-xs font-bold py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition cursor-pointer"
        >
          Close
        </button>
      </div>
    </div>
  );
}
