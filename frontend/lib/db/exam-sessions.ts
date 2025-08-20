import { client, castRow, castRows } from "./client";
import type { ExamSession, Invigilator } from "./types";

export const examSessionsDb = {
  async getSession(id: number) {
    const result = await client.execute({
      sql: `
        SELECT es.*, c.title as course_title, c.code as course_code, c.department as course_department, c.level as course_level 
        FROM ExamSessions es
        JOIN Courses c ON es.course_id = c.id
        WHERE es.id = ?
      `,
      args: [id],
    });
    
    const row = result.rows[0];
    if (!row) return undefined;
    
    return {
      ...castRow<ExamSession & {
        course_title: string;
        course_code: string;
        course_department: string;
        course_level: string;
      }>(row),
      course: {
        id: row.course_id as number,
        title: row.course_title as string,
        code: row.course_code as string,
        department: row.course_department as string,
        level: row.course_level as number,
      },
    };
  },

  async getActiveSessions() {
    const result = await client.execute({
      sql: `
        SELECT es.*, c.title as course_title, c.code as course_code
        FROM ExamSessions es
        JOIN Courses c ON es.course_id = c.id
        WHERE es.is_active = 1
      `,
    });
    return castRows<
      ExamSession & {
        course_title: string;
        course_code: string;
      }
    >(result.rows);
  },

  async getSessionInvigilators(sessionId: number) {
    const result = await client.execute({
      sql: `
        SELECT i.*, u.name, u.email
        FROM Invigilators i
        JOIN SessionInvigilators si ON i.id = si.invigilator_id
        JOIN Users u ON i.user_id = u.id
        WHERE si.session_id = ?
      `,
      args: [sessionId],
    });
    return castRows<
      Invigilator & {
        name: string;
        email: string;
      }
    >(result.rows);
  },

  async query<T = any>(sql: string, args: any[] = []) {
    const result = await client.execute({
      sql,
      args,
    });
    return result.rows as T[];
  },

  async getSessionsByCourse(courseId: number) {
    const result = await client.execute({
      sql: "SELECT * FROM ExamSessions WHERE course_id = ?",
      args: [courseId],
    });
    return castRows<ExamSession>(result.rows);
  },

  async getSessionsByInvigilator(invigilatorId: number) {
    const result = await client.execute({
      sql: `
        SELECT DISTINCT es.*, c.title as course_title, c.code as course_code, c.department as course_department, c.level as course_level 
        FROM ExamSessions es
        JOIN SessionDivisions sd ON es.id = sd.session_id
        JOIN SessionInvigilators si ON sd.id = si.session_division_id
        JOIN Courses c ON es.course_id = c.id
        WHERE si.invigilator_id = ?
        ORDER BY es.date DESC, es.start_time DESC
      `,
      args: [invigilatorId],
    });

    return castRows<
      ExamSession & {
        course_title: string;
        course_code: string;
        course_department: string;
        course_level: string;
      }
    >(result.rows).map((row) => ({
      ...row,
      course: {
        id: row.course_id,
        title: row.course_title,
        code: row.course_code,
        department: row.course_department,
        level: row.course_level,
      },
    }));
  },

  async createSession(data: Omit<ExamSession, "id">) {
    const result = await client.execute({
      sql: `INSERT INTO ExamSessions (course_id, date, start_time, end_time, is_active) 
            VALUES (?, ?, ?, ?, ?)`,
      args: [
        Number(data.course_id),
        String(data.date),
        String(data.start_time),
        String(data.end_time),
        Boolean(data.is_active ?? false),
      ],
    });
    return Number(result.lastInsertRowid);
  },

  async updateSession(id: number, data: Partial<ExamSession>) {
    const updates = Object.entries(data)
      .filter(([_, value]) => value !== undefined)
      .map(([key]) => `${key} = ?`)
      .join(", ");

    const values = Object.entries(data)
      .filter(([_, value]) => value !== undefined)
      .map(([_, value]) => value);

    if (updates.length > 0) {
      await client.execute({
        sql: `UPDATE ExamSessions SET ${updates} WHERE id = ?`,
        args: [...values, id],
      });
    }
  },

  async assignInvigilator(sessionId: number, invigilatorId: number) {
    await client.execute({
      sql: "INSERT INTO SessionInvigilators (session_id, invigilator_id) VALUES (?, ?)",
      args: [sessionId, invigilatorId],
    });
  },

  async removeInvigilator(sessionId: number, invigilatorId: number) {
    await client.execute({
      sql: "DELETE FROM SessionInvigilators WHERE session_id = ? AND invigilator_id = ?",
      args: [sessionId, invigilatorId],
    });
  },

  async getAllSessions() {
    const result = await client.execute({
      sql: `
        SELECT es.*, c.title as course_title, c.code as course_code, c.department as course_department, c.level as course_level 
        FROM ExamSessions es
        JOIN Courses c ON es.course_id = c.id
        ORDER BY es.date DESC, es.start_time DESC
      `,
    });

    return castRows<
      ExamSession & {
        course_title: string;
        course_code: string;
        course_department: string;
        course_level: string;
      }
    >(result.rows).map((row) => ({
      ...row,
      course: {
        id: row.course_id,
        title: row.course_title,
        code: row.course_code,
        department: row.course_department,
        level: row.course_level,
      },
    }));
  },

  async deleteSession(id: number) {
    await client.execute({
      sql: "DELETE FROM ExamSessions WHERE id = ?",
      args: [id],
    });
  },

  async getSessionWithDivisions(sessionId: number) {
    // Get the main session
    const sessionResult = await client.execute({
      sql: `
        SELECT 
          es.*,
          c.title as course_title,
          c.code as course_code,
          c.level as course_level,
          c.department as course_department
        FROM ExamSessions es
        JOIN Courses c ON es.course_id = c.id
        WHERE es.id = ?
      `,
      args: [sessionId],
    });

    if (sessionResult.rows.length === 0) return null;

    const sessionRow = sessionResult.rows[0];
    
    // First, ensure all divisions with enrolled students exist for this session
    const enrolledDivisionsResult = await client.execute({
      sql: `
        SELECT DISTINCT s.division, COUNT(*) as student_count
        FROM Students s
        JOIN StudentCourses sc ON s.id = sc.student_id
        WHERE sc.course_id = ?
        GROUP BY s.division
        ORDER BY s.division
      `,
      args: [sessionRow.course_id],
    });

    // Create missing divisions
    for (const row of enrolledDivisionsResult.rows) {
      const existingDivision = await client.execute({
        sql: "SELECT id FROM SessionDivisions WHERE session_id = ? AND division = ?",
        args: [sessionId, row.division],
      });

      if (existingDivision.rows.length === 0) {
        await client.execute({
          sql: "INSERT INTO SessionDivisions (session_id, division, room_number, max_capacity) VALUES (?, ?, ?, ?)",
          args: [sessionId, row.division, null, null],
        });
      }
    }

    // Now get all divisions for this session
    const divisionsResult = await client.execute({
      sql: `
        SELECT 
          sd.*,
          COUNT(DISTINCT CASE WHEN sc.course_id = ? THEN sc.student_id END) as student_count
        FROM SessionDivisions sd
        LEFT JOIN Students s ON s.division = sd.division
        LEFT JOIN StudentCourses sc ON sc.student_id = s.id
        WHERE sd.session_id = ?
        GROUP BY sd.id
        ORDER BY sd.division
      `,
      args: [sessionRow.course_id, sessionId],
    });



    // Get invigilators for each division
    const divisions = [];
    for (const divRow of divisionsResult.rows) {
      const invigilatorsResult = await client.execute({
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
        args: [divRow.id],
      });

      const invigilators = invigilatorsResult.rows.map(invRow => ({
        id: Number(invRow.invigilator_id),
        user_id: Number(invRow.user_id),
        department: invRow.invigilator_department,
        is_primary: Boolean(invRow.is_primary),
        user: {
          id: Number(invRow.user_id),
          name: invRow.user_name,
          email: invRow.user_email,
          password: '',
          role: 'invigilator' as const,
        },
      }));

      divisions.push({
        id: Number(divRow.id),
        session_id: Number(divRow.session_id),
        division: divRow.division as string,
        room_number: divRow.room_number,
        max_capacity: divRow.max_capacity ? Number(divRow.max_capacity) : null,
        student_count: Number(divRow.student_count) || 0,
        invigilators,
      });
    }

    return {
      id: Number(sessionRow.id),
      course_id: Number(sessionRow.course_id),
      date: sessionRow.date,
      start_time: sessionRow.start_time,
      end_time: sessionRow.end_time,
      is_active: Boolean(sessionRow.is_active),
      course: {
        id: Number(sessionRow.course_id),
        title: sessionRow.course_title,
        code: sessionRow.course_code,
        level: Number(sessionRow.course_level),
        department: sessionRow.course_department,
      },
      divisions,
    };
  },
};
