import { useState, useCallback, useMemo } from "react";
import { Calendar as CalendarUI } from "../ui/calendar";
import { cn } from "../../lib/utils";
import type { DateRange, Matcher } from "react-day-picker";
import { CalendarDays, PenLine, ArrowLeft, ArrowRight } from "lucide-react";

interface ScheduleCalendarProps {
  selectedRange: DateRange | undefined;
  onSelect: (range: DateRange | undefined) => void;
  raceDays: Date[];
  defaultMonth?: Date;
  onMonthChange?: (month: Date) => void;
  highlightClass?: string;
}

const calendarScaleClasses = cn(
  "p-3 sm:p-4 xl:p-6 w-full max-w-full overflow-hidden transition-all",
  "[&_.rdp-table]:border-spacing-x-0!",
  "[&_.rdp-table]:border-spacing-y-0!",
  "[&_.rdp-cell]:!w-8 sm:[&_.rdp-cell]:!w-9 xl:[&_.rdp-cell]:!w-10 [&_.rdp-cell]:!h-8 sm:[&_.rdp-cell]:!h-9 xl:[&_.rdp-cell]:!h-10 [&_.rdp-cell]:p-0",
  "[&_.rdp-head_th]:!w-8 sm:[&_.rdp-head_th]:!w-9 xl:[&_.rdp-head_th]:!w-10 [&_.rdp-head_th]:!h-8 sm:[&_.rdp-head_th]:!h-9 xl:[&_.rdp-head_th]:!h-10 [&_.rdp-head_th]:p-0 [&_.rdp-head_th]:font-semibold",
  "[&_.rdp-day]:!w-8 sm:[&_.rdp-day]:!w-9 xl:[&_.rdp-day]:!w-10 [&_.rdp-day]:!h-8 sm:[&_.rdp-day]:!h-9 xl:[&_.rdp-day]:!h-10 [&_.rdp-day]:m-auto [&_.rdp-day]:rounded-lg",
  "[&_.rdp-day]:!text-xs sm:[&_.rdp-day]:!text-sm [&_.rdp-head_th]:!text-[10px] sm:[&_.rdp-head_th]:!text-xs [&_.rdp-caption_label]:!text-sm sm:[&_.rdp-caption_label]:!text-base"
);

