import { useState, useMemo } from "react";
import useHorse from "../hooks/horse/useHorse";
import { useSpotlightHorse } from "../hooks/useSpotlightEntity";
import HorseSearch from "../components/horse/HorseSearch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { useNavigate } from "react-router-dom";
import type { Horse } from "../types/horse";
import { formatStatus } from "../utils/formatters";
import { HORSE_HEALTH_STYLES } from "../components/ui/StatusBadge";
import {
  Layers,
  Zap,
  Activity,
  ShieldAlert,
  Star,
  ArrowRight,
  Ban,
} from "lucide-react";
import banner from "../assets/images/horse-banner.png";

function getAge(birthDate?: string) {
  if (!birthDate) return "N/A";
  const birth = new Date(birthDate);
  if (Number.isNaN(birth.getTime())) return "N/A";

  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return `${Math.max(age, 0)} yrs`;
}

function getHealthKey(healthStatus?: string): string {
  return (healthStatus ?? "").toLowerCase().replace(/[\s]+/g, "_");
}

function getStatusLabel(horse: Horse): string {
  if (horse.isRetired) return "Retired";
  return horse.healthStatus ? formatStatus(horse.healthStatus) : "Active";
}

function getStatusDotColor(horse: Horse): string {
  if (horse.isRetired) return "bg-slate-400";
  const dotMap: Record<string, string> = {
    healthy: "bg-emerald-500",
    recovering: "bg-blue-500",
    minor_injury: "bg-amber-400",
    injured: "bg-red-500",
    sick: "bg-amber-400",
    rest: "bg-slate-300",
    under_observation: "bg-slate-300",
  };
  return dotMap[getHealthKey(horse.healthStatus)] ?? "bg-emerald-500";
}

function getStatusBadgeStyle(horse: Horse): string {
  if (horse.isRetired) return "bg-slate-100 border-slate-200 text-slate-600";
  return (
    HORSE_HEALTH_STYLES[getHealthKey(horse.healthStatus)] ??
    HORSE_HEALTH_STYLES.healthy
  );
}

function HorseRow({ horse, selected }: { horse: Horse; selected: boolean }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/horses/${horse.id}`)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          navigate(`/horses/${horse.id}`);
        }
      }}
      role="button"
      tabIndex={0}
      className={`group flex items-center justify-between px-5 py-4 transition-all border-l-4 cursor-pointer ${
        selected
          ? "bg-primary/5 border-l-primary"
          : "border-l-transparent hover:bg-slate-50/50"
      }`}
    >
      <div className="flex items-center gap-4 min-w-0">
        <div className="h-10 w-10 rounded-full overflow-hidden bg-slate-200 shrink-0 flex items-center justify-center">
          {horse.imageUrl ? (
            <img
              src={horse.imageUrl}
              alt={horse.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-sm font-bold text-slate-500">
              {horse.name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <div className="truncate">
          <p
            className={`font-bold font-headline text-base truncate ${
              selected ? "text-primary" : "text-foreground"
            }`}
          >
            {horse.name}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {horse.breed || "Unknown Breed"} · {getAge(horse.birthDate)} ·{" "}
            {horse.weightKg ? `${horse.weightKg}kg` : "N/A weight"}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0 pl-4">
        {horse.isRacing && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-xs font-bold text-amber-700">
            <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
            Racing
          </span>
        )}
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-bold ${getStatusBadgeStyle(horse)}`}
        >
          <span
            className={`h-2 w-2 rounded-full ${getStatusDotColor(horse)}`}
          />
          {getStatusLabel(horse)}
        </span>
      </div>
    </div>
  );
}

