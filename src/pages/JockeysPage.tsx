import { useCallback, useMemo } from "react";
import useJockeys from "../hooks/useJockeys";
import { useSpotlightJockey } from "../hooks/useSpotlightEntity";
import JockeySearch from "../components/jockey/JockeySearch";

import { useNavigate } from "react-router-dom";
import type { Jockey } from "../types/jockey";
import { Layers, Zap, Star, ArrowRight, User, Ban } from "lucide-react";
import banner from "../assets/images/horse-banner.png";
import { StatusBadge, HORSE_STATUS_STYLES } from "../components/ui/StatusBadge";

function JockeyRow({
  jockey,
  selected,
}: {
  jockey: Jockey;
  selected: boolean;
}) {
  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate(`/jockeys/${jockey.id}`);
  };

  return (
    <div
      onClick={handleNavigate}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleNavigate();
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
          {jockey.avatarUrl ? (
            <img
              src={jockey.avatarUrl}
              alt={jockey.fullName}
              className="h-full w-full object-cover"
            />
          ) : (
            <User className="h-5 w-5 text-slate-400" />
          )}
        </div>
        <div className="truncate">
          <p
            className={`font-bold font-headline text-base truncate ${
              selected ? "text-primary" : "text-foreground"
            }`}
          >
            {jockey.fullName}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Jockey ·{" "}
            {jockey.experienceYear !== null &&
            jockey.experienceYear !== undefined
              ? `${jockey.experienceYear} yrs experience`
              : "N/A experience"}{" "}
            ·{" "}
            {jockey.weightKg !== null && jockey.weightKg !== undefined
              ? `${jockey.weightKg}kg`
              : "N/A weight"}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0 pl-4">
        {jockey.isRacing && (
          <StatusBadge
            status="Racing"
            styleMap={HORSE_STATUS_STYLES}
            size="md"
            showDot
            dotClassName="bg-amber-400"
          />
        )}
      </div>
    </div>
  );
}

export default function JockeysPage() {
  const navigate = useNavigate();
  const { jockeys, loading, error, pagination, setPagination } = useJockeys();
  const spotlight = useSpotlightJockey();

  const handleSearchChange = useCallback(
    (value: string) => {
      setPagination((prev) =>
        prev.search === value && prev.page === 1
          ? prev
          : { ...prev, search: value, page: 1 }
      );
    },
    [setPagination]
  );

  const filteredJockeys = useMemo(() => {
    if (pagination.status === "all") return jockeys;
    if (pagination.status === "racing")
      return jockeys.filter((j) => j.isRacing);
    return jockeys.filter((j) => !j.isRacing);
  }, [jockeys, pagination.status]);

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
                  Jockey List
                </h1>
                <p className="mt-3 text-sm sm:text-base leading-relaxed text-emerald-50/80">
                  Browse all registered jockeys and view detailed information
                  about each jockey, including experience, weight, and racing
                  status.
                </p>
              </div>

              {/* Quick Stat Pills */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur px-4 py-3 text-left">
                  <div className="flex items-center gap-2 text-emerald-200 text-xs font-semibold uppercase tracking-wider mb-1">
                    <Layers className="h-4 w-4" /> Total Jockeys
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {pagination.total || jockeys.length}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur px-4 py-3 text-left">
                  <div className="flex items-center gap-2 text-amber-200 text-xs font-semibold uppercase tracking-wider mb-1">
                    <Zap className="h-4 w-4 text-amber-300" /> Racing
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {jockeys.filter((j) => j.isRacing).length}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Embedded Spotlight Card with Subtle Ambient Glow & Reserved Slot */}
            <div className="relative overflow-hidden w-full xl:w-[380px] shrink-0 rounded-2xl border border-white/25 bg-emerald-950/75 backdrop-blur p-6 text-white shadow-[0_0_20px_rgba(245,158,11,0.15)] ring-1 ring-amber-400/30 transition-all duration-300 hover:ring-amber-400/60 hover:shadow-[0_0_28px_rgba(245,158,11,0.22)] flex flex-col justify-between min-h-[220px]">
              {/* Subtle ambient glowing orb */}
              <div className="absolute -top-10 -right-10 h-24 w-24 bg-amber-400/15 rounded-full blur-xl animate-pulse pointer-events-none" />

              {spotlight.loading || !spotlight.jockey ? (
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
                      SPOTLIGHT JOCKEY
                    </span>
                  </div>

                  <div className="z-10">
                    <h2 className="text-2xl font-bold tracking-tight text-white!">
                      {spotlight.jockey.fullName}
                    </h2>
                    <p className="text-xs font-semibold text-emerald-200/80 mt-1">
                      {spotlight.jockey.experienceYear !== null &&
                      spotlight.jockey.experienceYear !== undefined
                        ? `${spotlight.jockey.experienceYear} yrs exp`
                        : "N/A exp"}{" "}
                      ·{" "}
                      {spotlight.jockey.weightKg !== null &&
                      spotlight.jockey.weightKg !== undefined
                        ? `${spotlight.jockey.weightKg}kg`
                        : "N/A weight"}
                    </p>
                    <p className="mt-3 text-sm text-white/90 font-medium leading-snug">
                      <span className="font-bold text-white!">
                        {spotlight.jockey.fullName}
                      </span>{" "}
                      is our chosen spotlight jockey!
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-white/15 z-10">
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-200">
                        Overall win rate
                      </div>
                      <div className="text-2xl font-black text-white">
                        {spotlight.winRate}%
                      </div>
                    </div>

                    <button
                      onClick={() =>
                        navigate(`/jockeys/${spotlight.jockey!.id}`)
                      }
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
            <JockeySearch
              value={pagination.search}
              onChange={handleSearchChange}
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            <button
              onClick={() =>
                setPagination((prev) => {
                  const modes = ["all", "racing", "not_racing"];
                  const idx = modes.indexOf(prev.status);
                  return { ...prev, status: modes[(idx + 1) % 3], page: 1 };
                })
              }
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2.5 text-xs font-bold transition ${
                pagination.status === "racing"
                  ? "bg-amber-50 border-amber-200 text-amber-700 shadow-sm"
                  : pagination.status === "not_racing"
                    ? "bg-slate-100 border-slate-300 text-slate-600 shadow-sm"
                    : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
              }`}
            >
              {pagination.status === "racing" ? (
                <Zap className="h-3.5 w-3.5 text-amber-500" />
              ) : pagination.status === "not_racing" ? (
                <Ban className="h-3.5 w-3.5 text-slate-500" />
              ) : null}
              {pagination.status === "racing"
                ? "Racing"
                : pagination.status === "not_racing"
                  ? "Not Racing"
                  : "All"}
            </button>
          </div>
        </div>

        <div>
          {loading ? (
            <div className="rounded-2xl border border-dashed border-border bg-card py-16 text-center">
              <p className="text-sm font-semibold text-muted-foreground">
                Loading jockeys...
              </p>
            </div>
          ) : filteredJockeys.length > 0 ? (
            <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden divide-y divide-border">
              {filteredJockeys.map((jockey) => (
                <JockeyRow key={jockey.id} jockey={jockey} selected={false} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border bg-card py-16 text-center">
              <p className="text-sm font-semibold text-muted-foreground">
                {pagination.status !== "all"
                  ? "No jockeys match the selected status."
                  : "No jockeys found."}
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
