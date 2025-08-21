import { createClient } from "@libsql/client";
import bcrypt from "bcryptjs";
import * as dotenv from "dotenv";
import path from "path";

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, "../.env") });

const client = createClient({
  url: process.env.TURSO_DATABASE_URL ?? "",
  authToken: process.env.TURSO_AUTH_TOKEN ?? "",
});

async function seedDatabase() {
  console.log("Starting database seeding...");
  console.log("Clearing existing data...");
  const tables = [
    "AttendanceRecords",
    "SessionInvigilators", 
    "SessionDivisions",
    "StudentCourses",
    "ExamSessions",
    "FaceData",
    "Students",
    "Invigilators",
    "Courses",
    "Users",
  ];

  for (const table of tables) {
    try {
      await client.execute({ sql: `DELETE FROM ${table}` });
      console.log(`Cleared table: ${table}`);
    } catch (error) {
      console.log(`Skipping table ${table} - does not exist yet`);
    }
  }

  console.log("Creating admin user...");
  const admin = await createUser(
    "Super Admin",
    "admin@st.umat.edu.gh",
    "password123",
    "admin"
  );

  console.log("Creating invigilator users...");
  const invigilator1User = await createUser(
    "Dr. Kofi Adu",
    "kofi@st.umat.edu.gh",
    "password123",
    "invigilator"
  );
  const invigilator2User = await createUser(
    "Dr. Yaw Addae",
    "yaw@st.umat.edu.gh", 
    "password123",
    "invigilator"
  );
 

  // Create invigilators (only need user_id and department)
  const inv1 = await createInvigilator(invigilator1User, "Computer Science");
  const inv2 = await createInvigilator(invigilator2User, "Mathematics");

  console.log("Creating students...");
  // Create students with realistic data across multiple divisions
  // const students = [
  //   { name: "Alice Johnson", email: "alice.johnson@student.university.edu", index: "FOE.41.008.209.33", dept: "Computer Science", level: 300, division: "A" },
  //   { name: "Bob Wilson", email: "bob.wilson@student.university.edu", index: "FOE.41.008.210.33", dept: "Computer Science", level: 300, division: "A" },
  //   { name: "Carol Davis", email: "carol.davis@student.university.edu", index: "FOE.41.008.211.33", dept: "Computer Science", level: 300, division: "B" },
  //   { name: "David Brown", email: "david.brown@student.university.edu", index: "FOE.41.008.212.33", dept: "Computer Science", level: 300, division: "B" },
  //   { name: "Eve Miller", email: "eve.miller@student.university.edu", index: "FOE.41.008.213.33", dept: "Computer Science", level: 300, division: "C" },
  //   { name: "Frank Garcia", email: "frank.garcia@student.university.edu", index: "FOE.41.008.214.33", dept: "Computer Science", level: 300, division: "C" },
  //   { name: "Grace Lee", email: "grace.lee@student.university.edu", index: "MATH.42.001.101.33", dept: "Mathematics", level: 200, division: "A" },
  //   { name: "Henry Chen", email: "henry.chen@student.university.edu", index: "MATH.42.001.102.33", dept: "Mathematics", level: 200, division: "A" },
  //   { name: "Isabel Rodriguez", email: "isabel.rodriguez@student.university.edu", index: "MATH.42.001.103.33", dept: "Mathematics", level: 200, division: "B" },
  //   { name: "Jack Thompson", email: "jack.thompson@student.university.edu", index: "MATH.42.001.104.33", dept: "Mathematics", level: 200, division: "B" },
  //   { name: "Kelly White", email: "kelly.white@student.university.edu", index: "FOE.41.001.001.33", dept: "Computer Science", level: 100, division: "A" },
  //   { name: "Louis Anderson", email: "louis.anderson@student.university.edu", index: "FOE.41.001.002.33", dept: "Computer Science", level: 100, division: "A" },
  // ];

  // const studentIds = [];
  // for (const student of students) {
  //   const studentId = await createStudent(
  //     student.name,
  //     student.email,
  //     student.index,
  //     student.dept,
  //     student.level,
  //     student.division
  //   );
  //   studentIds.push(studentId);
  // }

  console.log("Creating courses...");
  const course1 = await createCourse(
    "Introduction to Programming",
    "CE150",
    100,
    "Computer Science"
  );
  const course2 = await createCourse(
    "Compiler Design", 
    "CE262",
    200,
    "Computer Science"
  );
  const course3 = await createCourse(
    "Data Structures and Algorithms",
    "CE351",
    300,
    "Computer Science"
  );
  const course4 = await createCourse(
    "Computer Architecture",
    "CE451",
    400,
    "Computer Science"
  );

  console.log("Creating student enrollments...");
  // Enroll students in appropriate courses based on their level
  const enrollments = [
    // 100 level students in CSC101
    { studentIndex: 10, courseId: course1 }, // Kelly
    { studentIndex: 11, courseId: course1 }, // Louis
    
    // 200 level students in MTH201
    { studentIndex: 6, courseId: course2 }, // Grace
    { studentIndex: 7, courseId: course2 }, // Henry
    { studentIndex: 8, courseId: course2 }, // Isabel
    { studentIndex: 9, courseId: course2 }, // Jack
    
    // 300 level CS students in CSC301
    { studentIndex: 0, courseId: course3 }, // Alice
    { studentIndex: 1, courseId: course3 }, // Bob
    { studentIndex: 2, courseId: course3 }, // Carol
    { studentIndex: 3, courseId: course3 }, // David
    { studentIndex: 4, courseId: course3 }, // Eve
    { studentIndex: 5, courseId: course3 }, // Frank
    
    // Cross-enrollments for variety
    { studentIndex: 6, courseId: course4 }, // Grace in Linear Algebra
    { studentIndex: 7, courseId: course4 }, // Henry in Linear Algebra
  ];

  // for (const enrollment of enrollments) {
  //   await enrollStudent(studentIds[enrollment.studentIndex], enrollment.courseId);
  // }

  console.log("Creating exam sessions...");
  // Create exam sessions with realistic future dates
  // const session1 = await createExamSession(
  //   course1,
  //   "2025-02-15",
  //   "09:00",
  //   "11:00",
  //   true
  // );
  // const session2 = await createExamSession(
  //   course2,
  //   "2025-02-16", 
  //   "14:00",
  //   "16:00",
  //   true
  // );
  // const session3 = await createExamSession(
  //   course3,
  //   "2025-02-17",
  //   "10:00",
  //   "12:00",
  //   false
  // );
  // const session4 = await createExamSession(
  //   course4,
  //   "2025-02-18",
  //   "08:00",
  //   "10:00",
  //   false
  // );

  console.log("Creating session divisions...");
  // Create session divisions based on enrolled students
  const sessionDivisions = [
    // Session 1 (CSC101) - only A division students enrolled
    // { sessionId: session1, division: "A", roomNumber: "LAB-A", maxCapacity: 30 },
    
    // Session 2 (MTH201) - A and B division students enrolled  
    // { sessionId: session2, division: "A", roomNumber: "HALL-101", maxCapacity: 50 },
    // { sessionId: session2, division: "B", roomNumber: "HALL-102", maxCapacity: 50 },
    
    // Session 3 (CSC301) - A, B, C division students enrolled
    // { sessionId: session3, division: "A", roomNumber: "LAB-B", maxCapacity: 25 },
    // { sessionId: session3, division: "B", roomNumber: "LAB-C", maxCapacity: 25 },
    // { sessionId: session3, division: "C", roomNumber: "LAB-D", maxCapacity: 25 },
    
    // Session 4 (MTH301) - A division students enrolled
    // { sessionId: session4, division: "A", roomNumber: "HALL-201", maxCapacity: 40 },
  ];

  // const divisionIds = [];
  // for (const division of sessionDivisions) {
  //   const divisionId = await createSessionDivision(
  //     division.sessionId,
  //     division.division,
  //     division.roomNumber,
  //     division.maxCapacity
  //   );
  //   divisionIds.push(divisionId);
  // }

  console.log("Assigning invigilators to session divisions...");
  // Assign invigilators to specific session divisions
  const assignments = [
    // Session 1 divisions
    { divisionIndex: 0, invigilatorId: inv1 }, // CSC101-A → Dr. John (CS)
    
    // Session 2 divisions
    { divisionIndex: 1, invigilatorId: inv2 }, // MTH201-A → Dr. Jane (Math)
    { divisionIndex: 2, invigilatorId: inv2 }, // MTH201-B → Dr. Jane (Math)
    
    // Session 3 divisions
    // { divisionIndex: 3, invigilatorId: inv1 }, // CSC301-A → Dr. John (CS)
    // { divisionIndex: 4, invigilatorId: inv3 }, // CSC301-B → Prof. Michael (CS)
    { divisionIndex: 5, invigilatorId: inv1 }, // CSC301-C → Dr. John (CS)
    
    // Session 4 divisions
    { divisionIndex: 6, invigilatorId: inv2 }, // MTH301-A → Dr. Jane (Math)
  ];

  // for (const assignment of assignments) {
  //   await assignInvigilatorToSessionDivision(divisionIds[assignment.divisionIndex], assignment.invigilatorId);
  // }

  console.log("Database seeded successfully!");
  // console.log(`Created ${studentIds.length} students, 4 courses, 4 sessions, ${divisionIds.length} divisions`);
}

