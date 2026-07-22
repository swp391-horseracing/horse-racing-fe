import { useNavigate, useParams } from "react-router-dom";
import {
  User,
  Trophy,
  Award,
  Target,
  Percent,
  Zap,
  Activity,
  Calendar,
  Dna,
} from "lucide-react";
import useHorseDetail from "../hooks/useHorseDetail";
import NotFoundContent from "../components/ui/NotFoundContent";
import { formatStatus } from "../utils/formatters";

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <span className="text-slate-500">{label}</span>
      <div className="font-semibold text-[#173a35] text-right">{value}</div>
    </div>
  );
}

function SectionTitle({
  title,
  action,
}: {
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex items-center justify-between gap-4">
      <h2 className="text-2xl font-semibold text-[#173a35]">{title}</h2>
      {action}
    </div>
  );
}

function formatDate(dateStr?: string) {
  if (!dateStr) return "N/A";
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getAge(birthDate?: string) {
  if (!birthDate) return "N/A age";
  const birth = new Date(birthDate);
  if (Number.isNaN(birth.getTime())) return "N/A age";

  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return `${Math.max(age, 0)} yrs old`;
}

export default function HorseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    horse,
    ownerName,
    history,
    stats,
    loading,
    error,
    pagination,
    setPagination,
  } = useHorseDetail(id);

  if (error) {
    return (
      <NotFoundContent
        title="Error"
        message={error}
        actionLabel="Go Back"
        onAction={() => navigate(-1)}
      />
    );
  }

  if (loading && !horse) {
    return (
      <div className="min-h-screen bg-[#f2f4f1] px-6 py-6 flex items-center justify-center">
        <div className="text-slate-600 font-medium">
          Loading horse detail...
        </div>
      </div>
    );
  }

  if (!horse) {
    return (
      <NotFoundContent
        title="Horse not found"
        message="We couldn't find the horse you're looking for."
        actionLabel="Go Back"
        onAction={() => navigate(-1)}
      />
    );
  }

  const winRate =
    Number(stats.totalRaces || 0) > 0
      ? (
          (Number(stats.wins || 0) / Number(stats.totalRaces || 1)) *
          100
        ).toFixed(1)
      : "0.0";

  return (
    <div className="h-full w-full px-40 py-4 overflow-y-auto bg-background">
      <div className="mx-auto max-w-full overflow-hidden">
        {/* Navigation & Header Banner */}
        <div className="relative overflow-hidden bg-[#173a35] rounded-3xl p-8 text-white shadow-sm">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.16),_transparent_28%),linear-gradient(135deg,rgba(18,54,45,0.98),rgba(24,73,58,0.92))]" />
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
              backgroundSize: "52px 52px",
            }}
          />

          {/* Header Main Grid */}
          <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between py-2">
            {/* Horse Info */}
            <div className="flex flex-col gap-5 md:flex-row md:items-center">
              <div className="overflow-hidden h-[150px] w-[150px] rounded-2xl bg-slate-800 flex items-center justify-center shrink-0 shadow-md">
                {horse.imageUrl ? (
                  <img
                    src={horse.imageUrl}
                    alt={horse.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User className="h-16 w-16 text-slate-400" />
                )}
              </div>

              <div className="max-w-xl text-white">
                <div className="mb-3 flex flex-wrap items-center gap-2.5 text-xs font-semibold tracking-[0.12em]">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-300 px-3 py-1 text-[#173a35]">
                    <Calendar className="h-3.5 w-3.5" />
                    {getAge(horse.birthDate)}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#254f45] px-3 py-1 text-white">
                    <Dna className="h-3.5 w-3.5" />
                    Breed: {horse.breed || "N/A"}
                  </span>
                </div>

                <h1 className="text-3xl font-semibold tracking-tight text-[#F4F6F5]! sm:text-4xl md:text-5xl">
                  {horse.name}
                </h1>

                <p className="mt-2 text-base font-medium text-white/80">
                  Owned by {ownerName}
                </p>
              </div>
            </div>

            {/* Standout Badges Grid on the Right (6 Badges) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 shrink-0 w-full lg:w-auto">
              {/* Left Top: Speed */}
              <div className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur p-3.5 min-w-[125px] flex flex-col justify-between">
                <div className="flex items-center justify-between text-cyan-200 text-xs font-semibold uppercase tracking-wider mb-1.5">
                  <span>Speed</span>
                  <Zap className="h-4 w-4 text-cyan-300" />
                </div>
                <div className="text-2xl font-bold text-white">
                  {horse.baseSpeed != null ? `${horse.baseSpeed} m/s` : "N/A"}
                </div>
              </div>

              {/* Middle Top: Wins */}
              <div className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur p-3.5 min-w-[125px] flex flex-col justify-between">
                <div className="flex items-center justify-between text-amber-200 text-xs font-semibold uppercase tracking-wider mb-1.5">
                  <span>Wins</span>
                  <Trophy className="h-4 w-4 text-amber-300" />
                </div>
                <div className="text-2xl font-bold text-white">
                  {Number(stats.wins || 0)}
                </div>
              </div>

              {/* Right Top: Win Rate */}
              <div className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur p-3.5 min-w-[125px] flex flex-col justify-between">
                <div className="flex items-center justify-between text-emerald-200 text-xs font-semibold uppercase tracking-wider mb-1.5">
                  <span>Win Rate</span>
                  <Percent className="h-4 w-4 text-emerald-300" />
                </div>
                <div className="text-2xl font-bold text-white">{winRate}%</div>
              </div>

              {/* Left Bottom: Stamina */}
              <div className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur p-3.5 min-w-[125px] flex flex-col justify-between">
                <div className="flex items-center justify-between text-orange-200 text-xs font-semibold uppercase tracking-wider mb-1.5">
                  <span>Stamina</span>
                  <Activity className="h-4 w-4 text-orange-300" />
                </div>
                <div className="text-2xl font-bold text-white">
                  {horse.stamina != null ? String(horse.stamina) : "N/A"}
                </div>
              </div>

              {/* Middle Bottom: Podiums */}
              <div className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur p-3.5 min-w-[125px] flex flex-col justify-between">
                <div className="flex items-center justify-between text-blue-200 text-xs font-semibold uppercase tracking-wider mb-1.5">
                  <span>Podiums</span>
                  <Award className="h-4 w-4 text-blue-300" />
                </div>
                <div className="text-2xl font-bold text-white">
                  {Number(stats.wins || 0) + Number(stats.places || 0)}
                </div>
              </div>

              {/* Right Bottom: Avg Pos */}
              <div className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur p-3.5 min-w-[125px] flex flex-col justify-between">
                <div className="flex items-center justify-between text-purple-200 text-xs font-semibold uppercase tracking-wider mb-1.5">
                  <span>Avg Pos</span>
                  <Target className="h-4 w-4 text-purple-300" />
                </div>
                <div className="text-2xl font-bold text-white">
                  {stats.avgFinishPosition !== null &&
                  stats.avgFinishPosition !== undefined
                    ? `${Number(stats.avgFinishPosition).toFixed(1)}`
                    : "N/A"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Body Layout */}
        <div className="grid gap-6 py-6 lg:grid-cols-[minmax(0,1fr)_290px]">
          {/* Left Column: Performance History Table */}
          <div className="space-y-6">
            <section>
              <SectionTitle title="Performance History" />

              <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
                <table className="w-full border-collapse text-left text-sm">
                  <thead className="bg-slate-50 text-[11px] uppercase tracking-[0.18em] text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Race Event</th>
                      <th className="px-4 py-3">Position</th>
                      <th className="px-4 py-3">Jockey</th>
                      <th className="px-4 py-3">Venue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {history.length > 0 ? (
                      history.map((row, index) => (
                        <tr
                          key={`${row.raceId}-${index}`}
                          className="hover:bg-slate-50"
                        >
                          <td className="px-4 py-4 font-medium text-slate-700">
                            {formatDate(row.scheduledAt)}
                          </td>
                          <td className="px-4 py-4 text-slate-700 font-semibold">
                            {row.raceName || `Race #${row.raceNumber}`}
                          </td>
                          <td className="px-4 py-4">
                            {row.finishedPosition ? (
                              <span className="rounded bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-900">
                                #{row.finishedPosition}
                              </span>
                            ) : (
                              <span className="rounded bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600 uppercase">
                                {row.finishStatus || row.raceStatus}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-4 text-slate-700 font-medium">
                            {row.jockey?.fullName || "N/A"}
                          </td>
                          <td className="px-4 py-4 text-slate-700">
                            {row.venue || "N/A"}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-4 py-8 text-center text-sm font-semibold text-muted-foreground"
                        >
                          No race history found for this horse.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-end gap-2 pt-4">
                  <button
                    disabled={pagination.page <= 1}
                    onClick={() =>
                      setPagination((prev) => ({
                        ...prev,
                        page: prev.page - 1,
                      }))
                    }
                    className="border rounded-lg px-3 py-1 text-sm disabled:opacity-50"
                  >
                    Prev
                  </button>
                  <span className="text-sm text-muted-foreground">
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
                    className="border rounded-lg px-3 py-1 text-sm disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </section>
          </div>

          {/* Right Column: Horse Specs Card */}
          <aside className="space-y-6">
            <SectionTitle title="Horse Specs" />
            <section className="rounded-2xl border bg-white p-6 shadow-sm">
              <div className="space-y-1 text-sm">
                <InfoRow
                  label="Status"
                  value={
                    horse.isRetired ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 border border-slate-300 px-2.5 py-0.5 text-xs font-bold text-slate-600">
                        Retired
                      </span>
                    ) : horse.isRacing ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-xs font-bold text-amber-700">
                        <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                        Racing
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
                        <span className="h-2 w-2 rounded-full bg-green-500" />
                        Active
                      </span>
                    )
                  }
                />
                <InfoRow
                  label="Health Status"
                  value={
                    horse.healthStatus
                      ? formatStatus(horse.healthStatus)
                      : "Unknown"
                  }
                />
                <InfoRow
                  label="Weight"
                  value={horse.weightKg ? `${horse.weightKg} kg` : "N/A"}
                />
                <InfoRow label="Total Races" value={String(stats.totalRaces)} />
                <InfoRow
                  label="DNF / DSQ Record"
                  value={
                    <div className="flex items-center gap-1 text-xs">
                      <span className="rounded bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 font-bold">
                        {stats.dnfCount} DNF
                      </span>
                      <span className="text-slate-300 font-normal">|</span>
                      <span className="rounded bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 font-bold">
                        {stats.dsqCount} DSQ
                      </span>
                    </div>
                  }
                />
                <InfoRow
                  label="Registered Date"
                  value={formatDate(horse.createdAt)}
                />
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
