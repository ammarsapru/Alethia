import pandas as pd
import tldextract
# from mock_response import dictionary_serp

def clean_dict(input_dict):
    sources_links = {}# a dictionary which holds the title of the publisher provided by serp along with the corresponding links these are meant to be the source clusters
    clean_links = []#a list to hold the cleaned links, meaning the base domain of the links
    
    def get_base_domain(url):#extracts the base domain from a url ie google.com from https://www.google.com/search?q=example for example
        ext = tldextract.extract(url)
        return f"{ext.domain}.{ext.suffix}"
        

    print(f"function clean_dict called. Keys: {input_dict.keys()}")
    
    # Try multiple potential keys for SerpAPI results
    results = input_dict.get('image_results')
    if results is None:
        results = input_dict.get('organic_results')
    if results is None:
        results = input_dict.get('visual_matches')
    if results is None:
        results = []

    print(f"Found {len(results)} results to process.")
    image_results_df = pd.DataFrame(results)

    print(f"DataFrame columns: {image_results_df.columns.tolist()}")#adding comments to understand
    
    if image_results_df.empty:
        return [], [], {}
    
    # Safety check for required columns
    if 'link' not in image_results_df.columns:
        return [], [], {}
        
    image_links = image_results_df['link'].tolist()
    print(image_links)#second comment to understand
    
    # 'source' might be missing in some result types, fallback to domain
    if 'source' in image_results_df.columns:
        image_sources = image_results_df['source'].tolist()
    else:
        image_sources = [get_base_domain(url) for url in image_links]
    
    for i in range(len(image_sources)):#this loop iterates through the image sources and links, it checks if the source is already in the sources_links dictionary, if not it adds it with the corresponding link, if it is already there it appends the link to the list of links for that source
        if image_sources[i] not in sources_links:
            sources_links[image_sources[i]] = [image_links[i]]
        elif image_sources[i] in sources_links:
            sources_links[image_sources[i]].append(image_links[i])    
    
    for i in image_links:#loop which iterates through the image links and appends the base domain of the link to the clean_links list
        clean_links.append(get_base_domain(i))# to be used later for bias analysis

    print(f"Number of image links: {len(image_links)}")
    print(f"Image links: {image_links[:5]}")  # Print first 5 image links for brevity
    return image_links,clean_links, sources_links
# clean_dict(dictionary_serp)