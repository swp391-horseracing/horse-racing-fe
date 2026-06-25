import { useEffect, useState } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Coins,
  Target,
  Clock,
  MapPin,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePredictions } from "../../hooks/usePredictions";
import { useRaces } from "../../hooks/useRaces";
import { RaceService } from "../../services/RaceService";
import { PlacePredictionModal } from "./PlacePredictionModal";
import type { PredictionStatus } from "../../types/prediction";
import type { RaceEntry, RaceListItem } from "../../types/race";
import { cn } from "../../lib/utils";
import { useToast } from "../../hooks/useToast";
import { ToastContainer } from "../../components/ui/toast";

type SubTab = "my-predictions" | "open-races";

const FILTER_TABS: { key: PredictionStatus | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "correct", label: "Correct" },
  { key: "incorrect", label: "Incorrect" },
];

const POSITION_LABELS: Record<number, string> = {
  1: "1st",
  2: "2nd",
  3: "3rd",
};

const STATUS_BADGE: Record<string, { label: string; class: string }> = {
  pending: {
    label: "Pending",
    class: "bg-slate-50 border-slate-200 text-slate-500",
  },
  correct: {
    label: "Correct",
    class: "bg-emerald-50 border-emerald-200 text-emerald-800",
  },
  incorrect: {
    label: "Incorrect",
    class: "bg-rose-50 border-rose-200 text-rose-800",
  },
};

function getStatus(isCorrect: boolean | null): PredictionStatus {
  if (isCorrect === null) return "pending";
  return isCorrect ? "correct" : "incorrect";
}

