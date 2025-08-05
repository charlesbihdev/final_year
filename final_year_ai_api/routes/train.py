from fastapi import APIRouter, UploadFile, File, Form
from typing import List
import numpy as np
from core.face_utils import get_face_embedding
import sqlite3
import logging

router = APIRouter()
# logging.basicConfig(level=logging.DEBUG)
# logger = logging.getLogger(__name__)

def get_db_connection():
    conn = sqlite3.connect("face_data.db")
    conn.row_factory = sqlite3.Row
    return conn

@router.post("/train")
async def train_face(
    student_id: int = Form(...),
    photos: List[UploadFile] = File(...)
):
    # logger.debug(f"Training for student ID: {student_id} with {len(photos)} photos")
    
    embeddings = []

    for photo in photos:
        image_bytes = await photo.read()
        embedding = get_face_embedding(image_bytes)
        if embedding is not None:
            embeddings.append(embedding)

    if not embeddings:
        return {"message": "No valid faces detected"}

    avg_embedding = np.mean(embeddings, axis=0).astype(np.float32)
    blob = avg_embedding.tobytes()

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO faces (student_id, embedding) VALUES (?, ?)", (student_id, blob))
    conn.commit()
    conn.close()

    return {"message": f"Successfully Trained {len(embeddings)} image(s) for the student {student_id}"}
