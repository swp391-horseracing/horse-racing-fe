import { useState, useCallback, useEffect } from "react";
import type {
  CourseDetail,
  CourseListItem,
  CourseDistance,
  TrackShape,
  PaginatedResponse,
} from "../types/course";
import { CourseService } from "../services/CourseService";

export function useCourse(initialParams?: {
  autoFetchCourses?: boolean;
  autoFetchTrackShapes?: boolean;
  courseId?: string;
}) {
  // List & Detail State
  const [courses, setCourses] = useState<CourseListItem[]>([]);
  const [courseDetail, setCourseDetail] = useState<CourseDetail | null>(null);
  const [distances, setDistances] = useState<CourseDistance[]>([]);
  const [trackShapes, setTrackShapes] = useState<TrackShape[]>([]);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [limit, setLimit] = useState(10);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // ==================== FETCH ====================

  const getCourses = useCallback(
    async (params?: { page?: number; limit?: number; status?: string }) => {
      try {
        setLoading(true);
        setError(null);

        // Merge current state with passed params
        const requestParams = {
          page: params?.page ?? currentPage,
          limit: params?.limit ?? limit,
          status: params?.status,
        };

        const response = await CourseService.getCourses(requestParams);

        // Handle PaginatedResponse { data: [], pagination: {} }
        if (response && typeof response === "object" && "data" in response) {
          const paginated =
            response as unknown as PaginatedResponse<CourseListItem>;

          setCourses(paginated.data ?? []);

          if (paginated.pagination) {
            setCurrentPage(paginated.pagination.page);
            setLimit(paginated.pagination.limit);
            setTotalItems(paginated.pagination.total);

            // Calculate totalPages if not explicitly provided by API
            const calculatedPages = Math.ceil(
              paginated.pagination.total / paginated.pagination.limit
            );
            setTotalPages(paginated.pagination.totalPages || calculatedPages);
          }
        }
        // Fallback for plain array responses
        else if (Array.isArray(response)) {
          setCourses(response);
          setTotalItems(response.length);
          setTotalPages(1);
        }

        return response;
      } catch (err) {
        const error = err as Error;
        console.error("Error fetching courses:", error);
        setError(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [currentPage, limit]
  );

  const getCourseById = useCallback(async (courseId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await CourseService.getCourseById(courseId);
      setCourseDetail(response);
      return response;
    } catch (err) {
      const error = err as Error;
      console.error("Error fetching course detail:", error);
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const getCourseDistances = useCallback(async (courseId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await CourseService.getCourseDistances(courseId);
      setDistances(response ?? []);
      return response;
    } catch (err) {
      const error = err as Error;
      console.error("Error fetching course distances:", error);
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
      const response = await CourseService.getTrackShapes();
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

  // ==================== ADMIN CRUD ====================

  const createCourse = useCallback(
    async (data: any) => {
      try {
        setLoading(true);
        setError(null);
        const response = await CourseService.createCourse(data);
        // Refresh list and go back to page 1 to see new item
        await getCourses({ page: 1 });
        return response;
      } catch (err) {
        const error = err as Error;
        console.error("Error creating course:", error);
        setError(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [getCourses]
  );

  const updateCourse = useCallback(
    async (courseId: string, data: any) => {
      try {
        setLoading(true);
        setError(null);
        const response = await CourseService.updateCourse(courseId, data);

        // Optimistic update for detail
        if (courseDetail?.id === courseId) {
          setCourseDetail(response);
        }

        // Update in list
        setCourses((prev) =>
          prev.map((course) =>
            course.id === courseId ? { ...course, ...response } : course
          )
        );

        return response;
      } catch (err) {
        const error = err as Error;
        console.error("Error updating course:", error);
        setError(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [courseDetail]
  );

  const updateCourseStatus = useCallback(
    async (courseId: string, status: string) => {
      try {
        setLoading(true);
        setError(null);
        const response = await CourseService.updateCourseStatus(
          courseId,
          status
        );

        // Update in list and detail
        setCourses((prev) =>
          prev.map((course) =>
            course.id === courseId ? { ...course, status } : course
          )
        );

        if (courseDetail?.id === courseId) {
          setCourseDetail((prev) => (prev ? { ...prev, status } : null));
        }

        return response;
      } catch (err) {
        const error = err as Error;
        console.error("Error updating course status:", error);
        setError(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [courseDetail]
  );

  const createCourseDistance = useCallback(
    async (courseId: string, data: any) => {
      try {
        setLoading(true);
        setError(null);
        const response = await CourseService.createCourseDistance(
          courseId,
          data
        );

        // Refresh distances if current course
        if (courseDetail?.id === courseId) {
          await getCourseDistances(courseId);
        }

        return response;
      } catch (err) {
        const error = err as Error;
        console.error("Error creating course distance:", error);
        setError(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [courseDetail, getCourseDistances]
  );

  const deleteCourseDistance = useCallback(
    async (courseId: string, distanceId: string) => {
      try {
        setLoading(true);
        setError(null);
        await CourseService.deleteCourseDistance(courseId, distanceId);

        // Optimistic update
        setDistances((prev) => prev.filter((d) => d.id !== distanceId));

        return true;
      } catch (err) {
        const error = err as Error;
        console.error("Error deleting course distance:", error);
        setError(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // ==================== PAGINATION ACTIONS ====================

  const goToPage = useCallback(
    (page: number) => {
      if (page < 1 || page > totalPages) return;
      setCurrentPage(page);
      getCourses({ page });
    },
    [totalPages, getCourses]
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

  // ==================== EFFECTS ====================

  // Auto-fetch courses on mount
  useEffect(() => {
    if (initialParams?.autoFetchCourses) {
      /* eslint-disable react-hooks/set-state-in-effect */
      getCourses();
    }
  }, [initialParams?.autoFetchCourses, getCourses]);

  // Auto-fetch track shapes on mount
  useEffect(() => {
    if (initialParams?.autoFetchTrackShapes) {
      /* eslint-disable react-hooks/set-state-in-effect */
      getTrackShapes();
    }
  }, [initialParams?.autoFetchTrackShapes, getTrackShapes]);

  // Fetch course detail when courseId changes
  useEffect(() => {
    if (initialParams?.courseId) {
      /* eslint-disable react-hooks/set-state-in-effect */
      getCourseById(initialParams.courseId);
    } else {
      setCourseDetail(null);
    }
  }, [initialParams?.courseId, getCourseById]);

  // Fetch distances when course detail is loaded
  useEffect(() => {
    if (courseDetail?.id) {
      /* eslint-disable react-hooks/set-state-in-effect */
      getCourseDistances(courseDetail.id);
    } else {
      setDistances([]);
    }
  }, [courseDetail?.id, getCourseDistances]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      setCourses([]);
      setCourseDetail(null);
      setDistances([]);
      setTrackShapes([]);
      setError(null);
    };
  }, []);

  return {
    // State
    courses,
    courseDetail,
    distances,
    trackShapes,
    loading,
    error,

    // Pagination State
    currentPage,
    totalPages,
    totalItems,
    limit,

    // Actions
    getCourses,
    getCourseById,
    getCourseDistances,
    getTrackShapes,

    // Pagination Actions
    goToPage,
    nextPage,
    prevPage,

    // Admin actions
    createCourse,
    updateCourse,
    updateCourseStatus,
    createCourseDistance,
    deleteCourseDistance,

    // Setters
    setCourses,
    setCourseDetail,
    setDistances,
    setTrackShapes,
  };
}
