type Props = {
  status: string;
};

export default function TournamentStatus({ status }: Props) {
  const config = {
    DRAFT: "bg-slate-100 text-slate-600 border-slate-200",
    REGISTRATION_OPEN: "bg-amber-50 text-amber-700 border-amber-200",
    REGISTRATION_CLOSED: "bg-blue-50 text-blue-700 border-blue-200",
    LIVE: "bg-yellow-50 text-yellow-700 border-yellow-200",
    COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-200",
    CANCELLED: "bg-rose-50 text-rose-700 border-rose-200",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full border text-xs font-bold ${
        config[status as keyof typeof config] ??
        "bg-slate-50 text-slate-600 border-slate-200"
      }`}
    >
      {status.replaceAll("_", " ")}
    </span>
  );
}
