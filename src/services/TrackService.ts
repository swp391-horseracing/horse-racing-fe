import api from "../lib/api.ts";
import type {
  TrackDetail,
  TrackListItem,
  TrackDistance,
  TrackShape,
} from "../types/track.ts";

export const TrackService = {
  async getTrackShapes(): Promise<TrackShape[]> {
    const response = await api.get("/courses/track-shapes");
    return response.data;
  },

  async getTracks(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<TrackListItem[]> {
    const response = await api.get("/courses", { params });
    const data = response.data;
    return Array.isArray(data) ? data : (data.data ?? []);
  },

  async getTrackById(trackId: string): Promise<TrackDetail> {
    const response = await api.get(`/courses/${trackId}`);
    return response.data;
  },

  async getTrackDistances(trackId: string): Promise<TrackDistance[]> {
    const response = await api.get(`/courses/${trackId}/distances`);
    return response.data;
  },

  async createTrack(data: any): Promise<TrackDetail> {
    const response = await api.post("/courses", data);
    return response.data;
  },

  async updateTrack(trackId: string, data: any): Promise<TrackDetail> {
    const response = await api.patch(`/courses/${trackId}`, data);
    return response.data;
  },

  async updateTrackStatus(
    trackId: string,
    status: string
  ): Promise<TrackDetail> {
    const response = await api.patch(`/courses/${trackId}/status`, { status });
    return response.data;
  },

  async createTrackDistance(
    trackId: string,
    data: any
  ): Promise<TrackDistance> {
    const response = await api.post(`/courses/${trackId}/distances`, data);
    return response.data;
  },

  async deleteTrackDistance(
    trackId: string,
    distanceId: string
  ): Promise<void> {
    await api.delete(`/courses/${trackId}/distances/${distanceId}`);
  },
};
