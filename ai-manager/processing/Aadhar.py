import easyocr
import re
import sys

# Set output encoding
sys.stdout.reconfigure(encoding='utf-8')

def extract_aadhaar_info(image_path):
    """
    Extract Aadhaar details (Name, Aadhaar Number) from an image using EasyOCR.
    """
    # Initialize EasyOCR Reader
    reader = easyocr.Reader(['en'])
    
    # Get OCR text with confidence values
    results = reader.readtext(image_path, detail=1)  # detail=1 gives confidence scores
    
    # Extract text with confidence filtering
    extracted_text = [text[1] for text in results if text[2] > 0.5]  # Only keep high-confidence text
    
    # Join all extracted text into a single string
    full_text = ' '.join(extracted_text)
    
    # Result dictionary
    result = {
        'id_type': 'Aadhaar Card',
        'name': '',
        'id_number': ''
    }

    # Fix misinterpretation of Aadhaar number (remove dots and extra spaces)
    normalized_text = full_text.replace(".", "").replace("  ", " ")
    
    # Aadhaar Number Extraction (handles spaces, dots, etc.)
    aadhaar_pattern = r'\b(\d{4}\s?\d{4}\s?\d{4})\b'
    aadhaar_match = re.search(aadhaar_pattern, normalized_text)
    if aadhaar_match:
        result['id_number'] = aadhaar_match.group(1).replace(" ", "")

    # Name Extraction: Use regex or backup from highest confidence capitalized text
    name_pattern = r'(?:Name|नाम|பெயர்|নাম|નામ|പേര്|नामं|ಹೆಸರು|பெயர்|పేరు|اسم)[:\s]*([A-Za-z\s]+)'
    name_match = re.search(name_pattern, normalized_text, re.IGNORECASE)
    
    if name_match:
        result['name'] = name_match.group(1).strip()
    else:
        # Backup: Choose the longest capitalized text as the name
        capitalized_words = [word for word in extracted_text if word.istitle() and len(word) > 3]
        if capitalized_words:
            result['name'] = max(capitalized_words, key=len)  # Choose longest possible name

    return result

# Example usage
if __name__ == "__main__":
    image_path = r"C:\Users\Asus\Desktop\AI Manager\ai-manager\processing\Screenshot 2025-03-18 233733.png"
    result = extract_aadhaar_info(image_path)

    # Print only the extracted Aadhaar details
    print(f"\n✅ Extracted Aadhaar Card Details:")
    print(f"Name: {result['name'] or 'Not Found'}")
    print(f"Aadhaar Number: {result['id_number'] or 'Not Found'}")
