import json

with open('response.json','r') as file:
    data = json.load(file)
    webEntitiesLength = len(data['webDetection']['webEntities'])
    webEntities = data['webDetection']['webEntities']
    print("items in webEntitiess")

    scoreDescription =[]
    matchingpagesURL = {}

    fullMatchingImagesLength = len(data['webDetection']['fullMatchingImages'])
    fullMatchingImages = data['webDetection']['fullMatchingImages']

    partialMatchingImages = data['webDetection']['partialMatchingImages']
    partialMatchingImagesLength = len(data['webDetection']['partialMatchingImages'])

    pagesWithMatchingImages = data['webDetection']['pagesWithMatchingImages']   
    pagesWithMatchingImagesLength = len(data['webDetection']['pagesWithMatchingImages'])
    # partialInPagesWithMatchingImagesLength = len(data['webDetection']['pagesWithMatchingImages']['partialMatchingImages'])

    #--------------------print checks
    print(f"number of web entities: {webEntitiesLength}")
    print("--------------------------------------------------")

    for entity in webEntities:
        description = entity.get('description', 'No description')
        score = entity.get('score', 0)
        print(f"Description: {description}, Score: {score}")
        scoreDescription.append((score, description))

    print("--------------------------------------------------") 
    for pages in pagesWithMatchingImages:
        url = pages.get('url','none')
        pageTitle = pages.get('pageTitle','none')
        print(f"Page title: {pageTitle}, \npage URL: {url}")

    print("--------------------------------------------------")

    print(f"number of pages with matching images: {pagesWithMatchingImagesLength}")
    print("--------------------------------------------------")
    print(f"Pages with matching images: {pagesWithMatchingImages}")

    print("--------------------------------------------------")

    print(f"number of full matching images: {fullMatchingImagesLength}")
    print("--------------------------------------------------")
    print(f"Full matching images: {fullMatchingImages}")

    print("--------------------------------------------------")

    print(f"number of partial matching images: {partialMatchingImagesLength}")
    print("--------------------------------------------------")
    print(f"Partial matching images: {partialMatchingImages}")
    # print(data)