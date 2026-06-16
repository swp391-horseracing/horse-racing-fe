import { Star } from "lucide-react";
import useHorse from "../hooks/useHorse.ts";
import NoInfoPage from "./NoInfoPage.tsx";
import HorseSearch from "../components/horse/HorseSearch.tsx";
import { useNavigate } from "react-router-dom";
import type { Horse } from "../services/horseService";

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

function getDisplayStatus(horse: Horse): string {
  if (horse.isRetired) return "Retired";
  return horse.healthStatus || "Unknown";
}

function getStatusColor(horse: Horse): string {
  if (horse.isRetired) return "bg-slate-400";
  switch (horse.healthStatus?.toLowerCase()) {
    case "healthy":
      return "bg-green-500";
    case "recovering":
      return "bg-blue-500";
    case "minor injury":
      return "bg-yellow-500";
    case "injured":
      return "bg-red-500";
    case "under observation":
      return "bg-slate-200";
    default:
      return "bg-slate-400";
  }
}

function HorseRow({
  horse,
  selected,
}: {
  horse: Horse;
  selected: boolean;
}) {
  const navigate = useNavigate();

  return (
    <div
      className={`group flex items-center justify-between px-5 py-4 transition-all border-l-4 ${
        selected
          ? "bg-primary/5 border-l-primary"
          : "border-l-transparent hover:bg-slate-50/50"
      }`}
    >
      <div className="flex items-center gap-4 min-w-0">
        <div className="h-10 w-10 rounded-full overflow-hidden bg-slate-200 shrink-0">
          <img
            src={horse.imageUrl || "/placeholder.jpg"}
            alt={horse.name}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="truncate">
          <p
            className={`font-bold font-headline text-base truncate ${
              selected ? "text-primary" : "text-foreground"
            }`}
          >
            {horse.name}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {horse.breed} · {getAge(horse.birthDate)} · {horse.weightKg}kg
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0 pl-4">
        <span className={`h-2 w-2 rounded-full ${getStatusColor(horse)}`} />
        <span className="text-xs font-medium text-muted-foreground hidden sm:inline">
          {getDisplayStatus(horse)}
        </span>
        <button
          onClick={() => navigate(`/horses/${horse.id}`)}
          className="px-3 py-1.5 text-xs font-bold rounded-lg border border-border bg-card hover:bg-muted/40 transition-colors shrink-0"
        >
          Horse Detail
        </button>
      </div>
    </div>
  );
}

export default function HorsePage() {
  const { horses, loading, error, pagination, setPagination } = useHorse();

  return (
    <div className="h-full overflow-y-auto bg-background">
      <div className="max-w-[1600px] mx-auto m-6">
        <div className="bg-primary px-4 py-8 pt-5 my-6 rounded-sm">
          <h1 className="text-3xl font-black !text-[#F4F6F5]">Horse List</h1>
          <div className="flex max-w-4xl text-lg md:text-2xl leading-relaxed text-[#F4F6F5]">
            The Horse List page allows users to browse all available horses and
            view detailed information about each horse, including ownership,
            health status, weight, and important dates.
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-destructive p-4 text-destructive">
            {error}
          </div>
        )}

        <h1 className="flex items-center justify-left text-xl font-black text-primary gap-2">
          <Star />
          <span className="text-2xl">Spotlight Horse</span>
        </h1>

        <div className="bg-background border-1 border-gray-400 px-4 py-10 my-6 rounded-sm">
          <div className="flex w-full justify-center items-center">
            <NoInfoPage />
          </div>
        </div>

        <div className="w-full mb-4">
          <HorseSearch
            value={pagination.search}
            onChange={(value) =>
              setPagination((prev) => ({
                ...prev,
                search: value,
                page: 1,
              }))
            }
          />
        </div>

        <div>
          {loading ? (
            <div className="rounded-2xl border border-dashed border-border bg-card py-16 text-center">
              <p className="text-sm font-semibold text-muted-foreground">
                Loading horses...
              </p>
            </div>
          ) : horses.length > 0 ? (
            <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden divide-y divide-border">
              {horses.map((horse) => (
                <HorseRow
                  key={horse.id}
                  horse={horse}
                  selected={false}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border bg-card py-16 text-center">
              <p className="text-sm font-semibold text-muted-foreground">
                No horses found.
              </p>
            </div>
          )}

          {pagination.totalPages > 1 && (
            <div className="flex items-center gap-2 pt-3">
              <button
                disabled={pagination.page <= 1}
                onClick={() =>
                  setPagination((prev) => ({
                    ...prev,
                    page: prev.page - 1,
                  }))
                }
                className="border rounded-lg px-3 py-1 disabled:opacity-50"
              >
                Prev
              </button>

              <span className="text-sm text-muted-foreground">
                {pagination.page} / {pagination.totalPages}
              </span>

              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() =>
                  setPagination((prev) => ({
                    ...prev,
                    page: prev.page + 1,
                  }))
                }
                className="border rounded-lg px-3 py-1 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
