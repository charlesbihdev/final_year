"""
Migration script to fix AttendanceRecords table UNIQUE constraint
Changes from UNIQUE(student_id, session_id) to UNIQUE(student_id, session_division_id)
"""

from db import get_db_connection

def migrate_attendance_table():
    """Migrate AttendanceRecords table to use correct UNIQUE constraint"""
    db = get_db_connection()
    
    print("Starting AttendanceRecords table migration...")
    
    try:
        # Step 1: Create backup of existing data
        print("1. Backing up existing attendance data...")
        backup_result = db.execute("SELECT * FROM AttendanceRecords")
        backup_data = backup_result.fetchall()
        print(f"   Backed up {len(backup_data)} attendance records")
        
        # Step 2: Drop the existing table
        print("2. Dropping existing AttendanceRecords table...")
        db.execute("DROP TABLE IF EXISTS AttendanceRecords")
        
        # Step 3: Create new table with correct constraint
        print("3. Creating new AttendanceRecords table with correct constraint...")
        db.execute("""
        CREATE TABLE AttendanceRecords (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id INTEGER NOT NULL,
            session_id INTEGER NOT NULL,
            session_division_id INTEGER NOT NULL,
            timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            method TEXT NOT NULL,
            UNIQUE(student_id, session_division_id),
            FOREIGN KEY(student_id) REFERENCES Students(id),
            FOREIGN KEY(session_id) REFERENCES ExamSessions(id),
            FOREIGN KEY(session_division_id) REFERENCES SessionDivisions(id)
        );
        """)
        
        # Step 4: Restore data (if any existed)
        if backup_data:
            print("4. Restoring attendance data...")
            for record in backup_data:
                try:
                    # Try to insert the record
                    db.execute("""
                    INSERT INTO AttendanceRecords 
                    (id, student_id, session_id, session_division_id, timestamp, method)
                    VALUES (?, ?, ?, ?, ?, ?)
                    """, [
                        record[0],  # id
                        record[1],  # student_id
                        record[2],  # session_id
                        record[3],  # session_division_id
                        record[4],  # timestamp
                        record[5]   # method
                    ])
                except Exception as e:
                    print(f"   Warning: Could not restore record {record[0]}: {e}")
            
            print(f"   Attempted to restore {len(backup_data)} records")
        else:
            print("4. No existing data to restore")
        
        # Step 5: Commit the changes
        db.commit()
        print("5. Migration completed successfully!")
        
        # Verify the new constraint
        schema_result = db.execute("""
        SELECT sql FROM sqlite_master 
        WHERE type='table' AND name='AttendanceRecords'
        """)
        schema = schema_result.fetchone()
        if schema:
            print(f"   New table schema: {schema[0]}")
        
    except Exception as e:
        print(f"Migration failed: {e}")
        raise
    
    print("AttendanceRecords table migration completed!")

if __name__ == "__main__":
    migrate_attendance_table()
