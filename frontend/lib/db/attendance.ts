import { client, castRow, castRows } from "./client";
import type { AttendanceRecord } from "./types";

export const attendanceDb = {
  async getAttendance(id: number) {
    const result = await client.execute({
      sql: "SELECT * FROM AttendanceRecords WHERE id = ?",
      args: [id],
    });
    return castRow<AttendanceRecord>(result.rows[0]);
  },

  async getStudentAttendance(studentId: number) {
    const result = await client.execute({
      sql: "SELECT * FROM AttendanceRecords WHERE student_id = ?",
      args: [studentId],
    });
    return castRows<AttendanceRecord>(result.rows);
  },

  async getSessionAttendance(sessionId: number) {
    // First get the course ID for this session
    const sessionResult = await client.execute({
      sql: "SELECT course_id FROM ExamSessions WHERE id = ?",
      args: [sessionId],
    });
    const courseId = sessionResult.rows[0]?.course_id;
    if (!courseId) return { present: [], total: 0 };

    // Get total enrolled students for this course
    const enrolledResult = await client.execute({
      sql: "SELECT COUNT(DISTINCT sc.student_id) as total FROM StudentCourses sc WHERE sc.course_id = ?",
      args: [courseId],
    });
    const totalEnrolled = enrolledResult.rows[0]?.total || 0;

    // Get present students
    const presentResult = await client.execute({
      sql: `
        SELECT ar.*, s.index_number as student_number, s.name, s.email
        FROM AttendanceRecords ar
        JOIN Students s ON ar.student_id = s.id
        WHERE ar.session_id = ?
      `,
      args: [sessionId],
    });

    return {
      present: castRows<
        AttendanceRecord & {
          student_number: string;
          name: string;
          email: string;
        }
      >(presentResult.rows),
      total: Number(totalEnrolled),
    };
  },

  async createAttendance(data: Omit<AttendanceRecord, "id">) {
    const result = await client.execute({
      sql: `INSERT INTO AttendanceRecords (student_id, session_id, session_division_id, timestamp, method) 
            VALUES (?, ?, ?, ?, ?)`,
      args: [
        data.student_id, 
        data.session_id, 
        data.session_division_id,
        data.timestamp, 
        data.method
      ],
    });
    return Number(result.lastInsertRowid);
  },

  async getAttendanceBySession(sessionId: number) {
    const result = await client.execute({
      sql: `
        SELECT ar.*, s.index_number as student_number, s.name, s.email
        FROM AttendanceRecords ar
        JOIN Students s ON ar.student_id = s.id
        WHERE ar.session_id = ?
        ORDER BY ar.timestamp DESC
      `,
      args: [sessionId],
    });
    return castRows<
      AttendanceRecord & {
        student_number: string;
        name: string;
        email: string;
      }
    >(result.rows).map(record => ({
      ...record,
      student: {
        id: record.student_id,
        user_id: 0, // This would need to be fetched separately if needed
        student_id: record.student_number,
        department: null,
        level: 100,
        division: "A",
        user: {
          id: 0,
          name: record.name,
          email: record.email,
          role: "student" as const,
        }
      }
    }));
  },

  async updateAttendance(id: number, data: Partial<AttendanceRecord>) {
    const updates = Object.entries(data)
      .filter(([_, value]) => value !== undefined)
      .map(([key]) => `${key} = ?`)
      .join(", ");

    const values = Object.entries(data)
      .filter(([_, value]) => value !== undefined)
      .map(([_, value]) => value);

    if (updates.length > 0) {
      await client.execute({
        sql: `UPDATE AttendanceRecords SET ${updates} WHERE id = ?`,
        args: [...values, id],
      });
    }
  },

  async getAllAttendance() {
    const result = await client.execute({
      sql: `
        SELECT 
          ar.*,
          s.student_id as student_number,
          u.name as student_name,
          u.email as student_email,
          c.title as course_title,
          c.code as course_code,
          es.date as session_date,
          es.start_time
        FROM AttendanceRecords ar
        JOIN Students s ON ar.student_id = s.id
        JOIN Users u ON s.user_id = u.id
        JOIN ExamSessions es ON ar.session_id = es.id
        JOIN Courses c ON es.course_id = c.id
        ORDER BY ar.timestamp DESC
      `,
    });
    return castRows<
      AttendanceRecord & {
        student_number: string;
        student_name: string;
        student_email: string;
        course_title: string;
        course_code: string;
        session_date: string;
        start_time: string;
      }
    >(result.rows).map(record => ({
      ...record,
      student: {
        id: record.student_id,
        user_id: 0,
        student_id: record.student_number,
        department: null,
        level: 100,
        division: "A",
        user: {
          id: 0,
          name: record.student_name,
          email: record.student_email,
          role: "student" as const,
        }
      },
      session: {
        id: record.session_id,
        course_id: 0,
        date: record.session_date,
        start_time: record.start_time,
        end_time: "",
        is_active: true
      }
    }));
  },
};
