import { Calendar as CalendarUI } from "../ui/calendar";
import { cn } from "../../lib/utils";

interface ScheduleCalendarProps {
  selectedDate: Date | undefined;
  onSelect: (date: Date | undefined) => void;
  raceDays: Date[];
  defaultMonth?: Date;
  onMonthChange?: (month: Date) => void; // Thêm prop này
  highlightClass?: string;
}

export const calendarScaleClasses =
  "p-6 w-full [&_.rdp-day]:h-[46px]! [&_.rdp-day]:w-[46px]! [&_.rdp-head_th]:w-[46px]! [&_.rdp-day]:text-sm! [&_.rdp-head_th]:text-xs! [&_.rdp-caption_label]:text-base!";

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
