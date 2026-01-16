from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from typing import List
import os, uuid, requests
from pathlib import Path
from datetime import datetime
from .handle_serp import handle_serp_response
from routers.upload import upload_image_to_cloudinary
from routers.getExif import handle_exif
from .aon.aiOrNot import AIorNot_image_analysis
from .genai_analysis import generate_comprehensive_report

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
    #below is the updloaded image path. calls from ai or not and exif can be added here
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

    # Increased timeout to 60 seconds to prevent ReadTimeout errors
    r = requests.get("https://serpapi.com/search", params=params, timeout=60)
    if r.status_code != 200:
        raise HTTPException(status_code=502, detail="SerpAPI failed")

    data = r.json()
    print(data)
    
    # Initialize with defaults to prevent frontend issues
    processed_data = {
        "image_description": "No description available.",
        "biases": {},
        "source_clusters": {}
    }
    exif_data = {}

    try:
        # This likely calls the legacy describe_image.py
        serp_result = handle_serp_response(data, file_path)
        if serp_result:
            processed_data.update(serp_result)
    except Exception as e:
        print(f"Error processing SERP/Wayback response: {e}")

    try:
        exif_data = handle_exif(file_path)
    except Exception as e:
        print(f"Error processing EXIF: {e}")

    ai_analysis = {}
    try:
        ai_analysis = AIorNot_image_analysis(file_path)
        if ai_analysis is None:
            ai_analysis = {}
    except Exception as e:
        print(f"Error processing AI detection: {e}")
        
    organic_results = data.get("organic_results", [])
    total_matches = data.get("search_information", {}).get("total_results", 0)

    # Fix: If API reports 0 total results but we have organic results, use the count of organic results
    if total_matches == 0 and organic_results:
        total_matches = len(organic_results)

    # --- NEW: Generate Comprehensive AI Report ---
    # This overrides the basic description from handle_serp_response if successful
    try:
        print("Generating comprehensive AI report...")
        # Debug: Check if we have data to send
        print(f"Sending to Gemini -> Matches: {len(organic_results)}, EXIF keys: {list(exif_data.keys())}, AI Verdict: {ai_analysis.get('verdict')}")
        
        comprehensive_desc = await generate_comprehensive_report(file_path, data, exif_data, ai_analysis)
        
        if comprehensive_desc:
            print("SUCCESS: Comprehensive Gemini Report Generated. OVERWRITING legacy description.")
            processed_data['image_description'] = comprehensive_desc
        else:
            print("WARNING: Gemini returned None. Keeping legacy description.")
            
    except Exception as e:
        print(f"Failed to generate comprehensive report: {e}")
    # ---------------------------------------------

    response_payload = {
        "image_url": public_url,
        "total_matches": total_matches,
    }
    response_payload.update(processed_data)
    response_payload["exif_data"] = exif_data
    response_payload["ai_analysis"] = ai_analysis

    return JSONResponse(content=response_payload)
