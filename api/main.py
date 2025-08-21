from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from core.db import get_db_connection

from routes import recognize
from routes import train
from routes import students
from routes import fingerprint

app = FastAPI()

# Allow React frontend to connect
origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,        # only allow frontend origin
    allow_credentials=True,
    allow_methods=["*"],          # allow all methods (GET, POST, etc.)
    allow_headers=["*"],          # allow all headers
)

@app.get("/")
def home():
    db = None
    try:
        db = get_db_connection()
        
        # Test database connection with simple queries
        students_count = db.execute("SELECT COUNT(*) FROM Students").fetchone()[0]
        temp_fingerprint_count = db.execute("SELECT COUNT(*) FROM TemporaryFingerprint").fetchone()[0]
        
        # Check if fingerprint_id column exists in Students table
        try:
            fingerprint_students = db.execute("SELECT COUNT(*) FROM Students WHERE fingerprint_id IS NOT NULL").fetchone()[0]
        except:
            fingerprint_students = "Column not found"
        
        return {
            "message": "Server running",
            "database_status": "Connected",
            "students_count": students_count,
            "temp_fingerprint_count": temp_fingerprint_count,
            "students_with_fingerprint": fingerprint_students,
            "fingerprint_table_exists": True
        }
    except Exception as e:
        return {
            "message": "Server running",
            "database_status": f"Error: {str(e)}",
            "students_count": "N/A",
            "temp_fingerprint_count": "N/A", 
            "students_with_fingerprint": "N/A",
            "fingerprint_table_exists": "N/A"
        }
    finally:
        if db:
            db.close()

# Include recognize route
app.include_router(recognize.router)

# Include train route
app.include_router(train.router)

# Include students route
app.include_router(students.router)

# Include fingerprint route
app.include_router(fingerprint.router)