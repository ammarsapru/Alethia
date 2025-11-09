import requests
# from mock_response import dictionary_serp

def get_earliest_snapshot(url: str):
    api_url = "https://web.archive.org/cdx/search/cdx"
    params = {
        "url": url,
        "output": "json",
        "limit": 1,
        "filter": "statuscode:200",
        "sort": "ascending"
    }
    response  = requests.get(api_url, params=params)
    
    if response.status_code == 200:
        data = response.json()
        if len(data) > 1:
            timestamp = data[1][1]  # The first element is the header
            archive_url = f"https://web.archive.org/web/{timestamp}/{url}"
            return{
                "timestamp": timestamp,
                "archive_url": archive_url,
                "formatted_date": f"{timestamp[:4]}-{timestamp[4:6]}-{timestamp[6:8]}"
            }
        else:
            return {"error": "No archived snapshots found."}
    else:
        return {"error": f"Failed with status code: {response.status_code}"}
url = "https://www.britannica.com/art/Renaissance-art" 

# result = get_earliest_snapshot(url)
# print(result)

# print("earlieast date found:", result.get("formatted_date", "No date found"))