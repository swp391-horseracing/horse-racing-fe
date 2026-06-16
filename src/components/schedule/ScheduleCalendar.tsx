import { Calendar as CalendarUI } from "../ui/calendar";
import { cn } from "../../lib/utils";

interface ScheduleCalendarProps {
  selectedDate: Date | undefined;
  onSelect: (date: Date | undefined) => void;
  raceDays: Date[];
  defaultMonth?: Date;
  onMonthChange?: (month: Date) => void;
  highlightClass?: string;
}

// Fixed styling to align headers and handle browser zooming gracefully
const calendarScaleClasses = cn(
  "p-3 sm:p-4 xl:p-6 w-full max-w-full overflow-hidden transition-all",

  "[&_.rdp-table]:border-spacing-x-0!",
  "[&_.rdp-table]:border-spacing-y-0!",

  // Dynamic cell sizing: w-8 (32px) on mobile, w-9 (36px) on tablet/desktop, w-10 (40px) on wide displays
  "[&_.rdp-cell]:!w-8 sm:[&_.rdp-cell]:!w-9 xl:[&_.rdp-cell]:!w-10 [&_.rdp-cell]:!h-8 sm:[&_.rdp-cell]:!h-9 xl:[&_.rdp-cell]:!h-10 [&_.rdp-cell]:p-0",
  "[&_.rdp-head_th]:!w-8 sm:[&_.rdp-head_th]:!w-9 xl:[&_.rdp-head_th]:!w-10 [&_.rdp-head_th]:!h-8 sm:[&_.rdp-head_th]:!h-9 xl:[&_.rdp-head_th]:!h-10 [&_.rdp-head_th]:p-0 [&_.rdp-head_th]:font-semibold",

  "[&_.rdp-day]:!w-8 sm:[&_.rdp-day]:!w-9 xl:[&_.rdp-day]:!w-10 [&_.rdp-day]:!h-8 sm:[&_.rdp-day]:!h-9 xl:[&_.rdp-day]:!h-10 [&_.rdp-day]:m-auto [&_.rdp-day]:rounded-lg",

  // Relative typography to complement scaled elements
  "[&_.rdp-day]:!text-xs sm:[&_.rdp-day]:!text-sm [&_.rdp-head_th]:!text-[10px] sm:[&_.rdp-head_th]:!text-xs [&_.rdp-caption_label]:!text-sm sm:[&_.rdp-caption_label]:!text-base"
);

export function ScheduleCalendar({
  selectedDate,
  onSelect,
  raceDays,
  defaultMonth = new Date(2026, 5),
  onMonthChange,
  highlightClass = "font-black text-[#064E3B] bg-[#064E3B]/10 border border-[#064E3B]/20 rounded-md",
}: ScheduleCalendarProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200 bg-white shadow-sm flex items-center justify-center transition-all w-full",
        calendarScaleClasses
      )}
    >
      <CalendarUI
        mode="single"
        selected={selectedDate}
        onSelect={onSelect}
        defaultMonth={defaultMonth}
        onMonthChange={onMonthChange}
        showOutsideDays={false}
        modifiers={{ hasRace: raceDays }}
        modifiersClassNames={{
          hasRace: highlightClass,
        }}
        className="w-full flex justify-center text-sm font-medium mx-auto"
      />
    </div>
  );
}
