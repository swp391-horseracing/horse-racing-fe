import { useState, useEffect, useCallback } from "react";
import { UserService } from "../services/UserService";
import type { Ride } from "../types/race.ts";
export type MyRide = Ride;
import type { UserRace } from "../types/user.ts";
import type { Jockey } from "../types/jockey.ts";
import { JockeyService } from "../services/JockeyService.ts";

export function useJockey() {
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [jockeysPagination, setJockeysPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [page, setPage] = useState(1);
  const [jockeys, setJockeys] = useState<Jockey[]>([]);

  const mapApiRaceToMyRide = (race: UserRace): Ride => {
    return {
      id: race.id,
      tournamentId: race.tournamentId,
      name: race.name,
      roundName: race.roundName ?? "",
      distanceMeters: race.distanceMeters,
      scheduledAt: race.scheduledAt,
      venue: race.venue,
      status:
        race.status === "completed" || race.status === "result_confirmed"
          ? "completed"
          : race.status === "ongoing"
            ? "live"
            : "scheduled",
      ride: race.horse ?? race.ride ?? "",
      laneNumber: race.laneNumber ?? 0,
      entryStatus: (race.entryStatus ?? "pending") as
        | "pending"
        | "accepted"
        | "declined",
      confirmedAt: race.confirmedAt ?? null,
      horseOwner: race.jockey ?? race.horseOwner ?? "",
      horsesId: race.horsesId ?? "",
      ownerId: race.ownerId ?? "",
      trackCondition: race.trackCondition ?? "good",
      laneCount: race.laneCount ?? 8,
      ranking: race.ranking ?? undefined,
    };
  };

  const loadJockey = useCallback(async () => {
    try {
      const response = await JockeyService.getJockeys({
        page,
        limit: 10,
      });

      console.log("jockey is here:", response.data);
      setJockeys(response.data ?? []);
      setJockeysPagination(response.pagination);
    } catch (error) {
      console.error("Failed to load horses:", error);
    }
  }, [page]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadJockey();
  }, [loadJockey]);

  const loadRaces = useCallback(
    async (page: number = 1, limit: number = 20) => {
      try {
        setLoading(true);
        setError(null);

        const response = await UserService.getMyRaces(page, limit);
        console.log("jockey races response:", response);
        const mappedRides = response.data.map(mapApiRaceToMyRide);
        console.log("map races response:", mappedRides);
        setRides(mappedRides);
        setPagination(response.pagination);
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
        setRides([]);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const updateRideStatus = useCallback(
    (rideId: string, status: "accepted" | "declined") => {
      setRides((prev) =>
        prev.map((r) =>
          r.id === rideId
            ? {
                ...r,
                entryStatus: status,
                confirmedAt:
                  status === "accepted"
                    ? new Date().toISOString()
                    : r.confirmedAt,
              }
            : r
        )
      );
    },
    []
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadRaces();
  }, [loadRaces]);

  return {
    page,
    setPage,
    jockeys,
    rides,
    loading,
    error,
    pagination,
    jockeysPagination,
    loadRaces,
    updateRideStatus,
  };
}
