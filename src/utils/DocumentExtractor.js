// utils/documentExtractors.js

/**
 * Extract information from Aadhaar card text
 * @param {string} text - The OCR extracted text from the document
 * @returns {object} - Extracted information
 */
export function extractAadhaarData(text) {
    const data = {};
    
    // Extract Aadhaar number (12 digits, sometimes with spaces)
    const aadhaarPattern = /\b\d{4}\s?\d{4}\s?\d{4}\b/;
    const aadhaarMatch = text.match(aadhaarPattern);
    if (aadhaarMatch) {
      data.idNumber = aadhaarMatch[0].replace(/\s/g, '');
    }
    
    // Extract name (usually preceded by "Name:" or similar)
    const namePattern = /(?:Name|नाम)\s*[:：]\s*([^\n]+)/i;
    const nameMatch = text.match(namePattern);
    if (nameMatch) {
      data.name = nameMatch[1].trim();
    } else {
      // Try alternative name detection
      const lines = text.split('\n').filter(line => line.trim() !== '');
      for (let i = 0; i < lines.length; i++) {
        // Look for lines that seem to contain a full name (not too short, not too long)
        if (lines[i].length > 5 && lines[i].length < 40 && 
            !lines[i].includes(':') && !lines[i].includes('Aadhaar') && 
            !/\d{4}/.test(lines[i])) {
          data.name = lines[i].trim();
          break;
        }
      }
    }
    
    // Extract date of birth
    const dobPattern = /(?:DOB|Date of Birth|जन्म तिथि)\s*[:：]\s*(\d{2}[/.-]\d{2}[/.-]\d{4}|\d{2}\s+\w+\s+\d{4})/i;
    const dobMatch = text.match(dobPattern);
    if (dobMatch) {
      data.dob = dobMatch[1].trim();
    }
    
    // Extract gender
    const genderPattern = /(?:Gender|लिंग)\s*[:：]\s*(\w+)/i;
    const genderMatch = text.match(genderPattern);
    if (genderMatch) {
      data.gender = genderMatch[1].trim();
    }
    
    // Extract address (usually the longest text block)
    const addressPattern = /(?:Address|पता)\s*[:：]\s*([^\n]+(?:\n[^\n]+)*)/i;
    const addressMatch = text.match(addressPattern);
    if (addressMatch) {
      data.address = addressMatch[1].trim().replace(/\n/g, ' ');
    }
    
    return data;
  }
  
  /**
   * Extract information from PAN card text
   * @param {string} text - The OCR extracted text from the document
   * @returns {object} - Extracted information
   */
  export function extractPANData(text) {
    const data = {};
    
    // Extract PAN number (10 characters with specific format)
    const panPattern = /\b[A-Z]{5}\d{4}[A-Z]{1}\b/;
    const panMatch = text.match(panPattern);
    if (panMatch) {
      data.panNumber = panMatch[0];
    }
    
    // Extract name (usually preceded by "Name:" or similar)
    const namePattern = /(?:Name|नाम)\s*[:：]\s*([^\n]+)/i;
    const nameMatch = text.match(namePattern);
    if (nameMatch) {
      data.name = nameMatch[1].trim();
    } else {
      // Try alternative name detection - look for a line that might be a name
      const lines = text.split('\n').filter(line => line.trim() !== '');
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].length > 5 && lines[i].length < 40 && 
            !lines[i].includes(':') && !lines[i].includes('PAN') && 
            !/\d{4}/.test(lines[i])) {
          data.name = lines[i].trim();
          break;
        }
      }
    }
    
    // Extract father's name
    const fatherPattern = /(?:Father|Father's Name|पिता|पिता का नाम)\s*[:：]\s*([^\n]+)/i;
    const fatherMatch = text.match(fatherPattern);
    if (fatherMatch) {
      data.fatherName = fatherMatch[1].trim();
    }
    
    // Extract date of birth
    const dobPattern = /(?:DOB|Date of Birth|जन्म तिथि)\s*[:：]\s*(\d{2}[/.-]\d{2}[/.-]\d{4}|\d{2}\s+\w+\s+\d{4})/i;
    const dobMatch = text.match(dobPattern);
    if (dobMatch) {
      data.dob = dobMatch[1].trim();
    }
    
    return data;
  }
  
  /**
   * Extract information from income documents (salary slips, Form 16)
   * @param {string} text - The OCR extracted text from the document
   * @returns {object} - Extracted information
   */
  export function extractIncomeData(text) {
    const data = {};
    
    // Extract employee name
    const namePattern = /(?:Employee|Name|Employee Name|कर्मचारी का नाम)\s*[:：]\s*([^\n]+)/i;
    const nameMatch = text.match(namePattern);
    if (nameMatch) {
      data.name = nameMatch[1].trim();
    }
    
    // Extract employee ID
    const employeeIdPattern = /(?:Employee ID|ID|कर्मचारी आईडी|EMP ID)\s*[:：]\s*([^\n]+)/i;
    const employeeIdMatch = text.match(employeeIdPattern);
    if (employeeIdMatch) {
      data.employeeId = employeeIdMatch[1].trim();
    }
    
    // Extract employer name
    const employerPattern = /(?:Employer|Company|कंपनी|Organization)\s*[:：]\s*([^\n]+)/i;
    const employerMatch = text.match(employerPattern);
    if (employerMatch) {
      data.employerName = employerMatch[1].trim();
    }
    
    // Extract monthly income/salary
    // Look for currency symbols followed by numbers
    const salaryPattern = /(?:Salary|Gross Salary|Income|वेतन|Net Pay|Total Earnings)[^₹$]*[₹$]?\s*(\d+[,\d]*\.\d+|\d+[,\d]*)/i;
    const salaryMatch = text.match(salaryPattern);
    if (salaryMatch) {
      data.monthlyIncome = `₹${salaryMatch[1].trim()}`;
    } else {
      // Alternative pattern - look for numbers near salary keywords
      const altSalaryPattern = /(?:Salary|Income|वेतन|Net Pay|Total Earnings)[^\d]*(\d+[,\d]*\.\d+|\d+[,\d]*)/i;
      const altSalaryMatch = text.match(altSalaryPattern);
      if (altSalaryMatch) {
        data.monthlyIncome = `₹${altSalaryMatch[1].trim()}`;
      }
    }
    
    // Extract pay period
    const periodPattern = /(?:Pay Period|Period|Month|अवधि)\s*[:：]\s*([^\n]+)/i;
    const periodMatch = text.match(periodPattern);
    if (periodMatch) {
      data.payPeriod = periodMatch[1].trim();
    }
    
    return data;
  }
  
  /**
   * Extract information from address proof documents
   * @param {string} text - The OCR extracted text from the document
   * @returns {object} - Extracted information
   */
  export function extractAddressData(text) {
    const data = {};
    
    // Extract name
    const namePattern = /(?:Name|नाम|Customer Name|Consumer Name)\s*[:：]\s*([^\n]+)/i;
    const nameMatch = text.match(namePattern);
    if (nameMatch) {
      data.name = nameMatch[1].trim();
    }
    
    // Extract full address
    // Look for address block - often the longest text block
    const addressPattern = /(?:Address|पता|Billing Address|Residential Address)\s*[:：]\s*([^\n]+(?:\n[^\n]+)*)/i;
    const addressMatch = text.match(addressPattern);
    if (addressMatch) {
      data.address = addressMatch[1].trim().replace(/\n/g, ' ');
    } else {
      // If no address label, try to identify address by looking for pincode
      const pincodePattern = /\b(\d{6})\b/; // Indian pincode is 6 digits
      const pincodeMatch = text.match(pincodePattern);
      if (pincodeMatch) {
        // Find the line containing the pincode and few lines before it
        const lines = text.split('\n').filter(line => line.trim() !== '');
        const pincodeLineIndex = lines.findIndex(line => line.includes(pincodeMatch[1]));
        if (pincodeLineIndex !== -1) {
          // Take up to 3 lines before the pincode line
          const startIndex = Math.max(0, pincodeLineIndex - 3);
          data.address = lines.slice(startIndex, pincodeLineIndex + 1).join(' ');
        }
      }
    }
    
    // Extract pincode
    const pincodePattern = /\b(\d{6})\b/;
    const pincodeMatch = text.match(pincodePattern);
    if (pincodeMatch) {
      data.pincode = pincodeMatch[1];
    }
    
    // Extract city
    const cityPattern = /(?:City|शहर|Town)\s*[:：]\s*([^\n,]+)/i;
    const cityMatch = text.match(cityPattern);
    if (cityMatch) {
      data.city = cityMatch[1].trim();
    }
    
    // Extract state
    const statePattern = /(?:State|राज्य)\s*[:：]\s*([^\n,]+)/i;
    const stateMatch = text.match(statePattern);
    if (stateMatch) {
      data.state = stateMatch[1].trim();
    }
    
    return data;
  }
  
  /**
   * Extract information from bank statements
   * @param {string} text - The OCR extracted text from the document
   * @returns {object} - Extracted information
   */
  export function extractBankData(text) {
    const data = {};
    
    // Extract bank name
    const bankNamePattern = /(?:Bank Name|बैंक|Bank)\s*[:：]?\s*([^\n]+)/i;
    const bankNameMatch = text.match(bankNamePattern);
    if (bankNameMatch) {
      data.bankName = bankNameMatch[1].trim();
    } else {
      // Try to identify bank name from common bank names
      const bankNames = ["State Bank of India", "HDFC Bank", "ICICI Bank", "Axis Bank", "Punjab National Bank", "Bank of Baroda"];
      for (const bank of bankNames) {
        if (text.includes(bank)) {
          data.bankName = bank;
          break;
        }
      }
    }
    
    // Extract account number (typically 9-18 digits, sometimes with X masks)
    const accountPattern = /(?:Account|A\/c|Account Number|खाता संख्या)\s*[:：]?\s*(?:No|Number|#)?\s*[:：]?\s*((?:\d|X|x){9,18}|(?:\d|X|x){4}[-\s](?:\d|X|x){4}[-\s](?:\d|X|x){4})/i;
    const accountMatch = text.match(accountPattern);
    if (accountMatch) {
      data.accountNumber = accountMatch[1].trim();
    }
    
    // Extract account holder name
    const holderPattern = /(?:Account Holder|Name|Customer Name|ग्राहक का नाम)\s*[:：]\s*([^\n]+)/i;
    const holderMatch = text.match(holderPattern);
    if (holderMatch) {
      data.accountHolder = holderMatch[1].trim();
    }
    
    // Extract IFSC code (Indian Financial System Code)
    const ifscPattern = /(?:IFSC|IFSC Code|आईएफएससी कोड)\s*[:：]?\s*([A-Z]{4}0[A-Z0-9]{6})/i;
    const ifscMatch = text.match(ifscPattern);
    if (ifscMatch) {
      data.ifscCode = ifscMatch[1].trim();
    }
    
    // Extract account balance
    const balancePattern = /(?:Balance|Closing Balance|Available Balance|बैलेंस)[^₹$]*[₹$]?\s*(\d+[,\d]*\.\d+|\d+[,\d]*)/i;
    const balanceMatch = text.match(balancePattern);
    if (balanceMatch) {
      data.accountBalance = `₹${balanceMatch[1].trim()}`;
    }
    
    // Extract statement period
    const periodPattern = /(?:Statement Period|Period|अवधि)\s*[:：]\s*([^\n]+)/i;
    const periodMatch = text.match(periodPattern);
    if (periodMatch) {
      data.statementPeriod = periodMatch[1].trim();
    }
    
    return data;
  }