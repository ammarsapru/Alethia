import requests

def get_earliest_snapshot(url):
    api_url = f"http://archive.org/wayback/available?url={url}"
    # User-Agent is required to avoid being blocked by archive.org
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }
    try:
        # Increased timeout to 30 seconds as Wayback Machine can be slow
        response = requests.get(api_url, headers=headers, timeout=30)
        
        if response.status_code == 200:
            return response.json()
        
        print(f"Wayback API returned status {response.status_code} for {url}")
        return {} 
    except Exception as e:
        print(f"Error querying Wayback Machine for {url}: {e}")
        return {}