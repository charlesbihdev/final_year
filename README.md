# Exam Attendance Verification System

A web system for verifying and recording student attendance at university
examinations. Invigilators identify a student either by taking a photo
(face recognition) or by a fingerprint reader, and the system matches the
person against enrolled students, checks that they belong in the room and
division for the active session, and records the attendance. Administrators
manage students, courses, exam sessions, room divisions, and invigilator
assignments through a web dashboard.

## Motivation

Manual attendance at exams (signature sheets, ID checks) is slow and easy to
falsify. The intended deployment is a real university setting where the
capture conditions are poor: variable and often weak lecture-hall lighting,
and low-cost cameras or phone cameras rather than dedicated hardware. The
face-recognition path is therefore built to tolerate uneven exposure and
inconsistent image quality rather than assuming clean, studio-like input.

## How it works

**Face path.** An uploaded image is first put through a preprocessing stage:
convert to RGB, downscale large phone photos to at most 1024px, and apply mild
contrast and brightness normalisation (Pillow). The face is then detected and
cropped with MTCNN (`facenet-pytorch`). If detection fails, the system retries
with progressively enhanced versions of the image (brightness, contrast,
sharpness) and finally with a more lenient MTCNN configuration — this staged
fallback is what makes it robust to weak lighting. The 160px face crop is
passed through InceptionResnetV1 (pretrained on VGGFace2) to produce an
embedding.

- *Enrollment* (`/train`): several photos per student are embedded and averaged
  into a single vector stored as a BLOB in the `FaceData` table.
- *Verification* (`/recognize`): the query embedding is compared against all
  stored embeddings using cosine similarity (scikit-learn); the best match
  above a 0.6 threshold identifies the student, and attendance is recorded.

**Fingerprint path.** A fingerprint reader (IoT device) is enrolled by polling
`/fingerprint/get_id` for a temporary ID (1–127) assigned during registration,
then mapped to a student. At exam time the device posts to
`/fingerprint/attendance/{fingerprint_id}/{room_number}`; the server confirms
the student is enrolled in the course, that their division matches the room's
active session, and that they have not already been marked, then writes the
record.

Both paths validate against the same session, division, and enrollment rules,
and every record carries its capture method (`face`, `fingerprint`, `manual`).

## Architecture

Two services share one hosted SQLite database (Turso / libSQL):

- A **FastAPI** service (`api/`) runs the face and fingerprint logic, including
  the PyTorch models.
- The **Next.js** app (`frontend/`) is both the UI and its own API layer: its
  route handlers manage authentication, students, courses, sessions,
  divisions, enrollments, and attendance directly against the database, and it
  calls the FastAPI service for face capture.

Authentication uses bcrypt password hashing and JWTs (jose). The browser talks
to Next.js API routes; the invigilator's capture screen posts photos to the
FastAPI service.

```
final_year/
├── api/                     FastAPI service (Python)
│   ├── core/                DB connection, face pipeline, schema/seed scripts
│   │   ├── face_utils.py    Preprocessing, MTCNN detection, embeddings
│   │   ├── db.py            Turso/libSQL connection
│   │   └── setup_db.py      Table definitions
│   ├── routes/              recognize, train, students, courses, fingerprint
│   └── main.py              App entry, CORS, router wiring
└── frontend/                Next.js app (TypeScript)
    ├── app/                 Pages (admin, invigilator, login) + API routes
    ├── components/          UI (admin, attendance, sessions, enrollment, …)
    ├── lib/db/              Typed data-access layer over libSQL
    ├── lib/face-api.ts      Client for the FastAPI face service
    └── lib/auth.tsx         Auth context (JWT)
```

## Tech stack

- **Backend:** Python, FastAPI, Uvicorn, PyTorch, facenet-pytorch (MTCNN,
  InceptionResnetV1), scikit-learn, NumPy, Pillow, libsql.
- **Frontend:** TypeScript, Next.js 15, React 18, Tailwind CSS, Radix UI,
  `@libsql/client`, jose, bcryptjs.
- **Database:** Turso (hosted libSQL / SQLite).

## Setup and running

Requires Python 3.11, Node.js, and a Turso database.

**Backend** (`api/`):

```bash
cd api
pip install -r requirements.txt
# .env
#   DB_URL=<turso-database-url>
#   DB_AUTH_TOKEN=<turso-auth-token>
python core/setup_db.py          # create tables (run once)
uvicorn main:app --reload        # serves on http://localhost:8000
```

**Frontend** (`frontend/`):

```bash
cd frontend
npm install
# .env.local
#   TURSO_DATABASE_URL=<turso-database-url>
#   TURSO_AUTH_TOKEN=<turso-auth-token>
#   JWT_SECRET=<random-secret>
#   NEXT_PUBLIC_FAST_API_URL=http://localhost:8000
#   NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
npm run dev                      # serves on http://localhost:3000
```

The frontend is deployed on Vercel; the FastAPI service is run locally against
the shared database.

## Limitations and future work

- The system has not been formally evaluated. No accuracy, false-match, or
  timing figures are reported here because none were measured.
- Face verification uses a fixed cosine-similarity threshold (0.6) and a single
  averaged embedding per student; both would benefit from tuning and from
  per-student calibration on real enrollment data.
- The embedding model (VGGFace2) is used as-is, without fine-tuning on the
  target population or capture conditions.
- No liveness or anti-spoofing check exists, so a photo of a photo could pass
  the face path; this would need addressing before production use.
- The FastAPI face service is run locally rather than hosted, and the two
  services duplicate some data-access logic; consolidating them would simplify
  deployment.

## My role

I led a three-person team on this project. My own contribution was the image
preprocessing pipeline for the face-recognition path — the normalisation and
staged detection-fallback logic in `api/core/face_utils.py` that lets the
system detect faces under the weak, uneven lighting and low-quality cameras
expected in the deployment setting.
