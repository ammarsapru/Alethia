
from dotenv import load_dotenv
import os
import pathlib
import google.generativeai as genai

def describe_image(image_path):
    if image_path:
        load_dotenv()
        api_key = os.getenv("GOOGLE_API_KEY")
        genai.configure(api_key=api_key)

        # CORRECT WAY: Instantiate GenerativeModel directly
        model = genai.GenerativeModel("gemini-1.5-flash") # <--- CHANGE THIS LINE

        image = pathlib.Path(image_path).read_bytes()
        image = {
            "mime_type": "image/jpeg",
            "data": image,
        }

        try:
            response = model.generate_content([
                image,
                "Describe the image in detail, including the objects, colors, and any text present.",
            ])

            print("Response from Gemini:")
            print(response.text)  # Print the entire response for debugging
            # Access the text from the response directly
            return response.text # Use .text for simple responses
        except Exception as e:
            print(f"An error occurred: {e}")
    else:
        print("No image path provided or an error occurred.")
        return "No image path provided or an error occurred."