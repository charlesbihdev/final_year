from fastapi import APIRouter, Form
from core.db import get_db_connection   # ✅ Use Turso client

router = APIRouter()

@router.post("/students")
def create_student(
    student_name: str = Form(...),
    index_number: str = Form(...),
    class_: str = Form(...)
):
    conn = get_db_connection()

    conn.execute(
        """
        INSERT INTO students (student_name, index_number, class)
        VALUES (?, ?, ?)
        """,
        (student_name, index_number, class_)
    )

    # libsql-client commits automatically
    return {
        "message": "Student added successfully",
        "name": student_name,
        "index_number": index_number
    }

@router.get("/students")
def list_students():
    conn = get_db_connection()
    rows = conn.execute(
        "SELECT id, student_name, class, index_number FROM students"
    ).fetchall()

    # Rows are dict-like in libsql-client
    return [dict(row) for row in rows]
