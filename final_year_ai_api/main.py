from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware

from routes import recognize
from routes import train
from routes import students


app = FastAPI()

# Allow React frontend to connect
origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,        # only allow frontend origin
    allow_credentials=True,
    allow_methods=["*"],          # allow all methods (GET, POST, etc.)
    allow_headers=["*"],          # allow all headers
)

# Include recognize route
app.include_router(recognize.router)

# Include train route
app.include_router(train.router)

# Include students route
app.include_router(students.router)