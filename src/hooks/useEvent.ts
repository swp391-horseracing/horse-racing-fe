import { useEffect, useState } from "react";
import type { CalendarEvent } from "../types/event.ts";
import { CalendarService } from "../services/calendarService.ts";

export function useEvent() {
  const [eventList, setEvent] = useState<CalendarEvent[]>([]);

  const getEventList = async () => {
    const getEvents = await CalendarService.getEvent();
    setEvent(getEvents);
  };

  useEffect(() => {
    getEventList();
  });

  return { eventList, getEventList };
}
