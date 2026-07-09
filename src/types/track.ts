export interface TrackShape {
  id: string;
  shape: string;
  createdAt?: string;
  updatedAt?: string;
  description?: string;
  [key: string]: any;
}

export interface TrackListItem {
  id: string;
  name: string;
  country?: string;
  city?: string;
  location?: string;
  surfaceType?: string;
  distanceMeters?: number;
  maxStartingPositions?: number;
  grandstandCapacity?: number;
  trackShape?: TrackShape;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages?: number;
  };
}

export interface TrackDistance {
  id: string;
  trackId: string;
  distance: number;
  name?: string;
  type?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  distanceMeters?: number;
  [key: string]: any;
}

export interface GetTracksParams {
  page?: number;
  limit?: number;
  status?: string;
}

export interface CreateTrackData {
  name: string;
  country: string;
  city: string;
  surfaceType: string;
  distanceMeters: number;
  maxStartingPositions: number;
  grandstandCapacity: number;
  trackShapeId: string;
  status?: string;
  description?: string;
  address?: string;
}

export interface UpdateTrackData {
  name?: string;
  country?: string;
  city?: string;
  surfaceType?: string;
  distanceMeters?: number;
  maxStartingPositions?: number;
  grandstandCapacity?: number;
  trackShapeId?: string;
  status?: string;
  description?: string;
  address?: string;
}

export interface CreateTrackDistanceData {
  distance: number;
  name?: string;
  type?: string;
  status?: string;
}

export interface TrackDetail {
  id: string;
  name: string;
  country: string;
  city: string;
  address: string;
  surfaceType: string;
  distanceMeters: number;
  maxStartingPositions: number;
  grandstandCapacity: number;
  status: string;
  trackShape: TrackShape;
  createdAt: string;
  updatedAt: string;
  distances: TrackDistance[];
}
