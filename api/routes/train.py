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
        
        # Validate minimum number of photos
        if len(photos) < 2:
            raise HTTPException(
                status_code=400, 
                detail="Please upload at least 2 photos for better face recognition accuracy"
            )
        
        embeddings = []
        failed_photos = 0

        for i, photo in enumerate(photos):
            try:
                image_bytes = await photo.read()
                embedding = get_face_embedding(image_bytes)
                if embedding is not None:
                    embeddings.append(embedding)
                else:
                    failed_photos += 1
            except Exception as e:
                failed_photos += 1
                print(f"Failed to process photo {i+1}: {e}")
                continue

        if not embeddings:
            raise HTTPException(
                status_code=400, 
                detail=f"No valid faces detected in any of the {len(photos)} uploaded photos. Please ensure photos show clear, unobstructed faces."
            )
        
        if len(embeddings) < 2:
            raise HTTPException(
                status_code=400, 
                detail=f"Only {len(embeddings)} out of {len(photos)} photos had detectable faces. Please upload at least 2 photos with clear faces for better accuracy."
            )

        # Calculate average embedding from multiple photos for better accuracy
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
            message = f"Updated face data with {len(embeddings)} photos for student {student_id}"
        else:
            # Insert new face data
            db.execute(
                "INSERT INTO FaceData (student_id, embedding) VALUES (?, ?)", 
                (student_id, blob)
            )
            message = f"Successfully registered face data with {len(embeddings)} photos for student {student_id}"
        
        # Commit the transaction to ensure data is saved
        db.commit()

        return {
            "success": True,
            "message": message,
            "student_id": student_id,
            "photos_processed": len(embeddings),
            "photos_total": len(photos),
            "failed_photos": failed_photos,
            "accuracy_note": f"Face recognition accuracy improved with {len(embeddings)} photos"
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Training failed: {str(e)}")
