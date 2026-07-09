import { useState, useCallback, useEffect } from "react";
import type {
  TrackDetail,
  TrackListItem,
  TrackDistance,
  TrackShape,
  PaginatedResponse,
} from "../types/track";
import { TrackService } from "../services/TrackService";

export function useTrack(initialParams?: {
  autoFetchTracks?: boolean;
  autoFetchTrackShapes?: boolean;
  trackId?: string;
}) {
  const [tracks, setTracks] = useState<TrackListItem[]>([]);
  const [trackDetail, setTrackDetail] = useState<TrackDetail | null>(null);
  const [distances, setDistances] = useState<TrackDistance[]>([]);
  const [trackShapes, setTrackShapes] = useState<TrackShape[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [limit, setLimit] = useState(10);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const getTracks = useCallback(
    async (params?: { page?: number; limit?: number; status?: string }) => {
      try {
        setLoading(true);
        setError(null);

        const requestParams = {
          page: params?.page ?? currentPage,
          limit: params?.limit ?? limit,
          status: params?.status,
        };

        const response = await TrackService.getTracks(requestParams);

        if (response && typeof response === "object" && "data" in response) {
          const paginated =
            response as unknown as PaginatedResponse<TrackListItem>;

          setTracks(paginated.data ?? []);

          if (paginated.pagination) {
            setCurrentPage(paginated.pagination.page);
            setLimit(paginated.pagination.limit);
            setTotalItems(paginated.pagination.total);

            const calculatedPages = Math.ceil(
              paginated.pagination.total / paginated.pagination.limit
            );
            setTotalPages(paginated.pagination.totalPages || calculatedPages);
          }
        }

        return response;
      } catch (err) {
        const error = err as Error;
        console.error("Error fetching tracks:", error);
        setError(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [currentPage, limit]
  );

  const getTrackById = useCallback(async (trackId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await TrackService.getTrackById(trackId);
      setTrackDetail(response);
      return response;
    } catch (err) {
      const error = err as Error;
      console.error("Error fetching track detail:", error);
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const getTrackDistances = useCallback(async (trackId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await TrackService.getTrackDistances(trackId);
      setDistances(response ?? []);
      return response;
    } catch (err) {
      const error = err as Error;
      console.error("Error fetching track distances:", error);
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const getTrackShapes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await TrackService.getTrackShapes();
      console.log("track", response);
      setTrackShapes(response ?? []);
      return response;
    } catch (err) {
      const error = err as Error;
      console.error("Error fetching track shapes:", error);
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const createTrack = useCallback(
    async (data: any) => {
      try {
        setLoading(true);
        setError(null);
        const response = await TrackService.createTrack(data);
        await getTracks({ page: 1 });
        return response;
      } catch (err) {
        const error = err as Error;
        console.error("Error creating track:", error);
        setError(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [getTracks]
  );

  const updateTrack = useCallback(
    async (trackId: string, data: any) => {
      try {
        setLoading(true);
        setError(null);
        const response = await TrackService.updateTrack(trackId, data);

        if (trackDetail?.id === trackId) {
          setTrackDetail(response);
        }

        setTracks((prev) =>
          prev.map((track) =>
            track.id === trackId ? { ...track, ...response } : track
          )
        );

        return response;
      } catch (err) {
        const error = err as Error;
        console.error("Error updating track:", error);
        setError(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [trackDetail]
  );

  const updateTrackStatus = useCallback(
    async (trackId: string, status: string) => {
      try {
        setLoading(true);
        setError(null);
        const response = await TrackService.updateTrackStatus(trackId, status);

        setTracks((prev) =>
          prev.map((track) =>
            track.id === trackId ? { ...track, status } : track
          )
        );

        if (trackDetail?.id === trackId) {
          setTrackDetail((prev) => (prev ? { ...prev, status } : null));
        }

        return response;
      } catch (err) {
        const error = err as Error;
        console.error("Error updating track status:", error);
        setError(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [trackDetail]
  );

  const createTrackDistance = useCallback(
    async (trackId: string, data: any) => {
      try {
        setLoading(true);
        setError(null);
        const response = await TrackService.createTrackDistance(trackId, data);

        if (trackDetail?.id === trackId) {
          await getTrackDistances(trackId);
        }

        return response;
      } catch (err) {
        const error = err as Error;
        console.error("Error creating track distance:", error);
        setError(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [trackDetail, getTrackDistances]
  );

  const deleteTrackDistance = useCallback(
    async (trackId: string, distanceId: string) => {
      try {
        setLoading(true);
        setError(null);
        await TrackService.deleteTrackDistance(trackId, distanceId);

        setDistances((prev) => prev.filter((d) => d.id !== distanceId));

        return true;
      } catch (err) {
        const error = err as Error;
        console.error("Error deleting track distance:", error);
        setError(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const goToPage = useCallback(
    (page: number) => {
      if (page < 1 || page > totalPages) return;
      setCurrentPage(page);
      getTracks({ page });
    },
    [totalPages, getTracks]
  );

  const nextPage = useCallback(() => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  }, [currentPage, totalPages, goToPage]);

  const prevPage = useCallback(() => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  }, [currentPage, goToPage]);

  useEffect(() => {
    if (initialParams?.autoFetchTracks) {
      /* eslint-disable react-hooks/set-state-in-effect */
      getTracks();
    }
  }, [initialParams?.autoFetchTracks, getTracks]);

  useEffect(() => {
    if (initialParams?.autoFetchTrackShapes) {
      /* eslint-disable react-hooks/set-state-in-effect */
      getTrackShapes();
    }
  }, [initialParams?.autoFetchTrackShapes, getTrackShapes]);

  useEffect(() => {
    if (initialParams?.trackId) {
      /* eslint-disable react-hooks/set-state-in-effect */
      getTrackById(initialParams.trackId);
    } else {
      setTrackDetail(null);
    }
  }, [initialParams?.trackId, getTrackById]);

  useEffect(() => {
    if (trackDetail?.id) {
      /* eslint-disable react-hooks/set-state-in-effect */
      getTrackDistances(trackDetail.id);
    } else {
      setDistances([]);
    }
  }, [trackDetail?.id, getTrackDistances]);

  useEffect(() => {
    return () => {
      setTracks([]);
      setTrackDetail(null);
      setDistances([]);
      setTrackShapes([]);
      setError(null);
    };
  }, []);

  return {
    tracks,
    trackDetail,
    distances,
    trackShapes,
    loading,
    error,

    currentPage,
    totalPages,
    totalItems,
    limit,

    getTracks,
    getTrackById,
    getTrackDistances,
    getTrackShapes,

    goToPage,
    nextPage,
    prevPage,

    createTrack,
    updateTrack,
    updateTrackStatus,
    createTrackDistance,
    deleteTrackDistance,

    setTracks,
    setTrackDetail,
    setDistances,
    setTrackShapes,
  };
}
