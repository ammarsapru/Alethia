# cloudinary_upload.py
from dotenv import load_dotenv
load_dotenv()

import os
import cloudinary
import cloudinary.uploader

# Load environment variables from .env file

# Configure Coudinary
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET")
)

def upload_image_to_cloudinary(file_path: str) -> str:
    """
    Uploads an image to Cloudinary and returns the secure URL.
    
    Args:
        file_path (str): Path to the local image file.

    Returns:
        str: Secure Cloudinary URL of the uploaded image.
    """
    try:
        result = cloudinary.uploader.upload(file_path)
        return result["secure_url"]
    except Exception as e:
        print(f"❌ Cloudinary upload failed: {e}")
        return None
