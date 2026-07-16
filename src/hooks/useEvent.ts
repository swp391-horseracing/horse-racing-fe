import { useState, useEffect } from "react";
import { TournamentService } from "../services/TournamentService";
import type { Tournament } from "../types/tournament";

export function useEvent() {
  const [eventList, setEventList] = useState<{ id: string; title: string }[]>(
    []
  );

  useEffect(() => {
    TournamentService.getTournaments()
      .then((res) => {
        const tournaments = res.data as Tournament[];
        setEventList(tournaments.map((t) => ({ id: t.id, title: t.name })));
      })
      .catch((err) => {
        console.error("Failed to load tournaments:", err);
        setEventList([]);
      });
  }, []);

  return { eventList };
}
