from fastapi import APIRouter, UploadFile, File, Form
from typing import List
import numpy as np
from core.face_utils import get_face_embedding
from libsql_client import create_client
import logging
import os

router = APIRouter()
# logging.basicConfig(level=logging.DEBUG)
# logger = logging.getLogger(__name__)

# Turso DB URL 
db_url = os.getenv("TURSO_DB_URL")
client = create_client(db_url)

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

    await client.execute(
        "INSERT INTO faces (student_id, embedding) VALUES (?, ?)",
        [student_id, blob]
    )

    return {"message": f"Successfully Trained {len(embeddings)} image(s) for the student {student_id}"}