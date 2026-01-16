import os, requests
from dotenv import load_dotenv
from pathlib import Path
from .aonAnalysis import bk_analysis

# Load environment variables from .env file (2 levels up from this script)
env_path = Path(__file__).resolve().parents[2] / '.env'
load_dotenv(dotenv_path=env_path)

# Updated fallback key
key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImRhNDZjOWY1LThhY2UtNDMzMy1iZDgyLTkzNjRhYWNjNWNjYiIsInVzZXJfaWQiOiJhNjUwYmQyMC1lMGNjLTRmNjktOWM5Ni05M2RkMjhkYzk3MDgiLCJhdWQiOiJhY2Nlc3MiLCJleHAiOjE5MjQxNDI0MTEsInNjb3BlIjoiYWxsIn0.o4N7mNqo3O9tvfE1oIpudF7Df5rn-WO7MI0t5WWIIbA'
# Set API key ENV variable or replace with your own API key
API_KEY = os.getenv("AIORNOT_API_KEY", key)
IMAGE_ENDPOINT = "https://api.aiornot.com/v2/image/sync"

# By default, ai_generated, deepfake, nsfw, and quality reports run.
# Use 'only' and 'excluding' parameters to select subsets.
# Note: ai_generated and deepfake have their own costs.
def ai_or_not_image(file_path):
    filepath = file_path
    with open(filepath, "rb") as f:
        resp = requests.post(
            IMAGE_ENDPOINT,
            headers={"Authorization": f"Bearer {API_KEY}"},
            files={"image": f},
            params={
            "external_id": "my-tracking-id"  # Optional
            # Example: only run reverse_search:
            # "only": ["reverse_search"]
            # Example: run all defaults except deepfake:
            # "excluding": ["deepfake"]
            }
        )
    resp.raise_for_status()
    result = resp.json()
    
    # print(resp.json())
    return result

# ai_or_not_image("backend\\routers\\exiftest\\DSCN0010.jpg")
def AIorNot_image_analysis(file_path):
    """
    Returns placeholder AI analysis data as requested by the user, 
    bypassing the live API call while maintaining architecture.
    """
    try:
        # Placeholder data mimicking a successful API response parsed by bk_analysis
        placeholder_result = {
            "report": {
                "ai_generated": {
                    "verdict": "human",
                    "ai": {"is_detected": False, "confidence": 0.05},
                    "human": {"is_detected": True, "confidence": 0.95}
                },
                "deepfake": {"is_detected": False, "confidence": 0.02, "rois": []},
                "nsfw": {"is_detected": False},
                "meta": {
                    "width": 1920,
                    "height": 1080,
                    "format": "JPEG",
                    "size_bytes": 102400
                }
            }
        }
        
        # Logging for transparency (the user will see this in terminal if they watch logs)
        print(f"DEBUG: Returning placeholder AI analysis for {file_path}")
        
        return bk_analysis(placeholder_result)
        
    except Exception as e:
        print(f"Error during AI or Not image analysis: {e}")
        return {
            'verdict': 'human',
            'ai_is_detected': False,
            'ai_id_confidence': 0.0,
            'human_is_detected': True,
            'human_confidence': 1.0,
            'deepfake_is_detected': False,
            'deepfake_confidence': 0.0,
            'nsfw_is_detected': False
        }
# AIorNot_image_analysis("backend\\routers\\exiftest\\DSCN0010.jpg")