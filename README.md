# AI Branch Manager – Video-Based Loan Assistance

## Overview
The **AI Branch Manager** is a web-based platform designed to provide a digital, branch-like experience for users applying for loans. Using AI-powered video interactions, document processing, and rule-based eligibility checks, this system guides users through the loan application process in an intuitive and interactive manner.

## Features
### 1. Virtual AI Branch Manager
- Users interact with a pre-recorded AI video assistant that mimics a real-life bank manager.
- The AI Manager asks structured financial questions and provides step-by-step guidance on loan applications.

### 2. Video-Based Customer Interaction
- Users respond to financial queries by recording video responses.
- Basic facial verification ensures that the same applicant continues throughout the process, preventing fraud.

### 3. Simplified Document Submission & Processing
- Users upload images of Aadhaar, PAN, or income proof via mobile or webcam.
- AI extracts key details such as name, date of birth, income, and employment type from the documents.

### 4. Loan Eligibility & Decisioning
- A rule-based system evaluates loan eligibility using user responses and document data.
- Instant feedback provided:
  - ✅ Approved
  - ❌ Rejected (with reasons)
  - 🔄 More Info Needed

### 5. Multi-Language Support *(Optional Enhancement)*
- Pre-recorded assistant videos can be available in multiple Indian languages for a better user experience.

## Folder Structure
```
manager/
│── processing/                 # Loan application processing logic
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
- **Git**
- **Yarn or npm**

### Steps to Run Locally
1. **Clone the repository**
   ```sh
   git clone https://github.com/sujallimje/manager.git
   cd manager
   ```
2. **Install dependencies**
   ```sh
   npm install  # or yarn install
   ```
3. **Run the development server**
   ```sh
   npm run dev  # or yarn dev
   ```
4. **Access the application**
   - Open [http://localhost:3000](http://localhost:3000) in your browser.

## Technologies Used
- **Frontend:** Next.js, React.js, Tailwind CSS
- **Backend:** Next.js API Routes, Node.js
- **AI Processing:** OpenCV (for facial verification), Tesseract.js (for document OCR)
- **Database:** MongoDB (optional, for storing loan applications)
- **Deployment:** Vercel

## Future Enhancements
- Implement AI-powered chat/video assistant using NLP.
- Add multilingual support with AI-generated voice responses.
- Integrate with banking APIs for real-time loan approval processing.

---
Developed for a **48-hour Hackathon Challenge**.

