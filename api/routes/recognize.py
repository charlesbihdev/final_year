from fastapi import APIRouter, UploadFile, File, Form
import numpy as np
from facenet_pytorch import MTCNN, InceptionResnetV1
from PIL import Image
import torch
from sklearn.metrics.pairwise import cosine_similarity
import sqlite3
import io

router = APIRouter()

# Load models
mtcnn = MTCNN(image_size=160, margin=0)
resnet = InceptionResnetV1(pretrained='vggface2').eval()

# Connect to SQLite DB
def get_db_connection():
    conn = sqlite3.connect("face_data.db")
    conn.row_factory = sqlite3.Row
    return conn

# Convert image to embedding
def get_face_embedding(image_bytes):
    img = Image.open(io.BytesIO(image_bytes)).convert('RGB')
    face = mtcnn(img)
    if face is None:
        return None
    with torch.no_grad():
        embedding = resnet(face.unsqueeze(0)).numpy()[0]
    return embedding

@router.post("/recognize")
async def recognize(photo: UploadFile = File(...)):
    image_bytes = await photo.read()
    new_embedding = get_face_embedding(image_bytes)

    if new_embedding is None:
        return {"message": "No face detected in image"}

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, embedding FROM faces")
    rows = cursor.fetchall()

    best_match_id = None
    best_similarity = 0
    threshold = 0.6

    for row in rows:
        db_embedding = np.frombuffer(row["embedding"], dtype=np.float32)

        similarity = cosine_similarity([new_embedding], [db_embedding])[0][0]
        if similarity > best_similarity and similarity >= threshold:
            best_similarity = similarity
            best_match_id = row["id"]

    if best_match_id:
        cursor.execute("SELECT * FROM students WHERE id = ?", (best_match_id,))
        student = cursor.fetchone()
        conn.close()

        if student:
            return {
                "matched": True,
                "similarity": float(best_similarity),
                "student": dict(student)
            }
        else:
            return {
                "matched": True,
                "similarity": float(best_similarity),
                "student": None,
                "message": "Student record not found for matched face ID"
            }
    else:
        conn.close()
        return {
            "matched": False,
            "message": "No matching face found",
            "similarity": float(best_similarity)
        }