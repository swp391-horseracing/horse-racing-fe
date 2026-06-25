import { useState } from "react";
import { useFormik } from "formik";
import { toFormikValidationSchema } from "zod-formik-adapter";
import { X } from "lucide-react";
import {
  type TournamentFormValues,
  tournamentSchema,
} from "../../../styles/schema/tournamentSchema";

function toISO(value: string) {
  if (!value) return "";
  return new Date(value).toISOString();
}

function ErrorText({ text }: { text?: string }) {
  if (!text) return null;
  return <p className="mt-1 text-xs text-rose-600">{text}</p>;
}

export function TournamentForm({
  onClose,
  createTournament,
  actionLoading,
}: {
  onClose: () => void;
  createTournament: (tournament: TournamentFormValues) => Promise<unknown>;
  actionLoading: boolean;
}) {
  const [serverError, setServerError] = useState<string | null>(null);

  const formik = useFormik<TournamentFormValues>({
    initialValues: {
      name: "",
      startDate: "",
      endDate: "",
      description: "",
      rules: "",
      location: "",
      registrationOpenDate: "",
      registrationCloseDate: "",
      prizePool: 1000,
      maximumParticipants: 10,
      minimumParticipants: 2,
    },
    validationSchema: toFormikValidationSchema(tournamentSchema),
    onSubmit: async (values) => {
      setServerError(null);

      const payload: TournamentFormValues = {
        ...values,
        startDate: toISO(values.startDate),
        endDate: toISO(values.endDate),
        registrationOpenDate: toISO(values.registrationOpenDate),
        registrationCloseDate: toISO(values.registrationCloseDate),
      };

      const result = await createTournament(payload);

      if (result) {
        formik.resetForm();
        onClose();
      }
    },
  });

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

        {serverError && (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {serverError}
          </div>
        )}

        <form onSubmit={formik.handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold mb-2">
              Tournament Name
            </label>
            <input
              type="text"
              name="name"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full border rounded-xl px-4 py-3"
            />
            <ErrorText
              text={formik.touched.name ? formik.errors.name : undefined}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">
                Start Date
              </label>
              <input
                type="datetime-local"
                name="startDate"
                value={formik.values.startDate}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full border rounded-xl px-4 py-3"
              />
              <ErrorText
                text={
                  formik.touched.startDate ? formik.errors.startDate : undefined
                }
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                End Date
              </label>
              <input
                type="datetime-local"
                name="endDate"
                value={formik.values.endDate}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full border rounded-xl px-4 py-3"
              />
              <ErrorText
                text={
                  formik.touched.endDate ? formik.errors.endDate : undefined
                }
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">
              Description
            </label>
            <textarea
              name="description"
              rows={4}
              value={formik.values.description}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full border rounded-xl px-4 py-3"
            />
            <ErrorText
              text={
                formik.touched.description
                  ? formik.errors.description
                  : undefined
              }
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Rules</label>
            <textarea
              name="rules"
              rows={4}
              value={formik.values.rules}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full border rounded-xl px-4 py-3"
            />
            <ErrorText
              text={formik.touched.rules ? formik.errors.rules : undefined}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Location</label>
            <input
              type="text"
              name="location"
              value={formik.values.location}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full border rounded-xl px-4 py-3"
            />
            <ErrorText
              text={
                formik.touched.location ? formik.errors.location : undefined
              }
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">
                Registration Open Date
              </label>
              <input
                type="datetime-local"
                name="registrationOpenDate"
                value={formik.values.registrationOpenDate}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full border rounded-xl px-4 py-3"
              />
              <ErrorText
                text={
                  formik.touched.registrationOpenDate
                    ? formik.errors.registrationOpenDate
                    : undefined
                }
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Registration Close Date
              </label>
              <input
                type="datetime-local"
                name="registrationCloseDate"
                value={formik.values.registrationCloseDate}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full border rounded-xl px-4 py-3"
              />
              <ErrorText
                text={
                  formik.touched.registrationCloseDate
                    ? formik.errors.registrationCloseDate
                    : undefined
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
                name="maximumParticipants"
                min={1}
                value={formik.values.maximumParticipants}
                onChange={(e) =>
                  formik.setFieldValue(
                    "maximumParticipants",
                    Number(e.target.value)
                  )
                }
                onBlur={formik.handleBlur}
                className="w-full border rounded-xl px-4 py-3"
              />
              <ErrorText
                text={
                  formik.touched.maximumParticipants
                    ? formik.errors.maximumParticipants
                    : undefined
                }
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Minimum Participants
              </label>
              <input
                type="number"
                name="minimumParticipants"
                min={1}
                value={formik.values.minimumParticipants}
                onChange={(e) =>
                  formik.setFieldValue(
                    "minimumParticipants",
                    Number(e.target.value)
                  )
                }
                onBlur={formik.handleBlur}
                className="w-full border rounded-xl px-4 py-3"
              />
              <ErrorText
                text={
                  formik.touched.minimumParticipants
                    ? formik.errors.minimumParticipants
                    : undefined
                }
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Prize Pool
              </label>
              <input
                type="number"
                name="prizePool"
                min={1}
                value={formik.values.prizePool}
                onChange={(e) =>
                  formik.setFieldValue("prizePool", Number(e.target.value))
                }
                onBlur={formik.handleBlur}
                className="w-full border rounded-xl px-4 py-3"
              />
              <ErrorText
                text={
                  formik.touched.prizePool ? formik.errors.prizePool : undefined
                }
              />
            </div>
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="submit"
              disabled={formik.isSubmitting || actionLoading}
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
