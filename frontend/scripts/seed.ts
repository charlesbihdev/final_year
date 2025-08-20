import { createClient } from "@libsql/client";
import bcrypt from "bcryptjs";

const client = createClient({
  url: "libsql://facechain-charlesbih.aws-eu-west-1.turso.io",
  authToken:
    "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NTU0NDcyNTcsImlkIjoiZTIyMTQ5ODYtMzhkZi00ZjY2LTg0NzUtZjAwMjczYzczZDhjIiwicmlkIjoiOTNlZGEwNjgtMTc5My00OWQzLWExZTItMGMyOTY0MjQ2Y2UzIn0.J2tfng8GjLsazU6pq-GsrpyRuY39G_Ianwb8LZLcc85PHxW7NPQEiw9oS_xJGbHMtsApWCnOjoOcdnfhdqzhAA",
});

async function seedDatabase() {
  console.log("Starting database seeding...");
  console.log("Clearing existing data...");
  const tables = [
    "AttendanceRecords",
    "SessionInvigilators",
    "ExamSessions",
    "StudentCourses",
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

  console.log("Creating test users...");
  const admin = await createUser(
    "Admin User",
    "admin@example.com",
    "password123",
    "admin"
  );
  const invigilator1 = await createUser(
    "John Doe",
    "john@example.com",
    "password123",
    "invigilator"
  );
  const invigilator2 = await createUser(
    "Jane Smith",
    "jane@example.com",
    "password123",
    "invigilator"
  );
  const student1 = await createUser(
    "Alice Johnson",
    "alice@example.com",
    "password123",
    "student"
  );
  const student2 = await createUser(
    "Bob Wilson",
    "bob@example.com",
    "password123",
    "student"
  );

  // Create invigilators
  await createInvigilator(invigilator1, "INV001", "Computer Science");
  await createInvigilator(invigilator2, "INV002", "Mathematics");

  // Create students
  await createStudent(student1, "STU001", "Computer Science", 300, "A");
  await createStudent(student2, "STU002", "Mathematics", 200, "B");

  // Create courses
  const course1 = await createCourse(
    "Introduction to Programming",
    "CSC101",
    100,
    "Computer Science"
  );
  const course2 = await createCourse(
    "Calculus I",
    "MTH201",
    200,
    "Mathematics"
  );
  const course3 = await createCourse(
    "Data Structures",
    "CSC301",
    300,
    "Computer Science"
  );

  // Create exam sessions (using future dates from today)
  const session1 = await createExamSession(
    course1,
    "2025-08-20",
    "09:00",
    "11:00",
    true
  );
  const session2 = await createExamSession(
    course2,
    "2025-08-21",
    "14:00",
    "16:00",
    true
  );
  const session3 = await createExamSession(
    course3,
    "2025-08-22",
    "10:00",
    "12:00",
    false
  );

  // Get invigilator IDs
  const inv1 = await getInvigilatorId(invigilator1);
  const inv2 = await getInvigilatorId(invigilator2);

  if (inv1 && session1) {
    await client.execute({
      sql: "INSERT INTO SessionInvigilators (session_id, invigilator_id) VALUES (?, ?)",
      args: [session1, inv1],
    });
  }

  if (inv2 && session2) {
    await client.execute({
      sql: "INSERT INTO SessionInvigilators (session_id, invigilator_id) VALUES (?, ?)",
      args: [session2, inv2],
    });
  }

  if (inv1 && session3) {
    await client.execute({
      sql: "INSERT INTO SessionInvigilators (session_id, invigilator_id) VALUES (?, ?)",
      args: [session3, inv1],
    });
  }

  console.log("Database seeded successfully!");
}

async function getInvigilatorId(userId: number): Promise<number | null> {
  const result = await client.execute({
    sql: "SELECT id FROM Invigilators WHERE user_id = ?",
    args: [userId],
  });
  return result.rows[0] ? Number(result.rows[0].id) : null;
}

async function createUser(
  name: string,
  email: string,
  password: string,
  role: "admin" | "invigilator" | "student"
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
  staffId: string,
  department: string
) {
  await client.execute({
    sql: "INSERT INTO Invigilators (user_id, staff_id, department) VALUES (?, ?, ?)",
    args: [userId, staffId, department],
  });
}

async function createStudent(
  userId: number,
  studentId: string,
  department: string,
  level: number,
  division: string
) {
  await client.execute({
    sql: "INSERT INTO Students (user_id, student_id, department, level, division) VALUES (?, ?, ?, ?, ?)",
    args: [userId, studentId, department, level, division],
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
