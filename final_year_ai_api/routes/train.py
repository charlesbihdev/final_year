from fastapi import APIRouter, UploadFile, File, Form
from typing import List
import numpy as np
from core.face_utils import get_face_embedding
import sqlite3

router = APIRouter()

def get_db_connection():
    conn = sqlite3.connect("face_data.db")
    conn.row_factory = sqlite3.Row
    return conn

@router.post("/train")
async def train_face(
    student_id: int = Form(...),
    photos: List[UploadFile] = File(...)
):
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
    cursor.execute("INSERT INTO faces (id, embedding) VALUES (?, ?)", (student_id, blob))
    conn.commit()
    conn.close()

    return {"message": f"Trained {len(embeddings)} image(s) for student {student_id}"}