function fmtInput(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function fmtShort(d: Date): string {
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function parseInputDate(value: string): Date | undefined {
  if (!value) return undefined;
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}


function normalizeDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

export function ScheduleCalendar({
  selectedRange,
  onSelect,
  raceDays,
  defaultMonth = new Date(2026, 5),
  onMonthChange,
  highlightClass = "font-black text-[#064E3B] bg-[#064E3B]/10 border border-[#064E3B]/20 rounded-md",
}: ScheduleCalendarProps) {
  const [displayMode, setDisplayMode] = useState<"calendar" | "input">(
    "calendar"
  );
  const [phase, setPhase] = useState<"from" | "to">(
    selectedRange?.from && !selectedRange?.to ? "to" : "from"
  );

  const [inputFrom, setInputFrom] = useState(
    selectedRange?.from ? fmtInput(selectedRange.from) : ""
  );
  const [inputTo, setInputTo] = useState(
    selectedRange?.to ? fmtInput(selectedRange.to) : ""
  );


  const rangeComplete = selectedRange?.from && selectedRange?.to;

  // ── click handler for single-date calendar ──────────────────────
  const handleDayClick = useCallback(
    (date: Date) => {
      if (phase === "from") {
        let from = date;
        let to = selectedRange?.to;
        if (to && from > to) {
          from = to;
          to = date;
        }
        onSelect({ from, to });
        setPhase("to");
      } else {
        let to = date;
        let from = selectedRange?.from ?? date;
        if (to < from) {
          to = from;
          from = date;
        }
        onSelect({ from, to });
      }
    },
    [phase, selectedRange, onSelect]
  );

  // ── range middle modifier (dates strictly between from and to) ──
  const isInRangeMiddle = useCallback(
    (date: Date) => {
      if (!selectedRange?.from || !selectedRange?.to) return false;
      const d = normalizeDay(date);
      const from = normalizeDay(selectedRange.from);
      const to = normalizeDay(selectedRange.to);
      const min = Math.min(from, to);
      const max = Math.max(from, to);
      return d > min && d < max;
    },
    [selectedRange]
  );

  const handleInputFromChange = useCallback(
    (value: string) => {
      setInputFrom(value);
      const from = parseInputDate(value);
      const to = parseInputDate(inputTo);
      if (from && to) {
        onSelect(from > to ? { from: to, to: from } : { from, to });
      } else if (from) {
        onSelect({ from, to: from });
      } else {
        onSelect(undefined);
      }
    },
    [inputTo, onSelect]
  );

  const handleInputToChange = useCallback(
    (value: string) => {
      setInputTo(value);
      const from = parseInputDate(inputFrom);
      const to = parseInputDate(value);
      if (from && to) {
        onSelect(from > to ? { from: to, to: from } : { from, to });
      } else if (to) {
        onSelect({ from: to, to });
      } else {
        onSelect(undefined);
      }
    },
    [inputFrom, onSelect]
  );

  const handleClear = useCallback(() => {
    onSelect(undefined);
    setInputFrom("");
    setInputTo("");
    setPhase("from");
  }, [onSelect]);

  // ── custom modifiers for range visual ──────────────────────────
  const modifiers = useMemo(() => {
    const m: Record<string, Matcher | Matcher[] | undefined> = {
      hasRace: raceDays,
      range_middle: isInRangeMiddle,
    };
    if (selectedRange?.from) m.range_start = [selectedRange.from];
    if (selectedRange?.to) m.range_end = [selectedRange.to];
    return m;
  }, [raceDays, selectedRange, isInRangeMiddle]);

  return (
    <div className="w-full space-y-3">
      {/* Mode Toggle */}
      <div className="flex rounded-xl border border-slate-200 bg-white p-0.5 shadow-sm w-fit">
        <button
          onClick={() => setDisplayMode("calendar")}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
            displayMode === "calendar"
              ? "bg-[#064E3B] text-white shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          )}
        >
          <CalendarDays className="h-3.5 w-3.5" />
          Calendar
        </button>
        <button
          onClick={() => setDisplayMode("input")}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
            displayMode === "input"
              ? "bg-[#064E3B] text-white shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          )}
        >
          <PenLine className="h-3.5 w-3.5" />
          Manual
        </button>
      </div>

      {/* Calendar Mode */}
      {displayMode === "calendar" ? (
        <div
          className={cn(
            "rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col items-center justify-center transition-all w-full",
            calendarScaleClasses
          )}
        >
          <CalendarUI
            mode="single"
            selected={undefined}
            onSelect={(date: Date | undefined) => {
              if (date) handleDayClick(date);
            }}
            defaultMonth={defaultMonth}
            onMonthChange={onMonthChange}
            showOutsideDays={false}
            modifiers={modifiers}
            modifiersClassNames={{
              hasRace: highlightClass,
            }}
            className="w-full flex justify-center text-sm font-medium mx-auto"
          />

          {/* Edit chips — shown when a range is selected */}
          {rangeComplete && (
            <div className="flex items-center gap-2 pb-3 px-3 w-full">
              <button
                onClick={() => setPhase("from")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all",
                  phase === "from"
                    ? "bg-[#064E3B] text-white border-[#064E3B] shadow-sm"
                    : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                )}
              >
                <ArrowLeft className="h-3 w-3" />
                {fmtShort(selectedRange.from!)}
              </button>
              <span className="text-[10px] text-slate-400 font-bold">to</span>
              <button
                onClick={() => setPhase("to")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all",
                  phase === "to"
                    ? "bg-[#064E3B] text-white border-[#064E3B] shadow-sm"
                    : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                )}
              >
                {fmtShort(selectedRange.to!)}
                <ArrowRight className="h-3 w-3" />
              </button>
              <button
                onClick={handleClear}
                className="ml-auto px-2.5 py-1 rounded-lg text-[10px] font-bold border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 hover:border-rose-400 transition-all"
              >
                Clear
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Input Mode */
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4 space-y-3">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              From
            </label>
            <input
              type="date"
              value={inputFrom}
              onChange={(e) => handleInputFromChange(e.target.value)}
              className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium outline-none focus:border-[#064E3B] focus:ring-1 focus:ring-[#064E3B]/30 transition-all"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              To
            </label>
            <input
              type="date"
              value={inputTo}
              onChange={(e) => handleInputToChange(e.target.value)}
              className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium outline-none focus:border-[#064E3B] focus:ring-1 focus:ring-[#064E3B]/30 transition-all"
            />
          </div>
        </div>
      )}
    </div>
  );
}
