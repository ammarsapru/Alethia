This is a Web app built with NextJs, TailwindCSS and Typescript on the frontend. Connected via fastapi and uvicorn to the backend, which is built using python as well as several libraies and third party API's:
  SERP - google reverse image search as the main reverse image engine - currently working on moving over to cloudvision, due to lack of quality and consitent results with SERP API in testing. Used to find sources of similar images.
  Wayback machine - used to find the earliest archived date for a site, to try and find the earliest date for the image.
  AI OR NOT - A third party tool which is/was used to be able to distinguish between AI generated images, deepfakes and normally produced ones.
  gemini 2.5 flash - used to generate a summarize report
  PILLOW - for metadata extraction such as model, make, coordinates, ISO and other metrics useful in determining origin of images.(Important note, this was good for a start however exif data being present in all images is a            naive assumption as in some cases it is not available, and in some it is even altered.
  Pandas - cross checking image sources with a research grade bias dataset.
  Docker - To containerize the application.

NOTE: Currently the AI or NOT is purposefully ignored in the pipeline while considering alternative and conducting testing.

Workflow - User inputs images, they recieve the following:
Number of matches found related to the image, the bias split of a pie chart shedding some light on the bias of the sources using the image, the earliest date found via archives or other means, a source list, a metadata extaction summary, geolocation via exif coordinates (Shifting slowly to a 8 - 10B locally produced model for geolocation of images) a breakdown of the likelihood of the images being AI genereted or not.
below are some images of the application:

