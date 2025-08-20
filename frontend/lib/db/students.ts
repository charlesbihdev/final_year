import { client, castRow, castRows } from "./client";
import type { Student } from "./types";

export const studentsDb = {
  async getStudent(id: number) {
    const result = await client.execute({
      sql: "SELECT * FROM Students WHERE id = ?",
      args: [id],
    });
    return castRow<Student>(result.rows[0]);
  },

  async getStudentByIndexNumber(indexNumber: string) {
    const result = await client.execute({
      sql: "SELECT * FROM Students WHERE index_number = ?",
      args: [indexNumber],
    });
    return castRow<Student>(result.rows[0]);
  },

  async getStudentsByCourse(courseId: number) {
    const result = await client.execute({
      sql: `
        SELECT s.* 
        FROM Students s 
        JOIN StudentCourses sc ON s.id = sc.student_id
        WHERE sc.course_id = ?
        ORDER BY s.index_number
      `,
      args: [courseId],
    });
    return castRows<Student>(result.rows);
  },

  async createStudent(data: Omit<Student, "id">) {
    // Validate and convert level to ensure it's one of the allowed values
    const validLevels = [100, 200, 300, 400] as const;
    const levelNum = typeof data.level === 'string' ? parseInt(data.level) : data.level;
    const level = validLevels.includes(levelNum as any) ? levelNum : 100;

    // Ensure all required fields are present and valid
    if (!data.name || !data.index_number || !data.division) {
      throw new Error("Missing required fields: name, index_number, or division");
    }

    const result = await client.execute({
      sql: `INSERT INTO Students (name, email, index_number, department, level, division) 
            VALUES (?, ?, ?, ?, ?, ?)`,
      args: [
        String(data.name),
        data.email || null,
        String(data.index_number),
        data.department || null,
        Number(level),
        String(data.division),
      ],
    });
    return Number(result.lastInsertRowid);
  },

  async updateStudent(id: number, data: Partial<Student>) {
    const updates = Object.entries(data)
      .filter(([_, value]) => value !== undefined)
      .map(([key]) => `${key} = ?`)
      .join(", ");

    const values = Object.entries(data)
      .filter(([_, value]) => value !== undefined)
      .map(([_, value]) => value);

    if (updates.length > 0) {
      await client.execute({
        sql: `UPDATE Students SET ${updates} WHERE id = ?`,
        args: [...values, id],
      });
    }
  },

  async getAllStudents() {
    const result = await client.execute({
      sql: `SELECT * FROM Students ORDER BY index_number`,
    });
    return castRows<Student>(result.rows);
  },

  async deleteStudent(id: number) {
    await client.execute({
      sql: "DELETE FROM Students WHERE id = ?",
      args: [id],
    });
  },
};
