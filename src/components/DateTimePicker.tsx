import { format } from "date-fns";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

type DateTimePickerProps = {
  value: string;
  onChange: (value: string) => void;
};

function parseValue(value: string) {
  if (!value) {
    return {
      date: undefined,
      hour: "00",
      minute: "00",
    };
  }

  const [datePart, timePart = "00:00"] = value.split("T");

  return {
    date: new Date(datePart),
    hour: timePart.split(":")[0],
    minute: timePart.split(":")[1],
  };
}

export default function DateTimePicker({
  value,
  onChange,
}: DateTimePickerProps) {
  const { date, hour, minute } = parseValue(value);

  const updateValue = (
    nextDate: Date | undefined,
    nextHour: string,
    nextMinute: string
  ) => {
    if (!nextDate) {
      onChange("");
      return;
    }

    const dateString = format(nextDate, "yyyy-MM-dd");

    onChange(
      `${dateString}T${nextHour.padStart(2, "0")}:${nextMinute.padStart(
        2,
        "0"
      )}`
    );
  };

  return (
    <div className="flex flex-col gap-4 rounded-xl border bg-white p-4">
      <div>
        <DayPicker
          mode="single"
          selected={date}
          onSelect={(selectedDate) => updateValue(selectedDate, hour, minute)}
        />
      </div>

      <div className="flex items-center gap-3">
        <div>
          <label className="mb-1 block text-sm font-medium">Hour</label>

          <select
            value={hour}
            onChange={(e) => updateValue(date, e.target.value, minute)}
            className="rounded-lg border px-3 py-2"
          >
            {Array.from({ length: 24 }, (_, i) => {
              const h = String(i).padStart(2, "0");

              return (
                <option key={h} value={h}>
                  {h}
                </option>
              );
            })}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Minute</label>

          <select
            value={minute}
            onChange={(e) => updateValue(date, hour, e.target.value)}
            className="rounded-lg border px-3 py-2"
          >
            {Array.from({ length: 60 }, (_, i) => {
              const m = String(i).padStart(2, "0");

              return (
                <option key={m} value={m}>
                  {m}
                </option>
              );
            })}
          </select>
        </div>

        <div className="flex-1">
          <label className="mb-1 block text-sm font-medium">Selected</label>

          <div className="rounded-lg border bg-slate-50 px-3 py-2 font-medium">
            {value || "No date selected"}
          </div>
        </div>
      </div>
    </div>
  );
}
