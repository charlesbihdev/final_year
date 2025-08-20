import { createClient } from "@libsql/client";

const client = createClient({
  url: "libsql://facechain-charlesbih.aws-eu-west-1.turso.io",
  authToken:
    "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NTU0NDcyNTcsImlkIjoiZTIyMTQ5ODYtMzhkZi00ZjY2LTg0NzUtZjAwMjczYzczZDhjIiwicmlkIjoiOTNlZGEwNjgtMTc5My00OWQzLWExZTItMGMyOTY0MjQ2Y2UzIn0.J2tfng8GjLsazU6pq-GsrpyRuY39G_Ianwb8LZLcc85PHxW7NPQEiw9oS_xJGbHMtsApWCnOjoOcdnfhdqzhAA",
});

export async function setupDatabase() {
  try {
    // Create Users table
    await client.execute(`
      CREATE TABLE IF NOT EXISTS Users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL CHECK(role IN ('admin', 'invigilator', 'student'))
      )
    `);

    // Create Students table
    await client.execute(`
      CREATE TABLE IF NOT EXISTS Students (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER UNIQUE NOT NULL,
        student_id TEXT UNIQUE NOT NULL,
        department TEXT,
        level INTEGER NOT NULL CHECK(level IN (100, 200, 300, 400)),
        division TEXT NOT NULL CHECK(division IN ('A', 'B', 'C', 'D')),
        FOREIGN KEY(user_id) REFERENCES Users(id)
      )
    `);

    // Create Courses table
    await client.execute(`
      CREATE TABLE IF NOT EXISTS Courses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        code TEXT UNIQUE NOT NULL,
        level INTEGER CHECK(level IN (100, 200, 300, 400)),
        department TEXT
      )
    `);

    // Create Invigilators table
    await client.execute(`
      CREATE TABLE IF NOT EXISTS Invigilators (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER UNIQUE NOT NULL,
        staff_id TEXT UNIQUE NOT NULL,
        department TEXT,
        FOREIGN KEY(user_id) REFERENCES Users(id)
      )
    `);

    // Create StudentCourses table (Enrollments)
    await client.execute(`
      CREATE TABLE IF NOT EXISTS StudentCourses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        course_id INTEGER NOT NULL,
        UNIQUE(student_id, course_id),
        FOREIGN KEY(student_id) REFERENCES Students(id),
        FOREIGN KEY(course_id) REFERENCES Courses(id)
      )
    `);

    // Create ExamSessions table
    await client.execute(`
      CREATE TABLE IF NOT EXISTS ExamSessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        course_id INTEGER NOT NULL,
        date DATE NOT NULL,
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        is_active BOOLEAN DEFAULT 0,
        FOREIGN KEY(course_id) REFERENCES Courses(id)
      )
    `);

    // Create SessionInvigilators table
    await client.execute(`
      CREATE TABLE IF NOT EXISTS SessionInvigilators (
        session_id INTEGER NOT NULL,
        invigilator_id INTEGER NOT NULL,
        PRIMARY KEY(session_id, invigilator_id),
        FOREIGN KEY(session_id) REFERENCES ExamSessions(id),
        FOREIGN KEY(invigilator_id) REFERENCES Invigilators(id)
      )
    `);

    // Create AttendanceRecords table
    await client.execute(`
      CREATE TABLE IF NOT EXISTS AttendanceRecords (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        session_id INTEGER NOT NULL,
        timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        method TEXT NOT NULL CHECK(method IN ('face', 'fingerprint', 'manual')),
        UNIQUE(student_id, session_id),
        FOREIGN KEY(student_id) REFERENCES Students(id),
        FOREIGN KEY(session_id) REFERENCES ExamSessions(id)
      )
    `);

    // Create FaceData table
    await client.execute(`
      CREATE TABLE IF NOT EXISTS FaceData (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER UNIQUE NOT NULL,
        embedding BLOB NOT NULL,
        FOREIGN KEY(student_id) REFERENCES Students(id)
      )
    `);

    console.log("All tables created successfully!");
  } catch (error) {
    console.error("Error setting up database:", error);
    console.error(
      "Stack trace:",
      error instanceof Error ? error.stack : "No stack trace available"
    );
    throw error;
  }
}

// Run setup if this file is being executed directly
setupDatabase().catch((error) => {
  console.error("Database setup failed:", error);
  process.exit(1);
});