export default function HorsePage() {
  const navigate = useNavigate();
  const { horses, loading, error, pagination, setPagination } = useHorse();
  const spotlight = useSpotlightHorse(horses);

  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredHorses = useMemo(() => {
    if (statusFilter === "all") return horses;
    if (statusFilter === "retired") return horses.filter((h) => h.isRetired);
    return horses.filter(
      (h) => !h.isRetired && h.healthStatus?.toLowerCase() === statusFilter
    );
  }, [horses, statusFilter]);

  return (
    <div className="h-full w-full px-40 overflow-y-auto bg-background">
      <div className="mx-auto m-6">
        {/* Merged Header Card: Page Title + Quick Stats + Embedded Spotlight Card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0d2a23] via-[#12362d] to-[#1a473b] p-8 text-white shadow-lg my-6">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.12),_transparent_40%)]" />
          <div
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />

          {/* Low-opacity horse image (moved left, enlarged to show upper half) */}
          <div className="absolute left-[20%] lg:left-[24%] xl:left-[0%] -top-6 bottom-0 w-[70%] hidden lg:block opacity-25 pointer-events-none overflow-hidden">
            <img
              src={banner}
              alt=""
              className="h-[170%] w-full object-cover object-top grayscale mix-blend-overlay"
            />
          </div>

          <div className="relative z-10 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-8">
            {/* Left Column: Title, Description, Quick Stat Pills */}
            <div className="max-w-2xl flex flex-col justify-between space-y-6">
              <div>
                <h1 className="font-serif text-4xl font-bold tracking-tight text-white! sm:text-5xl">
                  Horse List
                </h1>
                <p className="mt-3 text-sm sm:text-base leading-relaxed text-emerald-50/80">
                  Browse all available horses and view detailed information
                  about each horse, including ownership, health status, weight,
                  and performance metrics.
                </p>
              </div>

              {/* 4 Quick Stat Pills */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur px-4 py-3 text-left">
                  <div className="flex items-center gap-2 text-emerald-200 text-xs font-semibold uppercase tracking-wider mb-1">
                    <Layers className="h-4 w-4" /> Total
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {pagination.total || horses.length}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur px-4 py-3 text-left">
                  <div className="flex items-center gap-2 text-amber-200 text-xs font-semibold uppercase tracking-wider mb-1">
                    <Zap className="h-4 w-4 text-amber-300" /> Racing
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {horses.filter((h) => h.isRacing).length}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur px-4 py-3 text-left">
                  <div className="flex items-center gap-2 text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-1">
                    <Activity className="h-4 w-4 text-emerald-300" /> Active
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {horses.filter((h) => !h.isRetired && !h.isRacing).length}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur px-4 py-3 text-left">
                  <div className="flex items-center gap-2 text-slate-300 text-xs font-semibold uppercase tracking-wider mb-1">
                    <ShieldAlert className="h-4 w-4 text-slate-300" /> Retired
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {horses.filter((h) => h.isRetired).length}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Embedded Spotlight Card with Subtle Ambient Glow & Reserved Slot */}
            <div className="relative overflow-hidden w-full xl:w-[380px] shrink-0 rounded-2xl border border-white/25 bg-emerald-950/75 backdrop-blur p-6 text-white shadow-[0_0_20px_rgba(245,158,11,0.15)] ring-1 ring-amber-400/30 transition-all duration-300 hover:ring-amber-400/60 hover:shadow-[0_0_28px_rgba(245,158,11,0.22)] flex flex-col justify-between min-h-[220px]">
              {/* Subtle ambient glowing orb */}
              <div className="absolute -top-10 -right-10 h-24 w-24 bg-amber-400/15 rounded-full blur-xl animate-pulse pointer-events-none" />

              {spotlight.loading || !spotlight.horse ? (
                <div className="animate-pulse flex flex-col justify-between h-full space-y-4">
                  <div className="h-4 w-32 bg-white/20 rounded-full" />
                  <div className="space-y-2">
                    <div className="h-7 w-40 bg-white/30 rounded-md" />
                    <div className="h-3.5 w-52 bg-white/20 rounded-md" />
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-white/10">
                    <div className="h-8 w-20 bg-white/20 rounded-md" />
                    <div className="h-9 w-28 bg-white/20 rounded-xl" />
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between z-10">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/20 border border-amber-300/40 px-3 py-0.5 text-xs font-bold text-amber-300 tracking-wider uppercase shadow-sm">
                      <Star className="h-3.5 w-3.5 fill-amber-300 text-amber-300" />
                      SPOTLIGHT HORSE
                    </span>
                  </div>

                  <div className="z-10">
                    <h2 className="text-2xl font-bold tracking-tight text-white!">
                      {spotlight.horse.name}
                    </h2>
                    <p className="text-xs font-semibold text-emerald-200/80 mt-1">
                      {spotlight.horse.breed} ·{" "}
                      {getAge(spotlight.horse.birthDate)} ·{" "}
                      {spotlight.horse.weightKg
                        ? `${spotlight.horse.weightKg}kg`
                        : "N/A"}
                    </p>
                    <p className="mt-3 text-sm text-white/90 font-medium leading-snug">
                      <span className="font-bold text-white!">
                        {spotlight.horse.name}
                      </span>{" "}
                      is our chosen spotlight horse!
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-white/15 z-10">
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-200">
                        Last month win rate
                      </div>
                      <div className="text-2xl font-black text-white">
                        {spotlight.winRate}%
                      </div>
                    </div>

                    <button
                      onClick={() => navigate(`/horses/${spotlight.horse!.id}`)}
                      className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-4 py-2 text-xs font-bold text-[#173a35] shadow-md transition hover:bg-amber-300 cursor-pointer"
                    >
                      View Details
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-destructive p-4 text-destructive">
            {error}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 p-4">
          <div className="w-full sm:max-w-md">
            <HorseSearch
              value={pagination.search}
              onChange={(value) =>
                setPagination((prev) => ({
                  ...prev,
                  search: value,
                  page: 1,
                }))
              }
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            <button
              onClick={() =>
                setPagination((prev) => {
                  const modes: (boolean | undefined)[] = [
                    undefined,
                    true,
                    false,
                  ];
                  const idx = modes.indexOf(prev.isRacing);
                  return { ...prev, isRacing: modes[(idx + 1) % 3], page: 1 };
                })
              }
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2.5 text-xs font-bold transition ${
                pagination.isRacing === true
                  ? "bg-amber-50 border-amber-200 text-amber-700 shadow-sm"
                  : pagination.isRacing === false
                    ? "bg-slate-100 border-slate-300 text-slate-600 shadow-sm"
                    : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
              }`}
            >
              {pagination.isRacing === true ? (
                <Zap className="h-3.5 w-3.5 text-amber-500" />
              ) : pagination.isRacing === false ? (
                <Ban className="h-3.5 w-3.5 text-slate-500" />
              ) : null}
              {pagination.isRacing === true
                ? "Racing"
                : pagination.isRacing === false
                  ? "Not Racing"
                  : "All"}
            </button>
            <Select
              value={statusFilter}
              onValueChange={(value) => {
                setStatusFilter(value);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
            >
              <SelectTrigger className="w-full sm:w-44 h-10 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="healthy">Healthy</SelectItem>
                <SelectItem value="recovering">Recovering</SelectItem>
                <SelectItem value="minor injury">Minor Injury</SelectItem>
                <SelectItem value="injured">Injured</SelectItem>
                <SelectItem value="under observation">
                  Under Observation
                </SelectItem>
                <SelectItem value="retired">Retired</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          {loading ? (
            <div className="rounded-2xl border border-dashed border-border bg-card py-16 text-center">
              <p className="text-sm font-semibold text-muted-foreground">
                Loading horses...
              </p>
            </div>
          ) : filteredHorses.length > 0 ? (
            <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden divide-y divide-border">
              {filteredHorses.map((horse) => (
                <HorseRow key={horse.id} horse={horse} selected={false} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border bg-card py-16 text-center">
              <p className="text-sm font-semibold text-muted-foreground">
                {statusFilter !== "all"
                  ? "No horses match the selected status."
                  : "No horses found."}
              </p>
            </div>
          )}

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
                className="border rounded-lg px-3 py-1 disabled:opacity-50"
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
                className="border rounded-lg px-3 py-1 disabled:opacity-50"
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
