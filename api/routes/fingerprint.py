from fastapi import APIRouter, HTTPException
from core.db import get_db_connection
import random

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
        
        return {"fingerprint_id": fingerprint_id, "student_id": student_id}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@router.get("/get")
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
            # Delete the temporary record
            # db.execute("DELETE FROM TemporaryFingerprint")
            
            return fingerprint_id
        else:
            return None
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@router.delete("/clear")
def clear_temporary_fingerprint():
    """
    Clear all temporary fingerprint records.
    """
    db = get_db_connection()
    
    try:
        db.execute("DELETE FROM TemporaryFingerprint")
        return {"message": "All temporary fingerprint records cleared successfully"}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")
