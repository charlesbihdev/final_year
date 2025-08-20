import { client, castRow, castRows } from "./client";
import type { Course } from "./types";

export const coursesDb = {
  async getCourse(id: number) {
    const result = await client.execute({
      sql: "SELECT * FROM Courses WHERE id = ?",
      args: [id],
    });
    return castRow<Course>(result.rows[0]);
  },

  async getCourseByCode(code: string) {
    const result = await client.execute({
      sql: "SELECT * FROM Courses WHERE code = ?",
      args: [code],
    });
    return castRow<Course>(result.rows[0]);
  },

  async getStudentCourses(studentId: number) {
    const result = await client.execute({
      sql: `
        SELECT c.* 
        FROM Courses c
        JOIN StudentCourses sc ON c.id = sc.course_id
        WHERE sc.student_id = ?
      `,
      args: [studentId],
    });
    return castRows<Course>(result.rows);
  },

  async createCourse(data: Omit<Course, "id">) {
    const result = await client.execute({
      sql: `INSERT INTO Courses (title, code, level, department) 
            VALUES (?, ?, ?, ?)`,
      args: [data.title, data.code, data.level, data.department],
    });
    return Number(result.lastInsertRowid);
  },

  async updateCourse(id: number, data: Partial<Course>) {
    const updates = Object.entries(data)
      .filter(([_, value]) => value !== undefined)
      .map(([key]) => `${key} = ?`)
      .join(", ");

    const values = Object.entries(data)
      .filter(([_, value]) => value !== undefined)
      .map(([_, value]) => value);

    if (updates.length > 0) {
      await client.execute({
        sql: `UPDATE Courses SET ${updates} WHERE id = ?`,
        args: [...values, id],
      });
    }
  },

  async getAllCourses() {
    const result = await client.execute({
      sql: "SELECT * FROM Courses ORDER BY code",
    });
    return castRows<Course>(result.rows);
  },

  async deleteCourse(id: number) {
    await client.execute({
      sql: "DELETE FROM Courses WHERE id = ?",
      args: [id],
    });
  },
};
