# import pandas as pd
# from urllib.parse import urlparse
# import tldextract
# import requests
import time
from datetime import datetime
from .clean_dict import clean_dict
from .earliestDate import earliestDate
from .describe_image import describe_image
from .wayback import get_earliest_snapshot
from .bias import bias_split
# from getExif import get_exif_data

def handle_serp_response(data, image_path=None):
    
    image_links, bias_data, source_clusters = clean_dict(data)
    urlDate = []
    
    print(f"Processing {len(image_links)} links. Checking Wayback for top 5...")

    # Limit to top 5 links to prevent timeouts and excessive waiting
    for i in image_links[:10]:
        print(f"Checking Wayback for: {i}")
        result = get_earliest_snapshot(i)
        
        # Parse the raw Wayback JSON response
        # Expected structure: {'archived_snapshots': {'closest': {'timestamp': 'YYYYMMDDHHMMSS', ...}}}
        date_found = "No date found"
        if result and "archived_snapshots" in result:
            snapshots = result["archived_snapshots"]
            if "closest" in snapshots and snapshots["closest"].get("available"):
                timestamp = snapshots["closest"].get("timestamp")
                if timestamp:
                    try:
                        # Convert YYYYMMDDHHMMSS to YYYY-MM-DD
                        dt_obj = datetime.strptime(timestamp, "%Y%m%d%H%M%S")
                        date_found = dt_obj.strftime("%Y-%m-%d")
                    except ValueError:
                        pass
        
        urlDate.append(date_found)
        # Add a 1-second delay to respect Wayback Machine's rate limits
        time.sleep(1)
    print("Dates found:", urlDate)

    # print(earliestDate(urlDate))
    biases = bias_split(bias_data)
    earliest_date = earliestDate(urlDate)
    image_description = describe_image(image_path) if image_path else None

    # Calculate total matches: use SERP total if available, else fallback to link count
    serp_total = data.get("search_information", {}).get("total_results", 0)
    total_matches = serp_total if serp_total > 0 else len(image_links)

    return {
        "biases": biases,
        "earliest_date": earliest_date,
        "image_description": image_description,
        "source_clusters": source_clusters,
        "total_matches": total_matches
    }

#     list_of_keys = []#a list to hold all the keys, meanning all the various fields
#     for key in data:#appends all the keys to the list
#         list_of_keys.append(key)
    
#     print("Keys in the dictionary:", list_of_keys)#just a print statement to show the keys in the dictionary

#     def get_base_domain(url):#extracts the base domain from a url ie google.com from https://www.google.com/search?q=example for example
#         ext = tldextract.extract(url)
#         return f"{ext.domain}.{ext.suffix}"
    
#     image_results_df  = pd.DataFrame(data[list_of_keys[4]])#stores the image results dictionary as a dataframe
#     sources_links = {}# a dictionary which holds the title of the publisher provided by serp along with the corresponding links these are meant to be the source clusters
#     image_sources = image_results_df['source'].tolist()
#     image_links = image_results_df['link'].tolist()
#     clean_links = []#a list to hold the cleaned links, meaning the base domain of the links

    
#     for i in range(len(image_sources)):#this loop iterates through the image sources and links, it checks if the source is already in the sources_links dictionary, if not it adds it with the corresponding link, if it is already there it appends the link to the list of links for that source
#         if image_sources[i] not in sources_links:
#             sources_links[image_sources[i]] = [image_links[i]]
#         elif image_sources[i] in sources_links:
#             sources_links[image_sources[i]].append(image_links[i])    
    
#     for i in image_links:#loop which iterates through the image links and appends the base domain of the link to the clean_links list
#         clean_links.append(get_base_domain(i))
        
#     score = {}

#     # if total==0:
#     #     values_bias["no matches"] = 100.0
#     # else:
#     #     for source in clean_links:
#     #         if source in mbfc_df['source'].values:
#     #             bias = mbfc_df.loc[mbfc_df['source'] == source, 'bias'].values[0]
#     #             if bias and bias in score:
#     #                 score[bias] += 1
#     #             else:
#     #                 score[bias] = 1
            
#     # values_bias = {}
#     # total = sum(score.values())
#     # for key,value in score.items():
#     #             percentage = (value / total) * 100
#     #             values_bias[key] = percentage
                
    
#     # def ask_mistral(data_mistral):
#     #     prompt = f"""You are an image analysis assistant. The following data was retrieved from the SerpAPI search for an image. It includes metadata, links to image results, their titles, snippets, and possibly knowledge graph data. Your task is to analyze this data and provide a structured summary of what the image represents.

#     #     Please return your response strictly in the following JSON format:

#     #     {{
#     #         "image_subject": "<What is in the image, as precisely as possible>",
#     #         "usage_context": "<How the image is being used or discussed across the sources>",
#     #         "source_summary": "<Summarize how websites are referring to or embedding the image>",
#     #         "likely_origin": "<Guess or extract the origin (time/place/person/organization) of the image, based on links and metadata>",
#     #         "location_guess": "<If any sources mention a location, state it. If not, give your best guess or say 'unknown'>",
#     #         "additional_notes": "<Anything notable or unique about the image, tone of usage, or anomalies>"
#     #     }}

#     #     The data is from SerpAPI. Here is the full search context:

#     #     {data_mistral}
#     #     """

#     #     response = requests.post(
#     #         "http://localhost:11434/api/generate",
#     #         json={
#     #             "model": "mistral",
#     #             "prompt": prompt,
#     #             "stream": False
#     #         }
#     #     )
#     #     print()

#     # Always check for errors
#         # if response.status_code == 200:
#         #     return response.json()["response"]
#         # else:
#         #     raise Exception(f"Request failed: {response.status_code} - {response.text}")
        
#     # basic_info = ask_mistral(data)
#     print("source clusters:", sources_links)
#     # print("basic info:",basic_info)
#     # print("Bias percentages:", values_bias)
#     return {
#         "bias_percentages": {"left": 20,
#                             "left-center": 10,
#                             "center": 35,
#                             "right-center": 15,
#                             "right": 20
#                             },
#         "source_clusters": sources_links,
#         # "source_clusters": {
#         #                     "bbc.com": [
#         #                         { "url": "https://bbc.com/news/article1", "summary": "BBC reports major breakthrough." },
#         #                         { "url": "https://bbc.com/news/article2", "summary": "Another BBC story." }
#         #                     ],
#         #                     "cnn.com": [
#         #                         { "url": "https://cnn.com/story1", "summary": "CNN covers political event." }
#         #                     ],
#         #                     },
#         "knowledge_graph": basic_info
#             # {
#             #                 "title": "John Doe",
#             #                 "type": "Person",
#             #                 "description": "John Doe is a fictional placeholder name used in legal and educational contexts...",
#             #                 "born": "January 1, 1970",
#             #                 "net_worth": "$10 million",
#             #                 "height": "6ft 0in",
#             #                 "source_link": "https://example.com/john-doe",
#             #                 "spouses": ["Jane Doe"]
#             #                 }
#             #             }

#         # "bias_percentages": values_bias,
#         # "source_clusters": sources_links,
#         # "knowledge_graph": basic_info
#     }
# mbfc_df = pd.read_csv('mbfc.csv')
# print(mbfc_df.head())  # Display the first few rows of the DataFrame
# #