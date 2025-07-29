from fastapi import APIRouter, Form
import sqlite3

router = APIRouter()

def get_db_connection():
    conn = sqlite3.connect("face_data.db")
    conn.row_factory = sqlite3.Row
    return conn

@router.post("/students")
def create_student(
    student_name: str = Form(...),
    index_number: str = Form(...),
    class_: str = Form(...)
):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO students (student_name, index_number, class)
        VALUES (?, ?, ?)
    """, (student_name, index_number, class_))

    conn.commit()
    conn.close()

    return { "message": "Student added successfully", "name": student_name, "index_number": index_number }

@router.get("/students")
def list_students():
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT id, student_name, class, index_number FROM students")
    rows = cursor.fetchall()
    conn.close()

    return [dict(row) for row in rows]
