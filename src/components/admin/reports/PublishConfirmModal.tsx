import { CheckCircle, Loader2 } from "lucide-react";

interface PublishConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
}

export default function PublishConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  loading,
}: PublishConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center"
      onClick={() => !loading && onClose()}
    >
      <div
        className="bg-white rounded-2xl p-6 shadow-2xl w-full max-w-sm space-y-4 mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
            <CheckCircle className="w-6 h-6 text-emerald-600" />
          </div>
          <h3 className="font-bold font-headline text-[#064E3B] text-lg">
            Publish Official Results?
          </h3>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            This action will officially publish the race results, mark the race
            as <span className="font-bold">completed</span>, and resolve all
            spectator predictions. This action{" "}
            <span className="font-bold text-red-600">cannot be undone</span>.
          </p>
        </div>

        <div className="flex gap-2 pt-2">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 text-xs font-bold py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 text-xs font-bold py-2.5 rounded-xl bg-[#064E3B] text-white hover:bg-[#043E2F] transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <CheckCircle className="w-3.5 h-3.5" />
            )}
            {loading ? "Publishing..." : "Confirm Publish"}
          </button>
        </div>
      </div>
    </div>
  );
}
