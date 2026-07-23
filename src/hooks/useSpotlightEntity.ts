import { useState, useEffect } from "react";
import { HorseService } from "../services/HorseService";
import { JockeyService } from "../services/JockeyService";
import type { Horse } from "../types/horse";
import type { Jockey } from "../types/jockey";

interface RaceHistoryItem {
  scheduledAt: string;
  finishedPosition: number | null;
}

export function useSpotlightHorse(horses: Horse[]) {
  const [spotlight, setSpotlight] = useState<{
    horse: Horse | null;
    winRate: string;
    loading: boolean;
  }>({
    horse: horses?.[0] || null,
    winRate: "0.0",
    loading: true,
  });

  useEffect(() => {
    if (!horses || horses.length === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSpotlight({ horse: null, winRate: "0.0", loading: false });
      return;
    }

    let isMounted = true;

    async function evaluateSpotlight() {
      try {
        const candidates = horses.slice(0, 5);
        const results = await Promise.all(
          candidates.map(async (candidate) => {
            try {
              const historyRes = await HorseService.getHorseRaceHistory(
                String(candidate.id),
                { limit: 50 }
              );
              const races: RaceHistoryItem[] = historyRes.data || [];
              const stats = historyRes.stats;

              const thirtyDaysAgo = new Date();
              thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

              const recentRaces = races.filter(
                (r) => r.scheduledAt && new Date(r.scheduledAt) >= thirtyDaysAgo
              );
              let rate = 0;

              if (recentRaces.length > 0) {
                const wins = recentRaces.filter(
                  (r) => Number(r.finishedPosition) === 1
                ).length;
                rate = (wins / recentRaces.length) * 100;
              } else if (stats && Number(stats.totalRaces) > 0) {
                rate =
                  (Number(stats.wins || 0) / Number(stats.totalRaces || 1)) *
                  100;
              }

              return { candidate, rate };
            } catch {
              return { candidate, rate: 0 };
            }
          })
        );

        let best = results[0];
        for (const res of results) {
          if (res.rate > best.rate) {
            best = res;
          }
        }

        if (isMounted && best) {
          setSpotlight({
            horse: best.candidate,
            winRate: best.rate.toFixed(1),
            loading: false,
          });
        }
      } catch {
        if (isMounted) {
          setSpotlight({ horse: horses[0], winRate: "0.0", loading: false });
        }
      }
    }

    void evaluateSpotlight();

    return () => {
      isMounted = false;
    };
  }, [horses]);

  return spotlight;
}

export function useSpotlightJockey(jockeys: Jockey[]) {
  const [spotlight, setSpotlight] = useState<{
    jockey: Jockey | null;
    winRate: string;
    loading: boolean;
  }>({
    jockey: jockeys?.[0] || null,
    winRate: "0.0",
    loading: true,
  });

  useEffect(() => {
    if (!jockeys || jockeys.length === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSpotlight({ jockey: null, winRate: "0.0", loading: false });
      return;
    }

    let isMounted = true;

    async function evaluateSpotlight() {
      try {
        const candidates = jockeys.slice(0, 5);
        const results = await Promise.all(
          candidates.map(async (candidate) => {
            try {
              const historyRes = await JockeyService.getJockeyRaceHistory(
                String(candidate.id),
                { limit: 50 }
              );
              const races: RaceHistoryItem[] = historyRes.data || [];
              const stats = historyRes.stats;

              const thirtyDaysAgo = new Date();
              thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

              const recentRaces = races.filter(
                (r) => r.scheduledAt && new Date(r.scheduledAt) >= thirtyDaysAgo
              );
              let rate = 0;

              if (recentRaces.length > 0) {
                const wins = recentRaces.filter(
                  (r) => Number(r.finishedPosition) === 1
                ).length;
                rate = (wins / recentRaces.length) * 100;
              } else if (stats && Number(stats.totalRaces) > 0) {
                rate =
                  (Number(stats.wins || 0) / Number(stats.totalRaces || 1)) *
                  100;
              }

              return { candidate, rate };
            } catch {
              return { candidate, rate: 0 };
            }
          })
        );

        let best = results[0];
        for (const res of results) {
          if (res.rate > best.rate) {
            best = res;
          }
        }

        if (isMounted && best) {
          setSpotlight({
            jockey: best.candidate,
            winRate: best.rate.toFixed(1),
            loading: false,
          });
        }
      } catch {
        if (isMounted) {
          setSpotlight({ jockey: jockeys[0], winRate: "0.0", loading: false });
        }
      }
    }

    void evaluateSpotlight();

    return () => {
      isMounted = false;
    };
  }, [jockeys]);

  return spotlight;
}
