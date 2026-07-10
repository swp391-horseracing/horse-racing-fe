import api from "../lib/api";
import type {
  TrackDetail,
  TrackListItem,
  TrackDistance,
  TrackShape,
  CreateTrackData,
  UpdateTrackData,
  CreateTrackDistanceData,
  PaginatedResponse,
} from "../types/track";

export const TrackService = {
  getTrackShapes: async (): Promise<TrackShape[]> => {
    const response = await api.get("/courses/track-shapes");
    return response.data;
  },

  getTracks: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<PaginatedResponse<TrackListItem>> => {
    const response = await api.get("/courses", { params });
    return response.data;
  },

  getTrackById: async (trackId: string): Promise<TrackDetail> => {
    const response = await api.get(`/courses/${trackId}`);
    return response.data;
  },

  getTrackDistances: async (trackId: string): Promise<TrackDistance[]> => {
    const response = await api.get(`/courses/${trackId}/distances`);
    return response.data;
  },

  createTrack: async (data: CreateTrackData): Promise<TrackDetail> => {
    const response = await api.post("/courses", data);
    return response.data;
  },

  updateTrack: async (
    trackId: string,
    data: UpdateTrackData
  ): Promise<TrackDetail> => {
    const response = await api.patch(`/courses/${trackId}`, data);
    return response.data;
  },

  updateTrackStatus: async (
    trackId: string,
    status: string
  ): Promise<TrackDetail> => {
    const response = await api.patch(`/courses/${trackId}/status`, { status });
    return response.data;
  },

  createTrackDistance: async (
    trackId: string,
    data: CreateTrackDistanceData
  ): Promise<TrackDistance> => {
    const response = await api.post(`/courses/${trackId}/distances`, data);
    return response.data;
  },

  deleteTrackDistance: async (
    trackId: string,
    distanceId: string
  ): Promise<void> => {
    await api.delete(`/courses/${trackId}/distances/${distanceId}`);
  },
};
