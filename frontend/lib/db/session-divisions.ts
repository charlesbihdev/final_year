import { client, castRow, castRows } from "./client";
import type { SessionDivision } from "./types";

export const sessionDivisionsDb = {
  async getSessionDivision(id: number) {
    const result = await client.execute({
      sql: "SELECT * FROM SessionDivisions WHERE id = ?",
      args: [id],
    });
    return castRow<SessionDivision>(result.rows[0]);
  },

  async getSessionDivisions(sessionId: number) {
    const result = await client.execute({
      sql: "SELECT * FROM SessionDivisions WHERE session_id = ? ORDER BY division",
      args: [sessionId],
    });
    return castRows<SessionDivision>(result.rows);
  },

  async getSessionDivisionsWithDetails(sessionId: number) {
    const result = await client.execute({
      sql: `
        SELECT 
          sd.*,
          COUNT(DISTINCT sc.student_id) as student_count
        FROM SessionDivisions sd
        LEFT JOIN Students s ON s.division = sd.division
        LEFT JOIN StudentCourses sc ON sc.student_id = s.id 
        LEFT JOIN ExamSessions es ON es.id = sd.session_id AND es.course_id = sc.course_id
        WHERE sd.session_id = ?
        GROUP BY sd.id
        ORDER BY sd.division
      `,
      args: [sessionId],
    });
    
    return result.rows.map(row => ({
      ...castRow<SessionDivision>(row),
      student_count: Number(row.student_count) || 0,
    }));
  },

  async createSessionDivision(data: Omit<SessionDivision, "id">) {
    const result = await client.execute({
      sql: `INSERT INTO SessionDivisions (session_id, division, room_number, max_capacity) 
            VALUES (?, ?, ?, ?)`,
      args: [
        Number(data.session_id),
        String(data.division),
        data.room_number || null,
        data.max_capacity ? Number(data.max_capacity) : null,
      ],
    });
    return Number(result.lastInsertRowid);
  },

  async updateSessionDivision(id: number, data: Partial<SessionDivision>) {
    const updates = Object.entries(data)
      .filter(([_, value]) => value !== undefined)
      .map(([key]) => `${key} = ?`)
      .join(", ");

    const values = Object.entries(data)
      .filter(([_, value]) => value !== undefined)
      .map(([_, value]) => value);

    if (updates.length > 0) {
      await client.execute({
        sql: `UPDATE SessionDivisions SET ${updates} WHERE id = ?`,
        args: [...values, id],
      });
    }
  },

  async deleteSessionDivision(id: number) {
    await client.execute({
      sql: "DELETE FROM SessionDivisions WHERE id = ?",
      args: [id],
    });
  },

  async deleteSessionDivisions(sessionId: number) {
    await client.execute({
      sql: "DELETE FROM SessionDivisions WHERE session_id = ?",
      args: [sessionId],
    });
  },

  async createDivisionsForSession(sessionId: number, courseId: number) {
    // Get all divisions that have students enrolled in this course
    const result = await client.execute({
      sql: `
        SELECT DISTINCT s.division, COUNT(*) as student_count
        FROM Students s
        JOIN StudentCourses sc ON s.id = sc.student_id
        WHERE sc.course_id = ?
        GROUP BY s.division
        ORDER BY s.division
      `,
      args: [courseId],
    });

    const divisions = [];
    for (const row of result.rows) {
      const divisionId = await this.createSessionDivision({
        session_id: sessionId,
        division: row.division as string,
        room_number: null,
        max_capacity: null,
      });
      divisions.push(divisionId);
    }
    return divisions;
  },

  async assignInvigilatorsToSessionDivision(sessionDivisionId: number, invigilatorIds: number[]) {
    // First, remove existing assignments for this session division
    await client.execute({
      sql: "DELETE FROM SessionInvigilators WHERE session_division_id = ?",
      args: [sessionDivisionId],
    });

    // Then add new assignments
    for (let i = 0; i < invigilatorIds.length; i++) {
      const invigilatorId = invigilatorIds[i];
      const isPrimary = i === 0; // First invigilator is primary

      await client.execute({
        sql: "INSERT INTO SessionInvigilators (session_division_id, invigilator_id, is_primary) VALUES (?, ?, ?)",
        args: [sessionDivisionId, invigilatorId, isPrimary],
      });
    }
  },

  async getSessionDivisionInvigilators(sessionDivisionId: number) {
    const result = await client.execute({
      sql: `
        SELECT 
          si.*,
          i.id as invigilator_id,
          i.department as invigilator_department,
          u.id as user_id,
          u.name as user_name,
          u.email as user_email
        FROM SessionInvigilators si
        JOIN Invigilators i ON si.invigilator_id = i.id
        JOIN Users u ON i.user_id = u.id
        WHERE si.session_division_id = ?
        ORDER BY si.is_primary DESC, u.name
      `,
      args: [sessionDivisionId],
    });

    return result.rows.map(row => ({
      id: Number(row.invigilator_id),
      user_id: Number(row.user_id),
      department: row.invigilator_department,
      is_primary: Boolean(row.is_primary),
      user: {
        id: Number(row.user_id),
        name: row.user_name,
        email: row.user_email,
        password: '', // Don't expose password
        role: 'invigilator' as const,
      },
    }));
  },
};