async function createUser(
  name: string,
  email: string,
  password: string,
  role: "admin" | "invigilator"
): Promise<number> {
  const hashedPassword = await bcrypt.hash(password, 10);
  const result = await client.execute({
    sql: "INSERT INTO Users (name, email, password, role) VALUES (?, ?, ?, ?)",
    args: [name, email, hashedPassword, role],
  });
  return Number(result.lastInsertRowid);
}

async function createInvigilator(
  userId: number,
  department: string
): Promise<number> {
  const result = await client.execute({
    sql: "INSERT INTO Invigilators (user_id, department) VALUES (?, ?)",
    args: [userId, department],
  });
  return Number(result.lastInsertRowid);
}

async function createStudent(
  name: string,
  email: string,
  indexNumber: string,
  department: string,
  level: number,
  division: string
): Promise<number> {
  const result = await client.execute({
    sql: "INSERT INTO Students (name, email, index_number, department, level, division) VALUES (?, ?, ?, ?, ?, ?)",
    args: [name, email, indexNumber, department, level, division],
  });
  return Number(result.lastInsertRowid);
}

async function enrollStudent(studentId: number, courseId: number) {
  await client.execute({
    sql: "INSERT INTO StudentCourses (student_id, course_id) VALUES (?, ?)",
    args: [studentId, courseId],
  });
}

