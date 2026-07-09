import { useState } from "react";
import { Clock, Trophy, MapPin, CalendarDays, X } from "lucide-react";
import { useOwner, type Entry } from "../../hooks/useOwner";
import { cn } from "../../lib/utils";
import { getEntryStatusStyle } from "../../utils/statusStyles";
import { useToast } from "../../hooks/useToast";
import { ToastContainer } from "../ui/toast";

export function OwnerEntries() {
  const {
    entries,
    entriesLoading,
    entriesPage,
    setEntriesPage,
    entriesPagination,
    withdrawEntry,
  } = useOwner();

  const { toasts, addToast } = useToast(3000);
  const [withdrawing, setWithdrawing] = useState<string | null>(null);

  const handleWithdraw = async (entry: Entry) => {
    if (withdrawing) return;
    setWithdrawing(entry.entryId);
    try {
      await withdrawEntry(entry.raceId, entry.entryId);
      addToast("Entry withdrawn successfully.", "success");
    } catch (err: unknown) {
      const axiosError = err as {
        response?: { data?: { message?: string } };
      };
      addToast(
        axiosError?.response?.data?.message || "Failed to withdraw entry.",
        "error"
      );
    } finally {
      setWithdrawing(null);
    }
  };

  const statusBadgeClass = (status: string) =>
    cn(
      "rounded border px-1.5 py-0.5 text-[8px] font-black uppercase",
      getEntryStatusStyle(status)
    );

  return (
    <div className="h-full w-full overflow-y-auto bg-background custom-scrollbar">
      <ToastContainer toasts={toasts} />
      <div className="mx-auto max-w-[1400px] px-6 py-6">
        <div className="mb-6">
          <h2 className="text-3xl font-black tracking-tight text-primary font-headline">
            My Entries
          </h2>
          <p className="mt-2 text-xs text-muted-foreground">
            View and manage your race entries across all tournaments.
          </p>
        </div>

        {entriesLoading ? (
          <div className="flex items-center justify-center h-64 text-sm text-slate-400">
            <Clock className="w-5 h-5 animate-spin mr-2" /> Loading entries...
          </div>
        ) : entries.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card py-20 text-center">
            <Trophy className="mx-auto mb-3 h-8 w-8 text-muted-foreground/60" />
            <p className="text-sm font-semibold text-muted-foreground">
              No entries found.
            </p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              Enter your horses into races to see them here.
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="px-5 py-3.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      Horse
                    </th>
                    <th className="px-5 py-3.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      Race
                    </th>
                    <th className="px-5 py-3.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground hidden sm:table-cell">
                      Schedule
                    </th>
                    <th className="px-5 py-3.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground hidden md:table-cell">
                      Venue
                    </th>
                    <th className="px-5 py-3.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      Status
                    </th>
                    <th className="px-5 py-3.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {entries.map((entry) => {
                    const isScheduled = entry.raceStatus === "scheduled";
                    return (
                      <tr
                        key={entry.entryId}
                        className="hover:bg-muted/20 transition-colors"
                      >
                        <td className="px-5 py-4">
                          <p className="font-bold text-foreground">
                            {entry.horseName}
                          </p>
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-semibold text-foreground truncate max-w-[200px]">
                            {entry.raceName}
                          </p>
                        </td>
                        <td className="px-5 py-4 hidden sm:table-cell">
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                            <CalendarDays className="h-3 w-3" />
                            {new Date(entry.scheduleAt).toLocaleString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </span>
                        </td>
                        <td className="px-5 py-4 hidden md:table-cell">
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            {entry.venue}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className={statusBadgeClass(entry.entryStatus)}>
                            {entry.entryStatus}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          {isScheduled && (
                            <button
                              onClick={() => handleWithdraw(entry)}
                              disabled={withdrawing === entry.entryId}
                              className="inline-flex items-center gap-1 rounded-md border border-rose-200 bg-rose-50 text-rose-700 px-2.5 py-1 text-[10px] font-bold hover:bg-rose-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                              <X className="h-3 w-3" />
                              {withdrawing === entry.entryId
                                ? "Withdrawing..."
                                : "Withdraw"}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {entriesPagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 p-4 border-t bg-muted/20">
                <button
                  disabled={entriesPage <= 1}
                  onClick={() => setEntriesPage((p) => p - 1)}
                  className="rounded-lg border bg-card px-3 py-1 text-xs font-semibold disabled:opacity-50 hover:bg-muted transition"
                >
                  Prev
                </button>

                <span className="text-xs text-muted-foreground">
                  {entriesPage} / {entriesPagination.totalPages}
                </span>

                <button
                  disabled={entriesPage >= entriesPagination.totalPages}
                  onClick={() => setEntriesPage((p) => p + 1)}
                  className="rounded-lg border bg-card px-3 py-1 text-xs font-semibold disabled:opacity-50 hover:bg-muted transition"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
