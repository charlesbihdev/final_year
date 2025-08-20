/**
 * @deprecated This file is deprecated. Import from 'lib/db/index' instead.
 * Example:
 * ```ts
 * // Instead of:
 * import { db } from 'lib/db'
 *
 * // Use:
 * import { usersDb, studentsDb, coursesDb, etc... } from 'lib/db/index'
 * ```
 */

import {
  usersDb,
  studentsDb,
  coursesDb,
  invigilatorsDb,
  examSessionsDb,
  attendanceDb,
  faceDataDb,
} from "./db/index";

export * from "./db/index";

/**
 * @deprecated Use the specific repository objects instead.
 * Example: usersDb, studentsDb, coursesDb, etc.
 */
export const db = {
  // Auth & Users
  createUser: usersDb.createUser,
  updateUser: usersDb.updateUser,
  getUser: usersDb.getUser,
  getUserByEmail: usersDb.getUserByEmail,

  // Students
  getStudent: studentsDb.getStudent,
  getStudentByUserId: studentsDb.getStudentByUserId,

  // Courses
  getCourse: coursesDb.getCourse,
  getCourseByCode: coursesDb.getCourseByCode,
  getStudentCourses: coursesDb.getStudentCourses,

  // Invigilators
  getInvigilator: invigilatorsDb.getInvigilator,

  // Exam Sessions
  getActiveExamSessions: examSessionsDb.getActiveSessions,
  getSessionInvigilators: examSessionsDb.getSessionInvigilators,

  // Attendance
  getSessionAttendance: attendanceDb.getSessionAttendance,

  // Face Data
  getFaceData: faceDataDb.getStudentFaceData,

  // For backward compatibility
  query: examSessionsDb.query,
};
