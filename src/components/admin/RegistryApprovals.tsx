import { useState } from "react";
import type { ToastType } from "../../types/referee";
import useAdminRegistration from "../../hooks/admin/useAdminRegistration";

export default function RegistryApprovals({
  addToast,
}: {
  addToast: (m: string, t?: ToastType) => void;
}) {
  const {
    registrations,
    loading,
    error,
    pagination,
    setPagination,
    loadRegistrations,
    updateRegistration,
  } = useAdminRegistration();
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  const handleAction = async (
    regId: string,
    status: "approved" | "rejected"
  ) => {
    setProcessingIds((prev) => new Set(prev).add(regId));
    try {
      await updateRegistration(regId, { status });
      addToast(
        status === "approved"
          ? "Horse entry approved."
          : "Horse entry rejected.",
        status === "approved" ? "success" : "error"
      );
    } catch {
      addToast("Failed to update registration.", "error");
    } finally {
      setProcessingIds((prev) => {
        const next = new Set(prev);
        next.delete(regId);
        return next;
      });
    }
  };

  const pendingEntries = registrations.filter((r) => r.status === "pending");

  return (
    <div className="p-6 space-y-5 max-w-7xl mx-auto h-full">
      <div className="border-b border-[#064E3B]/10 pb-4">
        <h2 className="text-xl font-black font-headline text-[#064E3B]">
          Verification & Registration Queue
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Review plain-text profiles and tournament entry submissions
          (UC-AD-05).
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white border rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-[#064E3B] border-b pb-2">
            Pending Tournament Entries
          </h3>

          {loading && (
            <p className="text-xs text-slate-400 text-center py-8">
              Loading entries...
            </p>
          )}

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl">
              <p className="text-[10px] text-rose-700">{error}</p>
              <button
                onClick={() => loadRegistrations()}
                className="text-[10px] text-rose-600 underline mt-1"
              >
                Retry
              </button>
            </div>
          )}

          {!loading && !error && pendingEntries.length === 0 && (
            <p className="text-xs text-slate-400 text-center py-8">
              No pending entries.
            </p>
          )}

          <div className="space-y-3">
            {pendingEntries.map((reg) => {
              const isProcessing = processingIds.has(reg.id);
              return (
                <div
                  key={reg.id}
                  className="p-4 border border-slate-100 bg-slate-50 rounded-xl space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs font-bold text-slate-800">
                        Horse: {reg.horse.name} ({reg.horse.breed})
                      </p>
                      <p className="text-[10px] text-slate-500">
                        Target: {reg.tournament.name}
                      </p>
                    </div>
                    <span className="bg-amber-100 text-amber-800 text-[9px] px-2 py-0.5 rounded font-black uppercase">
                      Pending
                    </span>
                  </div>

                  <div className="text-[10px] bg-white p-2 rounded border border-slate-100 font-label text-slate-600">
                    <p>Owner ID: {reg.horse.ownerId}</p>
                    <p>
                      Submitted:{" "}
                      {new Date(reg.submittedAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      disabled={isProcessing}
                      onClick={() => handleAction(reg.id, "approved")}
                      className="flex-1 bg-[#064E3B] text-white text-xs font-bold py-1.5 rounded-lg shadow-sm hover:bg-[#043E2F] disabled:opacity-50"
                    >
                      {isProcessing ? "..." : "Approve"}
                    </button>
                    <button
                      disabled={isProcessing}
                      onClick={() => handleAction(reg.id, "rejected")}
                      className="flex-1 bg-white border border-slate-200 text-rose-600 text-xs font-bold py-1.5 rounded-lg hover:bg-slate-50 disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {pagination.totalPages > 1 && (
            <div className="flex items-center gap-2 pt-3">
              <button
                disabled={pagination.page <= 1}
                onClick={() =>
                  setPagination((prev) => ({
                    ...prev,
                    page: prev.page - 1,
                  }))
                }
                className="border rounded-lg px-3 py-1 text-xs disabled:opacity-50"
              >
                Prev
              </button>

              <span className="text-sm text-slate-600">
                {pagination.page} / {pagination.totalPages}
              </span>

              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() =>
                  setPagination((prev) => ({
                    ...prev,
                    page: prev.page + 1,
                  }))
                }
                className="border rounded-lg px-3 py-1 text-xs disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
