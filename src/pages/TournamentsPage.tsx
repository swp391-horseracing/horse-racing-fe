import { useMemo, useState } from "react";
import {
  Search,
  MapPin,
  Flag,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  CircleDot,
  X,
  CalendarArrowDown,
  CalendarArrowUp,
} from "lucide-react";

// IMPORTANT: Adjust these paths to match where your hooks are located in your project
import { useEvent } from "../hooks/useEvent";
import { useHorseList } from "../hooks/useHorseList"; 

// --- Fallback Data ---
const defaultTournaments = [
  { id: 1, name: "Royal Ascot Summer Series", startDate: "2026-06-18", endDate: "2026-06-22", displayDate: "Jun 18 - Jun 22, 2026", location: "Ascot, UK", races: 35, status: "Live" },
  { id: 2, name: "The Breeders' Cup World Championships", startDate: "2026-11-01", endDate: "2026-11-02", displayDate: "Nov 1 - Nov 2, 2026", location: "Del Mar, CA", races: 14, status: "Scheduled" },
];

const races = [
  { id: 101, tournamentId: 1, title: "The Queen Anne Stakes", date: "2026-06-18", time: "14:30", distance: "1600m", surface: "Turf", className: "Group 1", drawList: [] },
  { id: 102, tournamentId: 1, title: "Coventry Stakes", date: "2026-06-18", time: "15:05", distance: "1200m", surface: "Turf", className: "Group 2", drawList: [] },
  { id: 103, tournamentId: 2, title: "Classic Turf Invitational", date: "2026-11-01", time: "16:00", distance: "2000m", surface: "Turf", className: "Group 1", drawList: [] },
  { id: 104, tournamentId: 2, title: "Night Derby", date: "2026-11-02", time: "18:30", distance: "2400m", surface: "Dirt", className: "Group 3", drawList: [] },
  { id: 105, tournamentId: 3, title: "Spring Cup", date: "2026-05-27", time: "12:00", distance: "1800m", surface: "Turf", className: "Group 2", drawList: [] },
];

const officials = [
  { initials: "JD", name: "John Deadlock", title: "Referee" },
  { initials: "CP", name: "Christ Paul", title: "Starter" },
  { initials: "BD", name: "Ben Dover", title: "Referee" },
];

// --- Subcomponents ---
function StatusBadge({ status }: { status: string }) {
  if (status === "Live") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fde047] px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-yellow-900 whitespace-nowrap shadow-sm">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-yellow-600"></span>
        Live
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap shadow-sm">
      {status}
    </span>
  );
}

