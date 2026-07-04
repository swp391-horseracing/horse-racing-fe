export const RACE_STATUS_STYLES: Record<string, string> = {
  draft: "bg-slate-100 text-slate-600 border-slate-200",
  scheduled: "bg-blue-50 text-blue-700 border-blue-200",
  pre_race: "bg-violet-50 text-violet-700 border-violet-200",
  ongoing: "bg-rose-50 text-rose-700 border-rose-200",
  under_review: "bg-amber-50 text-amber-700 border-amber-200",
  result_confirmed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  completed: "bg-teal-50 text-teal-700 border-teal-200",
  postponed: "bg-orange-50 text-orange-700 border-orange-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
};

export const RACE_STATUS_DETAIL_STYLES: Record<string, string> = {
  draft: "bg-slate-500/20 border-slate-400/50 text-slate-200",
  scheduled: "bg-blue-500/20 border-blue-400/50 text-blue-200",
  pre_race: "bg-violet-500/20 border-violet-400/50 text-violet-200",
  ongoing: "bg-rose-500/20 border-rose-400/50 text-rose-200",
  under_review: "bg-amber-500/20 border-amber-400/50 text-amber-200",
  result_confirmed: "bg-emerald-500/20 border-emerald-400/50 text-emerald-200",
  completed: "bg-teal-500/20 border-teal-400/50 text-teal-200",
  postponed: "bg-orange-500/20 border-orange-400/50 text-orange-200",
  cancelled: "bg-red-500/20 border-red-400/50 text-red-200",
};

export function getRaceStatusStyle(status: string): string {
  return RACE_STATUS_STYLES[status] ?? "bg-slate-100 text-slate-600 border-slate-200";
}

export function getRaceStatusDetailStyle(status: string): string {
  return RACE_STATUS_DETAIL_STYLES[status] ?? "bg-slate-500/20 border-slate-400/50 text-slate-200";
}
