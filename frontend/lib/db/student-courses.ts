import { client, castRow, castRows } from "./client";
import type { StudentCourse } from "./types";

export const studentCoursesDb = {
  async getEnrollment(id: number) {
    const result = await client.execute({
      sql: "SELECT * FROM StudentCourses WHERE id = ?",
      args: [id],
    });
    return castRow<StudentCourse>(result.rows[0]);
  },

  async getStudentEnrollments(studentId: number) {
    const result = await client.execute({
      sql: "SELECT * FROM StudentCourses WHERE student_id = ?",
      args: [studentId],
    });
    return castRows<StudentCourse>(result.rows);
  },

  async getCourseEnrollments(courseId: number) {
    const result = await client.execute({
      sql: "SELECT * FROM StudentCourses WHERE course_id = ?",
      args: [courseId],
    });
    return castRows<StudentCourse>(result.rows);
  },

  async getAllEnrollments() {
    const result = await client.execute({
      sql: "SELECT * FROM StudentCourses ORDER BY enrolled_at DESC",
    });
    return castRows<StudentCourse>(result.rows);
  },

  async enrollStudent(studentId: number, courseId: number) {
    try {
      const result = await client.execute({
        sql: "INSERT INTO StudentCourses (student_id, course_id) VALUES (?, ?)",
        args: [studentId, courseId],
      });
      return Number(result.lastInsertRowid);
    } catch (error) {
      // Handle duplicate enrollment
      if (error instanceof Error && error.message.includes('UNIQUE constraint failed')) {
        throw new Error('Student is already enrolled in this course');
      }
      throw error;
    }
  },

  async unenrollStudent(studentId: number, courseId: number) {
    await client.execute({
      sql: "DELETE FROM StudentCourses WHERE student_id = ? AND course_id = ?",
      args: [studentId, courseId],
    });
  },

  async deleteEnrollment(enrollmentId: number) {
    await client.execute({
      sql: "DELETE FROM StudentCourses WHERE id = ?",
      args: [enrollmentId],
    });
  },

  async isStudentEnrolled(studentId: number, courseId: number): Promise<boolean> {
    const result = await client.execute({
      sql: "SELECT COUNT(*) as count FROM StudentCourses WHERE student_id = ? AND course_id = ?",
      args: [studentId, courseId],
    });
    return Number(result.rows[0]?.count) > 0;
  },

  async getEnrollmentCount(courseId: number): Promise<number> {
    const result = await client.execute({
      sql: "SELECT COUNT(*) as count FROM StudentCourses WHERE course_id = ?",
      args: [courseId],
    });
    return Number(result.rows[0]?.count) || 0;
  },

  async getStudentEnrollmentCount(studentId: number): Promise<number> {
    const result = await client.execute({
      sql: "SELECT COUNT(*) as count FROM StudentCourses WHERE student_id = ?",
      args: [studentId],
    });
    return Number(result.rows[0]?.count) || 0;
  },
};