const formatDateTime = (dateString: string | undefined) => {
  if (!dateString) return "TBC";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Invalid Date";
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

function OpenRacesTab() {
  const navigate = useNavigate();
  const { races, loading, loadRacesByMonth } = useRaces();
  const [selectedRace, setSelectedRace] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [entries, setEntries] = useState<RaceEntry[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [loadingRaceId, setLoadingRaceId] = useState<string | null>(null);
  const [entriesCache, setEntriesCache] = useState<Record<string, RaceEntry[]>>(
    {}
  );

  const { toasts, addToast } = useToast();

  useEffect(() => {
    const now = new Date();
    loadRacesByMonth(now.getFullYear(), now.getMonth() + 1);
  }, [loadRacesByMonth]);

  const openRaces = races.filter(
    (r: RaceListItem) => r.status === "scheduled" || r.status === "pre_race"
  );

  useEffect(() => {
    if (openRaces.length === 0) return;
    let cancelled = false;

    const prefetch = async () => {
      const cache: Record<string, RaceEntry[]> = {};
      await Promise.all(
        openRaces.map(async (race: RaceListItem) => {
          try {
            const entriesData = await RaceService.getRaceEntries(race.id);
            if (!cancelled)
              cache[race.id] = (entriesData as any[]).map((e: any) => ({
                id: e.entryId,
                horseId: e.horse?.id || "",
                name: e.horse?.name || "",
                laneNumber: String(e.laneNumber),
                weightKg: "",
                entryStatus: e.entryStatus,
                jockeyName: e.jockey?.name || "",
                clothNumber: 0,
              }));
          } catch {
            // skip
          }
        })
      );
      if (!cancelled) setEntriesCache(cache);
    };

    prefetch();
    return () => {
      cancelled = true;
    };
  }, [openRaces]);

  const handlePredict = async (raceId: string, raceName: string) => {
    setLoadingRaceId(raceId);
    setSelectedRace({ id: raceId, name: raceName });
    const cached = entriesCache[raceId];
    if (cached) {
      setEntries(cached);
      setModalOpen(true);
      setLoadingRaceId(null);
      return;
    }
    try {
      const entriesData = await RaceService.getRaceEntries(raceId);
      const mapped = (entriesData as any[]).map((e: any) => ({
        id: e.entryId,
        horseId: e.horse?.id || "",
        name: e.horse?.name || "",
        laneNumber: String(e.laneNumber),
        weightKg: "",
        entryStatus: e.entryStatus,
        jockeyName: e.jockey?.name || "",
        clothNumber: 0,
      }));
      setEntries(mapped);
      setModalOpen(true);
    } catch {
      addToast("Failed to load race entries", "error");
      setSelectedRace(null);
    } finally {
      setLoadingRaceId(null);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <p className="text-sm font-semibold text-slate-400">Loading races...</p>
      </div>
    );
  }

  if (openRaces.length === 0) {
    return (
      <div className="py-20 text-center">
        <Target className="w-10 h-10 text-slate-300 mx-auto mb-3" />
        <p className="text-sm font-semibold text-slate-400">
          No races open for predictions right now.
        </p>
        <button
          onClick={() => navigate("/races")}
          className="mt-3 text-xs font-bold text-[#064E3B] hover:underline cursor-pointer"
        >
          Browse all races
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="p-4 md:p-6 space-y-3">
        {openRaces.map((race: RaceListItem) => (
          <div
            key={race.id}
            className="bg-white border border-[#064E3B]/10 rounded-xl p-4 shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <h3 className="font-headline font-bold text-[#064E3B] text-base leading-tight">
                  {race.name}
                </h3>
                <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-500 font-medium">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {formatDateTime(race.scheduledAt)}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {race.venue}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => navigate(`/races/${race.id}`)}
                  className="flex items-center gap-1.5 bg-white border border-slate-200 text-slate-600 font-bold text-sm px-3 py-2.5 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer"
                >
                  Detail
                </button>
                <button
                  onClick={() => handlePredict(race.id, race.name)}
                  disabled={loadingRaceId === race.id}
                  className="flex items-center gap-1.5 bg-[#EAB308] text-[#064E3B] font-bold text-sm px-4 py-2.5 rounded-xl hover:bg-[#D9A207] hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Target className="w-4 h-4" />
                  {loadingRaceId === race.id ? "Loading..." : "Predict"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <ToastContainer toasts={toasts} />

      {/* Prediction Modal */}
      {selectedRace && (
        <PlacePredictionModal
          raceId={selectedRace.id}
          raceName={selectedRace.name}
          entries={entries}
          open={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setSelectedRace(null);
            setEntries([]);
          }}
          onSuccess={() => {}}
          addToast={addToast}
        />
      )}
    </>
  );
}

function MyPredictionsTab() {
  const navigate = useNavigate();
  const {
    predictions,
    loading,
    error,
    page,
    totalPages,
    total,
    search,
    statusFilter,
    loadPredictions,
    handleSearchChange,
    handleStatusChange,
    handlePageChange,
  } = usePredictions();

  const [localSearch, setLocalSearch] = useState(search);

  useEffect(() => {
    loadPredictions();
  }, [page, statusFilter, loadPredictions]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== search) {
        handleSearchChange(localSearch);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [localSearch, handleSearchChange, search]);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      {/* Toolbar */}
      <div className="p-4 md:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search by race name..."
            className="w-full h-10 rounded-xl bg-slate-50 border border-slate-200 pl-10 pr-4 text-sm font-medium outline-none focus:ring-1 focus:ring-[#064E3B] focus:border-[#064E3B] transition-all"
          />
        </div>

        <div className="flex gap-1 bg-slate-50 rounded-lg p-1 border border-slate-100">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleStatusChange(tab.key)}
              className={cn(
                "px-3.5 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer",
                statusFilter === tab.key
                  ? "bg-white text-[#064E3B] shadow-sm border border-slate-200"
                  : "text-slate-500 hover:text-slate-700"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="py-20 text-center">
          <p className="text-sm font-semibold text-slate-400">
            Loading predictions...
          </p>
        </div>
      ) : error ? (
        <div className="py-20 text-center">
          <p className="text-sm font-semibold text-red-500">{error}</p>
          <button
            onClick={() => loadPredictions()}
            className="mt-2 text-xs font-bold text-[#064E3B] hover:underline cursor-pointer"
          >
            Try again
          </button>
        </div>
      ) : predictions.length === 0 ? (
        <div className="py-20 text-center">
          <Coins className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-400">
            {search || statusFilter !== "all"
              ? "No predictions match your filters."
              : "No predictions yet. Start by predicting on a race!"}
          </p>
          {!search && statusFilter === "all" && (
            <button
              onClick={() => navigate("/races")}
              className="mt-3 text-xs font-bold text-[#064E3B] hover:underline cursor-pointer"
            >
              Browse races
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/40">
                  <th className="py-3 px-6 font-label text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Race
                  </th>
                  <th className="py-3 px-6 font-label text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Horse
                  </th>
                  <th className="py-3 px-6 font-label text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">
                    Predicted
                  </th>
                  <th className="py-3 px-6 font-label text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">
                    Reward
                  </th>
                  <th className="py-3 px-6 font-label text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">
                    Status
                  </th>
                  <th className="py-3 px-6 font-label text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right hidden md:table-cell">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                {predictions.map((prediction) => {
                  const status = getStatus(prediction.isCorrect);
                  const badge = STATUS_BADGE[status];
                  return (
                    <tr
                      key={prediction.id}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <button
                          onClick={() =>
                            navigate(`/races/${prediction.race.id}`)
                          }
                          className="font-bold text-slate-800 hover:text-[#064E3B] hover:underline text-left cursor-pointer"
                        >
                          {prediction.race.name}
                        </button>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {prediction.race.venue}
                        </p>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-slate-700">
                          {prediction.predictedEntry.horseName}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className="inline-flex items-center justify-center h-6 w-6 rounded-md border border-slate-200 bg-white shadow-sm text-xs font-black text-slate-800">
                          {POSITION_LABELS[prediction.predictedPosition] ||
                            prediction.predictedPosition}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right font-mono text-slate-600">
                        {prediction.rewardAmount ? (
                          <span className="text-[#064E3B] font-bold">
                            {prediction.rewardAmount}
                          </span>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span
                          className={cn(
                            "inline-flex items-center justify-center px-2.5 py-0.5 rounded-full font-label text-[9px] font-bold uppercase border",
                            badge.class
                          )}
                        >
                          {badge.label}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right text-slate-400 hidden md:table-cell">
                        {formatDate(prediction.placedAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/20">
              <p className="text-xs text-slate-500 font-medium">
                Page {page} of {totalPages} ({total} total)
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page <= 1}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= totalPages}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}

export function PredictionsHub() {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>("my-predictions");

  return (
    <div className="flex-1 overflow-y-auto p-6 max-w-7xl w-full mx-auto font-body">
      <div className="mb-6">
        <h2 className="font-headline text-3xl text-[#064E3B] mb-2">
          Predictions Hub
        </h2>
        <p className="text-sm text-slate-500 font-medium">
          Place predictions and track your results.
        </p>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-6 border-b border-slate-200 mb-0">
        <button
          onClick={() => setActiveSubTab("my-predictions")}
          className={cn(
            "pb-3 font-semibold text-sm transition-all relative",
            activeSubTab === "my-predictions"
              ? "text-[#064E3B] font-extrabold border-b-2 border-[#064E3B]"
              : "text-slate-400 hover:text-slate-600"
          )}
        >
          My Predictions
        </button>
        <button
          onClick={() => setActiveSubTab("open-races")}
          className={cn(
            "pb-3 font-semibold text-sm transition-all relative",
            activeSubTab === "open-races"
              ? "text-[#064E3B] font-extrabold border-b-2 border-[#064E3B]"
              : "text-slate-400 hover:text-slate-600"
          )}
        >
          Open Races
        </button>
      </div>

      <div className="bg-white border border-[#064E3B]/10 rounded-2xl shadow-sm overflow-hidden">
        {activeSubTab === "my-predictions" ? (
          <MyPredictionsTab />
        ) : (
          <OpenRacesTab />
        )}
      </div>
    </div>
  );
}
