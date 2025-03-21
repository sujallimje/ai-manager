import easyocr
import re
import sys

# Set output encoding
sys.stdout.reconfigure(encoding='utf-8')

def extract_pan_number(image_path):
    """
    Extract only the PAN number from a PAN card image using EasyOCR.
    
    Args:
        image_path (str): Path to the PAN card image
    
    Returns:
        str: Extracted PAN number (or 'Not Found' if unavailable)
    """
    # Initialize EasyOCR Reader
    reader = easyocr.Reader(['en'])
    
    # Get OCR text
    results = reader.readtext(image_path, detail=0)  # detail=0 for plain text output
    
    # Join all extracted text into a single string
    full_text = ' '.join(results)

    # PAN Number Pattern (ABCDE1234F format)
    pan_pattern = r'\b[A-Z]{5}[0-9]{4}[A-Z]\b'
    pan_match = re.search(pan_pattern, full_text)

    # Extract PAN number if found
    if pan_match:
        return pan_match.group(0)
    else:
        return "Not Found"

# Example usage
if __name__ == "__main__":
    image_path = r"C:\Users\Asus\Desktop\AI Manager\ai-manager\processing\pan kani.jpg"  # Update with your image path
    pan_number = extract_pan_number(image_path)
    
    print("✅ Extracted PAN Card Details:")
    print(f"PAN Number: {pan_number}")
