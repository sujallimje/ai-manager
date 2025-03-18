import easyocr
import re
import sys

# Set the encoding to utf-8
sys.stdout.reconfigure(encoding='utf-8')

def extract_aadhaar_details(image_path):
    """
    Extract name, Aadhaar number, and DOB from an Aadhaar card using EasyOCR
    
    Args:
        image_path (str): Path to the Aadhaar card image
    
    Returns:
        dict: Extracted information
    """
    # Initialize EasyOCR
    reader = easyocr.Reader(['en'])
    
    # Get all text from the image
    results = reader.readtext(image_path, detail=0)
    
    # Initialize result dictionary
    aadhaar_details = {
        'name': '',
        'id_number': '',
        'dob': ''
    }
    
    # Join all text results into a single string for regex searches
    full_text = ' '.join(results)
    
    # Extract Aadhaar number (12 digits, possibly with spaces)
    aadhaar_pattern = r'\b(\d{4}\s\d{4}\s\d{4}|\d{12})\b'
    aadhaar_match = re.search(aadhaar_pattern, full_text)
    if aadhaar_match:
        aadhaar_details['id_number'] = aadhaar_match.group(1).replace(' ', '')
    
    # Extract DOB (in format DD/MM/YYYY)
    dob_pattern = r'(?:DOB|Date of Birth|जन्म तिथि)[\s:]*([\d/]+)'
    dob_match = re.search(dob_pattern, full_text, re.IGNORECASE)
    if dob_match:
        aadhaar_details['dob'] = dob_match.group(1)
    else:
        # Try another common date pattern (XX-XX-XXXX)
        alt_dob_pattern = r'\b(\d{2}[/-]\d{2}[/-]\d{4})\b'
        alt_dob_match = re.search(alt_dob_pattern, full_text)
        if alt_dob_match:
            aadhaar_details['dob'] = alt_dob_match.group(1)
    
    # Extract name - this is more complex
    # First try to find name with a label
    name_pattern = r'(?:Name|नाम)[\s:]*([\w\s]+)'
    name_match = re.search(name_pattern, full_text, re.IGNORECASE)
    
    if name_match:
        aadhaar_details['name'] = name_match.group(1).strip()
    else:
        # If no labeled name found, try to find it based on position and formatting
        # Common words to filter out
        filter_words = ['government', 'aadhaar', 'india', 'unique', 'identification', 
                        'authority', 'uidai', 'male', 'female', 'download', 'pdf',
                        'document', 'copy', 'birth', 'gender', 'address', 'verified']
        
        # Look for proper name in the individual results
        for i, text in enumerate(results):
            if i < len(results) - 1:  # Skip the last few entries as name is usually near the top
                # Clean the text
                text = text.strip()
                words = text.split()
                
                # Skip short texts or texts with filter words
                if len(text) < 4 or any(word.lower() in filter_words for word in words):
                    continue
                
                # Check for proper case name (2-4 words, first letter capital)
                if 2 <= len(words) <= 4:
                    is_name = True
                    for word in words:
                        if len(word) > 1:
                            if not (word[0].isupper() and any(c.islower() for c in word[1:])):
                                is_name = False
                                break
                        else:
                            is_name = False
                            break
                    
                    if is_name and all(word.isalpha() for word in words):
                        aadhaar_details['name'] = text
                        break
    
    return aadhaar_details

# Example usage
if __name__ == "__main__":
    image_path = r'processing\mm.jpg'
    result = extract_aadhaar_details(image_path)
    
    print("Extracted Aadhaar Details:")
    print(f"Name: {result['name']}")
    print(f"Aadhaar Number: {result['id_number']}")
    print(f"Date of Birth: {result['dob']}")
    
    # Uncomment below to see all extracted text (helpful for debugging)
    # reader = easyocr.Reader(['en'])
    # all_text = reader.readtext(image_path, detail=0)
    # print("\nAll detected text:")
    # for i, text in enumerate(all_text):
    #     print(f"{i}: {text}")