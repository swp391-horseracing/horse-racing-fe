import { useState, useMemo, useCallback } from "react";
import useJockeys from "../hooks/useJockeys";
import NoInfoPage from "./NoInfoPage";
import JockeySearch from "../components/jockey/JockeySearch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { useNavigate } from "react-router-dom";
import type { Jockey } from "../types/jockey";
import { Star, User } from "lucide-react";
import banner from "../assets/images/horse-banner.png";

function getDisplayStatus(jockey: Jockey): string {
  return jockey.isRacing ? "Racing" : "Active";
}

function getStatusColor(jockey: Jockey): string {
  return jockey.isRacing ? "bg-amber-400" : "bg-green-500";
}

function JockeyRow({
  jockey,
  selected,
}: {
  jockey: Jockey;
  selected: boolean;
}) {
  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate(`/jockeys/${jockey.id}`);
  };

  return (
    <div
      onClick={handleNavigate}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleNavigate();
        }
      }}
      role="button"
      tabIndex={0}
      className={`group flex items-center justify-between px-5 py-4 transition-all border-l-4 cursor-pointer ${
        selected
          ? "bg-primary/5 border-l-primary"
          : "border-l-transparent hover:bg-slate-50/50"
      }`}
    >
      <div className="flex items-center gap-4 min-w-0">
        <div className="h-10 w-10 rounded-full overflow-hidden bg-slate-200 shrink-0 flex items-center justify-center">
          {jockey.avatarUrl ? (
            <img
              src={jockey.avatarUrl}
              alt={jockey.fullName}
              className="h-full w-full object-cover"
            />
          ) : (
            <User className="h-5 w-5 text-slate-400" />
          )}
        </div>
        <div className="truncate">
          <p
            className={`font-bold font-headline text-base truncate ${
              selected ? "text-primary" : "text-foreground"
            }`}
          >
            {jockey.fullName}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Jockey ·{" "}
            {jockey.experienceYear !== null &&
            jockey.experienceYear !== undefined
              ? `${jockey.experienceYear} yrs experience`
              : "N/A experience"}{" "}
            ·{" "}
            {jockey.weightKg !== null && jockey.weightKg !== undefined
              ? `${jockey.weightKg}kg`
              : "N/A weight"}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0 pl-4">
        <span className={`h-2 w-2 rounded-full ${getStatusColor(jockey)}`} />
        <span className="text-xs font-medium text-muted-foreground hidden sm:inline">
          {getDisplayStatus(jockey)}
        </span>
      </div>
    </div>
  );
}

export default function JockeysPage() {
  const { jockeys, loading, error, pagination, setPagination } = useJockeys();

  const [statusFilter, setStatusFilter] = useState<string>("all");

  const handleSearchChange = useCallback(
    (value: string) => {
      setPagination((prev) =>
        prev.search === value && prev.page === 1
          ? prev
          : { ...prev, search: value, page: 1 }
      );
    },
    [setPagination]
  );

  const filteredJockeys = useMemo(() => {
    if (statusFilter === "all") return jockeys;
    if (statusFilter === "racing") return jockeys.filter((j) => j.isRacing);
    if (statusFilter === "active" || statusFilter === "available")
      return jockeys.filter((j) => !j.isRacing);
    return jockeys;
  }, [jockeys, statusFilter]);

  return (
    <div className="h-full w-full px-40 overflow-y-auto bg-background">
      <div className="mx-auto m-6">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950 via-emerald-900 to-green-900 px-8 py-10 text-white shadow-sm sm:px-10">
          <div className="flex flex-row items-center justify-between h-30">
            <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <h1 className="font-serif text-4xl font-bold tracking-tight text-white! sm:text-5xl">
                  Jockey List
                </h1>
                <p className="mt-4 max-w-xl text-base leading-7 text-emerald-50/90 sm:text-lg">
                  Browse all registered jockeys and view detailed information
                  about each jockey, including experience, weight, and racing
                  status.
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

        <h1 className="flex items-center justify-left text-xl font-black text-primary gap-2 mt-6">
          <Star />
          <span className="text-2xl">Spotlight Jockey</span>
        </h1>

        <div className="bg-background border-1 border-gray-400 px-4 py-10 my-6 rounded-sm">
          <div className="flex h-60 w-full justify-center items-center">
            <NoInfoPage />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 p-4">
          <div className="w-full sm:max-w-md">
            <JockeySearch
              value={pagination.search}
              onChange={handleSearchChange}
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
                <SelectItem value="racing">Racing</SelectItem>
                <SelectItem value="active">Active</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          {loading ? (
            <div className="rounded-2xl border border-dashed border-border bg-card py-16 text-center">
              <p className="text-sm font-semibold text-muted-foreground">
                Loading jockeys...
              </p>
            </div>
          ) : filteredJockeys.length > 0 ? (
            <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden divide-y divide-border">
              {filteredJockeys.map((jockey) => (
                <JockeyRow key={jockey.id} jockey={jockey} selected={false} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border bg-card py-16 text-center">
              <p className="text-sm font-semibold text-muted-foreground">
                {statusFilter !== "all"
                  ? "No jockeys match the selected status."
                  : "No jockeys found."}
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
