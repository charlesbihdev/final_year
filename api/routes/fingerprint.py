from fastapi import APIRouter, HTTPException
from core.db import get_db_connection
import random
from datetime import datetime

router = APIRouter(prefix="/fingerprint", tags=["fingerprint"])

@router.post("/generate/{student_id}")
def generate_fingerprint_id(student_id: int):
    """
    Generate a unique fingerprint ID (1-127) for a student during enrollment.
    Checks if the ID is already assigned to any student before storing it as active.
    """
    db = get_db_connection()
    
    try:
        # Check if student exists
        student = db.execute("SELECT id FROM Students WHERE id = ?", (student_id,)).fetchone()
        if not student:
            raise HTTPException(status_code=404, detail="Student not found")
        
        # Get all used fingerprint IDs
        used_ids = db.execute("SELECT fingerprint_id FROM Students WHERE fingerprint_id IS NOT NULL").fetchall()
        used_ids = [row[0] for row in used_ids]
        
        # Find available IDs (1-127)
        available_ids = [i for i in range(1, 128) if i not in used_ids]
        
        if not available_ids:
            raise HTTPException(status_code=400, detail="No available fingerprint IDs (all 127 are used)")
        
        # Generate random available ID
        fingerprint_id = random.choice(available_ids)
        
        # Clear any existing temporary records
        db.execute("DELETE FROM TemporaryFingerprint")
        
        # Store as active
        db.execute(
            "INSERT INTO TemporaryFingerprint (fingerprint_id) VALUES (?)",
            (fingerprint_id,)
        )
        
        # Commit the transaction
        db.commit()
        
        return {"fingerprint_id": fingerprint_id, "student_id": student_id}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")
    finally:
        db.close()

@router.get("/get_id")
def get_active_fingerprint():
    """
    Get the currently active fingerprint ID for IoT enrollment.
    Returns just the fingerprint ID as integer if exists, otherwise returns null.
    """
    db = get_db_connection()
    
    try:
        cursor = db.execute("SELECT fingerprint_id FROM TemporaryFingerprint LIMIT 1")
        result = cursor.fetchone()
        
        if result:
            fingerprint_id = result[0]
            # Don't delete the temporary record - let frontend control when to delete
            return fingerprint_id
        else:
            return None
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")
    finally:
        db.close()

@router.delete("/clear")
def clear_temporary_fingerprint():
    """
    Clear all temporary fingerprint records.
    """
    db = get_db_connection()
    
    try:
        # Check if there are any records to delete
        cursor = db.execute("SELECT COUNT(*) FROM TemporaryFingerprint")
        count = cursor.fetchone()[0]
        
        if count > 0:
            db.execute("DELETE FROM TemporaryFingerprint")
            db.commit()
            return {"message": f"Cleared {count} temporary fingerprint record(s)"}
        else:
            return {"message": "No temporary fingerprint records to clear"}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")
    finally:
        db.close()

@router.delete("/clear/{student_id}")
def clear_and_assign_fingerprint(student_id: int):
    """
    Clear temporary fingerprint record and assign the fingerprint ID to the student.
    """
    db = get_db_connection()
    
    try:
        # Get the current fingerprint ID from temporary table
        cursor = db.execute("SELECT fingerprint_id FROM TemporaryFingerprint LIMIT 1")
        result = cursor.fetchone()
        
        if result:
            fingerprint_id = result[0]
            
            # Assign the fingerprint ID to the student
            db.execute(
                "UPDATE Students SET fingerprint_id = ? WHERE id = ?",
                (fingerprint_id, student_id)
            )
            
            # Clear the temporary record
            db.execute("DELETE FROM TemporaryFingerprint")
            db.commit()
            
            return {
                "message": f"Assigned fingerprint ID {fingerprint_id} to student {student_id} and cleared temporary record",
                "fingerprint_id": fingerprint_id,
                "student_id": student_id
            }
        else:
            return {"message": "No temporary fingerprint record found to assign"}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")
    finally:
        db.close()

@router.post("/attendance/{fingerprint_id}/{room_number}")
def mark_fingerprint_attendance(fingerprint_id: int, room_number: str):
    """
    Mark attendance for a student using fingerprint ID and room number.
    Validates that the student is enrolled in the course and the session is active.
    """
    db = get_db_connection()
    
    try:
        # Find student with this fingerprint ID
        student = db.execute(
            "SELECT id, name, index_number, division FROM Students WHERE fingerprint_id = ?", 
            (fingerprint_id,)
        ).fetchone()
        
        if not student:
            return {"success": False, "message": "Fingerprint not registered"}
        
        student_id, student_name, index_number, student_division = student
        
        # Find active session for this room
        session_division = db.execute("""
            SELECT sd.id, sd.session_id, sd.division, es.course_id, es.is_active, es.date, es.start_time, es.end_time
            FROM SessionDivisions sd
            JOIN ExamSessions es ON sd.session_id = es.id
            WHERE sd.room_number = ? AND es.is_active = 1
        """, (room_number,)).fetchone()
        
        if not session_division:
            return {"success": False, "message": "No active session in this room"}
        
        division_id, session_id, division, course_id, is_active, date, start_time, end_time = session_division
        
        # Check if student is enrolled in this course
        enrollment = db.execute(
            "SELECT id FROM StudentCourses WHERE student_id = ? AND course_id = ?",
            (student_id, course_id)
        ).fetchone()
        
        if not enrollment:
            return {"success": False, "message": f"Not enrolled in this course"}
        
        # Check if student's division matches the session division
        if student_division != division:
            return {"success": False, "message": f"Wrong division. You are in {student_division}, this is {division}"}
        
        # Check if attendance already marked
        existing_attendance = db.execute(
            "SELECT id FROM AttendanceRecords WHERE student_id = ? AND session_division_id = ?",
            (student_id, division_id)
        ).fetchone()
        
        if existing_attendance:
            return {"success": False, "message": "Attendance already marked"}
        
        # Mark attendance
        db.execute("""
            INSERT INTO AttendanceRecords (student_id, session_id, session_division_id, method)
            VALUES (?, ?, ?, 'fingerprint')
        """, (student_id, session_id, division_id))
        
        db.commit()
        
        return {
            "success": True, 
            "message": f"Welcome {student_name}! Attendance marked successfully."
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")
    finally:
        db.close()