// Helper to format short dates (e.g. "Jun 18")
const formatShortDate = (dateStr: string | undefined) => {
  if (!dateStr) return "TBA";
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// --- Main Page Component ---
export default function TournamentsPage() {
  // --- Data Hooks ---
  const { eventList } = useEvent();
  const { horseList } = useHorseList();

  // --- States ---
  const [search, setSearch] = useState("");
  const [expandedTournamentId, setExpandedTournamentId] = useState<number | string | null>(null);
  const [selectedRaceId, setSelectedRaceId] = useState<number | null>(null);

  // --- Dynamic Data Mapping ---
  // 1. Map Calendar Events to Tournaments
  const activeTournaments = useMemo(() => {
    if (!eventList || eventList.length === 0) return defaultTournaments;

    return eventList.map((event, index) => {
      let status = "Scheduled";
      if (event.className?.includes("yellow") || event.title.includes("Thunder")) status = "Live";
      if (event.className?.includes("green") || event.title.includes("Qualifier")) status = "Completed";

      // Parse start and end dates from event hook
      const startDateStr = event.start || event.date;
      const endDateStr = event.end || startDateStr;

      const startDateObj = startDateStr ? new Date(startDateStr) : new Date();
      const endDateObj = endDateStr ? new Date(endDateStr) : startDateObj;

      const startFormatted = startDateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const endFormatted = endDateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      
      let displayDate = `${startFormatted} - ${endFormatted}`;
      if (startDateObj.toDateString() === endDateObj.toDateString()) {
         displayDate = startDateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      }

      return {
        id: event.id || index + 1,
        name: event.title,
        startDate: startDateObj.toISOString(),
        endDate: endDateObj.toISOString(),
        displayDate: displayDate,
        location: ["Ascot, UK", "Churchill Downs, KY", "Meydan, UAE"][index % 3] || "TBD",
        races: event.overlap ? 14 : 35,
        status: status,
      };
    });
  }, [eventList]);

  // Derive selected data
  const selectedRace = useMemo(() => races.find(r => r.id === selectedRaceId), [selectedRaceId]);
  const parentTournament = useMemo(() => activeTournaments.find(t => t.id === selectedRace?.tournamentId), [selectedRace, activeTournaments]);

  // 2. Map Horse hook data to the Draw List dynamically for the selected race
  const activeDrawList = useMemo(() => {
    if (!horseList || horseList.length === 0) return [];
    const startIndex = (selectedRace?.id || 0) % 2;
    return horseList.slice(startIndex, startIndex + 5).map((horse, idx) => ({
      draw: idx + 1,
      horse: horse.name,
      jockey: horse.jockey,
      trainer: horse.owner,
    }));
  }, [horseList, selectedRace]);

  // --- Search Filtering ---
  const filteredTournaments = useMemo(() =>
    activeTournaments.filter((item) => {
      const lower = search.toLowerCase();
      return (
        item.name.toLowerCase().includes(lower) ||
        item.location.toLowerCase().includes(lower) ||
        item.displayDate.toLowerCase().includes(lower)
      );
    }),
    [search, activeTournaments]
  );

  const groupedTournaments = useMemo(() => ({
    live: filteredTournaments.filter((item) => item.status === "Live"),
    scheduled: filteredTournaments.filter((item) => item.status === "Scheduled"),
    completed: filteredTournaments.filter((item) => item.status === "Completed"),
  }), [filteredTournaments]);

  // --- Handlers ---
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setSelectedRaceId(null);
    setExpandedTournamentId(null); 
  };

  const toggleTournament = (id: number | string) => {
    if (expandedTournamentId === id) {
      setExpandedTournamentId(null);
      if (selectedRace?.tournamentId === id) setSelectedRaceId(null);
    } else {
      setExpandedTournamentId(id);
    }
  };

  const handleRaceSelect = (raceId: number) => {
    setSelectedRaceId(prev => prev === raceId ? null : raceId);
  };

  // --- Render Helpers ---
  const renderSection = (title: string, items: typeof activeTournaments) => {
    if (items.length === 0) return null;

    return (
      <div className="mb-10 w-full">
        <h3 className="mb-4 border-b border-slate-200 pb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-800">
          {title}
        </h3>

        <div className="space-y-4">
          {items.map((item) => {
            const isTournamentExpanded = expandedTournamentId === item.id;
            const tournamentIdNumber = typeof item.id === 'string' ? parseInt(item.id) : item.id;
            const tournamentRaces = races.filter((r) => r.tournamentId === tournamentIdNumber);

            return (
              <div
                key={item.id}
                className={`overflow-hidden rounded-md border transition-all ${
                  isTournamentExpanded ? "border-emerald-700 shadow-md ring-1 ring-emerald-700" : "border-slate-200 bg-white hover:border-slate-300 shadow-sm"
                }`}
              >
                {/* TOURNAMENT CARD HEADER */}
                <button
                  type="button"
                  onClick={() => toggleTournament(item.id)}
                  className={`w-full flex items-start sm:items-center justify-between p-4 sm:p-5 text-left transition-colors ${
                    isTournamentExpanded ? "bg-emerald-50/30" : "bg-white hover:bg-slate-50"
                  }`}
                >
                  <div className="space-y-3 w-full pr-4 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <h4 className="text-base sm:text-lg font-bold text-slate-900 leading-tight truncate">{item.name}</h4>
                      <div className="flex-shrink-0">
                        <StatusBadge status={item.status} />
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs sm:text-sm text-slate-500">
                      
                      {/* START / END DATES DISPLAY */}
                      <span className="flex items-center gap-1.5 whitespace-nowrap bg-slate-100/80 px-2 py-0.5 rounded border border-slate-200/60">
                        <CalendarArrowDown className="h-3.5 w-3.5 text-emerald-600" />
                        <span className="font-medium text-slate-700">{formatShortDate(item.startDate)}</span>
                        <span className="text-slate-400 mx-0.5">-</span>
                        <CalendarArrowUp className="h-3.5 w-3.5 text-rose-500" />
                        <span className="font-medium text-slate-700">{formatShortDate(item.endDate)}</span>
                      </span>

                      <span className="flex items-center gap-1.5">
                        <MapPin className="h-4 w-4 opacity-70 flex-shrink-0" /> <span className="truncate">{item.location}</span>
                      </span>
                      <span className="flex items-center gap-1.5 whitespace-nowrap">
                        <Flag className="h-4 w-4 opacity-70" /> {item.races} Races
                      </span>
                    </div>
                  </div>
                  
                  <div className="pt-1 sm:pt-0 flex-shrink-0">
                    {isTournamentExpanded ? <ChevronUp className="h-5 w-5 text-slate-400" /> : <ChevronDown className="h-5 w-5 text-slate-400" />}
                  </div>
                </button>

                {/* RACE LIST ACCORDION */}
                {isTournamentExpanded && (
                  <div className="border-t border-slate-200 bg-slate-50 p-3 sm:p-5">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-500">
                      Scheduled Races
                    </p>
                    
                    {tournamentRaces.length > 0 ? (
                      <div className="divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                        {tournamentRaces.map((race) => {
                          const isSelected = selectedRaceId === race.id;

                          return (
                            <button 
                              key={race.id}
                              onClick={() => handleRaceSelect(race.id)}
                              className={`w-full flex flex-col xl:flex-row xl:items-center justify-between p-3 sm:p-4 text-left transition-all gap-2 sm:gap-3 ${
                                isSelected ? "bg-emerald-50 border-l-4 border-l-emerald-600 pl-2 sm:pl-3" : "hover:bg-slate-50 border-l-4 border-l-transparent"
                              }`}
                            >
                              <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
                                <div className={`flex flex-col flex-shrink-0 text-center bg-slate-100 rounded px-2 py-1 border border-slate-200 ${isSelected ? 'border-emerald-200 bg-emerald-100/50' : ''}`}>
                                  <span className={`text-[10px] font-bold uppercase tracking-wider ${isSelected ? 'text-emerald-700' : 'text-slate-500'}`}>{formatShortDate(race.date)}</span>
                                  <span className={`font-mono text-sm font-bold ${isSelected ? 'text-emerald-900' : 'text-slate-800'}`}>{race.time}</span>
                                </div>
                                <span className={`font-semibold text-sm truncate ${isSelected ? 'text-emerald-900' : 'text-slate-900'}`}>
                                  {race.title}
                                </span>
                              </div>
                              <div className="flex flex-wrap xl:flex-nowrap items-center gap-2 xl:gap-3 text-xs text-slate-500 pl-[4.5rem] xl:pl-0">
                                <span className="bg-white border border-slate-200 px-1.5 py-0.5 rounded whitespace-nowrap">{race.className}</span>
                                <span className="whitespace-nowrap">{race.distance}</span>
                                <span className="hidden xl:inline text-slate-300">•</span>
                                <span className="whitespace-nowrap">{race.surface}</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="rounded-lg border border-slate-200 border-dashed py-8 text-center text-sm text-slate-500 bg-white">
                        No race details available for this tournament yet.
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full w-full overflow-y-auto bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Layout wrapper: 1/3 for Tournaments, 2/3 for Info Panel */}
        <div className={`transition-all duration-300 ${
          selectedRaceId 
            ? "grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-6 lg:gap-8" 
            : "mx-auto max-w-5xl"
        }`}>
          
          {/* LEFT COLUMN: Search and Tournaments */}
          <div className="w-full flex flex-col min-w-0">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-slate-900 mb-6">Tournament Hub</h1>
              
              <div className="relative shadow-sm rounded-md">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={handleSearchChange}
                  placeholder="Search tournaments..."
                  className="w-full rounded-md border border-slate-300 bg-white py-3 pl-12 pr-4 text-sm text-slate-900 outline-none transition-all focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="w-full">
              {renderSection("Live Now", groupedTournaments.live)}
              {renderSection("Upcoming", groupedTournaments.scheduled)}
              {renderSection("Recently Completed", groupedTournaments.completed)}
              
              {filteredTournaments.length === 0 && (
                <p className="text-center text-slate-500 py-10 border border-dashed border-slate-300 rounded-lg">
                  No tournaments found matching your search.
                </p>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Info Panel for Selected Race */}
          {selectedRaceId && selectedRace && (
            <div className="w-full relative min-w-0 hidden lg:block animate-in fade-in slide-in-from-right-8 duration-300">
              <div className="sticky top-6 rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden flex flex-col max-h-[calc(100vh-2rem)]">
                
                {/* Panel Header */}
                <div className="bg-emerald-800 p-6 text-white relative flex-shrink-0">
                  <button 
                    onClick={() => setSelectedRaceId(null)}
                    className="absolute top-4 right-4 p-1.5 rounded-md hover:bg-white/10 text-emerald-200 hover:text-white transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                  <p className="text-emerald-200 text-xs font-bold uppercase tracking-wider mb-2 pr-8 truncate">
                    {parentTournament?.name}
                  </p>
                  <h2 className="text-2xl sm:text-3xl font-bold mb-5 pr-8">{selectedRace.title}</h2>
                  
                  <div className="flex flex-wrap gap-2.5">
                    {/* DISPLAY RACE DATE AND TIME */}
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 border border-white/20 px-3.5 py-1.5 text-xs font-medium text-emerald-50">
                      <CalendarDays className="w-3.5 h-3.5 opacity-70" /> 
                      {formatShortDate(selectedRace.date)} at {selectedRace.time}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 border border-white/20 px-3.5 py-1.5 text-xs font-medium text-emerald-50">
                      <Flag className="w-3.5 h-3.5 opacity-70" /> {selectedRace.distance}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 border border-white/20 px-3.5 py-1.5 text-xs font-medium text-emerald-50">
                      {selectedRace.surface}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 border border-white/20 px-3.5 py-1.5 text-xs font-medium text-emerald-50">
                      {selectedRace.className}
                    </span>
                  </div>
                </div>

                {/* Panel Scrollable Content */}
                <div className="p-6 overflow-y-auto custom-scrollbar">
                  
                  {/* Start List */}
                  <div className="mb-10">
                    <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
                      <h3 className="text-sm font-bold uppercase tracking-widest text-slate-800">Start List Details</h3>
                      {parentTournament?.status === "Live" && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 border border-red-100 px-2.5 py-1 text-xs font-bold text-red-600">
                          <CircleDot className="h-3.5 w-3.5 animate-pulse" /> Live Feed Enabled
                        </span>
                      )}
                    </div>
                    
                    <div className="overflow-hidden rounded-lg border border-slate-200">
                      <table className="w-full text-left text-sm text-slate-700">
                        <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 border-b border-slate-200">
                          <tr>
                            <th className="px-4 py-3 font-semibold w-16 text-center">Draw</th>
                            <th className="px-4 py-3 font-semibold">Horse</th>
                            <th className="px-4 py-3 font-semibold">Jockey</th>
                            <th className="px-4 py-3 font-semibold">Trainer</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {activeDrawList.length > 0 ? activeDrawList.map(entry => (
                            <tr key={entry.draw} className="hover:bg-slate-50/80 transition-colors">
                              <td className="px-4 py-3.5 font-bold text-slate-900 text-center bg-slate-50/50">{entry.draw}</td>
                              <td className="px-4 py-3.5 font-semibold text-slate-900">{entry.horse}</td>
                              <td className="px-4 py-3.5 text-slate-600">{entry.jockey}</td>
                              <td className="px-4 py-3.5 text-slate-600">{entry.trainer}</td>
                            </tr>
                          )) : (
                            <tr>
                              <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                                Loading horses or no data available for this race.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Officials */}
                  <div>
                    <div className="mb-4 border-b border-slate-100 pb-3">
                      <h3 className="text-sm font-bold uppercase tracking-widest text-slate-800">Race Officials</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                      {officials.map(official => (
                        <div key={official.initials} className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-100 border border-slate-200 text-sm font-bold text-slate-700">
                            {official.initials}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-sm font-bold text-slate-900 truncate">{official.name}</span>
                            <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider truncate">{official.title}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}