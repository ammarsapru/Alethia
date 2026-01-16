import json
import os

def bk_analysis(result):
    """
    Parses the AI or Not API response (dictionary) and extracts relevant info.
    Works for both real API responses and the test data.json.
    """
    # Initialize a fresh response dictionary for this specific call
    response = {}

    if not result or not isinstance(result, dict):
        print("Error: result is not a valid dictionary")
        return response

    # The API response structure has a top-level 'report' key
    report = result.get("report", {})
    if not report:
        return response

    # 1. AI Generated Analysis
    ai_gen = report.get("ai_generated", {})
    if ai_gen:
        response['verdict'] = ai_gen.get('verdict', None)
        
        ai = ai_gen.get('ai', {})
        if ai:
            response['ai_is_detected'] = ai.get('is_detected', False)
            response['ai_id_confidence'] = ai.get('confidence', 0.0)

        human = ai_gen.get('human', {})
        if human:
            response['human_is_detected'] = human.get('is_detected', False)
            response['human_confidence'] = human.get('confidence', 0.0)

    # 2. Deepfake Analysis
    df = report.get("deepfake", {})
    if df:
        response['deepfake_is_detected'] = df.get('is_detected', False)
        response['deepfake_confidence'] = df.get('confidence', 0.0)
        response['deepfake_rois'] = df.get('rois', [])

    # 3. NSFW Analysis
    if "nsfw" in report:
        response['nsfw_is_detected'] = report["nsfw"].get('is_detected', False)

    # 4. Metadata
    meta = report.get("meta", {})
    if meta:
        response['meta_width'] = meta.get('width', 0)
        response['meta_height'] = meta.get('height', 0)
        response['meta_format'] = meta.get('format', None)
        response['meta_filesize'] = meta.get('size_bytes', 0)

    return response

# --- TEST BLOCK ---
# This only runs if you execute this file directly (e.g., python aonAnalysis.py)
if __name__ == "__main__":
    # Path to your test data file
    test_data_path = 'backend/routers/data.json'
    
    print(f"Attempting to load test data from: {os.path.abspath(test_data_path)}")
    
    try:
        with open(test_data_path, 'r') as f:
            test_json = json.load(f)
            
            # Run the analysis
            analysis_result = bk_analysis(test_json)
            
            print("\n--- SUCCESS: Analysis Result ---")
            print(json.dumps(analysis_result, indent=4))
            print("--------------------------------\n")
            
    except FileNotFoundError:
        print(f"ERROR: Could not find {test_data_path}. Make sure you are running this from the project root.")
    except Exception as e:
        print(f"ERROR: An unexpected error occurred: {e}")