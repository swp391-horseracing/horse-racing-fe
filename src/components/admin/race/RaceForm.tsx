import { useState, type FormEvent } from "react";
import { X } from "lucide-react";

export type RaceFormData = {
  name: string;
  roundName: string;
  distanceMeters: number;
  trackCondition: string;
  scheduledAt: string;
  venue: string;
  laneCount: number;
  courseDistanceId: string;
  raceNumber?: number;
};

const initialForm: RaceFormData = {
  name: "",
  roundName: "",
  distanceMeters: 1200,
  trackCondition: "dry",
  scheduledAt: "",
  venue: "",
  laneCount: 8,
  courseDistanceId: "",
  raceNumber: undefined,
};

type Props = {
  initial?: Partial<RaceFormData>;
  onClose: () => void;
  onSubmit: (data: RaceFormData) => Promise<boolean>;
  actionLoading: boolean;
};

export default function RaceForm({
  initial,
  onClose,
  onSubmit,
  actionLoading,
}: Props) {
  const [form, setForm] = useState<RaceFormData>({
    ...initialForm,
    ...initial,
  });
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!form.name.trim()) {
      setError("Race name is required.");
      return;
    }
    if (!form.scheduledAt) {
      setError("Scheduled date is required.");
      return;
    }

    const ok = await onSubmit({
      ...form,
      scheduledAt: new Date(form.scheduledAt).toISOString(),
    });

    if (!ok) {
      setError("Failed to save race.");
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

        {error && (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

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

          <div className="grid md:grid-cols-3 gap-4">
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
                    raceNumber: e.target.value ? Number(e.target.value) : undefined,
                  }))
                }
                placeholder="e.g. 1"
                className="w-full border rounded-xl px-4 py-3"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">
                Round Name
              </label>
              <input
                type="text"
                value={form.roundName}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    roundName: e.target.value,
                  }))
                }
                placeholder="e.g. Round 1"
                className="w-full border rounded-xl px-4 py-3"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">
                Distance (meters)
              </label>
              <input
                type="number"
                min={400}
                max={5000}
                value={form.distanceMeters}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    distanceMeters: Number(e.target.value),
                  }))
                }
                className="w-full border rounded-xl px-4 py-3"
              />
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
            <label className="block text-sm font-semibold mb-2">Venue</label>
            <input
              type="text"
              value={form.venue}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, venue: e.target.value }))
              }
              className="w-full border rounded-xl px-4 py-3"
            />
          </div>

          {!form.courseDistanceId && (
            <div>
              <label className="block text-sm font-semibold mb-2">
                Course Distance ID
              </label>
              <input
                type="text"
                value={form.courseDistanceId}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    courseDistanceId: e.target.value,
                  }))
                }
                placeholder="UUID of the course distance"
                className="w-full border rounded-xl px-4 py-3"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold mb-2">
              Scheduled Date & Time
            </label>
            <input
              type="datetime-local"
              value={form.scheduledAt}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  scheduledAt: e.target.value,
                }))
              }
              className="w-full border rounded-xl px-4 py-3"
              required
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
        </form>
      </div>
    </div>
  );
}
