import { useEffect, useMemo, useState } from "react";
import { useFormik } from "formik";
import { toFormikValidationSchema } from "zod-formik-adapter";
import TournamentStatus from "./TournamentStatus";
import {
  type TournamentFormValues,
  tournamentSchema,
} from "../../../styles/schema/tournamentSchema";
import {
  formatTournamentStatus,
  getAvailableStatuses,
} from "../../../styles/schema/tournamentStatusFlow";
import type { Tournament } from "../../../types/tournament.ts";

type Props = {
  tournament: Tournament;
  onUpdate?: (id: string, data: TournamentFormValues) => Promise<boolean>;
  onStatusChange?: (id: string, status: string) => Promise<boolean>;
};

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function toDateTimeLocal(value?: string) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function toISO(value: string) {
  if (!value) return "";
  return new Date(value).toISOString();
}

function ErrorText({ text }: { text?: string }) {
  if (!text) return null;
  return <p className="mt-1 text-xs text-rose-600">{text}</p>;
}

export default function TournamentDetail({
  tournament,
  onUpdate,
  onStatusChange,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [status, setStatus] = useState(tournament.status);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStatus(tournament.status);
  }, [tournament.id, tournament.status]);

  const availableStatuses = useMemo(
    () => getAvailableStatuses(tournament.status),
    [tournament.status]
  );

  const formik = useFormik<TournamentFormValues>({
    enableReinitialize: true,
    initialValues: {
      name: tournament.name ?? "",
      startDate: toDateTimeLocal(tournament.startDate),
      endDate: toDateTimeLocal(tournament.endDate),
      description: tournament.description ?? "",
      rules: tournament.rules ?? "",
      location: tournament.location ?? "",
      registrationOpenDate: toDateTimeLocal(tournament.registrationOpenDate),
      registrationCloseDate: toDateTimeLocal(tournament.registrationCloseDate),
      prizePool: tournament.prizePool ?? 1000,
      maximumParticipants: tournament.maximumParticipants ?? 20,
      minimumParticipants: tournament.minimumParticipants ?? 10,
    },
    validationSchema: toFormikValidationSchema(tournamentSchema),
    onSubmit: async (values) => {
      if (!onUpdate) return;

      const payload: TournamentFormValues = {
        ...values,
        startDate: toISO(values.startDate),
        endDate: toISO(values.endDate),
        registrationOpenDate: toISO(values.registrationOpenDate),
        registrationCloseDate: toISO(values.registrationCloseDate),
      };

      const success = await onUpdate(tournament.id, payload);

      if (success) {
        setEditing(false);
      }
    },
  });

  const handleStatusUpdate = async () => {
    if (!onStatusChange) return;
    await onStatusChange(tournament.id, status);
  };

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center gap-3">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-[#064E3B]">
            {tournament.name}
          </h2>
          <TournamentStatus status={tournament.status} />
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => setEditing((prev) => !prev)}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold"
        >
          {editing ? "Cancel Edit" : "Edit Tournament"}
        </button>

        <div className="flex gap-2 items-center flex-wrap">
          <select
            value={status}
            onChange={(e) =>
              setStatus(e.target.value as typeof tournament.status)
            }
            className="border rounded-lg px-3 py-2 text-sm"
          >
            {availableStatuses.map((item) => (
              <option key={item} value={item}>
                {formatTournamentStatus(item)}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={handleStatusUpdate}
            className="px-4 py-2 rounded-lg bg-amber-600 text-white text-sm font-semibold"
          >
            Update Status
          </button>
        </div>
      </div>

      {editing ? (
        <form
          onSubmit={formik.handleSubmit}
          className="space-y-4 border rounded-xl p-4 bg-slate-50"
        >
          <div>
            <label className="font-medium text-sm">Name</label>
            <input
              name="name"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full border rounded-lg p-2 mt-1"
            />
            <ErrorText
              text={formik.touched.name ? formik.errors.name : undefined}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-medium text-sm">Start Date</label>
              <input
                type="datetime-local"
                name="startDate"
                value={formik.values.startDate}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full border rounded-lg p-2 mt-1"
              />
              <ErrorText
                text={
                  formik.touched.startDate ? formik.errors.startDate : undefined
                }
              />
            </div>

            <div>
              <label className="font-medium text-sm">End Date</label>
              <input
                type="datetime-local"
                name="endDate"
                value={formik.values.endDate}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full border rounded-lg p-2 mt-1"
              />
              <ErrorText
                text={
                  formik.touched.endDate ? formik.errors.endDate : undefined
                }
              />
            </div>
          </div>

          <div>
            <label className="font-medium text-sm">Description</label>
            <textarea
              name="description"
              value={formik.values.description}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full border rounded-lg p-2 mt-1 min-h-[96px]"
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
            <label className="font-medium text-sm">Rules</label>
            <textarea
              name="rules"
              value={formik.values.rules}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full border rounded-lg p-2 mt-1 min-h-[96px]"
            />
            <ErrorText
              text={formik.touched.rules ? formik.errors.rules : undefined}
            />
          </div>

          <div>
            <label className="font-medium text-sm">Location</label>
            <input
              name="location"
              value={formik.values.location}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full border rounded-lg p-2 mt-1"
            />
            <ErrorText
              text={
                formik.touched.location ? formik.errors.location : undefined
              }
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-medium text-sm">
                Registration Open Date
              </label>
              <input
                type="datetime-local"
                name="registrationOpenDate"
                value={formik.values.registrationOpenDate}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full border rounded-lg p-2 mt-1"
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
              <label className="font-medium text-sm">
                Registration Close Date
              </label>
              <input
                type="datetime-local"
                name="registrationCloseDate"
                value={formik.values.registrationCloseDate}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full border rounded-lg p-2 mt-1"
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="font-medium text-sm">Prize Pool</label>
              <input
                type="number"
                name="prizePool"
                value={formik.values.prizePool}
                onChange={(e) =>
                  formik.setFieldValue("prizePool", Number(e.target.value))
                }
                onBlur={formik.handleBlur}
                className="w-full border rounded-lg p-2 mt-1"
              />
              <ErrorText
                text={
                  formik.touched.prizePool ? formik.errors.prizePool : undefined
                }
              />
            </div>

            <div>
              <label className="font-medium text-sm">
                Maximum Participants
              </label>
              <input
                type="number"
                name="maximumParticipants"
                value={formik.values.maximumParticipants}
                onChange={(e) =>
                  formik.setFieldValue(
                    "maximumParticipants",
                    Number(e.target.value)
                  )
                }
                onBlur={formik.handleBlur}
                className="w-full border rounded-lg p-2 mt-1"
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
              <label className="font-medium text-sm">
                Minimum Participants
              </label>
              <input
                type="number"
                name="minimumParticipants"
                value={formik.values.minimumParticipants}
                onChange={(e) =>
                  formik.setFieldValue(
                    "minimumParticipants",
                    Number(e.target.value)
                  )
                }
                onBlur={formik.handleBlur}
                className="w-full border rounded-lg p-2 mt-1"
              />
              <ErrorText
                text={
                  formik.touched.minimumParticipants
                    ? formik.errors.minimumParticipants
                    : undefined
                }
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={!formik.isValid || formik.isSubmitting}
            className="px-5 py-2 rounded-lg bg-[#064E3B] text-white font-semibold disabled:opacity-50"
          >
            Save Changes
          </button>
        </form>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Location:</strong> {tournament.location}
            </div>

            <div>
              <strong>Prize Pool:</strong> ${tournament.prizePool ?? 0}
            </div>

            <div>
              <strong>Start Date:</strong>{" "}
              {tournament.startDate
                ? new Date(tournament.startDate).toLocaleString()
                : "-"}
            </div>

            <div>
              <strong>End Date:</strong>{" "}
              {tournament.endDate
                ? new Date(tournament.endDate).toLocaleString()
                : "-"}
            </div>

            <div>
              <strong>Registration Open:</strong>{" "}
              {tournament.registrationOpenDate
                ? new Date(tournament.registrationOpenDate).toLocaleString()
                : "-"}
            </div>

            <div>
              <strong>Registration Close:</strong>{" "}
              {tournament.registrationCloseDate
                ? new Date(tournament.registrationCloseDate).toLocaleString()
                : "-"}
            </div>

            <div>
              <strong>Max Participants:</strong>{" "}
              {tournament.maximumParticipants ?? 0}
            </div>

            <div>
              <strong>Min Participants:</strong>{" "}
              {tournament.minimumParticipants ?? 0}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="whitespace-pre-wrap">
              {tournament.description || "No description available."}
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <h3 className="font-semibold mb-2">Rules</h3>
            <p className="whitespace-pre-wrap">
              {tournament.rules || "No rules available."}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
