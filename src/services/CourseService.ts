import api from "../lib/api.ts";
import type {
  CourseDetail,
  CourseListItem,
  CourseDistance,
  TrackShape,
} from "../types/course.ts";

export const CourseService = {
  /**
   * Lấy tất cả track shapes
   */
  async getTrackShapes(): Promise<TrackShape[]> {
    const response = await api.get("/courses/track-shapes");
    return response.data;
  },

  /**
   * Lấy tất cả race courses
   */
  async getCourses(params?: {
    page?: number;
    limit?: number;
    status?: string;
    // Có thể thêm các filter khác nếu backend hỗ trợ
  }): Promise<CourseListItem[]> {
    const response = await api.get("/courses", { params });
    return response.data;
  },

  /**
   * Lấy chi tiết một course
   */
  async getCourseById(courseId: string): Promise<CourseDetail> {
    const response = await api.get(`/courses/${courseId}`);
    return response.data;
  },

  /**
   * Lấy tất cả supported distances của một course
   */
  async getCourseDistances(courseId: string): Promise<CourseDistance[]> {
    const response = await api.get(`/courses/${courseId}/distances`);
    return response.data;
  },

  /**
   * Admin: Tạo race course mới
   */
  async createCourse(data: any): Promise<CourseDetail> {
    const response = await api.post("/courses", data);
    return response.data;
  },

  /**
   * Admin: Update race course
   */
  async updateCourse(courseId: string, data: any): Promise<CourseDetail> {
    const response = await api.patch(`/courses/${courseId}`, data);
    return response.data;
  },

  /**
   * Admin: Update status của race course
   */
  async updateCourseStatus(
    courseId: string,
    status: string
  ): Promise<CourseDetail> {
    const response = await api.patch(`/courses/${courseId}/status`, { status });
    return response.data;
  },

  /**
   * Admin: Tạo distance cho course
   */
  async createCourseDistance(
    courseId: string,
    data: any
  ): Promise<CourseDistance> {
    const response = await api.post(`/courses/${courseId}/distances`, data);
    return response.data;
  },

  /**
   * Admin: Xóa distance của course
   */
  async deleteCourseDistance(
    courseId: string,
    distanceId: string
  ): Promise<void> {
    await api.delete(`/courses/${courseId}/distances/${distanceId}`);
  },
};
