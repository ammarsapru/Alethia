from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from typing import List
import os, uuid, requests
from pathlib import Path
from datetime import datetime
from .handle_serp import handle_serp_response
from routers.upload import upload_image_to_cloudinary

SERP_KEY = os.getenv("SERP_API_KEY")

if not SERP_KEY:
    raise ValueError("Environment variable SERP_API_KEY must be set.")

router = APIRouter(prefix="/search", tags=["search"])


def extract_valid_date(date_str):
    try:
        return datetime.fromisoformat(date_str)
    except Exception:
        return None


@router.post("/image")
async def search_image(file: UploadFile = File(...)):
    upload_dir = "static/uploads/"
    os.makedirs(upload_dir, exist_ok=True)

    ext = os.path.splitext(file.filename)[1]
    file_name = f"{uuid.uuid4()}{ext}"
    file_path = os.path.join(upload_dir, file_name)

    # Save uploaded file to local path
    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)

    # Upload to Cloudinary and get public URL
    public_url = upload_image_to_cloudinary(file_path)
    print(f"Public Image URL: {public_url}")

    # Call SerpAPI
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
    processed_data = handle_serp_response(data,file_path)

    organic_results = data.get("organic_results", [])
    total_matches = data.get("search_information", {}).get("total_results", 0)

    # usage_dates = []
    # used_urls = []
    # headings = []

    # for item in organic_results:
    #     if "link" in item:
    #         used_urls.append(item["link"])
    #     if "title" in item:
    #         headings.append(item["title"])

    #     possible_date = item.get("date") or item.get("snippet_date")
    #     if possible_date:
    #         usage_dates.append(possible_date)

    #     rich_ext = item.get("rich_snippet", {}).get("top", {}).get("detected_extensions", {})
    #     if "datePublished" in rich_ext:
    #         usage_dates.append(rich_ext["datePublished"])

    # # Validate & find the earliest valid date
    # valid_dates = [extract_valid_date(d) for d in usage_dates if extract_valid_date(d)]
    # earliest_date = min(valid_dates).strftime("%Y-%m-%d") if valid_dates else "an unknown date"

    response_payload = {
        "image_url": public_url,
        "total_matches": total_matches,
    }
    response_payload.update(processed_data)


    return JSONResponse(content=response_payload)
