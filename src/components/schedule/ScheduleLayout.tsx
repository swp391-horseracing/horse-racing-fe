import React from "react";
import { cn } from "../../lib/utils";

interface ScheduleLayoutProps {
  panelOpen: boolean;
  calendarSlot?: React.ReactNode;
  listSlot: React.ReactNode;
  detailSlot?: React.ReactNode;
  leftColClass?: string;
  rightColClass?: string;
}

export function ScheduleLayout({
  panelOpen,
  calendarSlot,
  listSlot,
  detailSlot,
  leftColClass,
  rightColClass,
}: ScheduleLayoutProps) {
  // Allocated slightly larger column space (5/12 instead of 4/12) on intermediate viewports,
  // falling back to standard 4/12 on extra wide screens.
  const resolvedLeftColClass =
    leftColClass ||
    (panelOpen ? "lg:col-span-5 xl:col-span-4" : "lg:col-span-12");
  const resolvedRightColClass =
    rightColClass ||
    (panelOpen ? "lg:col-span-7 xl:col-span-8" : "lg:col-span-8");

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start pb-6">
      {/* Master Side Panel */}
      <div
        className={cn(
          resolvedLeftColClass,
          "grid grid-cols-1 gap-6 items-start",
          !panelOpen && "lg:grid-cols-12"
        )}
      >
        {calendarSlot && (
          <div
            className={cn(
              !panelOpen && "lg:col-span-5",
              "flex justify-center w-full"
            )}
          >
            {calendarSlot}
          </div>
        )}
        <div
          className={cn(
            calendarSlot && !panelOpen && "lg:col-span-7",
            "space-y-4"
          )}
        >
          {listSlot}
        </div>
      </div>

      {/* Detail Side Panel */}
      {panelOpen && detailSlot && (
        <div className={resolvedRightColClass}>{detailSlot}</div>
      )}
    </div>
  );
}
