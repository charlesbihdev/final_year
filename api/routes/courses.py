from fastapi import APIRouter, HTTPException
from core.db import get_db_connection
from typing import Optional
from pydantic import BaseModel

router = APIRouter(prefix="/courses", tags=["courses"])

class CourseCreate(BaseModel):
    title: str
    code: str
    level: Optional[int] = None
    department: Optional[str] = None

class CourseUpdate(BaseModel):
    title: Optional[str] = None
    code: Optional[str] = None
    level: Optional[int] = None
    department: Optional[str] = None

@router.post("/")
def create_course(course_data: CourseCreate):
    """
    Create a new course
    """
    db = get_db_connection()
    
    try:
        cursor = db.execute("""
            INSERT INTO Courses (title, code, level, department)
            VALUES (?, ?, ?, ?)
        """, (course_data.title, course_data.code, course_data.level, course_data.department))
        
        course_id = cursor.lastrowid
        db.commit()
        
        return {
            "success": True,
            "message": "Course created successfully",
            "course_id": course_id
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating course: {str(e)}")
    finally:
        db.close()

@router.get("/")
def get_courses():
    """
    Get all courses
    """
    db = get_db_connection()
    
    try:
        courses = db.execute("""
            SELECT id, title, code, level, department
            FROM Courses
            ORDER BY code
        """).fetchall()
        
        result = [
            {
                "id": course[0],
                "title": course[1],
                "code": course[2],
                "level": course[3],
                "department": course[4]
            }
            for course in courses
        ]
        
        return {
            "success": True,
            "data": result
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching courses: {str(e)}")
    finally:
        db.close()

@router.get("/{course_id}")
def get_course(course_id: int):
    """
    Get a specific course
    """
    db = get_db_connection()
    
    try:
        course = db.execute("""
            SELECT id, title, code, level, department
            FROM Courses
            WHERE id = ?
        """, (course_id,)).fetchone()
        
        if not course:
            raise HTTPException(status_code=404, detail="Course not found")
        
        course_data = {
            "id": course[0],
            "title": course[1],
            "code": course[2],
            "level": course[3],
            "department": course[4]
        }
        
        return {
            "success": True,
            "data": course_data
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching course: {str(e)}")
    finally:
        db.close()

@router.put("/{course_id}")
def update_course(course_id: int, course_data: CourseUpdate):
    """
    Update a course
    """
    db = get_db_connection()
    
    try:
        # Check if course exists
        existing = db.execute("SELECT id FROM Courses WHERE id = ?", (course_id,)).fetchone()
        if not existing:
            raise HTTPException(status_code=404, detail="Course not found")
        
        # Update course fields
        update_fields = []
        update_values = []
        
        if course_data.title is not None:
            update_fields.append("title = ?")
            update_values.append(course_data.title)
        
        if course_data.code is not None:
            update_fields.append("code = ?")
            update_values.append(course_data.code)
        
        if course_data.level is not None:
            update_fields.append("level = ?")
            update_values.append(course_data.level)
        
        if course_data.department is not None:
            update_fields.append("department = ?")
            update_values.append(course_data.department)
        
        if update_fields:
            update_values.append(course_id)
            db.execute(f"""
                UPDATE Courses 
                SET {', '.join(update_fields)}
                WHERE id = ?
            """, update_values)
            db.commit()
        
        return {
            "success": True,
            "message": "Course updated successfully"
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating course: {str(e)}")
    finally:
        db.close()

@router.delete("/{course_id}")
def delete_course(course_id: int):
    """
    Delete a course
    """
    db = get_db_connection()
    
    try:
        # Check if course exists
        existing = db.execute("SELECT id FROM Courses WHERE id = ?", (course_id,)).fetchone()
        if not existing:
            raise HTTPException(status_code=404, detail="Course not found")
        
        # Delete course
        db.execute("DELETE FROM Courses WHERE id = ?", (course_id,))
        db.commit()
        
        return {
            "success": True,
            "message": "Course deleted successfully"
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting course: {str(e)}")
    finally:
        db.close()
