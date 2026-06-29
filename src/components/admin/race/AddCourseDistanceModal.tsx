import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { AdminService } from "../../../services/AdminService";

type Props = {
  courseId: string;
  courseName: string;
  onClose: () => void;
  onCreated: (id: string, distanceMeters: number) => void;
};

export default function AddCourseDistanceModal({
  courseId,
  courseName,
  onClose,
  onCreated,
}: Props) {
  const [distanceMeters, setDistanceMeters] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);

    const meters = Number(distanceMeters);
    if (!meters || meters < 100) {
      setError("Distance must be at least 100 meters.");
      return;
    }

    setSaving(true);
    try {
      const res = await AdminService.createCourseDistance(
        courseId,
        meters
      );
      const newId = res?.id ?? res?.data?.id;
      if (newId) {
        onCreated(newId, meters);
      } else {
        onCreated("", meters);
      }
      onClose();
    } catch {
      setError("Failed to create course distance.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl border p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-[#064E3B]">
            Add Course Distance
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-sm text-slate-600 mb-4">
          Adding a distance for <strong>{courseName}</strong>
        </p>

        {error && (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">
              Distance (meters)
            </label>
            <input
              type="number"
              min={100}
              value={distanceMeters}
              onChange={(e) => setDistanceMeters(e.target.value)}
              className="w-full border rounded-xl px-4 py-3"
              required
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              disabled={saving}
              onClick={handleSubmit}
              className="flex-1 bg-[#064E3B] text-white px-4 py-2.5 rounded-xl font-semibold hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              Add Distance
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
