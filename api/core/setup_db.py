# setup_db.py
from db import get_db_connection   # ✅ Use Turso client

db = get_db_connection()

# Create Users table (admin and invigilator only)
db.execute("""
CREATE TABLE IF NOT EXISTS Users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('admin', 'invigilator'))
);
""")

# Create Students table (independent - no user account needed)
db.execute("""
CREATE TABLE IF NOT EXISTS Students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT,
    index_number TEXT UNIQUE NOT NULL,
    department TEXT,
    level INTEGER NOT NULL CHECK(level IN (100, 200, 300, 400)),
    division TEXT NOT NULL,
    fingerprint_id INTEGER CHECK(fingerprint_id >= 1 AND fingerprint_id <= 127)
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
    enrolled_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
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

# Create SessionDivisions table
db.execute("""
CREATE TABLE IF NOT EXISTS SessionDivisions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER NOT NULL,
    division TEXT NOT NULL,
    room_number TEXT,
    max_capacity INTEGER,
    UNIQUE(session_id, division),
    FOREIGN KEY(session_id) REFERENCES ExamSessions(id)
);
""")

# Create SessionInvigilators table (updated for division-based assignment)
db.execute("""
CREATE TABLE IF NOT EXISTS SessionInvigilators (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_division_id INTEGER NOT NULL,
    invigilator_id INTEGER NOT NULL,
    is_primary BOOLEAN DEFAULT 0,
    UNIQUE(session_division_id, invigilator_id),
    FOREIGN KEY(session_division_id) REFERENCES SessionDivisions(id),
    FOREIGN KEY(invigilator_id) REFERENCES Invigilators(id)
);
""")

# Create AttendanceRecords table (updated for division-based attendance)
db.execute("""
CREATE TABLE IF NOT EXISTS AttendanceRecords (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    session_id INTEGER NOT NULL,
    session_division_id INTEGER NOT NULL,
    timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    method TEXT NOT NULL,  -- 'face', 'fingerprint', 'manual'
    UNIQUE(student_id, session_division_id),
    FOREIGN KEY(student_id) REFERENCES Students(id),
    FOREIGN KEY(session_id) REFERENCES ExamSessions(id),
    FOREIGN KEY(session_division_id) REFERENCES SessionDivisions(id)
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

# Create TemporaryFingerprint table for IoT devices
db.execute("""
CREATE TABLE IF NOT EXISTS TemporaryFingerprint (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fingerprint_id INTEGER NOT NULL CHECK(fingerprint_id >= 1 AND fingerprint_id <= 127),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
""")

print("All tables created successfully!")

def drop_all_tables():
    """Drop all tables in reverse order to handle foreign key constraints"""
    print("Dropping all tables...")
    
    # Drop tables in reverse order of creation to handle foreign key dependencies
    tables_to_drop = [
        "TemporaryFingerprint",
        "FaceData",
        "AttendanceRecords", 
        "SessionInvigilators",
        "SessionDivisions",
        "ExamSessions",
        "StudentCourses",
        "Invigilators",
        "Courses",
        "Students",
        "Users"
    ]
    
    for table in tables_to_drop:
        try:
            db.execute(f"DROP TABLE IF EXISTS {table}")
            print(f"✓ Dropped table: {table}")
        except Exception as e:
            print(f"✗ Error dropping table {table}: {e}")
    
    print("All tables dropped successfully!")

# Uncomment the line below to drop all tables (BE CAREFUL!)
# drop_all_tables()
