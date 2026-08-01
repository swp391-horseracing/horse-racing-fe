import { useState, useEffect } from "react";
import { HorseService } from "../services/HorseService";
import { JockeyService } from "../services/JockeyService";
import type { Horse } from "../types/horse";
import type { Jockey } from "../types/jockey";

function computeWinRate(wins: number, totalRaces: number): number {
  if (totalRaces <= 0) return 0;
  return (wins / totalRaces) * 100;
}

export function useSpotlightHorse() {
  const [spotlight, setSpotlight] = useState<{
    horse: Horse | null;
    winRate: string;
    loading: boolean;
  }>({
    horse: null,
    winRate: "0.0",
    loading: true,
  });

  useEffect(() => {
    let isMounted = true;

    async function evaluateSpotlight() {
      try {
        const res = await HorseService.getLeaderboard(1, 1);
        const entry = res?.data?.[0];
        if (!entry) {
          if (isMounted) {
            setSpotlight({ horse: null, winRate: "0.0", loading: false });
          }
          return;
        }

        const horse = await HorseService.getHorseById(String(entry.horse.id));
        const rate = computeWinRate(entry.wins, entry.totalRaces);

        if (isMounted) {
          setSpotlight({
            horse,
            winRate: rate.toFixed(1),
            loading: false,
          });
        }
      } catch {
        if (isMounted) {
          setSpotlight({ horse: null, winRate: "0.0", loading: false });
        }
      }
    }

    void evaluateSpotlight();

    return () => {
      isMounted = false;
    };
  }, []);

  return spotlight;
}

export function useSpotlightJockey() {
  const [spotlight, setSpotlight] = useState<{
    jockey: Jockey | null;
    winRate: string;
    loading: boolean;
  }>({
    jockey: null,
    winRate: "0.0",
    loading: true,
  });

  useEffect(() => {
    let isMounted = true;

    async function evaluateSpotlight() {
      try {
        const res = await JockeyService.getLeaderboard(1, 1);
        const entry = res?.data?.[0];
        if (!entry) {
          if (isMounted) {
            setSpotlight({ jockey: null, winRate: "0.0", loading: false });
          }
          return;
        }

        const jockey: Jockey = {
          id: entry.jockey.id,
          name: entry.jockey.fullName || "Unknown Jockey",
          fullName: entry.jockey.fullName || "Unknown Jockey",
          avatarUrl: entry.jockey.avatarUrl ?? null,
          weightKg: entry.jockey.weightKg,
          experienceYear: entry.jockey.experienceYear,
          isRacing: false,
          licenseId: "",
          winRate: computeWinRate(entry.wins, entry.totalRaces),
          totalRuns: entry.totalRaces,
          podiums: 0,
          club: "Independent",
        };
        const rate = computeWinRate(entry.wins, entry.totalRaces);

        if (isMounted) {
          setSpotlight({
            jockey,
            winRate: rate.toFixed(1),
            loading: false,
          });
        }
      } catch {
        if (isMounted) {
          setSpotlight({ jockey: null, winRate: "0.0", loading: false });
        }
      }
    }

    void evaluateSpotlight();

    return () => {
      isMounted = false;
    };
  }, []);

  return spotlight;
}
