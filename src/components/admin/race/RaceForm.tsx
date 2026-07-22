import {
  useState,
  useEffect,
  useCallback,
  startTransition,
  type FormEvent,
} from "react";
import { X, Loader2 } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import { AdminService } from "../../../services/AdminService";

type Track = {
  id: string;
  name: string;
  country: string;
  city: string;
  surfaceType: string;
  distanceMeters: number;
};

type TrackDistanceType = {
  id: string;
  distanceMeters: number;
};

export type RaceFormData = {
  name: string;
  distanceMeters: number;
  trackCondition: string;
  scheduledAt: string;
  venue: string;
  laneCount: number;
  raceNumber?: number;
  trackDistanceId: string;
};

const initialForm: RaceFormData = {
  name: "",
  distanceMeters: 1200,
  trackCondition: "dry",
  scheduledAt: "",
  venue: "",
  laneCount: 8,
  raceNumber: undefined,
  trackDistanceId: "",
};

type Props = {
  initial?: Partial<RaceFormData>;
  initialTrackId?: string;
  onClose: () => void;
  onSubmit: (data: RaceFormData) => Promise<string | null>;
  actionLoading: boolean;
  tournamentStartDate?: string;
  tournamentEndDate?: string;
  onError?: (message: string) => void;
};

export default function RaceForm({
  initial,
  initialTrackId,
  onClose,
  onSubmit,
  actionLoading,
  tournamentStartDate,
  tournamentEndDate,
  onError,
}: Props) {
  const [form, setForm] = useState<RaceFormData>({
    ...initialForm,
    ...initial,
  });
  const [error, setError] = useState<string | null>(null);
  const setFormError = useCallback(
    (msg: string) => {
      setError(msg);
      onError?.(msg);
    },
    [onError]
  );

  const [tracks, setTracks] = useState<Track[]>([]);
  const [tracksLoading, setTracksLoading] = useState(false);
  const [selectedTrackId, setSelectedTrackId] = useState("");
  const [distances, setDistances] = useState<TrackDistanceType[]>([]);
  const [distancesLoading, setDistancesLoading] = useState(false);

  // Seed track selector when editing
  useEffect(() => {
    if (initialTrackId && initial?.trackDistanceId) {
      startTransition(() => {
        setSelectedTrackId(initialTrackId);
      });
    }
  }, [initialTrackId, initial?.trackDistanceId]);

  // Load tracks on mount
  useEffect(() => {
    const load = async () => {
      setTracksLoading(true);
      try {
        const data = await AdminService.getTracks();
        const list = Array.isArray(data) ? data : (data?.data ?? []);
        setTracks(Array.isArray(list) ? list : []);
      } catch {
        setFormError("Failed to load tracks. Please try again.");
      } finally {
        setTracksLoading(false);
      }
    };
    void load();
  }, [setFormError]);

  // When track changes, fetch distances
  useEffect(() => {
    if (!selectedTrackId) return;
    const load = async () => {
      setDistancesLoading(true);
      try {
        const data = await AdminService.getTrackDistances(selectedTrackId);
        const list = Array.isArray(data) ? data : (data?.data ?? []);
        setDistances(Array.isArray(list) ? list : []);
      } catch {
        setDistances([]);
      } finally {
        setDistancesLoading(false);
      }
    };
    void load();
  }, [selectedTrackId]);

  const handleTrackChange = (trackId: string) => {
    setSelectedTrackId(trackId);
    const track = tracks.find((c) => c.id === trackId);
    if (track) {
      setForm((prev) => ({
        ...prev,
        venue: track.name,
        trackDistanceId: "",
        distanceMeters: 0,
      }));
    }
  };

  const handleDistanceChange = (distanceId: string) => {
    const dist = distances.find((d) => d.id === distanceId);
    if (dist) {
      setForm((prev) => ({
        ...prev,
        distanceMeters: dist.distanceMeters,
        trackDistanceId: dist.id,
      }));
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!form.name.trim()) {
      setFormError("Race name is required.");
      return;
    }
    if (!form.scheduledAt) {
      setFormError("Scheduled date is required.");
      return;
    }
    if (!form.trackDistanceId) {
      setFormError("Please select a track and distance.");
      return;
    }

    if (tournamentStartDate && tournamentEndDate) {
      const scheduledMs = new Date(form.scheduledAt).getTime();
      const startMs = new Date(tournamentStartDate).getTime();
      const endMs = new Date(tournamentEndDate).getTime();
      if (scheduledMs < startMs || scheduledMs > endMs) {
        setFormError(
          "Scheduled date must be between tournament start and end dates"
        );
        return;
      }
    }

    const errMsg = await onSubmit({
      ...form,
      scheduledAt: new Date(form.scheduledAt).toISOString(),
    });

    if (errMsg) {
      setFormError(errMsg);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl border p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-[#064E3B]">
            {initial ? "Edit Race" : "Create Race"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">
              Race Name
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, name: e.target.value }))
              }
              className="w-full border rounded-xl px-4 py-3"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">
              Race Number
            </label>
            <input
              type="number"
              min={1}
              value={form.raceNumber ?? ""}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  raceNumber: e.target.value
                    ? Number(e.target.value)
                    : undefined,
                }))
              }
              placeholder="e.g. 1"
              className="w-full border rounded-xl px-4 py-3"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Track</label>
              {tracksLoading ? (
                <div className="flex items-center gap-2 text-sm text-slate-500 py-3">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading tracks...
                </div>
              ) : (
                <select
                  value={selectedTrackId}
                  onChange={(e) => handleTrackChange(e.target.value)}
                  className="w-full border rounded-xl px-4 py-3"
                >
                  <option value="">Select a track</option>
                  {tracks.map((track) => (
                    <option key={track.id} value={track.id}>
                      {track.name} — {track.surfaceType} ({track.city})
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">
                Track Distance
              </label>
              {!selectedTrackId ? (
                <div className="w-full border rounded-xl px-4 py-3 text-sm text-slate-400 bg-slate-50">
                  Select a track first
                </div>
              ) : distancesLoading ? (
                <div className="flex items-center gap-2 text-sm text-slate-500 py-3">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading distances...
                </div>
              ) : distances.length === 0 ? (
                <div className="w-full border rounded-xl px-4 py-3 text-sm text-slate-400 bg-slate-50">
                  No distances available
                </div>
              ) : (
                <select
                    value={form.trackDistanceId}
                    onChange={(e) => handleDistanceChange(e.target.value)}
                    className="w-full border rounded-xl px-4 py-3"
                  >
                    <option value="">Select distance</option>
                    {distances.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.distanceMeters}m
                      </option>
                    ))}
                  </select>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">
                Track Condition
              </label>
              <select
                value={form.trackCondition}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    trackCondition: e.target.value,
                  }))
                }
                className="w-full border rounded-xl px-4 py-3"
              >
                <option value="dry">Dry</option>
                <option value="wet">Wet</option>
                <option value="muddy">Muddy</option>
                <option value="heavy">Heavy</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">
                Lane Count
              </label>
              <input
                type="number"
                min={2}
                max={16}
                value={form.laneCount}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    laneCount: Number(e.target.value),
                  }))
                }
                className="w-full border rounded-xl px-4 py-3"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">
              Scheduled Date & Time
            </label>
            {tournamentStartDate && tournamentEndDate && (
              <p className="text-[11px] text-slate-500 mb-2">
                Tournament period:{" "}
                {new Date(tournamentStartDate).toLocaleDateString("en-GB")} –{" "}
                {new Date(tournamentEndDate).toLocaleDateString("en-GB")}
              </p>
            )}
            <DatePicker
              selected={form.scheduledAt ? new Date(form.scheduledAt) : null}
              onChange={(date: Date | null) =>
                setForm((prev) => ({
                  ...prev,
                  scheduledAt: date ? format(date, "yyyy-MM-dd'T'HH:mm") : "",
                }))
              }
              showTimeSelect
              timeFormat="hh:mm aa"
              timeIntervals={15}
              dateFormat="dd/MM/yyyy hh:mm aa"
              placeholderText="dd/MM/yyyy hh:mm aa"
              className="w-full border rounded-xl px-4 py-3"
              required
              shouldCloseOnSelect
            />
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="submit"
              disabled={actionLoading}
              className="bg-[#064E3B] text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 disabled:opacity-50"
            >
              {actionLoading
                ? "Saving..."
                : initial
                  ? "Save Changes"
                  : "Create Race"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-xl font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>

          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
