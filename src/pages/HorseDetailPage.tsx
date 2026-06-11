import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowRight,
  Calendar,
  ChevronLeft,
  Heart,
  ShieldCheck,
  Star,
  Weight,
  PlayCircle,
  ArrowLeft,
  Clock7,
  Info,
} from "lucide-react";
import useHorse from "../hooks/useHorse.ts";
import useAuth from "../hooks/useAuth.ts";
import { ROUTES } from "../router/routes.tsx";

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

function StatCard({
  label,
  value,
  subValue,
  highlighted = false,
}: {
  label: string;
  value: string;
  subValue?: string;
  highlighted?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 shadow-sm ${
        highlighted
          ? "border-amber-300 bg-[#f9f3dd]"
          : "border-slate-200 bg-white"
      }`}
    >
      <div className="text-center text-[11px] uppercase tracking-[0.24em] text-slate-500">
        {label}
      </div>
      <div className="mt-3 text-center text-3xl font-semibold text-[#173a35]">
        {value}
      </div>
      {subValue ? (
        <div className="mt-2 text-center text-[11px] text-slate-500">
          {subValue}
        </div>
      ) : null}
      <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          className={`h-full rounded-full ${
            highlighted ? "bg-amber-600" : "bg-[#173a35]"
          }`}
          style={{ width: highlighted ? "74%" : "66%" }}
        />
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <div className="flex items-center gap-2 text-slate-500">
        {icon}
        <span>{label}</span>
      </div>
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

  // const careerWins = useMemo(() => {
  //     if (!selectedHorse) return "0/0";
  //     const wins = (selectedHorse as any).wins ?? (selectedHorse as any).winCount ?? 14;
  //     const races = (selectedHorse as any).races ?? (selectedHorse as any).raceCount ?? 22;
  //     return `${wins}/${races}`;
  // }, [selectedHorse]);
  //
  // const winRate = useMemo(() => {
  //     if (!selectedHorse) return "0%";
  //     const wins = (selectedHorse as any).wins ?? (selectedHorse as any).winCount ?? 14;
  //     const races = (selectedHorse as any).races ?? (selectedHorse as any).raceCount ?? 22;
  //     if (!races) return "0%";
  //     return `${Math.round((wins / races) * 100)}%`;
  // }, [selectedHorse]);

  if (detailLoading || (!selectedHorse && id)) {
    return (
      <div className="min-h-screen bg-[#f2f4f1] px-3 py-3">
        <div className="mx-auto max-w-[1440px] rounded-[18px] border-4 border-[#6d61e8] bg-white p-8 shadow-sm">
          Loading horse detail...
        </div>
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
    <div className="h-full w-full overflow-y-auto bg-background">
      <div className="mx-auto max-w-full shadow-2xl overflow-hidden">
        <section className="relative overflow-hidden bg-[#173a35]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.16),_transparent_28%),linear-gradient(135deg,rgba(18,54,45,0.98),rgba(24,73,58,0.92))]" />
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)",
              backgroundSize: "52px 52px",
            }}
          />
          <div className="relative h-full px-6 py-8 md:px-10 md:py-10">
            <div className="flex h-full flex-col justify-end gap-8 md:flex-row md:items-end md:justify-between">
              <div className="flex flex-col gap-5 md:flex-row md:items-center">
                <div className="overflow-hidden rounded-xl border border-white/20 bg-black/20 shadow-2xl">
                  <img
                    src={
                      selectedHorse.imageUrl ||
                      "https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&w=900&q=80"
                    }
                    alt={selectedHorse.name}
                    className="h-[200px] w-[200px] object-cover"
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

              <div className="flex flex-col gap-3 md:items-end">
                <button
                  onClick={() => navigate(ROUTES.HORSES)}
                  className="inline-flex items-center gap-2 mb-10 rounded-xl border border-white/20 bg-white/10 px-3 py-3 font-semibold text-white backdrop-blur transition hover:bg-white/15"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <button className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-3 font-semibold text-white backdrop-blur transition hover:bg-white/15">
                  <Heart className="h-4 w-4" />
                  Add to Favorite
                </button>
                <button className="inline-flex items-center gap-2 rounded-xl bg-[#4d6b5f] px-5 py-3 font-semibold text-white transition hover:bg-[#466359]">
                  <PlayCircle className="h-4 w-4" />
                  View Race History
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Body */}
        <div className="grid gap-6 px-4 py-6 lg:grid-cols-[minmax(0,1fr)_290px] lg:px-6">
          <div className="space-y-6">
            <section>
              <SectionTitle title="Stat Dashboard" />
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                  label="Speed Rating"
                  value={
                    (selectedHorse as any).speedRating?.toString() ??
                    "No Info yet"
                  }
                />
                <StatCard
                  label="Stamina"
                  value={
                    (selectedHorse as any).stamina?.toString() ?? "No Info yet"
                  }
                />
                <StatCard
                  label="Agility"
                  value={
                    (selectedHorse as any).agility?.toString() ?? "No Info yet"
                  }
                />
                <StatCard
                  label="Career Wins"
                  value={
                    (selectedHorse as any).agility?.toString() ?? "No Info yet"
                  }
                  highlighted
                />
              </div>
            </section>

            <section className="rounded-2xl border bg-[#eef2ef] p-6 shadow-sm">
              <SectionTitle title="Heritage & Lineage" />
              <div className="grid gap-4 md:grid-cols-[1fr_1fr] xl:grid-cols-[1fr_180px_1fr] xl:items-center">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm">
                  <div className="text-[11px] uppercase tracking-[0.2em] text-slate-500">
                    Subject
                  </div>
                  <div className="mt-2 font-semibold text-[#173a35]">
                    {selectedHorse.name}
                  </div>
                </div>

                <div className="hidden justify-center xl:flex">
                  <div className="h-px w-full bg-slate-300" />
                </div>

                <div className="space-y-4">
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm">
                    <div className="text-[11px] uppercase tracking-[0.2em] text-slate-500">
                      Sire
                    </div>
                    <div className="mt-2 font-semibold text-[#173a35]">
                      No Info yet
                    </div>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm">
                    <div className="text-[11px] uppercase tracking-[0.2em] text-slate-500">
                      Dam
                    </div>
                    <div className="mt-2 font-semibold text-[#173a35]">
                      No Info yet
                    </div>
                  </div>
                </div>
              </div>
            </section>

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
            <section className="rounded-2xl border bg-white p-6 mt-13 shadow-sm">
              <SectionTitle title="Physical Specs" />
              <div className="space-y-1 text-sm">
                <InfoRow
                  label="Status"
                  value={
                    (selectedHorse as any).isRetired ? "Retired" : "Active"
                  }
                  icon={<Info className="h-4 w-4" />}
                />
                <InfoRow
                  label="Weight"
                  value={`${selectedHorse.weightKg ?? "No Info"} kg`}
                  icon={<Weight className="h-4 w-4" />}
                />
                <InfoRow
                  label="Breed"
                  value={(selectedHorse as any).breed ?? "No Info"}
                  icon={<Star className="h-4 w-4" />}
                />
                <InfoRow
                  label="Health"
                  value={(selectedHorse as any).healthStatus ?? "No Info"}
                  icon={<ShieldCheck className="h-4 w-4" />}
                />
                <InfoRow
                  label="Created"
                  value={
                    formatDate((selectedHorse as any).createdAt) ?? "No Info"
                  }
                  icon={<Clock7 className="h-4 w-4" />}
                />
                <InfoRow
                  label="Updated"
                  value={
                    formatDate((selectedHorse as any).updatedAt) ?? "No Info"
                  }
                  icon={<Clock7 className="h-4 w-4" />}
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
