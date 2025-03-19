# AI Branch Manager – Video-Based Loan Assistance

## Overview
The **AI Branch Manager** is a web-based platform designed to provide a digital, branch-like experience for users applying for loans. Using AI-powered video interactions, document processing, and rule-based eligibility checks, this system guides users through the loan application process in an intuitive and interactive manner.

## Demo Video
A demonstration video showcasing the AI Branch Manager's functionality is available in the project. You can view it at:
```
CapitalCue - Your AI Branch Manager.mp4
```

This demo highlights the key features and user flow of the application, providing a visual overview of how the system works.

## Features
### 1. Virtual AI Branch Manager
- Users interact with a pre-recorded AI video assistant that mimics a real-life bank manager.
- The AI Manager asks structured financial questions and provides step-by-step guidance on loan applications.

### 2. Video-Based Customer Interaction
- Users respond to financial queries by recording video responses.
- Basic facial verification ensures that the same applicant continues throughout the process, preventing fraud.

### 3. Advanced Document Processing
- Users upload images of Aadhaar, PAN, income proof, address proof, and bank statements via mobile or webcam.
- AI-powered OCR extracts key details such as:
  - **ID Documents:** Name, DOB, ID number, address
  - **Income Documents:** Monthly income, employer name, pay period
  - **Address Proof:** Full address, pincode, city, state
  - **Bank Statements:** Account number, bank name, balance, IFSC code

### 4. Loan Eligibility & Decisioning
- A rule-based system evaluates loan eligibility using user responses and document data.
- Instant feedback provided:
  - ✅ Approved
  - ❌ Rejected (with reasons)
  - 🔄 More Info Needed

### 5. Multi-Language Support *(Optional Enhancement)*
- Pre-recorded assistant videos can be available in multiple Indian languages for a better user experience.
- OCR supports multiple languages including English and several Indian languages.

## Folder Structure
```
manager/
│── CapitalCue - Your AI Branch Manager.mp4  # Demo video in root directory
│── processing/                 # Loan application processing logic
│   └── ocr_extraction.py       # Document OCR and data extraction
│── public/                     # Public assets (images, icons, videos)
│── src/
│   ├── app/                    # Main application logic
│   ├── components/             # Reusable UI components
│   ├── pages/
│   │   ├── api/                # Backend API routes
│   │   ├── index.tsx           # Landing page
│   ├── utils/                  # Utility functions
│── .gitignore                  # Files to be ignored by Git
│── README.md                   # Project documentation
│── requirements.txt            # Python dependencies
│── next-env.d.ts               # TypeScript environment definitions
│── next.config.ts              # Next.js configuration
│── package.json                # Project dependencies and scripts
│── postcss.config.mjs          # PostCSS configuration
│── tsconfig.json               # TypeScript configuration
```

## Installation & Setup
### Prerequisites
Ensure you have the following installed:
- **Node.js** (>= 16.x)
- **Python** (>= 3.7)
- **Git**
- **Yarn or npm**
- **Tesseract OCR** (for document processing)

### Steps to Run Locally
1. **Clone the repository**
   ```sh
   git clone https://github.com/sujallimje/manager.git
   cd manager
   ```
2. **Install JavaScript dependencies**
   ```sh
   npm install  # or yarn install
   ```
3. **Install Python dependencies**
   ```sh
   pip install -r requirements.txt
   ```
4. **Install Tesseract OCR**
   - Windows: Download from [GitHub](https://github.com/UB-Mannheim/tesseract/wiki)
   - macOS: `brew install tesseract`
   - Linux: `sudo apt install tesseract-ocr`
   
   Update the path in `processing/ocr_extraction.py` if needed:
   ```python
   pytesseract.pytesseract.tesseract_cmd = r'path/to/tesseract.exe'
   ```

5. **Run the development server**
   ```sh
   npm run dev  # or yarn dev
   ```
6. **Access the application**
   - Open [http://localhost:3000](http://localhost:3000) in your browser.
   - To view the demo video, access the `CapitalCue - Your AI Branch Manager.mp4` file in the root project directory.

## Document Processing
The system uses advanced OCR techniques to extract information from various documents:

1. **ID Documents** (Aadhaar & PAN):
   - Automatically detects document type
   - Extracts name, DOB, ID number, address, gender
   - Supports multiple languages

2. **Income Documents**:
   - Extracts monthly income, employer name, employee ID
   - Identifies pay period

3. **Address Proof**:
   - Extracts full address, pincode, city, state

4. **Bank Statements**:
   - Extracts bank name, account number, IFSC code, balance
   - Identifies statement period

## Technologies Used
- **Frontend:** Next.js, React.js, Tailwind CSS
- **Backend:** Next.js API Routes, Node.js
- **AI Processing:** 
  - OpenCV (for image preprocessing and facial verification)
  - Tesseract OCR (for document text extraction)
  - pytesseract (Python wrapper for Tesseract)
  - NumPy (for image manipulation)
- **Database:** MongoDB (optional, for storing loan applications)
- **Deployment:** Vercel

## Future Enhancements
- Implement AI-powered chat/video assistant using NLP.
- Add multilingual support with AI-generated voice responses.
- Integrate with banking APIs for real-time loan approval processing.
- Enhance OCR accuracy with deep learning-based document analysis.

---
Developed for a **48-hour Hackathon Challenge**.