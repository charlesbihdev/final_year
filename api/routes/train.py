from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import List
import numpy as np
from core.face_utils import get_face_embedding
from core.db import get_db_connection

router = APIRouter()

@router.post("/train")
async def train_face(
    student_id: int = Form(...),
    photos: List[UploadFile] = File(...)
):
    try:
        # Validate that student exists
        db = get_db_connection()
        student_check = db.execute(
            "SELECT id FROM Students WHERE id = ?", 
            (student_id,)
        ).fetchone()
        
        if not student_check:
            raise HTTPException(status_code=404, detail=f"Student with ID {student_id} not found")
        
        embeddings = []

        for photo in photos:
            try:
                image_bytes = await photo.read()
                embedding = get_face_embedding(image_bytes)
                if embedding is not None:
                    embeddings.append(embedding)
            except Exception:
                continue

        if not embeddings:
            raise HTTPException(status_code=400, detail="No valid faces detected in any of the uploaded photos")

        # Calculate average embedding
        avg_embedding = np.mean(embeddings, axis=0).astype(np.float32)
        blob = avg_embedding.tobytes()

        # Check if student already has face data
        existing_face = db.execute(
            "SELECT id FROM FaceData WHERE student_id = ?", 
            (student_id,)
        ).fetchone()
        
        if existing_face:
            # Update existing face data
            db.execute(
                "UPDATE FaceData SET embedding = ? WHERE student_id = ?", 
                (blob, student_id)
            )
        else:
            # Insert new face data
            db.execute(
                "INSERT INTO FaceData (student_id, embedding) VALUES (?, ?)", 
                (student_id, blob)
            )
        
        # Commit the transaction to ensure data is saved
        db.commit()

        return {
            "success": True,
            "message": f"Successfully trained {len(embeddings)} image(s) for student {student_id}",
            "student_id": student_id,
            "photos_processed": len(embeddings),
            "photos_total": len(photos)
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Training failed: {str(e)}")
