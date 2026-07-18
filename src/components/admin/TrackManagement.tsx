import { useState } from "react";
import { createPortal } from "react-dom";
import {
  ChevronDown,
  Loader2,
  MapPin,
  Flag,
  Users,
  Activity,
  X,
  Eye,
  Ruler,
  Layers,
  Plus,
  Trash2,
  ArrowRight,
  Infinity,
  Circle,
} from "lucide-react";
import { cn } from "../../lib/utils";
import type { ToastType } from "../../types/referee";
import type { TrackDetail, TrackListItem, TrackShape } from "../../types/track";
import { useTrack } from "../../hooks/useTrack";
import { formatStatus } from "../../utils/formatters";

type OpenMenuState = {
  id: string;
  type: "status";
  buttonTop: number;
  buttonBottom: number;
  buttonRight: number;
  dropUp: boolean;
} | null;

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "under_maintainance", label: "Under maintenance" },
] as const;

const STATUS_LABEL_MAP = Object.fromEntries(
  STATUS_OPTIONS.map((o) => [o.value, o.label])
);

function formatDateOrFallback(value?: string) {
  if (!value) return "N/A";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "N/A" : d.toLocaleDateString("en-GB");
}

function getTrackShapeIcon(shape?: string) {
  const s = shape?.toLowerCase().trim() ?? "";
  if (s === "straight") return ArrowRight;
  if (s === "figure_eight") return Infinity;
  if (s === "oval") return Circle;
  return Activity;
}

interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

function FormModal({ isOpen, onClose, title, children }: FormModalProps) {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h3 className="text-lg font-black text-[#064E3B]">{title}</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5 max-h-[80vh] overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}

