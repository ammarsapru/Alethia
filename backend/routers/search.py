from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import List
import os, uuid, requests, json
from pathlib import Path

SERP_KEY = os.getenv("SERP_API_KEY")
NGROK_BASE = os.getenv("NGROK_BASE")
# print(f"NGROK URL: {NGROK_BASE}")

if not NGROK_BASE or not SERP_KEY:
    raise ValueError("Environment variables NGROK_BASE and SERP_API_KEY must be set.")

router = APIRouter(prefix="/search", tags=["search"])

@router.post("/image")
async def search_image(file: UploadFile = File(...)):
    
    upload_dir = "static/uploads/"
    os.makedirs(upload_dir, exist_ok=True)
    ext = os.path.splitext(file.filename)[1]
    file_name = f"{uuid.uuid4()}{ext}"
    file_path = os.path.join(upload_dir, file_name)
    
    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)
    # public_url = f"http://127.0.0.1:8000/static/uploads/{file.filename}"
    public_url = f"{NGROK_BASE}/static/uploads/{file_name}"#public url for serp api
    print(public_url)
    params = {
        "engine": "google_reverse_image",
        "image_url": public_url,
        "api_key": SERP_KEY,
    }
    
    r = requests.get("https://serpapi.com/search", params=params, timeout=30)
    if r.status_code != 200:
        raise HTTPException(status_code=502, detail="SerpAPI failed")
    data = r.json()
    print(data)
    best_guess = data.get("best_guess", "")
    total_results = data.get("search_information", {}).get("total_results", 0)
    pages_raw     = data.get("pages_with_matching_images", [])[:5]  # first 5
    pages = [{"title": p["title"], "link": p["link"], "snippet": p["snippet"]} for p in pages_raw]
    
    # Dummy response - replace with actual logic like calling SerpAPI or reverse image check
    # return {
    #     "filename": file_name,
    #     "status": "received",
    #     "message": "Search API received your image successfully."
    # }
    return {
        "public_url": public_url,
        "best_guess": best_guess,
        "total_results": total_results,
        "pages": pages,
    }
