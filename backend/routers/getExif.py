from PIL import Image
from PIL.ExifTags import TAGS, GPSTAGS
import os
from PIL.TiffImagePlugin import IFDRational

def get_exif_data(image_path):
    try:
        image = Image.open(image_path)
        
        # Print basic image details to confirm it loaded
        print(f"Image Details: Format={image.format}, Size={image.size}, Mode={image.mode}")

        # ._getexif() is specific to JPEG/TIFF. It returns None if no EXIF block exists.
        exif_data = getattr(image, '_getexif', lambda: None)()
        
        # Check if EXIF data exists before iterating
        if not exif_data:
            print("No standard EXIF data found.")
            # Check if there is ANY other metadata (e.g. JFIF, Adobe, etc.)
            if image.info:
                print("Returning raw metadata from image.info (JFIF/Basic info).")
                return image.info
            return None

        decoded_exif = {}
        for tag_id, value in exif_data.items():
            tag = TAGS.get(tag_id, tag_id)
            decoded_exif[tag] = value
            
            # Decode GPSInfo if present
            if tag == "GPSInfo":
                gps_data = {}
                for t in value:
                    sub_tag = GPSTAGS.get(t, t)
                    gps_data[sub_tag] = value[t]
                decoded_exif[tag] = gps_data
            # print("------------------------------")
            # print(f"{tag_id}: {tag} => {value}")
            # print("------------------------------")
        return decoded_exif
    except Exception as e:
        print(f"error retrieiving exif data: {e}")
        return None

def _convert_value(val):
    """Convert special EXIF data types to JSON-serializable types."""
    if isinstance(val, IFDRational):
        return float(val)
    if isinstance(val, bytes):
        try:
            return val.decode('utf-8', errors='ignore').strip().strip('\x00')
        except:
            return str(val)
    if isinstance(val, tuple):
        return tuple(_convert_value(v) for v in val)
    return val

# Only run this block if the file is executed directly
def handle_exif(filepath):
        # Get the directory where this script is located
        # script_dir = os.path.dirname(os.path.abspath(__file__))
        # Construct the path to the image relative to the script
        # image_file = os.path.join(script_dir, "exiftest", "DSCN0010.jpg")
        
        print(f"Processing image path: {filepath}")
        
        exif_info = get_exif_data(filepath)
        
        # Get format and size which are not in EXIF but available from PIL/OS
        try:
            with Image.open(filepath) as img:
                image_format = img.format
            file_size_bytes = os.path.getsize(filepath)
        except Exception:
            image_format = None
            file_size_bytes = None


        if not exif_info:
            print("No EXIF data to process.")
            return {
                "Format": image_format,
                "Size": file_size_bytes,
            }

        if exif_info:
            print("\n--- Metadata Found ---")
            
            # Helper dictionary for JFIF units
            unit_names = {0: "No absolute unit (Aspect Ratio only)", 1: "Dots Per Inch (DPI)", 2: "Dots Per Centimeter"}

            for key, value in exif_info.items():
                # Filter out large binary blobs like ICC profiles for cleaner output
                if key == 'icc_profile':
                    print(f"{key}: <Binary Data>")
                elif key == 'MakerNote':
                    print(f"{key}: <Binary Data (Hidden)>")
                elif key == 'jfif_unit':
                    print(f"{key}: {value} ({unit_names.get(value, 'Unknown')})")
                else:
                    print(f"{key}: {value}")

            print("\n--- Explicit Variables Extracted ---")
            # Extracting specific variables as requested
            gps_coordinates = exif_info.get("GPSInfo")
            make = _convert_value(exif_info.get("Make"))
            model = _convert_value(exif_info.get("Model"))
            software = _convert_value(exif_info.get("Software"))
            x_resolution = _convert_value(exif_info.get("XResolution"))
            y_resolution = _convert_value(exif_info.get("YResolution"))
            datetime_original = _convert_value(exif_info.get("DateTimeOriginal"))

            datetime_digitized = _convert_value(exif_info.get("DateTimeDigitized"))

            focal_length = _convert_value(exif_info.get("FocalLength"))
            image_width = _convert_value(exif_info.get("ImageWidth") or exif_info.get("ExifImageWidth"))
            interoperability_offset = _convert_value(exif_info.get("InteroperabilityOffset"))
            
            # Additional fields requested
            exposure_time = _convert_value(exif_info.get("ExposureTime"))
            iso_speed = _convert_value(exif_info.get("ISOSpeedRatings"))
            image_height = _convert_value(exif_info.get("ImageHeight") or exif_info.get("ExifImageHeight"))

            print(f"GPS Coordinates: {gps_coordinates}")
            print(f"Make: {make}")
            print(f"Model: {model}")
            print(f"Software: {software}")
            print(f"X Resolution: {x_resolution}")
            print(f"Y Resolution: {y_resolution}")
            print(f"DateTime Original: {datetime_original}")
            print(f"DateTime Digitized: {datetime_digitized}")
            print(f"Focal Length: {focal_length}")
            print(f"Image Width: {image_width}")
            print(f"Image Height: {image_height}")
            print(f"Interoperability Offset: {interoperability_offset}")
            print(f"Exposure Time: {exposure_time}")
            print(f"ISO: {iso_speed}")

            print("\n--- Isolated Key Information ---")
            print(f"Camera Model: {model}")
            print(f"Capture Time: {datetime_original}")
            
            # Basic formatting for GPS if available
            gps_display = "No GPS Data"
            if gps_coordinates:
                lat = gps_coordinates.get('GPSLatitude')
                lat_ref = gps_coordinates.get('GPSLatitudeRef')
                lon = gps_coordinates.get('GPSLongitude')
                lon_ref = gps_coordinates.get('GPSLongitudeRef')
                if lat and lon:
                    try:
                        lat = _convert_value(lat)
                        lon = _convert_value(lon)
                        lat_deg = float(lat[0]) + float(lat[1])/60 + float(lat[2])/3600
                        lon_deg = float(lon[0]) + float(lon[1])/60 + float(lon[2])/3600
                        gps_display = f"{lat_deg:.6f}° {lat_ref}, {lon_deg:.6f}° {lon_ref}"
                    except:
                        gps_display = str(gps_coordinates)
                else:
                    gps_display = str(gps_coordinates)
            exifData = {
                "GPS Location": gps_display,
                "Model": model,
                "Make": make,
                "Software": software,
                "Exposure": exposure_time,
                "Focal Length": focal_length,
                "DateTime Original": datetime_original,
                "ISO": iso_speed,
                "Image Width": image_width,
                "Image Height": image_height,
                "Format": image_format,
                "Size": file_size_bytes,
            }
            print("\n--- Summary ---")
            print(f"EXIF Data Extracted: {exifData}")

            # print(f"GPS Location: {gps_display}")
            # print("\n--- Fields from Image Request ---")
            # print(f"Device: {model}")
            # print(f"Exposure: {exposure_time}")
            # print(f"Focal Length: {focal_length}")
            # print(f"ISO: {iso_speed}")
        return exifData
