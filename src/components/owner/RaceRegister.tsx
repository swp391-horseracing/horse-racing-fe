import { useState } from "react";
import { Search, MapPin, ArrowUpRight } from "lucide-react";
import { cn } from "../../lib/utils";
import type {
  Tournament,
  Horse,
  TournamentRegistration,
} from "../../hooks/useOwner";

export interface RaceRegisterProps {
  horses: Horse[];
  tournaments: Tournament[];
  registrations: TournamentRegistration[];
  onOpenRegisterModal: (
    horseId: string | null,
    tournamentId: number | null
  ) => void;
}

const activeFilterOptions = [
  "All",
  "Live now",
  "Registration open",
  "Upcoming",
  "Completed",
] as const;
type ActiveFilterType = (typeof activeFilterOptions)[number];

export function RaceRegister({
  tournaments,
  onOpenRegisterModal,
}: RaceRegisterProps) {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<ActiveFilterType>("All");

  const filtered = tournaments.filter((t: Tournament) => {
    const matchSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.allowedBreed.toLowerCase().includes(search.toLowerCase());
    const statusMap: Record<ActiveFilterType, string[]> = {
      All: [
        "Registration Open",
        "Registration Closed",
        "Scheduled",
        "Live",
        "Concluded",
      ],
      "Live now": ["Live"],
      "Registration open": ["Registration Open"],
      Upcoming: ["Scheduled", "Registration Closed"],
      Completed: ["Concluded"],
    };
    return matchSearch && statusMap[activeFilter].includes(t.status);
  });

  return (
    <div className="p-5 space-y-5 max-w-6xl mx-auto">
      <h2 className="text-xl font-black text-[#064E3B]">
        Race & Tournament Registration
      </h2>

      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            type="text"
            placeholder="Search tournaments..."
            className="w-full pl-9 pr-4 py-2.5 text-[13px] bg-white border rounded-xl outline-none focus:border-[#064E3B]"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {activeFilterOptions.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveFilter(tab)}
            className={cn(
              "px-4 py-1.5 rounded-full text-[13px] font-bold border",
              activeFilter === tab
                ? "bg-slate-800 text-white"
                : "bg-white text-slate-600 border-slate-200"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((t: Tournament) => (
          <div
            key={t.id}
            className="bg-white rounded-2xl border p-5 flex flex-col hover:shadow-md transition"
          >
            <h3 className="font-black text-[17px] text-[#064E3B] mb-2">
              {t.name}
            </h3>
            <div className="flex items-center gap-1.5 text-[13px] text-slate-500 mb-4">
              <MapPin className="w-3.5 h-3.5" /> Ho Chi Minh City
            </div>
            {t.status === "Registration Open" && (
              <button
                onClick={() => onOpenRegisterModal(null, t.id)}
                className="w-full rounded-xl border bg-white py-3 text-[13px] font-bold hover:bg-slate-50 flex items-center justify-center gap-1.5"
              >
                Register horse <ArrowUpRight className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
