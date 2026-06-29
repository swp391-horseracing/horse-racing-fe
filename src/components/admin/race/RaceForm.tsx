import { useState, useEffect, type FormEvent } from "react";
import { X, Loader2, Plus } from "lucide-react";
import { AdminService } from "../../../services/AdminService";
import AddCourseDistanceModal from "./AddCourseDistanceModal";

type Course = {
  id: string;
  name: string;
  country: string;
  city: string;
  surfaceType: string;
  distanceMeters: number;
};

type CourseDistance = {
  id: string;
  distanceMeters: number;
};

export type RaceFormData = {
  name: string;
  roundName: string;
  distanceMeters: number;
  trackCondition: string;
  scheduledAt: string;
  venue: string;
  laneCount: number;
  raceNumber?: number;
  courseDistanceId: string;
};

const initialForm: RaceFormData = {
  name: "",
  roundName: "",
  distanceMeters: 1200,
  trackCondition: "dry",
  scheduledAt: "",
  venue: "",
  laneCount: 8,
  raceNumber: undefined,
  courseDistanceId: "",
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

  const [courses, setCourses] = useState<Course[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [distances, setDistances] = useState<CourseDistance[]>([]);
  const [distancesLoading, setDistancesLoading] = useState(false);
  const [showAddDistance, setShowAddDistance] = useState(false);

  // Load courses on mount
  useEffect(() => {
    const load = async () => {
      setCoursesLoading(true);
      try {
        const data = await AdminService.getCourses();
        const list = Array.isArray(data) ? data : (data?.data ?? []);
        setCourses(Array.isArray(list) ? list : []);
      } catch {
        // silently fail
      } finally {
        setCoursesLoading(false);
      }
    };
    void load();
  }, []);

  // When course changes, fetch distances
  useEffect(() => {
    if (!selectedCourseId) return;
    const load = async () => {
      setDistancesLoading(true);
      try {
        const data = await AdminService.getCourseDistances(selectedCourseId);
        const list = Array.isArray(data) ? data : (data?.data ?? []);
        setDistances(Array.isArray(list) ? list : []);
      } catch {
        setDistances([]);
      } finally {
        setDistancesLoading(false);
      }
    };
    void load();
  }, [selectedCourseId]);

  const handleCourseChange = (courseId: string) => {
    setSelectedCourseId(courseId);
    const course = courses.find((c) => c.id === courseId);
    if (course) {
      setForm((prev) => ({ ...prev, venue: course.name }));
    }
  };

  const handleDistanceChange = (distanceId: string) => {
    const dist = distances.find((d) => d.id === distanceId);
    if (dist) {
      setForm((prev) => ({
        ...prev,
        distanceMeters: dist.distanceMeters,
        courseDistanceId: dist.id,
      }));
    }
  };

  const handleDistanceCreated = (id: string, meters: number) => {
    setDistances((prev) => [...prev, { id, distanceMeters: meters }]);
    setForm((prev) => ({
      ...prev,
      courseDistanceId: id,
      distanceMeters: meters,
    }));
  };

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
    if (!form.courseDistanceId) {
      setError("Please select a course and distance.");
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

          <div className="grid md:grid-cols-2 gap-4">
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
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Course</label>
              {coursesLoading ? (
                <div className="flex items-center gap-2 text-sm text-slate-500 py-3">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading courses...
                </div>
              ) : (
                <select
                  value={selectedCourseId}
                  onChange={(e) => handleCourseChange(e.target.value)}
                  className="w-full border rounded-xl px-4 py-3"
                >
                  <option value="">Select a course</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.name} — {course.surfaceType} ({course.city})
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">
                Course Distance
              </label>
              {!selectedCourseId ? (
                <div className="w-full border rounded-xl px-4 py-3 text-sm text-slate-400 bg-slate-50">
                  Select a course first
                </div>
              ) : distancesLoading ? (
                <div className="flex items-center gap-2 text-sm text-slate-500 py-3">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading distances...
                </div>
              ) : distances.length === 0 ? (
                <button
                  type="button"
                  onClick={() => setShowAddDistance(true)}
                  className="w-full border border-dashed border-amber-400 bg-amber-50 rounded-xl px-4 py-3 text-sm text-amber-700 font-semibold hover:bg-amber-100 flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Add Distance
                </button>
              ) : (
                <div className="flex gap-2">
                  <select
                    value={form.courseDistanceId}
                    onChange={(e) => handleDistanceChange(e.target.value)}
                    className="flex-1 border rounded-xl px-4 py-3"
                  >
                    <option value="">Select distance</option>
                    {distances.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.distanceMeters}m
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowAddDistance(true)}
                    className="px-3 py-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
                    title="Add new distance"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
            {showAddDistance && selectedCourseId && (
              <AddCourseDistanceModal
                courseId={selectedCourseId}
                courseName={
                  courses.find((c) => c.id === selectedCourseId)?.name ?? ""
                }
                onClose={() => setShowAddDistance(false)}
                onCreated={handleDistanceCreated}
              />
            )}
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
