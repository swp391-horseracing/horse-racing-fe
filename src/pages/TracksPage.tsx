import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Search,
  MapPin,
  Flag,
  X,
  Users,
  Ruler,
  Layers,
  Activity,
  Clock,
  Home,
  ArrowRight,
  Infinity,
  Circle,
} from "lucide-react";
import { useTrack } from "../hooks/useTrack";
import { formatStatus } from "../utils/formatters";
import { StatusBadge, TRACK_STATUS_STYLES } from "../components/ui/StatusBadge";

function StatFilterCard({
  label,
  value,
  active,
  onClick,
}: {
  label: string;
  value: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 text-left rounded-xl border py-1.5 px-3 transition-all ${
        active
          ? "border-primary bg-card shadow-sm ring-1 ring-primary"
          : "border-border bg-card hover:border-slate-300 hover:bg-slate-50/50"
      }`}
    >
      <p
        className={`text-[9px] font-bold tracking-wider mb-0.5 ${
          active ? "text-primary font-black" : "text-muted-foreground"
        }`}
      >
        {label}
      </p>
      <p className="text-lg font-black leading-none text-foreground">{value}</p>
    </button>
  );
}

function getTrackShapeIcon(shape?: string) {
  const s = shape?.toLowerCase().trim() ?? "";
  if (s === "straight") return ArrowRight;
  if (s === "figure_eight") return Infinity;
  if (s === "oval") return Circle;
  return Activity;
}

function TrackBadge({ status }: { status?: string }) {
  const labelMap: Record<string, string> = {
    active: "Active",
    inactive: "Inactive",
    maintenance: "Maintenance",
    under_maintainance: "Under Maintenance",
    draft: "Draft",
  };

  const currentStatus = status || "inactive";

  return (
    <StatusBadge
      status={currentStatus}
      styleMap={TRACK_STATUS_STYLES}
      labelMap={labelMap}
      showDot={currentStatus === "active"}
      dotClassName="bg-emerald-500"
    />
  );
}

export default function TracksPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const {
    tracks,
    trackDetail,
    distances,
    loading,
    currentPage,
    totalPages,
    getTrackById,
    nextPage,
    prevPage,
    setTrackDetail,
  } = useTrack({ autoFetchTracks: true });

  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [detailTab, setDetailTab] = useState<"overview" | "distances">(
    "overview"
  );

  useEffect(() => {
    const selectedId = searchParams.get("selected");
    if (selectedId && selectedId !== trackDetail?.id) {
      getTrackById(selectedId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOpenTrack = (id: string) => {
    getTrackById(id);
    setDetailTab("overview");
    setSearchParams({ selected: id }, { replace: true });
  };

  const handleCloseTrack = () => {
    setTrackDetail(null);
    setSearchParams({}, { replace: true });
  };

  const safeTracks = Array.isArray(tracks) ? tracks : [];

  const filteredTracks = safeTracks.filter((track) => {
    const searchLower = search.toLowerCase();
    const matchesSearch =
      track.name.toLowerCase().includes(searchLower) ||
      (track.city && track.city.toLowerCase().includes(searchLower)) ||
      (track.country && track.country.toLowerCase().includes(searchLower));

    const matchesFilter =
      activeFilter === "All" || track.status === activeFilter;

    return matchesSearch && matchesFilter;
  });

  const isPanelOpen = trackDetail !== null;

  return (
    <div className="h-full w-full overflow-y-auto bg-background custom-scrollbar">
      <div className="mx-auto max-w-[1400px] px-6 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="min-w-0">
            <h1 className="text-3xl font-black font-headline text-primary tracking-tight leading-none">
              Race Tracks
            </h1>
            <p className="mt-2 text-xs text-muted-foreground">
              Manage race tracks, configurations, and distance settings.
            </p>
          </div>

          <div className="relative w-full sm:w-72 md:w-80 shadow-sm rounded-xl border border-border bg-card">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, city or country..."
              className="w-full h-11 rounded-xl bg-transparent pl-11 pr-4 text-xs font-medium outline-none transition focus:ring-1 focus:ring-primary placeholder:text-muted-foreground"
            />
          </div>
        </div>

        <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatFilterCard
            label="Total Tracks"
            value={safeTracks.length}
            active={activeFilter === "All"}
            onClick={() => {
              setActiveFilter("All");
              handleCloseTrack();
            }}
          />
          <StatFilterCard
            label="Active"
            value={safeTracks.filter((c) => c.status === "active").length}
            active={activeFilter === "active"}
            onClick={() => {
              setActiveFilter("active");
              handleCloseTrack();
            }}
          />
          <StatFilterCard
            label="Inactive"
            value={safeTracks.filter((c) => c.status === "inactive").length}
            active={activeFilter === "inactive"}
            onClick={() => {
              setActiveFilter("inactive");
              handleCloseTrack();
            }}
          />
          <StatFilterCard
            label="Maintenance"
            value={
              safeTracks.filter(
                (c) =>
                  c.status === "maintenance" ||
                  c.status === "under_maintainance"
              ).length
            }
            active={activeFilter === "maintenance"}
            onClick={() => {
              setActiveFilter("maintenance");
              handleCloseTrack();
            }}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div
            className={`space-y-3 transition-all duration-300 ${
              isPanelOpen ? "lg:col-span-3" : "lg:col-span-12"
            }`}
          >
            {loading && !isPanelOpen ? (
              <div className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
                Loading tracks...
              </div>
            ) : (
              filteredTracks.map((track) => {
                const isSelected = trackDetail?.id === track.id;

                return (
                  <div
                    key={track.id}
                    onClick={() =>
                      isSelected
                        ? handleCloseTrack()
                        : handleOpenTrack(track.id)
                    }
                    className={`group cursor-pointer overflow-hidden rounded-2xl border bg-card transition-all duration-150 ${
                      isSelected
                        ? "border-primary ring-1 ring-primary bg-primary/5"
                        : "border-border hover:border-slate-300 hover:shadow-sm"
                    }`}
                  >
                    <div className="p-4 flex gap-3.5 items-start">
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${
                          isSelected
                            ? "bg-primary text-white border-primary"
                            : "bg-primary/10 text-primary border-primary/20 group-hover:bg-primary group-hover:text-white"
                        }`}
                      >
                        <Flag className="h-4.5 w-4.5" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          <h3 className="text-sm font-black font-headline text-primary tracking-tight leading-tight truncate">
                            {track.name}
                          </h3>
                          <TrackBadge status={track.status} />
                        </div>
                        <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-muted-foreground/80" />
                            {track.city}, {track.country}
                          </span>
                          {track.surfaceType && (
                            <span className="flex items-center gap-1 capitalize">
                              <Layers className="h-3 w-3 text-muted-foreground/80" />
                              {track.surfaceType}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            {!loading && filteredTracks.length === 0 && (
              <div className="rounded-2xl border border-dashed border-border bg-card py-16 text-center">
                <Flag className="mx-auto mb-3 h-8 w-8 text-muted-foreground/60" />
                <p className="text-sm font-semibold text-muted-foreground">
                  No tracks found.
                </p>
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex items-center gap-2 pt-2">
                <button
                  disabled={currentPage <= 1}
                  onClick={prevPage}
                  className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs disabled:opacity-50"
                >
                  Prev
                </button>
                <span className="text-xs text-muted-foreground">
                  Page {currentPage} / {totalPages}
                </span>
                <button
                  disabled={currentPage >= totalPages}
                  onClick={nextPage}
                  className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>

          {isPanelOpen && trackDetail && (
            <div className="lg:col-span-9 lg:sticky lg:top-4 bg-card border border-border rounded-2xl shadow-md overflow-hidden flex flex-col">
              <div className="border-b border-primary/20 bg-primary px-6 py-5 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-primary-foreground/70">
                    <MapPin className="h-3 w-3" />
                    {trackDetail.city}, {trackDetail.country}
                  </span>
                  <div className="text-2xl font-black font-headline text-white tracking-tight leading-snug truncate mt-1">
                    {trackDetail.name}
                  </div>
                  <p className="text-xs text-primary-foreground/70 mt-1">
                    Track configuration and distance settings
                  </p>
                </div>
                <button
                  onClick={handleCloseTrack}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="flex border-b border-border px-6 bg-background">
                <button
                  onClick={() => setDetailTab("overview")}
                  className={`py-2.5 px-4 text-xs font-bold border-b-2 transition-all -mb-[1px] ${
                    detailTab === "overview"
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setDetailTab("distances")}
                  className={`py-2.5 px-4 text-xs font-bold border-b-2 transition-all -mb-[1px] ${
                    detailTab === "distances"
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Distances
                </button>
              </div>

              <div className="p-6 max-h-[550px] overflow-y-auto custom-scrollbar">
                {detailTab === "overview" && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-4.5 rounded-xl border border-border bg-card flex items-start gap-3.5">
                        <div className="p-2.5 bg-primary/10 text-primary rounded-lg">
                          <Layers className="h-4.5 w-4.5" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                            Surface
                          </p>
                          <p className="text-base font-black text-foreground mt-1 capitalize">
                            {trackDetail.surfaceType || "N/A"}
                          </p>
                        </div>
                      </div>

                      <div className="p-4.5 rounded-xl border border-border bg-card flex items-start gap-3.5">
                        <div className="p-2.5 bg-secondary/15 text-secondary rounded-lg">
                          {(() => {
                            const Icon = getTrackShapeIcon(trackDetail.trackShape?.shape);
                            return <Icon className="h-4.5 w-4.5" />;
                          })()}
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                            Shape
                          </p>
                          <p className="text-base font-black text-foreground mt-1">
                            {formatStatus(
                              trackDetail.trackShape?.shape || "Unknown"
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="p-4.5 rounded-xl border border-border bg-card flex items-start gap-3.5">
                        <div className="p-2.5 bg-muted text-muted-foreground rounded-lg">
                          <Users className="h-4.5 w-4.5" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                            Capacity
                          </p>
                          <p className="text-base font-black text-foreground mt-1">
                            {trackDetail.grandstandCapacity?.toLocaleString(
                              "en-GB"
                            ) || 0}
                          </p>
                        </div>
                      </div>

                      <div className="p-4.5 rounded-xl border border-border bg-card flex items-start gap-3.5">
                        <div className="p-2.5 bg-secondary/15 text-secondary rounded-lg">
                          <Ruler className="h-4.5 w-4.5" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                            Starters
                          </p>
                          <p className="text-base font-black text-foreground mt-1">
                            {trackDetail.maxStartingPositions || 0}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4.5 rounded-xl border border-border bg-card flex items-start gap-3.5">
                        <div className="p-2.5 bg-primary/10 text-primary rounded-lg">
                          <Home className="h-4.5 w-4.5" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                            Address
                          </p>
                          <p className="text-sm font-bold text-foreground mt-1">
                            {trackDetail.address || "Not specified"}
                          </p>
                        </div>
                      </div>

                      <div className="p-4.5 rounded-xl border border-border bg-card flex items-start gap-3.5">
                        <div className="p-2.5 bg-secondary/15 text-secondary rounded-lg">
                          <Ruler className="h-4.5 w-4.5" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                            Total Distance
                          </p>
                          <p className="text-sm font-bold text-foreground mt-1">
                            {trackDetail.distanceMeters
                              ? `${trackDetail.distanceMeters.toLocaleString("en-GB")}m`
                              : "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between text-[10px] text-muted-foreground/60 font-mono pt-2 border-t border-border">
                      <span>ID: {trackDetail.id}</span>
                      <span>
                        Updated:{" "}
                        {new Date(
                          // eslint-disable-next-line react-hooks/purity
                          trackDetail.updatedAt || Date.now()
                        ).toLocaleDateString("en-GB")}
                      </span>
                    </div>
                  </div>
                )}

                {detailTab === "distances" && (
                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between border-b border-border pb-2">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground/80" />
                        Configured Distances
                      </h4>
                      <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                        {distances.length} Available
                      </span>
                    </div>

                    {distances.length > 0 ? (
                      <div className="space-y-2">
                        {distances.map((dist) => (
                          <div
                            key={dist.id}
                            className="flex justify-between items-center p-3.5 rounded-xl border border-border bg-card hover:border-primary/30 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground font-bold text-xs">
                                M
                              </div>
                              <div>
                                <p className="font-bold text-sm text-foreground">
                                  {(
                                    dist.distanceMeters ??
                                    dist.distance ??
                                    0
                                  ).toLocaleString("en-GB")}
                                  m
                                </p>
                                <p className="text-[11px] text-muted-foreground">
                                  {dist.name ||
                                    dist.type ||
                                    "Standard Distance"}
                                </p>
                              </div>
                            </div>
                            <TrackBadge status={dist.status} />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-xs text-muted-foreground font-medium">
                        No distances configured for this track yet.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