export default function TrackManagement({
  addToast,
}: {
  addToast: (m: string, t?: ToastType) => void;
}) {
  const {
    tracks,
    loading,
    currentPage,
    totalPages,
    totalItems,
    limit,
    trackShapes,
    getTracks,
    updateTrackStatus,
    getTrackById,
    createTrack,
    createTrackDistance,
    deleteTrackDistance,
  } = useTrack({ autoFetchTracks: true, autoFetchTrackShapes: true });

  const [openMenu, setOpenMenu] = useState<OpenMenuState>(null);
  const [selectedTrack, setSelectedTrack] = useState<TrackDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    country: "",
    city: "",
    address: "",
    surfaceType: "dirt",
    distanceMeters: 1400,
    maxStartingPositions: 12,
    grandstandCapacity: 10000,
    trackShapeId: "",
    status: "inactive" as string,
    description: "",
  });

  const [isDistOpen, setIsDistOpen] = useState(false);
  const [distLoading, setDistLoading] = useState(false);
  const [distData, setDistData] = useState({
    distanceMeters: 1400,
    name: "",
    type: "standard",
    status: "active",
  });

  const [filters, setFilters] = useState({ search: "", status: "" });

  const handleStatusFilterChange = (value: string) => {
    setFilters((prev) => ({ ...prev, status: value }));
    getTracks({ page: 1, status: value || undefined });
  };

  const safeTracks = Array.isArray(tracks) ? tracks : [];

  const filteredTracks = safeTracks.filter((track) => {
    const searchLower = filters.search.toLowerCase().trim();
    if (!searchLower) return true;
    return (
      track.name.toLowerCase().includes(searchLower) ||
      (track.city && track.city.toLowerCase().includes(searchLower)) ||
      (track.country && track.country.toLowerCase().includes(searchLower))
    );
  });

  const handleOpenDetails = async (trackId: string) => {
    try {
      setDetailLoading(true);
      const res = await getTrackById(trackId);
      const detail = (
        res && typeof res === "object" && "data" in res ? res.data : res
      ) as TrackDetail;
      setSelectedTrack(detail);
    } catch {
      addToast("Failed to load track details", "error");
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.trackShapeId) {
      addToast("Please select a track shape.", "warning");
      return;
    }
    try {
      setCreateLoading(true);
      await createTrack(formData);
      addToast("Track created successfully!", "success");
      setIsCreateOpen(false);
      setFormData({
        name: "",
        country: "",
        city: "",
        address: "",
        surfaceType: "dirt",
        distanceMeters: 0,
        maxStartingPositions: 12,
        grandstandCapacity: 10000,
        trackShapeId: "",
        status: "inactive",
        description: "",
      });
    } catch {
      addToast("Failed to create track.", "error");
    } finally {
      setCreateLoading(false);
    }
  };

  const handleAddDistance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTrack) return;
    try {
      setDistLoading(true);
      await createTrackDistance(selectedTrack.id, distData);
      addToast("Distance added successfully!", "success");
      setIsDistOpen(false);
      await handleOpenDetails(selectedTrack.id);
      setDistData({
        distanceMeters: 1400,
        name: "",
        type: "standard",
        status: "active",
      });
    } catch {
      addToast("Failed to add distance.", "error");
    } finally {
      setDistLoading(false);
    }
  };

  const handleDeleteDistance = async (trackId: string, distanceId: string) => {
    if (!confirm("Are you sure you want to remove this distance?")) return;
    try {
      await deleteTrackDistance(trackId, distanceId);
      addToast("Distance removed.", "success");
      await handleOpenDetails(trackId);
    } catch {
      addToast("Failed to remove distance.", "error");
    }
  };

  return (
    <div className="p-6 space-y-5 max-w-7xl mx-auto h-full relative">
      <div className="flex items-center justify-between border-b border-[#064E3B]/10 pb-4">
        <div>
          <h2 className="text-xl font-black font-headline text-[#064E3B]">
            Track Management
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Manage race tracks, configurations, and operational status
          </p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center gap-2 bg-[#064E3B] text-white px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-[#064E3B]/90 transition shadow-sm shadow-[#064E3B]/20"
        >
          <Plus className="w-4 h-4" />
          Create New Track
        </button>
      </div>

      <div className="bg-white border rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-center gap-4">
          <div className="w-full">
            <input
              type="text"
              placeholder="Search tracks by name or location..."
              value={filters.search}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, search: e.target.value }))
              }
              className="w-full bg-slate-50 border rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 outline-none focus:ring-1 focus:ring-[#064E3B]/20"
            />
          </div>

          <select
            value={filters.status}
            onChange={(e) => handleStatusFilterChange(e.target.value)}
            className="bg-slate-50 border rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 outline-none"
          >
            <option value="">All Status</option>
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="border rounded-xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b text-slate-500 font-bold uppercase text-[9px] tracking-wider">
              <tr>
                <th className="p-3 w-1/4">Track</th>
                <th className="p-3 w-1/4">Location & Shape</th>
                <th className="p-3 w-1/6">Capacity</th>
                <th className="p-3 w-1/6">Status</th>
                <th className="p-3 text-right w-1/6">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    <div className="inline-flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading tracks...
                    </div>
                  </td>
                </tr>
              ) : filteredTracks.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    No tracks found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredTracks.map((track: TrackListItem) => (
                  <tr
                    key={track.id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-[#064E3B]/10 flex items-center justify-center text-[#064E3B] shrink-0">
                          <Flag className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p
                            className="font-bold text-slate-800 truncate"
                            title={track.name}
                          >
                            {track.name}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="p-3">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span
                            className="truncate"
                            title={`${track.city ?? ""}, ${track.country ?? ""}`}
                          >
                            {track.city && track.country
                              ? `${track.city}, ${track.country}`
                              : (track.city ?? track.country ?? "—")}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-500">
                          {(() => {
                            const Icon = getTrackShapeIcon(track.trackShape?.shape);
                            return <Icon className="w-3 h-3 text-slate-400 shrink-0" />;
                          })()}
                          <span className="text-[10px] truncate">
                            {formatStatus(track.trackShape?.shape || "Unknown")}
                            {track.trackShape?.description &&
                              ` • ${track.trackShape.description}`}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="p-3">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Users className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="font-medium">
                          {track.grandstandCapacity?.toLocaleString() || 0}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Max Starters: {track.maxStartingPositions || 0}
                      </p>
                    </td>

                    <td className="p-3">
                      <span
                        className={cn(
                          "inline-flex px-2 py-0.5 rounded text-[9px] font-black uppercase border",
                          track.status === "active"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : track.status === "maintenance" ||
                                track.status === "under_maintainance"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : track.status === "draft"
                                ? "bg-slate-100 text-slate-600 border-slate-200"
                                : "bg-rose-50 text-rose-700 border-rose-200"
                        )}
                      >
                        {STATUS_LABEL_MAP[track.status ?? ""] ||
                          track.status ||
                          "Unknown"}
                      </span>
                    </td>

                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenDetails(track.id)}
                          disabled={detailLoading}
                          className="inline-flex items-center gap-1 text-[10px] font-bold bg-slate-100 text-slate-600 px-2.5 py-1.5 rounded hover:bg-slate-200 transition disabled:opacity-50"
                        >
                          <Eye className="w-3 h-3" />
                          Details
                        </button>

                        <div className="relative inline-block">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              const rect =
                                e.currentTarget.getBoundingClientRect();
                              const spaceBelow =
                                window.innerHeight - rect.bottom;
                              const dropUp = spaceBelow < 220;
                              setOpenMenu(
                                openMenu?.id === track.id &&
                                  openMenu?.type === "status"
                                  ? null
                                  : {
                                      id: track.id,
                                      type: "status",
                                      buttonTop: rect.top,
                                      buttonBottom: rect.bottom,
                                      buttonRight: rect.right,
                                      dropUp,
                                    }
                              );
                            }}
                            className="inline-flex items-center gap-1 text-[10px] font-bold bg-[#064E3B]/10 text-[#064E3B] px-2.5 py-1.5 rounded hover:bg-[#064E3B]/20 transition disabled:opacity-50"
                          >
                            Edit Status
                            <ChevronDown className="w-3 h-3" />
                          </button>

                          {openMenu?.id === track.id &&
                            openMenu?.type === "status" &&
                            createPortal(
                              <div
                                className="fixed w-44 bg-white border rounded-xl shadow-lg z-[60] overflow-hidden animate-in fade-in zoom-in-95 duration-100"
                                style={
                                  openMenu.dropUp
                                    ? {
                                        bottom:
                                          window.innerHeight -
                                          openMenu.buttonTop +
                                          8,
                                        left: openMenu.buttonRight - 176,
                                      }
                                    : {
                                        top: openMenu.buttonBottom + 8,
                                        left: openMenu.buttonRight - 176,
                                      }
                                }
                              >
                                {STATUS_OPTIONS.map((opt) => (
                                  <button
                                    key={opt.value}
                                    type="button"
                                    onClick={async () => {
                                      try {
                                        await updateTrackStatus(
                                          track.id,
                                          opt.value
                                        );
                                        addToast(
                                          `Status updated to ${opt.label}.`,
                                          "success"
                                        );
                                      } catch {
                                        addToast(
                                          `Failed to update status.`,
                                          "error"
                                        );
                                      }
                                      setOpenMenu(null);
                                    }}
                                    className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed border-b border-slate-50 last:border-0"
                                  >
                                    {opt.label}
                                  </button>
                                ))}
                                <button
                                  type="button"
                                  onClick={() => setOpenMenu(null)}
                                  className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 text-slate-500 font-medium"
                                >
                                  Cancel
                                </button>
                              </div>,
                              document.body
                            )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <p className="text-[10px] text-slate-400">
              Showing {(currentPage - 1) * limit + 1}-
              {Math.min(currentPage * limit, totalItems)} of {totalItems} tracks
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage <= 1}
                onClick={() => getTracks({ page: currentPage - 1 })}
                className="border rounded-lg px-3 py-1 text-xs font-medium disabled:opacity-50 hover:bg-slate-50"
              >
                Prev
              </button>
              <span className="text-xs text-slate-600 font-medium">
                {currentPage} / {totalPages}
              </span>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => getTracks({ page: currentPage + 1 })}
                className="border rounded-lg px-3 py-1 text-xs font-medium disabled:opacity-50 hover:bg-slate-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {selectedTrack && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => setSelectedTrack(null)}
          />
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-[#064E3B]/5 to-transparent flex items-start justify-between shrink-0">
              <div className="min-w-0 pr-8">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-xl font-black text-[#064E3B] truncate">
                    {selectedTrack.name}
                  </h3>
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded text-[9px] font-black uppercase border shrink-0",
                      selectedTrack.status === "active"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : selectedTrack.status === "maintenance" ||
                            selectedTrack.status === "under_maintainance"
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-slate-100 text-slate-600 border-slate-200"
                    )}
                  >
                    {STATUS_LABEL_MAP[selectedTrack.status ?? ""] ||
                      selectedTrack.status ||
                      "Unknown"}
                  </span>
                </div>
                <p className="text-xs text-slate-500 flex items-center gap-1.5">
                  <MapPin className="w-3 h-3 shrink-0" />
                  <span className="truncate">
                    {selectedTrack.address ||
                      `${selectedTrack.city}, ${selectedTrack.country}`}
                  </span>
                </p>
              </div>
              <button
                onClick={() => setSelectedTrack(null)}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatCard
                  label="Surface Type"
                  value={selectedTrack.surfaceType}
                  icon={<Layers className="w-3.5 h-3.5" />}
                />
                <StatCard
                  label="Track Shape"
                  value={formatStatus(selectedTrack.trackShape?.shape || "")}
                  icon={(() => {
                    const Icon = getTrackShapeIcon(selectedTrack.trackShape?.shape);
                    return <Icon className="w-3.5 h-3.5" />;
                  })()}
                />
                <StatCard
                  label="Grandstand Cap."
                  value={selectedTrack.grandstandCapacity?.toLocaleString()}
                  icon={<Users className="w-3.5 h-3.5" />}
                />
                <StatCard
                  label="Max Starters"
                  value={selectedTrack.maxStartingPositions}
                  icon={<Flag className="w-3.5 h-3.5" />}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {selectedTrack.trackShape?.description && (
                  <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                    <h4 className="text-[10px] font-bold uppercase text-slate-400 mb-2 flex items-center gap-2">
                      {(() => {
                        const Icon = getTrackShapeIcon(selectedTrack.trackShape?.shape);
                        return <Icon className="w-3 h-3" />;
                      })()} Shape Description
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed italic">
                      "{selectedTrack.trackShape.description}"
                    </p>
                  </div>
                )}
                <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                  <h4 className="text-[10px] font-bold uppercase text-slate-400 mb-2 flex items-center gap-2">
                    <MapPin className="w-3 h-3" /> Full Location
                  </h4>
                  <div className="text-xs text-slate-600 space-y-1">
                    {selectedTrack.address && (
                      <p className="font-medium">{selectedTrack.address}</p>
                    )}
                    <p>
                      {selectedTrack.city}, {selectedTrack.country}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-2">
                    <Ruler className="w-3 h-3" /> Available Race Distances (
                    {selectedTrack.distances?.length || 0})
                  </h4>
                  <button
                    onClick={() => setIsDistOpen(true)}
                    className="inline-flex items-center gap-1 text-[10px] font-bold text-[#064E3B] hover:text-[#064E3B]/80 transition"
                  >
                    <Plus className="w-3 h-3" /> Add Distance
                  </button>
                </div>
                <div className="space-y-2">
                  {selectedTrack.distances &&
                  selectedTrack.distances.length > 0 ? (
                    <div className="grid sm:grid-cols-2 gap-2">
                      {selectedTrack.distances.map((dist) => (
                        <div
                          key={dist.id}
                          className="group flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-white hover:border-[#064E3B]/20 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-lg bg-[#064E3B]/5 flex items-center justify-center text-[#064E3B] font-bold text-xs group-hover:bg-[#064E3B] group-hover:text-white transition-colors">
                              M
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-700">
                                {(
                                  dist.distanceMeters ??
                                  dist.distance ??
                                  0
                                ).toLocaleString()}
                                m
                              </p>
                              <p className="text-[10px] text-slate-400">
                                {dist.name || dist.type || "Standard Distance"}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={cn(
                                "px-2 py-0.5 rounded text-[9px] font-bold uppercase",
                                dist.status === "active"
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-slate-100 text-slate-500"
                              )}
                            >
                              {dist.status || "Active"}
                            </span>
                            <button
                              onClick={() =>
                                handleDeleteDistance(selectedTrack.id, dist.id)
                              }
                              className="p-1.5 rounded-lg text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition opacity-0 group-hover:opacity-100"
                              title="Remove distance"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center">
                      No distances configured yet. Click "Add Distance" to
                      start.
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex flex-wrap gap-x-6 gap-y-2 text-[10px] text-slate-400 font-mono">
                <p>
                  <span className="text-slate-500 font-bold">Created:</span>{" "}
                  {formatDateOrFallback(selectedTrack.createdAt)}
                </p>
                <p>
                  <span className="text-slate-500 font-bold">Updated:</span>{" "}
                  {formatDateOrFallback(selectedTrack.updatedAt)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <FormModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create New Track"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Track Name" required>
              <input
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, name: e.target.value }))
                }
                className="w-full bg-slate-50 border rounded-lg px-3 py-2 text-xs font-medium outline-none focus:ring-1 focus:ring-[#064E3B]"
                placeholder="e.g. Ho Chi Minh Derby"
              />
            </InputField>
            <InputField label="Track Shape" required>
              <select
                required
                value={formData.trackShapeId}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, trackShapeId: e.target.value }))
                }
                className="w-full bg-slate-50 border rounded-lg px-3 py-2 text-xs font-medium outline-none focus:ring-1 focus:ring-[#064E3B]"
              >
                <option value="">Select shape...</option>
                {trackShapes.map((ts: TrackShape) => (
                  <option key={ts.id} value={ts.id}>
                    {formatStatus(ts.shape)}
                  </option>
                ))}
              </select>
            </InputField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <InputField label="Country" required>
              <input
                required
                value={formData.country}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, country: e.target.value }))
                }
                className="w-full bg-slate-50 border rounded-lg px-3 py-2 text-xs font-medium outline-none focus:ring-1 focus:ring-[#064E3B]"
                placeholder="Vietnam"
              />
            </InputField>
            <InputField label="City" required>
              <input
                required
                value={formData.city}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, city: e.target.value }))
                }
                className="w-full bg-slate-50 border rounded-lg px-3 py-2 text-xs font-medium outline-none focus:ring-1 focus:ring-[#064E3B]"
                placeholder="Ho Chi Minh"
              />
            </InputField>
          </div>

          <InputField label="Street Address">
            <input
              value={formData.address}
              onChange={(e) =>
                setFormData((p) => ({ ...p, address: e.target.value }))
              }
              className="w-full bg-slate-50 border rounded-lg px-3 py-2 text-xs font-medium outline-none focus:ring-1 focus:ring-[#064E3B]"
              placeholder="663 N 1st Street"
            />
          </InputField>

          <div className="grid grid-cols-3 gap-4">
            <InputField label="Surface" required>
              <select
                required
                value={formData.surfaceType}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, surfaceType: e.target.value }))
                }
                className="w-full bg-slate-50 border rounded-lg px-3 py-2 text-xs font-medium outline-none focus:ring-1 focus:ring-[#064E3B]"
              >
                <option value="dirt">Dirt</option>
                <option value="turf">Turf</option>
                <option value="synthetic">Synthetic</option>
              </select>
            </InputField>
            <InputField label="Distance (m)" required>
              <input
                type="number"
                required
                min={100}
                value={formData.distanceMeters}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    distanceMeters: Number(e.target.value),
                  }))
                }
                className="w-full bg-slate-50 border rounded-lg px-3 py-2 text-xs font-medium outline-none focus:ring-1 focus:ring-[#064E3B]"
              />
            </InputField>
            <InputField label="Starters" required>
              <input
                type="number"
                required
                min={2}
                value={formData.maxStartingPositions}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    maxStartingPositions: Number(e.target.value),
                  }))
                }
                className="w-full bg-slate-50 border rounded-lg px-3 py-2 text-xs font-medium outline-none focus:ring-1 focus:ring-[#064E3B]"
              />
            </InputField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <InputField label="Grandstand Capacity" required>
              <input
                type="number"
                required
                min={0}
                value={formData.grandstandCapacity}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    grandstandCapacity: Number(e.target.value),
                  }))
                }
                className="w-full bg-slate-50 border rounded-lg px-3 py-2 text-xs font-medium outline-none focus:ring-1 focus:ring-[#064E3B]"
              />
            </InputField>
            <InputField label="Initial Status" required>
              <select
                required
                value={formData.status}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, status: e.target.value }))
                }
                className="w-full bg-slate-50 border rounded-lg px-3 py-2 text-xs font-medium outline-none focus:ring-1 focus:ring-[#064E3B]"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </InputField>
          </div>

          <InputField label="Description">
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) =>
                setFormData((p) => ({ ...p, description: e.target.value }))
              }
              className="w-full bg-slate-50 border rounded-lg px-3 py-2 text-xs font-medium outline-none focus:ring-1 focus:ring-[#064E3B] resize-none"
              placeholder="Optional track description..."
            />
          </InputField>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createLoading}
              className="inline-flex items-center gap-2 bg-[#064E3B] text-white px-5 py-2 rounded-xl text-xs font-bold hover:bg-[#064E3B]/90 transition disabled:opacity-50"
            >
              {createLoading && (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              )}
              Create Track
            </button>
          </div>
        </form>
      </FormModal>

      <FormModal
        isOpen={isDistOpen}
        onClose={() => setIsDistOpen(false)}
        title={`Add Distance to ${selectedTrack?.name}`}
      >
        <form onSubmit={handleAddDistance} className="space-y-4">
          <InputField label="Distance (Meters)" required>
            <input
              type="number"
              required
              min={100}
              step={50}
              value={distData.distanceMeters}
              onChange={(e) =>
                setDistData((p) => ({
                  ...p,
                  distanceMeters: Number(e.target.value),
                }))
              }
              className="w-full bg-slate-50 border rounded-lg px-3 py-2 text-xs font-medium outline-none focus:ring-1 focus:ring-[#064E3B]"
              placeholder="e.g. 1600"
            />
          </InputField>

          <InputField label="Distance Name / Label">
            <input
              value={distData.name}
              onChange={(e) =>
                setDistData((p) => ({ ...p, name: e.target.value }))
              }
              className="w-full bg-slate-50 border rounded-lg px-3 py-2 text-xs font-medium outline-none focus:ring-1 focus:ring-[#064E3B]"
              placeholder="e.g. Classic Mile, Sprint"
            />
          </InputField>

          <div className="grid grid-cols-2 gap-4">
            <InputField label="Type">
              <select
                value={distData.type}
                onChange={(e) =>
                  setDistData((p) => ({ ...p, type: e.target.value }))
                }
                className="w-full bg-slate-50 border rounded-lg px-3 py-2 text-xs font-medium outline-none focus:ring-1 focus:ring-[#064E3B]"
              >
                <option value="standard">Standard</option>
                <option value="handicap">Handicap</option>
                <option value="stakes">Stakes</option>
                <option value="trial">Trial</option>
              </select>
            </InputField>
            <InputField label="Status">
              <select
                value={distData.status}
                onChange={(e) =>
                  setDistData((p) => ({ ...p, status: e.target.value }))
                }
                className="w-full bg-slate-50 border rounded-lg px-3 py-2 text-xs font-medium outline-none focus:ring-1 focus:ring-[#064E3B]"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </InputField>
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsDistOpen(false)}
              className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={distLoading}
              className="inline-flex items-center gap-2 bg-[#064E3B] text-white px-5 py-2 rounded-xl text-xs font-bold hover:bg-[#064E3B]/90 transition disabled:opacity-50"
            >
              {distLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Add Distance
            </button>
          </div>
        </form>
      </FormModal>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value?: string | number;
  icon: React.ReactNode;
}) {
  return (
    <div className="p-3 rounded-xl border border-slate-100 bg-slate-50 flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5 text-slate-400">
        {icon}
        <p className="text-[9px] font-bold uppercase tracking-wider">{label}</p>
      </div>
      <p className="text-sm font-black text-slate-700 truncate">
        {value ?? "N/A"}
      </p>
    </div>
  );
}

function InputField({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      {children}
    </div>
  );
}
