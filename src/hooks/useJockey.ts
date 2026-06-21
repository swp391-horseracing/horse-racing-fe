import { useState, useEffect, useCallback } from "react";
import { UserService } from "../services/UserService";
import type { Ride } from "../types/race.ts";
export type MyRide = Ride;
import type { UserRace } from "../types/user.ts";

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

  const mapApiRaceToMyRide = (race: UserRace): Ride => {
    return {
      id: race.id,
      tournamentId: race.tournamentId,
      name: race.name,
      roundName: race.roundName,
      distanceMeters: race.distanceMeters,
      scheduledAt: race.scheduledAt,
      venue: race.venue,
      status:
        race.status === "completed" || race.status === "result_confirmed"
          ? "completed"
          : race.status === "ongoing"
            ? "live"
            : "scheduled",
      ride: "Horse TBD",
      laneNumber: 0,
      entryStatus: "pending",
      confirmedAt: null,
      horseOwner: "Owner TBD",
      horsesId: "",
      ownerId: "",
      trackCondition: "good",
      laneCount: 8,
      ranking: undefined,
    };
  };

  const loadRaces = useCallback(
    async (page: number = 1, limit: number = 20) => {
      try {
        setLoading(true);
        setError(null);

        const response = await UserService.getMyRaces(page, limit);
        const mappedRides = response.data.map(mapApiRaceToMyRide);

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
    rides,
    loading,
    error,
    pagination,
    loadRaces,
    updateRideStatus,
  };
}
