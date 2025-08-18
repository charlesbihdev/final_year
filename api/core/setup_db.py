# setup_db.py
from db import get_db_connection   # ✅ Use Turso client

db = get_db_connection()

# Create Users table
db.execute("""
CREATE TABLE IF NOT EXISTS Users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL  -- 'admin', 'invigilator', 'student'
);
""")

# Create Students table with constraints
db.execute("""
CREATE TABLE IF NOT EXISTS Students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE NOT NULL,
    student_id TEXT UNIQUE NOT NULL,
    department TEXT,
    level INTEGER NOT NULL CHECK(level IN (100, 200, 300, 400)),
    division TEXT NOT NULL CHECK(division IN ('A', 'B', 'C', 'D')),
    FOREIGN KEY(user_id) REFERENCES Users(id)
);
""")

# Create Courses table
db.execute("""
CREATE TABLE IF NOT EXISTS Courses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    level INTEGER CHECK(level IN (100, 200, 300, 400)),
    department TEXT
);
""")

# Create Invigilators table
db.execute("""
CREATE TABLE IF NOT EXISTS Invigilators (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE NOT NULL,
    staff_id TEXT UNIQUE NOT NULL,
    department TEXT,
    FOREIGN KEY(user_id) REFERENCES Users(id)
);
""")

# Create StudentCourses table (Enrollments)
db.execute("""
CREATE TABLE IF NOT EXISTS StudentCourses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    course_id INTEGER NOT NULL,
    UNIQUE(student_id, course_id),
    FOREIGN KEY(student_id) REFERENCES Students(id),
    FOREIGN KEY(course_id) REFERENCES Courses(id)
);
""")

# Create ExamSessions table
db.execute("""
CREATE TABLE IF NOT EXISTS ExamSessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    course_id INTEGER NOT NULL,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_active BOOLEAN DEFAULT 0,
    FOREIGN KEY(course_id) REFERENCES Courses(id)
);
""")

# Create SessionInvigilators table
db.execute("""
CREATE TABLE IF NOT EXISTS SessionInvigilators (
    session_id INTEGER NOT NULL,
    invigilator_id INTEGER NOT NULL,
    PRIMARY KEY(session_id, invigilator_id),
    FOREIGN KEY(session_id) REFERENCES ExamSessions(id),
    FOREIGN KEY(invigilator_id) REFERENCES Invigilators(id)
);
""")

# Create AttendanceRecords table
db.execute("""
CREATE TABLE IF NOT EXISTS AttendanceRecords (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    session_id INTEGER NOT NULL,
    timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    method TEXT NOT NULL,  -- 'face', 'fingerprint', 'manual'
    UNIQUE(student_id, session_id),
    FOREIGN KEY(student_id) REFERENCES Students(id),
    FOREIGN KEY(session_id) REFERENCES ExamSessions(id)
);
""")

# Create FaceData table
db.execute("""
CREATE TABLE IF NOT EXISTS FaceData (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER UNIQUE NOT NULL,
    embedding BLOB NOT NULL,  -- store face embeddings as binary
    FOREIGN KEY(student_id) REFERENCES Students(id)
);
""")

print("All tables created successfully!")
