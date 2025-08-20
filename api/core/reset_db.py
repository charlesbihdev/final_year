# reset_db.py - Database Reset Utility
from db import get_db_connection
import sys

db = get_db_connection()

def drop_all_tables():
    """Drop all tables in reverse order to handle foreign key constraints"""
    print("🗑️  Dropping all tables...")
    
    # Drop tables in reverse order of creation to handle foreign key dependencies
    tables_to_drop = [
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
    
    dropped_count = 0
    for table in tables_to_drop:
        try:
            db.execute(f"DROP TABLE IF EXISTS {table}")
            print(f"✓ Dropped table: {table}")
            dropped_count += 1
        except Exception as e:
            print(f"✗ Error dropping table {table}: {e}")
    
    print(f"🎯 Successfully dropped {dropped_count}/{len(tables_to_drop)} tables!")
    return dropped_count == len(tables_to_drop)

def create_all_tables():
    """Create all tables by running setup_db"""
    print("🏗️  Creating all tables...")
    try:
        # Import and run setup_db
        exec(open('setup_db.py').read())
        return True
    except Exception as e:
        print(f"✗ Error creating tables: {e}")
        return False

def reset_database():
    """Complete database reset - drop and recreate all tables"""
    print("🔄 Starting complete database reset...")
    print("⚠️  WARNING: This will delete ALL data in the database!")
    
    # Drop all tables
    if drop_all_tables():
        print("✅ All tables dropped successfully!")
        
        # Create all tables
        if create_all_tables():
            print("✅ All tables created successfully!")
            print("🎉 Database reset completed!")
            return True
        else:
            print("❌ Failed to create tables!")
            return False
    else:
        print("❌ Failed to drop some tables!")
        return False

if __name__ == "__main__":
    if len(sys.argv) > 1:
        command = sys.argv[1].lower()
        
        if command == "drop":
            drop_all_tables()
        elif command == "reset":
            reset_database()
        elif command == "create":
            create_all_tables()
        else:
            print("❌ Unknown command!")
            print("Usage:")
            print("  python reset_db.py drop    # Drop all tables")
            print("  python reset_db.py create  # Create all tables") 
            print("  python reset_db.py reset   # Drop and recreate all tables")
    else:
        print("🛠️  Database Management Utility")
        print("Usage:")
        print("  python reset_db.py drop    # Drop all tables")
        print("  python reset_db.py create  # Create all tables")
        print("  python reset_db.py reset   # Drop and recreate all tables")
        print("")
        print("⚠️  WARNING: 'drop' and 'reset' commands will delete ALL data!")
