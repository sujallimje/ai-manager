# processing/ocr_extraction.py
import cv2
import re
import os
import sys
import json
import traceback
from PIL import Image
import numpy as np
import tempfile
import logging
import easyocr  # Added EasyOCR import

logging.basicConfig(filename='ocr_error.log', level=logging.DEBUG)

# Removed pytesseract code since we're using EasyOCR

def preprocess_image(image_path):
    """
    Preprocess an image for better OCR results
    
    Args:
        image_path (str): Path to the image file
    
    Returns:
        numpy.ndarray: Preprocessed image
    """
    # Read the image
    image = cv2.imread(image_path)
    
    # Convert to grayscale
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    
    # Apply threshold to get binary image
    _, binary = cv2.threshold(gray, 150, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    
    # Noise removal
    kernel = np.ones((1, 1), np.uint8)
    opening = cv2.morphologyEx(binary, cv2.MORPH_OPEN, kernel)
    
    return opening

def extract_aadhaar_info(image_path):
    """
    Extract information from an Aadhaar card using EasyOCR
    
    Args:
        image_path (str): Path to the Aadhaar card image
    
    Returns:
        dict: Extracted information
    """
    # Initialize EasyOCR Reader
    reader = easyocr.Reader(['en'])
    
    # Get OCR text with confidence values
    results = reader.readtext(image_path, detail=1)  # detail=1 gives confidence scores
    
    # Extract text with confidence filtering
    extracted_text = [text[1] for text in results if text[2] > 0.5]  # Only keep high-confidence text
    
    # Join all extracted text into a single string
    full_text = ' '.join(extracted_text)
    
    # Initialize the result dictionary
    result = {
        'id_type': 'Aadhaar Card',
        'name': '',
        'dob': '',
        'id_number': '',
        'gender': '',
        'address': ''
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
        capitalized_texts = []
        for text in extracted_text:
            words = text.split()
            capitalized_words = [word for word in words if word.istitle() and len(word) > 3]
            if capitalized_words:
                capitalized_texts.append(' '.join(capitalized_words))
        
        if capitalized_texts:
            result['name'] = max(capitalized_texts, key=len)
    
    # Extract DOB (usually in format DD/MM/YYYY)
    dob_match = re.search(r'(?:DOB|Date of Birth|ജനിച്ച തീയതി|जन्म तिथि|జన్మదినము)[:\s]+([\d/.-]+)', normalized_text, re.IGNORECASE)
    if dob_match:
        result['dob'] = dob_match.group(1).strip()
    
    # Extract gender
    gender_match = re.search(r'(?:Gender|लिंग|MALE|FEMALE)[:\s]*(Male|Female|M|F)', normalized_text, re.IGNORECASE)
    if gender_match:
        gender = gender_match.group(1).strip().upper()
        if gender == 'M':
            result['gender'] = 'Male'
        elif gender == 'F':
            result['gender'] = 'Female'
        else:
            result['gender'] = gender
    
    # Extract address
    address_lines = []
    address_pattern = re.search(r'(?:Address|पता)[:\s]+(.*)', normalized_text, re.IGNORECASE)
    
    if address_pattern:
        address_lines.append(address_pattern.group(1).strip())
        
        # Try to capture a few lines after the address label
        address_index = full_text.lower().find('address')
        if address_index != -1:
            possible_address = full_text[address_index + 8:address_index + 150]  # Adjust size as needed
            address_lines.append(possible_address)
    
    if address_lines:
        result['address'] = ' '.join(address_lines)
    
    return result

def extract_pan_info(image_path):
    """
    Extract information from a PAN card using EasyOCR
    
    Args:
        image_path (str): Path to the PAN card image
    
    Returns:
        dict: Extracted information
    """
    # Initialize EasyOCR Reader
    reader = easyocr.Reader(['en'])
    
    # Get OCR text
    results = reader.readtext(image_path, detail=1)
    
    # Extract text with confidence filtering
    extracted_text = [text[1] for text in results if text[2] > 0.5]
    
    # Join all extracted text into a single string
    full_text = ' '.join(extracted_text)
    
    # Initialize the result dictionary
    result = {
        'id_type': 'PAN Card',
        'name': '',
        'dob': '',
        'id_number': '',
        'father_name': ''
    }
    
    # PAN Number Pattern (ABCDE1234F format)
    pan_pattern = r'\b[A-Z]{5}[0-9]{4}[A-Z]\b'
    pan_match = re.search(pan_pattern, full_text)
    
    if pan_match:
        result['id_number'] = pan_match.group(0)
    
    # Extract name (usually after "Name" or on a line by itself)
    name_match = re.search(r'(?:Name|नाम)[:\s]+([\w\s]+)', full_text, re.IGNORECASE)
    if name_match:
        result['name'] = name_match.group(1).strip()
    else:
        # Try alternative name detection - look for capitalized text
        for text in extracted_text:
            if len(text.strip()) > 5 and text.istitle() and len(text.split()) >= 2:
                # Avoid lines with PAN number pattern
                if not re.search(pan_pattern, text):
                    result['name'] = text.strip()
                    break
    
    # Extract DOB (usually in format DD/MM/YYYY)
    dob_match = re.search(r'(?:DOB|Date of Birth|जन्म तिथि)[:\s]+([\d/.-]+)', full_text, re.IGNORECASE)
    if dob_match:
        result['dob'] = dob_match.group(1).strip()
    
    # Extract father's name
    father_match = re.search(r'(?:Father|Father\'s Name|पिता|पिता का नाम)[:\s]+([\w\s]+)', full_text, re.IGNORECASE)
    if father_match:
        result['father_name'] = father_match.group(1).strip()
    
    return result

def extract_income_info(document_path):
    """
    Extract income information from a payslip or income document
    
    Args:
        document_path (str): Path to the income document
    
    Returns:
        dict: Extracted information
    """
    # Initialize EasyOCR Reader
    reader = easyocr.Reader(['en'])
    
    # Get OCR text
    results = reader.readtext(document_path, detail=0)
    
    # Join all extracted text into a single string
    text = ' '.join(results)
    
    # Initialize the result dictionary
    result = {
        'document_type': 'Income',
        'monthly_income': '',
        'employer_name': '',
        'employee_name': '',
        'employee_id': '',
        'pay_period': ''
    }
    
    # Extract income amount (looking for currency symbols and numbers)
    income_patterns = [
        r'(?:Net Pay|Net Salary|Total Salary|Take Home|Net Amount)[:\s]*(?:Rs\.|₹|INR)?[\s]*(\d+(?:,\d+)*(?:\.\d+)?)',
        r'(?:Rs\.|₹|INR)[\s]*(\d+(?:,\d+)*(?:\.\d+)?)',
        r'(?:Total Earnings|Gross)[:\s]*(?:Rs\.|₹|INR)?[\s]*(\d+(?:,\d+)*(?:\.\d+)?)'
    ]
    
    for pattern in income_patterns:
        income_match = re.search(pattern, text, re.IGNORECASE)
        if income_match:
            income_str = income_match.group(1).replace(',', '')
            try:
                result['monthly_income'] = f"₹{income_str}"
                break
            except ValueError:
                continue
    
    # Extract employer name
    employer_match = re.search(r'(?:Employer|Company|Organization)[:\s]+([\w\s]+)', text, re.IGNORECASE)
    if employer_match:
        result['employer_name'] = employer_match.group(1).strip()
    else:
        # Try to find company name at the top of the document
        lines = text.split('\n')
        for i in range(min(5, len(lines))):
            if lines[i].strip() and len(lines[i].strip()) > 3:
                result['employer_name'] = lines[i].strip()
                break
    
    # Extract employee name
    name_match = re.search(r'(?:Employee|Name|Employee Name|कर्मचारी का नाम)[:\s]+([\w\s]+)', text, re.IGNORECASE)
    if name_match:
        result['employee_name'] = name_match.group(1).strip()
    
    # Extract employee ID
    emp_id_match = re.search(r'(?:Employee ID|ID|कर्मचारी आईडी|EMP ID|Employee Number|Staff ID)[:\s]+([\w\d-]+)', text, re.IGNORECASE)
    if emp_id_match:
        result['employee_id'] = emp_id_match.group(1).strip()
    
    # Extract pay period
    period_match = re.search(r'(?:Pay Period|Period|Month|अवधि|for the month of)[:\s]+([\w\s,\d-]+)', text, re.IGNORECASE)
    if period_match:
        result['pay_period'] = period_match.group(1).strip()
    
    return result

def extract_address_data(image_path):
    """
    Extract information from address proof documents using EasyOCR
    
    Args:
        image_path (str): Path to the address proof document
    
    Returns:
        dict: Extracted information
    """
    # Initialize EasyOCR Reader
    reader = easyocr.Reader(['en'])
    
    # Get OCR text
    results = reader.readtext(image_path, detail=0)
    
    # Join all extracted text into a single string
    text = ' '.join(results)
    
    # Initialize result dictionary
    result = {
        'document_type': 'Address Proof',
        'name': '',
        'address': '',
        'pincode': '',
        'city': '',
        'state': ''
    }
    
    # Extract name
    name_match = re.search(r'(?:Name|नाम|Customer Name|Consumer Name)[:\s]+([\w\s]+)', text, re.IGNORECASE)
    if name_match:
        result['name'] = name_match.group(1).strip()
    
    # Extract full address
    address_match = re.search(r'(?:Address|पता|Billing Address|Residential Address)[:\s]+([\s\S]+?)(?=Pin|Pincode|\d{6}|$)', text, re.IGNORECASE)
    if address_match:
        result['address'] = ' '.join(address_match.group(1).strip().split())
    
    # Extract pincode (6 digits for Indian pincodes)
    pincode_match = re.search(r'(?:Pin|Pincode|पिन)[:\s]*(\d{6})', text, re.IGNORECASE) or re.search(r'\b(\d{6})\b', text)
    if pincode_match:
        result['pincode'] = pincode_match.group(1)
    
    # Extract city
    city_match = re.search(r'(?:City|शहर|Town)[:\s]+([\w\s]+)', text, re.IGNORECASE)
    if city_match:
        result['city'] = city_match.group(1).strip()
    
    # Extract state
    state_match = re.search(r'(?:State|राज्य)[:\s]+([\w\s]+)', text, re.IGNORECASE)
    if state_match:
        result['state'] = state_match.group(1).strip()
    
    return result

def extract_bank_data(image_path):
    """
    Extract information from bank statements using EasyOCR
    
    Args:
        image_path (str): Path to the bank statement
    
    Returns:
        dict: Extracted information
    """
    # Initialize EasyOCR Reader
    reader = easyocr.Reader(['en'])
    
    # Get OCR text
    results = reader.readtext(image_path, detail=0)
    
    # Join all extracted text into a single string
    text = ' '.join(results)
    
    # Initialize result dictionary
    result = {
        'document_type': 'Bank Statement',
        'bank_name': '',
        'account_number': '',
        'account_holder': '',
        'ifsc_code': '',
        'account_balance': '',
        'statement_period': ''
    }
    
    # Extract bank name
    bank_names = ["State Bank of India", "HDFC Bank", "ICICI Bank", "Axis Bank", "Punjab National Bank", 
                  "Bank of Baroda", "Kotak Mahindra Bank", "Yes Bank", "Canara Bank", "Union Bank of India"]
    
    for bank in bank_names:
        if bank.lower() in text.lower():
            result['bank_name'] = bank
            break
    
    if not result['bank_name']:
        bank_match = re.search(r'(?:Bank Name|बैंक|Bank)[:\s]*([A-Za-z\s]+)', text, re.IGNORECASE)
        if bank_match:
            result['bank_name'] = bank_match.group(1).strip()
    
    # Extract account number
    account_match = re.search(r'(?:Account|A\/c|Account Number|खाता संख्या)[:\s]*(?:No|Number|#)?[:\s]*([X\dx\*\s-]{6,18})', text, re.IGNORECASE)
    if account_match:
        result['account_number'] = account_match.group(1).strip()
    
    # Extract account holder name
    holder_match = re.search(r'(?:Account Holder|Name|Customer Name|ग्राहक का नाम)[:\s]+([\w\s]+)', text, re.IGNORECASE)
    if holder_match:
        result['account_holder'] = holder_match.group(1).strip()
    
    # Extract IFSC code
    ifsc_match = re.search(r'(?:IFSC|IFSC Code|आईएफएससी कोड)[:\s]*([A-Z0-9]{11})', text, re.IGNORECASE)
    if ifsc_match:
        result['ifsc_code'] = ifsc_match.group(1).strip()
    
    # Extract account balance
    balance_match = re.search(r'(?:Balance|Closing Balance|Available Balance|बैलेंस)[:\s]*(?:Rs\.|₹|INR)?[\s]*(\d+(?:,\d+)*(?:\.\d+)?)', text, re.IGNORECASE)
    if balance_match:
        result['account_balance'] = f"₹{balance_match.group(1).strip()}"
    
    # Extract statement period
    period_match = re.search(r'(?:Statement Period|Period|अवधि)[:\s]+([\w\s,\d-]+)', text, re.IGNORECASE)
    if period_match:
        result['statement_period'] = period_match.group(1).strip()
    
    return result

def extract_document_info(document_path, doc_type):
    """
    Extract information from a document based on its type
    
    Args:
        document_path (str): Path to the document
        doc_type (str): Type of document ('id', 'income', 'address', 'bank')
    
    Returns:
        dict: Extracted information
    """
    if doc_type == 'id':
        # Initialize EasyOCR Reader
        reader = easyocr.Reader(['en'])
        
        # Get OCR text
        results = reader.readtext(document_path, detail=0)
        
        # Join all extracted text into a single string
        text = ' '.join(results)
        
        # Check for Aadhaar keywords
        if re.search(r'(?:Aadhaar|आधार|UIDAI|UID|Unique Identification)', text, re.IGNORECASE) or re.search(r'\b\d{4}\s?\d{4}\s?\d{4}\b', text):
            return extract_aadhaar_info(document_path)
        # Check for PAN keywords
        elif re.search(r'(?:PAN|Permanent Account Number|Income Tax|आयकर)', text, re.IGNORECASE) or re.search(r'\b[A-Z]{5}[0-9]{4}[A-Z]\b', text):
            return extract_pan_info(document_path)
        else:
            # If can't determine, try both and return the one with more information
            aadhaar_info = extract_aadhaar_info(document_path)
            pan_info = extract_pan_info(document_path)
            
            # If either has an ID number, use that one
            if aadhaar_info.get('id_number'):
                return aadhaar_info
            elif pan_info.get('id_number'):
                return pan_info
            
            # Count non-empty fields
            aadhaar_count = sum(1 for value in aadhaar_info.values() if value)
            pan_count = sum(1 for value in pan_info.values() if value)
            
            return aadhaar_info if aadhaar_count >= pan_count else pan_info
    
    elif doc_type == 'income':
        return extract_income_info(document_path)
    elif doc_type == 'address':
        return extract_address_data(document_path)
    elif doc_type == 'bank':
        return extract_bank_data(document_path)
    
    return {"error": "Unknown document type"}

def enhance_image_for_ocr(image_path):
    """
    Enhance an image for better OCR results
    
    Args:
        image_path (str): Path to the image
    
    Returns:
        str: Path to the enhanced image
    """
    # Read image
    image = cv2.imread(image_path)
    
    # Convert to grayscale
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    
    # Apply adaptive thresholding
    thresh = cv2.adaptiveThreshold(gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
                                   cv2.THRESH_BINARY, 11, 2)
    
    # Apply dilation to make text more prominent
    kernel = np.ones((1, 1), np.uint8)
    dilated = cv2.dilate(thresh, kernel, iterations=1)
    
    # Apply erosion to remove noise
    eroded = cv2.erode(dilated, kernel, iterations=1)
    
    # Save enhanced image
    enhanced_path = image_path.replace('.', '_enhanced.')
    cv2.imwrite(enhanced_path, eroded)
    
    return enhanced_path

if __name__ == "__main__":
    # Check if correct arguments are provided
    if len(sys.argv) != 3:
        print(json.dumps({"error": "Usage: python ocr_extraction.py <document_path> <document_type>"}))
        sys.exit(1)
    
    document_path = sys.argv[1]
    doc_type = sys.argv[2]
    
    # Check if file exists
    if not os.path.exists(document_path):
        print(json.dumps({"error": f"File not found: {document_path}"}))
        sys.exit(1)
    
    try:
        # Try with original image
        result = extract_document_info(document_path, doc_type)
        
        # If not enough information, try with enhanced image
        has_useful_info = False
        if doc_type == 'id':
            has_useful_info = result.get('id_number') or result.get('name')
        elif doc_type == 'income':
            has_useful_info = result.get('monthly_income') or result.get('employer_name')
        elif doc_type == 'address':
            has_useful_info = result.get('address') or result.get('pincode')
        elif doc_type == 'bank':
            has_useful_info = result.get('account_number') or result.get('bank_name')
            
        if not has_useful_info:
            enhanced_path = enhance_image_for_ocr(document_path)
            enhanced_result = extract_document_info(enhanced_path, doc_type)
            
            # Clean up enhanced image
            if os.path.exists(enhanced_path):
                os.remove(enhanced_path)
                
            # Use enhanced result if it has more information
            if doc_type == 'id':
                if enhanced_result.get('id_number') or enhanced_result.get('name'):
                    result = enhanced_result
            elif doc_type == 'income':
                if enhanced_result.get('monthly_income') or enhanced_result.get('employer_name'):
                    result = enhanced_result
            elif doc_type == 'address':
                if enhanced_result.get('address') or enhanced_result.get('pincode'):
                    result = enhanced_result
            elif doc_type == 'bank':
                if enhanced_result.get('account_number') or enhanced_result.get('bank_name'):
                    result = enhanced_result
        # Print result as JSON
        print(json.dumps(result))
        
    except Exception as e:
        logging.error(f"Error processing {document_path}: {str(e)}")
        logging.error(f"Traceback: {traceback.format_exc()}")
        print(json.dumps({"error": str(e)}))
        sys.exit(1)