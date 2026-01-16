import pandas as pd
import json
import os

def convert_json_to_df():
    # Path to your data.json
    script_dir = os.path.dirname(os.path.abspath(__file__))
    json_path = os.path.join(script_dir, "data.json")

    try:
        with open(json_path, 'r') as f:
            data = json.load(f)

        # Method 1: Direct DataFrame (Keeps nested dictionaries as objects)
        # df_simple = pd.DataFrame([data]) 
        
        # Method 2: json_normalize (Best for your file)
        # This flattens keys like "report.ai_generated.verdict" into their own columns
        df_flat = pd.json_normalize(data)

        print("--- DataFrame Columns ---")
        print(df_flat.columns.tolist())
        
        print("\n--- DataFrame Head ---")
        print(df_flat.head())
        
        return df_flat

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    convert_json_to_df()
