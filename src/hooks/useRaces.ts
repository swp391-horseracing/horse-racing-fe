import { useState, useCallback } from "react";
import { ScheduleService } from "../services/ScheduleService.ts";
import { RaceService } from "../services/RaceService";
import type { RaceListItem, RaceDetail } from "../types/race";

export function useRaces() {
  const [races, setRaces] = useState<RaceListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRacesByMonth = useCallback(async (year: number, month: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await ScheduleService.getRacesByMonth(year, month);
      setRaces(data);
    } catch (err: unknown) {
      const error = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      setError(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to load races"
      );
      setRaces([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return { races, loading, error, loadRacesByMonth };
}

export function useRaceDetail() {
  const [detail, setDetail] = useState<RaceDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDetail = useCallback(async (raceId: string) => {
    if (!raceId) {
      setDetail(null);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const data = await RaceService.getRaceById(raceId);
      data.entries = await RaceService.getRaceHorses(raceId);
      setDetail(data);
    } catch (err: unknown) {
      const error = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      setError(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to load race detail"
      );
      setDetail(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearDetail = useCallback(() => {
    setDetail(null);
    setError(null);
  }, []);

  return { detail, loading, error, loadDetail, clearDetail };
}
