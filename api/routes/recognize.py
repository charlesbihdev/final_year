from fastapi import APIRouter, UploadFile, File, Form, HTTPException
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

from core.db import get_db_connection  # 🔥 use Turso DB
from core.face_utils import get_face_embedding  # Use optimized face detection

router = APIRouter()

@router.post("/recognize")
async def recognize(photo: UploadFile = File(...), session_id: int = Form(None)):
    image_bytes = await photo.read()
    new_embedding = get_face_embedding(image_bytes)

    if new_embedding is None:
        raise HTTPException(
            status_code=400, 
            detail="No face detected in image. Please ensure: 1) Face is clearly visible, 2) Good lighting, 3) Face is directly facing camera, 4) No obstructions"
        )

    db = get_db_connection()

    # Fetch stored embeddings from FaceData table
    result = db.execute("SELECT student_id, embedding FROM FaceData")
    rows = result.fetchall()

    best_match_id = None
    best_similarity = 0
    threshold = 0.6

    for row in rows:
        # Embeddings are stored as BLOBs
        db_embedding = np.frombuffer(row[1], dtype=np.float32)  # row[1] is embedding column
        similarity = cosine_similarity([new_embedding], [db_embedding])[0][0]

        if similarity > best_similarity and similarity >= threshold:
            best_similarity = similarity
            best_match_id = row[0]  # row[0] is student_id column

    if best_match_id:
        result = db.execute(
            "SELECT * FROM Students WHERE id = ?", [best_match_id]
        )
        student = result.fetchone()

        if student:
            # Convert row to dict for JSON serialization
            student_dict = {
                "id": student[0],
                "name": student[1],
                "email": student[2],
                "index_number": student[3],
                "department": student[4],
                "level": student[5],
                "division": student[6]
            }
            return {
                "matched": True,
                "similarity": float(best_similarity),
                "student": student_dict
            }
        else:
            return {
                "matched": True,
                "similarity": float(best_similarity),
                "student": None,
                "message": "Student record not found for matched face ID"
            }
    else:
        return {
            "matched": False,
            "message": "No matching face found",
            "similarity": float(best_similarity)
        }
