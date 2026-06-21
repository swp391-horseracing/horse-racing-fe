import { useEffect, useState, useCallback } from "react";
import type { CalendarEvent } from "../types/event";
import { CalendarService } from "../services/calendarService";

export function useEvent() {
  const [eventList, setEvent] = useState<CalendarEvent[]>([]);

  const getEventList = useCallback(async () => {
    try {
      const getEvents = await CalendarService.getEvent();
      setEvent(getEvents);
    } catch (error) {
      console.error("Error fetching event list:", error);
    }
  }, []);

  useEffect(() => {
    let active = true;

    const fetchEvents = async () => {
      try {
        const getEvents = await CalendarService.getEvent();
        if (active) {
          setEvent(getEvents);
        }
      } catch (error) {
        console.error("Error fetching events on mount:", error);
      }
    };

    fetchEvents();

    return () => {
      active = false;
    };
  }, []);

  return { eventList, getEventList };
}
