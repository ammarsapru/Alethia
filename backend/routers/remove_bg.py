from rembg import remove
from PIL import Image
import os

def remove_background(image_path, output_path=None):
    """
    Removes the background from an image using rembg.
    """
    try:
        if output_path is None:
            base, ext = os.path.splitext(image_path)
            output_path = f"{base}_no_bg.png"

        with open(image_path, 'rb') as i:
            with open(output_path, 'wb') as o:
                input_data = i.read()
                output_data = remove(input_data)
                o.write(output_data)
        
        return output_path
    except Exception as e:
        print(f"Error removing background: {e}")
        return None

if __name__ == "__main__":
    # Example usage: Update this path to your image (e.g., your logo)
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    # You can point this to your frontend logo to fix it permanently:
    # image_file = r"c:\Projects\Alethia\frontend\app\Logo2.png" 
    
    # Default test with the sample image
    image_file = os.path.join(script_dir, "exiftest", "sample_exif.jpg")
    
    if os.path.exists(image_file):
        print(f"Processing {image_file}...")
        result = remove_background(image_file)
        if result:
            print(f"Background removed. Saved to {result}")
    else:
        print(f"File not found: {image_file}")
