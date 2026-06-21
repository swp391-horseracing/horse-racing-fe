import { useState, useEffect } from "react";
import { ShieldAlert } from "lucide-react";

export function LiveTelemetry() {
  const [distanceRemaining, setDistanceRemaining] = useState(400);
  const [currentPace, setCurrentPace] = useState(62);
  const [elapsedSeconds, setElapsedSeconds] = useState(38);

  const [leaders, setLeaders] = useState([
    { pos: 1, no: "#4", name: "Desert Crown", jockey: "R. Moore", speed: 64.2, gap: "-", odds: "2/1", initial: "D" },
    { pos: 2, no: "#7", name: "Mishriff", jockey: "D. Egan", speed: 63.8, gap: "+0.5L", odds: "7/2", initial: "M" },
    { pos: 3, no: "#2", name: "Life Is Good", jockey: "I. Ortiz Jr.", speed: 62.1, gap: "+2.0L", odds: "4/1", initial: "L" },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setDistanceRemaining((prev) => {
        if (prev <= 10) {
          setElapsedSeconds(0);
          return 1200;
        }
        return prev - Math.round(5 + Math.random() * 5);
      });

      setElapsedSeconds((prev) => prev + 1);

      const paceChange = (Math.random() - 0.5) * 4;
      setCurrentPace((prev) => Math.min(72, Math.max(50, Math.round((prev + paceChange) * 10) / 10)));

      setLeaders((prev) => {
        const next = prev.map((leader) => {
          const deltaSpeed = (Math.random() - 0.5) * 3;
          const speed = Math.round(Math.min(75, Math.max(55, leader.speed + deltaSpeed)) * 10) / 10;
          return { ...leader, speed };
        });

        next.sort((a, b) => b.speed - a.speed);
        return next.map((leader, index) => {
          const gap = index === 0 ? "-" : `+${(index * 0.4 + Math.random() * 0.3).toFixed(1)}L`;
          return { ...leader, pos: index + 1, gap };
        });
      });
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex-1 overflow-y-auto p-6 max-w-7xl w-full mx-auto font-body h-full min-h-0">
      <div className="bg-white border border-[#064E3B]/10 rounded-2xl p-6 flex flex-col shadow-sm">
        <div className="flex justify-between items-end mb-6 border-b border-slate-100 pb-4">
          <div>
            <h3 className="font-headline font-bold text-2xl text-[#064E3B] m-0">Live Telemetry</h3>
            <p className="text-xs text-slate-400 font-bold mt-1 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
              Track Referee: Arthur Jones
            </p>
          </div>
          <div className="flex gap-4">
            <div className="text-right">
              <span className="block font-label text-[9px] font-bold text-slate-400 uppercase tracking-wider">Distance Remaining</span>
              <span className="font-headline text-lg font-black text-[#064E3B]">{distanceRemaining}m</span>
            </div>
            <div className="text-right pl-4 border-l border-slate-100">
              <span className="block font-label text-[9px] font-bold text-slate-400 uppercase tracking-wider">Current Pace</span>
              <span className="font-headline text-lg font-black text-[#064E3B]">{currentPace} km/h</span>
            </div>
          </div>
        </div>

        <div className="space-y-2 flex-1">
          <div className="grid grid-cols-12 gap-4 px-4 py-2 bg-slate-50 border border-slate-100 rounded-lg font-label text-[9px] font-bold text-slate-400 uppercase tracking-wider">
            <div className="col-span-1 text-center">Pos</div>
            <div className="col-span-1">No.</div>
            <div className="col-span-4">Horse / Jockey</div>
            <div className="col-span-2 text-right">Speed</div>
            <div className="col-span-2 text-right">Gap</div>
            <div className="col-span-2 text-right">Odds</div>
          </div>

          {leaders.map((leader) => (
            <div 
              key={leader.no} 
              className={`grid grid-cols-12 gap-4 px-4 py-3 bg-white border border-slate-100 rounded-xl items-center hover:shadow-md transition-all duration-300 ${
                leader.pos === 1 ? "border-l-2 border-l-[#EAB308]" : ""
              }`}
            >
              <div className={`col-span-1 text-center font-headline font-black text-sm ${
                leader.pos === 1 ? "text-[#EAB308]" : "text-slate-400"
              }`}>
                {leader.pos}
              </div>
              <div className="col-span-1 font-label text-xs font-bold text-slate-500">{leader.no}</div>
              <div className="col-span-4 flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-headline font-bold text-xs ${
                  leader.pos === 1 
                    ? "bg-[#EAB308]/15 text-[#8A6D00]" 
                    : leader.pos === 2 
                    ? "bg-[#064E3B]/10 text-[#064E3B]" 
                    : "bg-slate-100 text-slate-500"
                }`}>
                  {leader.initial}
                </div>
                <div>
                  <div className="font-bold text-slate-700 text-xs leading-tight">{leader.name}</div>
                  <div className="text-[10px] text-slate-400 font-medium">{leader.jockey}</div>
                </div>
              </div>
              <div className="col-span-2 text-right font-label text-xs font-bold text-slate-700">{leader.speed} km/h</div>
              <div className="col-span-2 text-right font-label text-xs font-bold text-slate-400">{leader.gap}</div>
              <div className="col-span-2 text-right font-label text-xs font-extrabold text-[#064E3B]">{leader.odds}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
