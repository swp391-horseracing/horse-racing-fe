import { Star } from "lucide-react";
import { useState, useMemo } from "react";
import useHorse from "../hooks/horse/useHorse.ts";
import NoInfoPage from "./NoInfoPage.tsx";
import HorseSearch from "../components/horse/HorseSearch.tsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { useNavigate } from "react-router-dom";
import type { Horse } from "../types/horse";
import banner from "../assets/images/horse-banner.png";

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

function HorseRow({ horse, selected }: { horse: Horse; selected: boolean }) {
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

  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredHorses = useMemo(() => {
    if (statusFilter === "all") return horses;
    if (statusFilter === "retired") return horses.filter((h) => h.isRetired);
    return horses.filter(
      (h) => !h.isRetired && h.healthStatus?.toLowerCase() === statusFilter
    );
  }, [horses, statusFilter]);

  return (
    <div className="h-full w-full px-40 overflow-y-auto bg-background">
      <div className="mx-auto m-6">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950 via-emerald-900 to-green-900 px-8 py-10 text-white shadow-sm sm:px-10">
          <div className="flex flex-row items-center justify-between h-30">
            <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <h1 className="font-serif text-4xl font-bold tracking-tight !text-white sm:text-5xl">
                  Horse List
                </h1>
                <p className="mt-4 max-w-xl text-base leading-7 text-emerald-50/90 sm:text-lg">
                  Browse all available horses and view detailed information
                  about each horse, including ownership, health status, weight,
                  and important dates.
                </p>
              </div>
            </div>
            <div className="relative inset-y-0 right-0 hidden w-1/2 opacity-20 lg:block">
              <div className="relative pt-60 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.16),transparent_55%)]" />
              <img
                src={banner}
                alt=""
                className="h-full w-full object-cover object-top grayscale"
              />
            </div>
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
          <div className="flex h-60 w-full justify-center items-center">
            <NoInfoPage />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 p-4">
          <div className="w-full sm:max-w-md">
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
          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            <Select
              value={statusFilter}
              onValueChange={(value) => {
                setStatusFilter(value);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
            >
              <SelectTrigger className="w-full sm:w-44 h-10 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="healthy">Healthy</SelectItem>
                <SelectItem value="recovering">Recovering</SelectItem>
                <SelectItem value="minor injury">Minor Injury</SelectItem>
                <SelectItem value="injured">Injured</SelectItem>
                <SelectItem value="under observation">
                  Under Observation
                </SelectItem>
                <SelectItem value="retired">Retired</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          {loading ? (
            <div className="rounded-2xl border border-dashed border-border bg-card py-16 text-center">
              <p className="text-sm font-semibold text-muted-foreground">
                Loading horses...
              </p>
            </div>
          ) : filteredHorses.length > 0 ? (
            <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden divide-y divide-border">
              {filteredHorses.map((horse) => (
                <HorseRow key={horse.id} horse={horse} selected={false} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border bg-card py-16 text-center">
              <p className="text-sm font-semibold text-muted-foreground">
                {statusFilter !== "all"
                  ? "No horses match the selected status."
                  : "No horses found."}
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
