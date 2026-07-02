// src/types/course.ts

export interface TrackShape {
  id: string;
  shape: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

export interface CourseListItem {
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

export interface CourseDistance {
  id: string;
  courseId: string;
  distance: number;
  name?: string;
  type?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

export interface GetCoursesParams {
  page?: number;
  limit?: number;
  status?: string;
}

export interface CreateCourseData {
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

export interface UpdateCourseData {
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

export interface CreateCourseDistanceData {
  distance: number;
  name?: string;
  type?: string;
  status?: string;
}

export interface TrackShape {
  id: string;
  shape: string;
  description: string;
}

export interface CourseDistance {
  id: string;
  distanceMeters: number;
}

export interface CourseDetail {
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
  distances: CourseDistance[];
}
