import cv2
from pyzbar.pyzbar import decode
import numpy as np

def scan_pan_qr_code(image_path):
    """
    Basic QR code scanning with enhanced preprocessing
    """
    try:
        # Read the image
        image = cv2.imread(image_path)
        
        if image is None:
            return {"error": "Unable to read the image file"}
        
        # Store original image
        original = image.copy()
        
        # Basic preprocessing steps in sequence
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        
        # Try basic gray image
        decoded_objects = decode(gray)
        if decoded_objects:
            qr_data = decoded_objects[0].data.decode('utf-8', errors='replace')
            return {"success": True, "raw_data": qr_data}
        
        # Try thresholding
        _, thresh = cv2.threshold(gray, 150, 255, cv2.THRESH_BINARY)
        decoded_objects = decode(thresh)
        if decoded_objects:
            qr_data = decoded_objects[0].data.decode('utf-8', errors='replace')
            return {"success": True, "raw_data": qr_data}
            
        # Try different threshold
        _, thresh2 = cv2.threshold(gray, 100, 255, cv2.THRESH_BINARY)
        decoded_objects = decode(thresh2)
        if decoded_objects:
            qr_data = decoded_objects[0].data.decode('utf-8', errors='replace')
            return {"success": True, "raw_data": qr_data}
        
        # Try with original again
        decoded_objects = decode(original)
        if decoded_objects:
            qr_data = decoded_objects[0].data.decode('utf-8', errors='replace')
            return {"success": True, "raw_data": qr_data}
        
        # If all else fails
        return {"error": "No QR code found in the image"}
        
    except Exception as e:
        return {"error": f"An error occurred: {str(e)}"}

def main():
    image_path = r'C:\Users\kanis\Desktop\chartered_final\manager\processing\pan card.jpg'
    result = scan_pan_qr_code(image_path)
    
    if "error" in result:
        print(f"Error: {result['error']}")
    else:
        print("QR code successfully decoded!")
        data = result["raw_data"]
        print(f"Raw data (first 100 chars): {data[:100]}...")

if __name__ == "__main__":
    main()