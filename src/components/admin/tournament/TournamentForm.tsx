import { useState, type FormEvent } from "react";
import { X } from "lucide-react";
import DateTimePicker from "../../DateTimePicker.tsx";

type TournamentFormData = {
  name: string;
  startDate: string;
  endDate: string;
  description: string;
  rules: string;
  location: string;
  registrationOpenDate: string;
  registrationCloseDate: string;
  maximumParticipants: number;
  minimumParticipants: number;
  prizePool: number;
};

const initialForm: TournamentFormData = {
  name: "",
  startDate: "",
  endDate: "",
  description: "",
  rules: "",
  location: "",
  registrationOpenDate: "",
  registrationCloseDate: "",
  maximumParticipants: 10,
  minimumParticipants: 2,
  prizePool: 1000,
};

function toISODateTime(value: string) {
  return value ? new Date(value).toISOString() : "";
}

export function TournamentForm({
  onClose,
  createTournament,
  actionLoading,
}: {
  onClose: () => void;
  createTournament: (tournament: TournamentFormData) => Promise<unknown>;
  actionLoading: boolean;
}) {
  const [form, setForm] = useState<TournamentFormData>(initialForm);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (form.prizePool <= 0) {
      setError("Prize pool must be greater than 0.");
      return;
    }

    const payload: TournamentFormData = {
      ...form,
      startDate: toISODateTime(form.startDate),
      endDate: toISODateTime(form.endDate),
      registrationOpenDate: toISODateTime(form.registrationOpenDate),
      registrationCloseDate: toISODateTime(form.registrationCloseDate),
    };

    const result = await createTournament(payload);

    if (result) {
      alert("Tournament created successfully");
      setForm(initialForm);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl border p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-[#064E3B]">
            Create Tournament
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

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold mb-2">
              Tournament Name
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  name: e.target.value,
                }))
              }
              className="w-full border rounded-xl px-4 py-3"
              required
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">
                Start Date
              </label>
              <input
                type="datetime-local"
                value={form.startDate}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    startDate: e.target.value,
                  }))
                }
                className="w-full border rounded-xl px-4 py-3"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                End Date
              </label>
              <input
                type="datetime-local"
                value={form.endDate}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    endDate: e.target.value,
                  }))
                }
                className="w-full border rounded-xl px-4 py-3"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">
              Description
            </label>
            <textarea
              rows={4}
              value={form.description}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className="w-full border rounded-xl px-4 py-3"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Rules</label>
            <textarea
              rows={4}
              value={form.rules}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  rules: e.target.value,
                }))
              }
              className="w-full border rounded-xl px-4 py-3"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Location</label>
            <input
              type="text"
              value={form.location}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  location: e.target.value,
                }))
              }
              className="w-full border rounded-xl px-4 py-3"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">
                Registration Open Date
              </label>
              <input
                type="datetime-local"
                value={form.registrationOpenDate}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    registrationOpenDate: e.target.value,
                  }))
                }
                className="w-full border rounded-xl px-4 py-3"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Registration Close Date
              </label>
              <DateTimePicker
                value={form.registrationCloseDate}
                onChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    registrationCloseDate: value,
                  }))
                }
              />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">
                Maximum Participants
              </label>
              <input
                type="number"
                min={1}
                value={form.maximumParticipants}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    maximumParticipants: Number(e.target.value),
                  }))
                }
                className="w-full border rounded-xl px-4 py-3"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Minimum Participants
              </label>
              <input
                type="number"
                min={1}
                value={form.minimumParticipants}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    minimumParticipants: Number(e.target.value),
                  }))
                }
                className="w-full border rounded-xl px-4 py-3"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Prize Pool
              </label>
              <input
                type="number"
                min={1}
                value={form.prizePool}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    prizePool: Number(e.target.value),
                  }))
                }
                className="w-full border rounded-xl px-4 py-3"
              />
            </div>
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="submit"
              disabled={actionLoading}
              className="bg-[#064E3B] text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 disabled:opacity-50"
            >
              {actionLoading ? "Creating..." : "Create Tournament"}
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
