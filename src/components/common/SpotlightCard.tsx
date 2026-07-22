import { useNavigate } from "react-router-dom";
import { Star, Percent, ArrowRight, User } from "lucide-react";

interface SpotlightCardProps {
  type: "horse" | "jockey";
  name: string;
  imageUrl?: string | null;
  subtitle?: string;
  winRate: string;
  detailsUrl: string;
  loading?: boolean;
}

export default function SpotlightCard({
  type,
  name,
  imageUrl,
  subtitle,
  winRate,
  detailsUrl,
  loading = false,
}: SpotlightCardProps) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="relative overflow-hidden rounded-3xl bg-[#173a35] p-8 text-white shadow-md animate-pulse my-6 min-h-[180px] flex items-center justify-center">
        <span className="text-sm font-medium text-emerald-200/70">
          Evaluating Spotlight {type === "horse" ? "Horse" : "Jockey"}...
        </span>
      </div>
    );
  }

  const pronoun = type === "horse" ? "it" : "they";

  return (
    <div className="relative overflow-hidden rounded-3xl bg-[#173a35] p-6 sm:p-8 text-white shadow-lg my-6 transition-all hover:shadow-xl">
      {/* Background patterns */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.16),_transparent_35%),linear-gradient(135deg,rgba(18,54,45,0.98),rgba(24,73,58,0.92))]" />
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />

      <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        {/* Entity details & Avatar */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center min-w-0">
          <div className="overflow-hidden h-24 w-24 sm:h-28 sm:w-28 rounded-2xl bg-slate-800 flex items-center justify-center shrink-0 border-2 border-white/20 shadow-md">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={name}
                className="h-full w-full object-cover"
              />
            ) : (
              <User className="h-12 w-12 text-slate-400" />
            )}
          </div>

          <div className="max-w-xl">
            <div className="mb-2 flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/20 border border-amber-300/40 px-3 py-0.5 text-xs font-bold text-amber-300 tracking-wider uppercase">
                <Star className="h-3.5 w-3.5 fill-amber-300 text-amber-300" />
                Spotlight {type === "horse" ? "Horse" : "Jockey"}
              </span>
            </div>

            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              {name}
            </h2>

            {subtitle && (
              <p className="text-xs font-medium text-emerald-200/80 mt-0.5 mb-2">
                {subtitle}
              </p>
            )}

            <p className="mt-2 text-sm sm:text-base leading-relaxed text-white/90 font-medium">
              <span className="font-bold text-white!">{name}</span> is our
              chosen spotlight {type}! During the last month {pronoun} had an
              impressive{" "}
              <span className="font-bold text-emerald-300 text-lg">
                {winRate}%
              </span>{" "}
              win rate!
            </p>
          </div>
        </div>

        {/* Right side metric & CTA */}
        <div className="flex items-center gap-4 shrink-0 justify-between sm:justify-start lg:flex-col lg:items-end">
          <div className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur px-5 py-3 flex items-center gap-3">
            <Percent className="h-6 w-6 text-emerald-300" />
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-200">
                Last Month Win Rate
              </div>
              <div className="text-2xl font-black text-white">{winRate}%</div>
            </div>
          </div>

          <button
            onClick={() => navigate(detailsUrl)}
            className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-5 py-2.5 text-sm font-bold text-[#173a35] shadow-md transition hover:bg-amber-300 hover:shadow-lg cursor-pointer"
          >
            View Details
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
