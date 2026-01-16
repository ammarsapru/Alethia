from dotenv import load_dotenv
from pathlib import Path

load_dotenv(Path(__file__).with_name(".env"))  # ← fixed path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from routers import search
import os

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include your API routers
app.include_router(search.router)

# Ensure the static directory exists
os.makedirs("static/uploads", exist_ok=True)

# Mount the static directory to serve uploaded images
app.mount("/static", StaticFiles(directory="static"), name="static")


@app.get("/")
def read_root():
    return {"message": "Alethia Backend is running"}