async function createSessionDivision(
  sessionId: number,
  division: string,
  roomNumber: string,
  maxCapacity: number
): Promise<number> {
  const result = await client.execute({
    sql: "INSERT INTO SessionDivisions (session_id, division, room_number, max_capacity) VALUES (?, ?, ?, ?)",
    args: [sessionId, division, roomNumber, maxCapacity],
  });
  return Number(result.lastInsertRowid);
}

async function assignInvigilatorToSessionDivision(
  sessionDivisionId: number,
  invigilatorId: number
) {
  await client.execute({
    sql: "INSERT INTO SessionInvigilators (session_division_id, invigilator_id) VALUES (?, ?)",
    args: [sessionDivisionId, invigilatorId],
  });
}

async function createCourse(
  title: string,
  code: string,
  level: number,
  department: string
): Promise<number> {
  const result = await client.execute({
    sql: "INSERT INTO Courses (title, code, level, department) VALUES (?, ?, ?, ?)",
    args: [title, code, level, department],
  });
  return Number(result.lastInsertRowid);
}

async function createExamSession(
  courseId: number,
  date: string,
  startTime: string,
  endTime: string,
  isActive: boolean
): Promise<number> {
  const result = await client.execute({
    sql: "INSERT INTO ExamSessions (course_id, date, start_time, end_time, is_active) VALUES (?, ?, ?, ?, ?)",
    args: [courseId, date, startTime, endTime, isActive],
  });
  return Number(result.lastInsertRowid);
}

// Run the seed function
seedDatabase().catch((error) => {
  console.error("Seeding failed:", error);
  process.exit(1);
});
