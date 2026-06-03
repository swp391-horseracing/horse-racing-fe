import type { CalendarEvent } from "../types/event.ts";

// const MOCK = true;

const mockList: CalendarEvent[] = [
  {
    id: "1",
    title: "Golden Thunder Race",
    start: "2026-05-22T09:00:00",
    end: "2026-05-22T11:00:00",
    overlap: false,
    editable: true,
    className: "bg-yellow-600 text-white",
  },

  {
    id: "2",
    title: "Night Derby Championship",
    start: "2026-05-24T18:30:00",
    end: "2026-05-24T21:00:00",
    overlap: false,
    editable: true,
    className: "bg-red-600 text-white",
  },

  {
    id: "3",
    title: "Spring Cup Qualifier",
    date: "2026-05-27",
    overlap: true,
    editable: false,
    className: "bg-green-600 text-white",
  },
];

export const CalendarService = {
  getEvent: async (): Promise<CalendarEvent[]> => {
    return mockList;
  },
};
