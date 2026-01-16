import folium

# 1. Replace these with your extracted EXIF coordinates
# Ensure they are in Decimal Degrees (e.g., 48.8584, 2.2945), not DMS.
latitude = 40.7128
longitude = -74.0060

# 2. Create the map centered at your coordinates
# zoom_start=19 offers high precision view (street/satellite level)
m = folium.Map(location=[latitude, longitude], zoom_start=19)

# 3. Add a precise marker with a popup
folium.Marker(
    [latitude, longitude],
    popup="<b>Image Location</b><br>Captured Here",
    tooltip="Click for details",
    icon=folium.Icon(color="red", icon="info-sign")
).add_to(m)

# 4. Save to a file
m.save("image_location.html")
print("Map saved as image_location.html")