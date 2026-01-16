from dotenv import load_dotenv
import os
import pathlib
import google.generativeai as genai


def list_available_models():
    try: 
        print("Avalilable Models:")
        for m in genai.list_models():
            if 'generateContent' in m.supported_generation_methods:
                print(f"  - {m.name}")
    except Exception as e:
        print(f"An error occurred while listing models: {e}")

def describe_image(image_path):
    if image_path:
        load_dotenv()
        api_key = os.getenv("GOOGLE_API_KEY")
        genai.configure(api_key=api_key)
        # list_available_models() # Optional: comment out to reduce log noise
        
        # Switched to gemini-2.0-flash as it was listed in your available models.
        # This model is faster and more capable than 1.5-flash.
        model = genai.GenerativeModel("gemini-2.0-flash")

        image = pathlib.Path(image_path).read_bytes()
        image = {
            "mime_type": "image/jpeg",
            "data": image,
        }

        try:
            print("--- LEGACY describe_image.py CALLED ---")
            response = model.generate_content([
                image,
                "Describe the image in detail, including the objects, colors, and any text present.",
            ])

            print("Response from Gemini (Legacy):")
            print(response.text)
            return response.text
        except Exception as e:
            print(f"An error occurred: {e}")
            return "Description unavailable."
    else:
        print("No image path provided or an error occurred.")
        return "No image path provided or an error occurred."