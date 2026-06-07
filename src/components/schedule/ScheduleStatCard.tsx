import { cn } from "../../lib/utils";

interface ScheduleStatCardProps {
  label: string;
  value: string | number;
  active: boolean;
  onClick: () => void;
  liveDot?: boolean;
  activeClass?: string;
  inactiveClass?: string;
}

export function ScheduleStatCard({
  label,
  value,
  active,
  onClick,
  liveDot,
  activeClass = "border-[#064E3B] bg-[#064E3B]/5 shadow-sm ring-1 ring-[#064E3B]",
  inactiveClass = "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50",
}: ScheduleStatCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex-1 text-left rounded-2xl border py-3 px-4 transition-all duration-200",
        active ? activeClass : inactiveClass
      )}
    >
      <p
        className={cn(
          "text-[9px] font-bold uppercase tracking-wider mb-1",
          active ? "text-[#064E3B]" : "text-slate-400"
        )}
      >
        {label}
      </p>
      <div className="flex items-center gap-1.5">
        <p className="text-xl font-black font-headline leading-none text-slate-800">
          {value}
        </p>
        {liveDot && Number(value) > 0 && (
          <span className="h-1.5 w-1.5 rounded-full bg-[#EAB308] animate-pulse" />
        )}
      </div>
    </button>
  );
}