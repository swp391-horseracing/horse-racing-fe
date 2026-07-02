import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowRight,
  Calendar,
  ChevronLeft,
  Heart,
  PlayCircle,
  ArrowLeft,
} from "lucide-react";
import useHorse from "../hooks/horse/useHorse.ts";
import useAuth from "../hooks/auth/useAuth.ts";

function getAge(birthDate?: string) {
  if (!birthDate) return "N/A";
  const birth = new Date(birthDate);
  if (Number.isNaN(birth.getTime())) return "N/A";

  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return `${Math.max(age, 0)} yrs`;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <span className="text-slate-500">{label}</span>
      <div className="font-semibold text-[#173a35] text-right">{value}</div>
    </div>
  );
}

function SectionTitle({
  title,
  action,
}: {
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex items-center justify-between gap-4">
      <h2 className="text-2xl font-semibold text-[#173a35]">{title}</h2>
      {action}
    </div>
  );
}

export default function HorseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { selectedHorse, detailLoading, openHorse } = useHorse();
  const { getUserByID } = useAuth();

  const [ownerName, setOwnerName] = useState("Unknown");

  useEffect(() => {
    if (!id) return;

    void openHorse(id);
  }, [id, openHorse]);

  useEffect(() => {
    if (!selectedHorse?.ownerId) return;

    let alive = true;
    getUserByID(selectedHorse.ownerId)
      .then((user) => {
        if (alive) setOwnerName(user.full_name ?? "Unknown");
      })
      .catch(() => {
        if (alive) setOwnerName("Unknown");
      });

    return () => {
      alive = false;
    };
  }, [selectedHorse?.ownerId, getUserByID]);

  const age = useMemo(
    () => getAge(selectedHorse?.birthDate),
    [selectedHorse?.birthDate]
  );

  if (detailLoading || (!selectedHorse && id)) {
    return (
      <div className="min-h-screen bg-[#f2f4f1] px-3 py-3">
        <div className="">Loading horse detail...</div>
      </div>
    );
  }

  if (!selectedHorse) {
    return (
      <div className="min-h-screen bg-[#f2f4f1] px-3 py-3">
        <div className="mx-auto max-w-[1440px] rounded-[18px] border-4 border-[#6d61e8] bg-white p-8 shadow-sm">
          Horse not found.
          <div className="mt-4">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold text-[#173a35]"
            >
              <ChevronLeft className="h-4 w-4" />
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const performanceRows = [
    {
      date: "No Info yet",
      event: "No Info yet",
      position: "No Info yet",
      jockey: "No Info yet",
      purse: "No Info yet",
    },
  ];

  return (
    <div className="h-full w-full px-40 py-4 overflow-y-auto bg-background">
      <div className="mx-auto max-w-full overflow-hidden">
        <div className="relative overflow-hidden bg-[#173a35] rounded-3xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.16),_transparent_28%),linear-gradient(135deg,rgba(18,54,45,0.98),rgba(24,73,58,0.92))]" />
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
              backgroundSize: "52px 52px",
            }}
          />
          <div className="relative h-full px-10">
            <div className="flex h-full flex-col justify-end gap-8 md:flex-row md:items-end md:justify-between py-8">
              <div className="flex flex-col gap-5 md:flex-row md:items-center">
                <div className="overflow-hidden">
                  <img
                    src={
                      selectedHorse.imageUrl ||
                      "https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&w=900&q=80"
                    }
                    alt={selectedHorse.name}
                    className="h-[160px] w-[160px] object-cover rounded-xl"
                  />
                </div>

                <div className="max-w-3xl text-white">
                  <div className="mb-4 flex flex-wrap items-center gap-3 text-xs font-semibold tracking-[0.16em]">
                    <span className="rounded-full bg-amber-300 px-3 py-1 text-[#173a35]">
                      No Info
                    </span>
                    <span className="rounded-full bg-[#254f45] px-3 py-1 text-white">
                      No Info
                    </span>
                  </div>

                  <h1 className="text-4xl font-semibold tracking-tight !text-[#F4F6F5] md:text-5xl">
                    {selectedHorse.name}
                  </h1>

                  <p className="mt-4 max-w-2xl text-base font-medium leading-7 text-white/80 md:text-lg">
                    {selectedHorse.breed} • {age} • Owned by {ownerName}
                  </p>
                </div>
              </div>

              <div className="h-full flex flex-col gap-3 md:items-end">
                <button
                  onClick={() => navigate(-1)}
                  className="inline-flex items-center gap-2 mb-6 rounded-xl border border-white/20 bg-white/10 px-3 py-3 font-semibold text-white backdrop-blur transition hover:bg-white/15"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <button className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-1 font-semibold text-white backdrop-blur transition hover:bg-white/15">
                  <Heart className="h-4 w-4" />
                  Add to Favorite
                </button>
                <button className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-1 font-semibold text-white backdrop-blur transition hover:bg-white/15">
                  <PlayCircle className="h-4 w-4" />
                  View Race History
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="grid gap-6 py-6 lg:grid-cols-[minmax(0,1fr)_290px]">
          <div className="space-y-6">
            <section>
              <SectionTitle
                title="Performance History"
                action={
                  <button className="inline-flex items-center gap-2 text-sm font-semibold text-[#173a35]">
                    Full History <ArrowRight className="h-4 w-4" />
                  </button>
                }
              />

              <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
                <table className="w-full border-collapse text-left text-sm">
                  <thead className="bg-slate-50 text-[11px] uppercase tracking-[0.18em] text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Event</th>
                      <th className="px-4 py-3">Position</th>
                      <th className="px-4 py-3">Jockey</th>
                      <th className="px-4 py-3">Purse</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {performanceRows.map((row) => (
                      <tr
                        key={`${row.date}-${row.event}`}
                        className="hover:bg-slate-50"
                      >
                        <td className="px-4 py-4 font-medium text-slate-700">
                          {row.date}
                        </td>
                        <td className="px-4 py-4 text-slate-700">
                          {row.event}
                        </td>
                        <td className="px-4 py-4">
                          <span className="rounded bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-900">
                            {row.position}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-slate-700">
                          {row.jockey}
                        </td>
                        <td className="px-4 py-4 font-semibold text-slate-700">
                          {row.purse}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <SectionTitle title="Physical Specs" />
            <section className="rounded-2xl border bg-white p-6 shadow-sm">
              <div className="space-y-1 text-sm">
                <InfoRow
                  label="Status"
                  value={
                    (selectedHorse as any).isRetired ? "Retired" : "Active"
                  }
                />
                <InfoRow
                  label="Weight"
                  value={`${selectedHorse.weightKg ?? "No Info"} kg`}
                />
                <InfoRow
                  label="Breed"
                  value={(selectedHorse as any).breed ?? "No Info"}
                />
                <InfoRow
                  label="Health"
                  value={(selectedHorse as any).healthStatus ?? "No Info"}
                />
                <InfoRow
                  label="Created"
                  value={
                    formatDate((selectedHorse as any).createdAt) ?? "No Info"
                  }
                />
                <InfoRow
                  label="Updated"
                  value={
                    formatDate((selectedHorse as any).updatedAt) ?? "No Info"
                  }
                />
              </div>
            </section>

            <section className="rounded-2xl bg-[#163c35] p-6 text-white shadow-sm">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Calendar className="h-4 w-4" />
                Breeding Status
              </div>
              <p className="mt-4 text-sm leading-7 text-white/80">
                Currently accepting applications for the next season. Limited
                slots remaining.
              </p>
              <button className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-white px-4 py-3 text-sm font-semibold text-[#173a35] transition hover:bg-slate-100">
                Check Availability
              </button>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
