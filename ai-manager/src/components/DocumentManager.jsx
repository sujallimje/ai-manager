"use client";
import { useState, useEffect } from "react";
import DocumentUpload from "./DocumentUpload";

const DocumentManager = ({ onComplete }) => {
  const [currentDocIndex, setCurrentDocIndex] = useState(0);
  const [uploadedDocuments, setUploadedDocuments] = useState({});
  const [extractedData, setExtractedData] = useState({});
  const [isComplete, setIsComplete] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [validationErrors, setValidationErrors] = useState({});
  const [verificationMethods, setVerificationMethods] = useState({});
  const [manualEntryMode, setManualEntryMode] = useState({});
  const [manualFormData, setManualFormData] = useState({});

  // Document types to be uploaded in sequence
  const documentTypes = [
    "identity",
    "pan",
    "address",
    "income",
    "bank",
    "cibil",
    "employment",
    "property",
    "collateral"
  ];

  // Required document types (user must upload these)
  const requiredDocTypes = ["identity", "pan", "address", "income", "bank"];

  // Field templates for manual entry
  const manualEntryFields = {
    identity: [
      { key: "name", label: "Full Name", type: "text", required: true },
      { key: "idNumber", label: "ID Number", type: "text", required: true },
      { key: "dateOfBirth", label: "Date of Birth", type: "date", required: true },
      { key: "gender", label: "Gender", type: "select", options: ["Male", "Female", "Other"], required: true },
    ],
    pan: [
      { key: "panNumber", label: "PAN Number", type: "text", required: true },
    ],
    address: [
      { key: "address", label: "Street Address", type: "text", required: true },
      { key: "city", label: "City", type: "text", required: true },
      { key: "state", label: "State", type: "text", required: true },
      { key: "pincode", label: "PIN Code", type: "text", required: true },
    ],
    income: [
      { key: "employerName", label: "Employer Name", type: "text", required: true },
      { key: "employeeId", label: "Employee ID", type: "text", required: false },
      { key: "designation", label: "Designation", type: "text", required: false },
      { key: "monthlyIncome", label: "Monthly Income", type: "number", required: true },
      { key: "payPeriod", label: "Pay Period", type: "text", required: false },
    ],
    bank: [
      { key: "accountNumber", label: "Account Number", type: "text", required: true },
      { key: "ifscCode", label: "IFSC Code", type: "text", required: true },
      { key: "bankName", label: "Bank Name", type: "text", required: true },
      { key: "accountHolder", label: "Account Holder Name", type: "text", required: true },
      { key: "accountType", label: "Account Type", type: "select", options: ["Savings", "Current", "Salary"], required: true },
    ],
    cibil: [
      { key: "cibilScore", label: "CIBIL Score", type: "number", required: true },
      { key: "reportDate", label: "Report Date", type: "date", required: true },
    ],
    employment: [
      { key: "companyName", label: "Company Name", type: "text", required: true },
      { key: "dateOfJoining", label: "Date of Joining", type: "date", required: true },
      { key: "employmentType", label: "Employment Type", type: "select", options: ["Full-time", "Part-time", "Contract"], required: true },
    ],
    property: [
      { key: "propertyType", label: "Property Type", type: "select", options: ["Apartment", "Independent House", "Plot", "Commercial"], required: true },
      { key: "propertyAddress", label: "Property Address", type: "text", required: true },
      { key: "propertyValue", label: "Property Value", type: "number", required: true },
    ],
    collateral: [
      { key: "collateralType", label: "Collateral Type", type: "select", options: ["Property", "Gold", "Fixed Deposit", "Shares", "Other"], required: true },
      { key: "collateralValue", label: "Collateral Value", type: "number", required: true },
      { key: "collateralDetails", label: "Collateral Details", type: "textarea", required: false },
    ]
  };

  // Validation rules for each document type
  const validationRules = {
    identity: (data) => {
      if (!data.idNumber) return "ID number is required";
      if (!data.name) return "Name is required";
      return null;
    },
    pan: (data) => {
      if (!data.panNumber) return "PAN number is required";
      return null;
    },
    address: (data) => {
      if (!data.address) return "Address information is required";
      return null;
    },
    income: (data) => {
      if (!data.monthlyIncome) return "Income information is required";
      return null;
    },
    bank: (data) => {
      if (!data.accountNumber) return "Account number is required";
      return null;
    }
  };

  // Initialize manual form data when document type changes
  useEffect(() => {
    const docType = documentTypes[currentDocIndex];
    if (!manualFormData[docType]) {
      const initialData = {};
      (manualEntryFields[docType] || []).forEach(field => {
        initialData[field.key] = '';
      });
      setManualFormData(prev => ({
        ...prev,
        [docType]: initialData
      }));
    }
  }, [currentDocIndex]);

  // Toggle manual entry mode
  const toggleManualEntry = (docType) => {
    setManualEntryMode(prev => ({
      ...prev,
      [docType]: !prev[docType]
    }));
    
    // If extracted data exists, pre-fill manual form data
    if (extractedData[docType]) {
      setManualFormData(prev => ({
        ...prev,
        [docType]: { ...extractedData[docType] }
      }));
    }
  };

  // Handle manual form data changes
  const handleManualFormChange = (docType, field, value) => {
    setManualFormData(prev => ({
      ...prev,
      [docType]: {
        ...prev[docType],
        [field]: value
      }
    }));
  };

  // Submit manual form data
  const submitManualForm = (docType) => {
    // Use manual form data as extracted data
    setExtractedData(prev => ({
      ...prev,
      [docType]: manualFormData[docType]
    }));
    
    // Validate the manual data
    const error = validateCurrentDoc(docType, manualFormData[docType]);
    setValidationErrors(prev => ({
      ...prev,
      [docType]: error
    }));
    
    // Mark as manually verified
    setVerificationMethods(prev => ({
      ...prev,
      [docType]: "manual"
    }));
    
    // Create a placeholder file object if none exists
    if (!uploadedDocuments[docType]) {
      const dummyFile = new File(
        [JSON.stringify(manualFormData[docType])], 
        `manual-${docType}.json`, 
        { type: 'application/json' }
      );
      
      setUploadedDocuments(prev => ({
        ...prev,
        [docType]: dummyFile
      }));
    }
    
    // Turn off manual entry mode
    setManualEntryMode(prev => ({
      ...prev,
      [docType]: false
    }));
  };

  // Validate the current document's extracted data
  const validateCurrentDoc = (docType, data) => {
    if (!requiredDocTypes.includes(docType)) return null;
    
    const validator = validationRules[docType];
    if (!validator) return null;
    
    return validator(data);
  };

  const handleDocumentUpload = (docType, file, method = "upload") => {
    setUploadedDocuments(prev => ({
      ...prev,
      [docType]: file
    }));
    
    // Store the verification method used
    setVerificationMethods(prev => ({
      ...prev,
      [docType]: method
    }));
    
    // Initialize upload progress
    setUploadProgress(prev => ({
      ...prev,
      [docType]: 0
    }));
    
    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        const newProgress = Math.min((prev[docType] || 0) + 10, 100);
        if (newProgress === 100) clearInterval(interval);
        return {
          ...prev,
          [docType]: newProgress
        };
      });
    }, 300);
  };

  const handleDataExtraction = (docType, data) => {
    setExtractedData(prev => ({
      ...prev,
      [docType]: data
    }));
    
    // Pre-fill manual form data with extracted data
    setManualFormData(prev => ({
      ...prev,
      [docType]: { ...data }
    }));
    
    // Validate the extracted data
    const error = validateCurrentDoc(docType, data);
    setValidationErrors(prev => ({
      ...prev,
      [docType]: error
    }));
  };

  const handleDataCorrection = (docType, field, value) => {
    setExtractedData(prev => ({
      ...prev,
      [docType]: {
        ...prev[docType],
        [field]: value
      }
    }));
    
    // Also update manual form data
    setManualFormData(prev => ({
      ...prev,
      [docType]: {
        ...(prev[docType] || {}),
        [field]: value
      }
    }));
    
    // Re-validate after correction
    const updatedData = {
      ...extractedData[docType],
      [field]: value
    };
    
    const error = validateCurrentDoc(docType, updatedData);
    setValidationErrors(prev => ({
      ...prev,
      [docType]: error
    }));
  };

  const goToNextDocument = () => {
    if (currentDocIndex < documentTypes.length - 1) {
      setCurrentDocIndex(currentDocIndex + 1);
    } else {
      setIsComplete(true);
      
      // Process and format all extracted data before sending
      const formattedData = {};
      Object.keys(extractedData).forEach(docType => {
        formattedData[docType] = cleanAndFormatData(extractedData[docType], docType);
      });
      
      // Include verification methods in the completed data
      onComplete(uploadedDocuments, formattedData, verificationMethods);
    }
  };

  const goToPreviousDocument = () => {
    if (currentDocIndex > 0) {
      setCurrentDocIndex(currentDocIndex - 1);
    }
  };

  // Clean and format extracted data
  const cleanAndFormatData = (data, docType) => {
    if (!data) return {};
    
    // Create a copy to avoid modifying the original
    const cleanData = { ...data };
    
    // Remove any extraction errors
    delete cleanData.extractionError;
    
    // Format specific fields based on document type
    if (docType === "identity" && cleanData.idNumber) {
      // Format Aadhaar number with spaces
      cleanData.idNumber = cleanData.idNumber.replace(/(\d{4})(\d{4})(\d{4})/, "$1 $2 $3");
    } else if (docType === "income" && cleanData.monthlyIncome) {
      // Ensure income has currency symbol
      if (!cleanData.monthlyIncome.startsWith("₹")) {
        cleanData.monthlyIncome = `₹${cleanData.monthlyIncome}`;
      }
    }
    
    return cleanData;
  };

  // Render manual entry form
  const renderManualEntryForm = (docType) => {
    const fields = manualEntryFields[docType] || [];
    
    return (
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-300 mt-4">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Manual Entry Form</h3>
        <div className="space-y-4">
          {fields.map((field) => (
            <div key={field.key} className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              
              {field.type === "select" ? (
                <select
                  value={manualFormData[docType]?.[field.key] || ""}
                  onChange={(e) => handleManualFormChange(docType, field.key, e.target.value)}
                  className="border border-gray-300 rounded-md p-2 text-sm"
                  required={field.required}
                >
                  <option value="">Select {field.label}</option>
                  {field.options.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              ) : field.type === "textarea" ? (
                <textarea
                  value={manualFormData[docType]?.[field.key] || ""}
                  onChange={(e) => handleManualFormChange(docType, field.key, e.target.value)}
                  className="border border-gray-300 rounded-md p-2 text-sm"
                  rows={3}
                  required={field.required}
                />
              ) : (
                <input
                  type={field.type}
                  value={manualFormData[docType]?.[field.key] || ""}
                  onChange={(e) => handleManualFormChange(docType, field.key, e.target.value)}
                  className="border border-gray-300 rounded-md p-2 text-sm"
                  required={field.required}
                />
              )}
            </div>
          ))}
        </div>
        
        <div className="mt-5 flex justify-end space-x-3">
          <button
            onClick={() => toggleManualEntry(docType)}
            className="px-4 py-2 text-sm text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={() => submitManualForm(docType)}
            className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Save Information
          </button>
        </div>
      </div>
    );
  };

  const currentDocType = documentTypes[currentDocIndex];
  const isCurrentDocUploaded = Boolean(uploadedDocuments[currentDocType]);
  const isCurrentDocExtracted = Boolean(extractedData[currentDocType]);
  const currentDocError = validationErrors[currentDocType];
  const isManualEntryActive = manualEntryMode[currentDocType];
  
  const isRequiredDoc = requiredDocTypes.includes(currentDocType);
  const canProceed = isCurrentDocUploaded && isCurrentDocExtracted && 
                    (!isRequiredDoc || !currentDocError);

  // Calculate overall progress
  const completedDocs = documentTypes.filter(docType => 
    uploadedDocuments[docType] && extractedData[docType]
  ).length;
  const overallProgress = Math.round((completedDocs / documentTypes.length) * 100);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl text-blue-600 font-bold mb-2">Document Upload</h2>
        <p className="text-gray-600 mb-4">
          Please upload the required documents one by one. We'll automatically extract the information.
          {isRequiredDoc && <span className="text-red-500 ml-1">*Required</span>}
        </p>
        
        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
          <div 
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
            style={{ width: `${overallProgress}%` }}
          ></div>
        </div>
        
        <div className="flex justify-between text-sm text-gray-500">
          <span>{currentDocIndex + 1} of {documentTypes.length} documents</span>
          <span>{overallProgress}% complete</span>
        </div>
      </div>

      {/* Show manual entry option */}
      <div className="flex justify-end mb-3">
        <button
          onClick={() => toggleManualEntry(currentDocType)}
          className="text-blue-600 text-sm hover:text-blue-800 flex items-center"
        >
          {isManualEntryActive ? "Cancel Manual Entry" : "Enter Details Manually"}
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </button>
      </div>

      {/* Show document upload or manual entry form */}
      {!isManualEntryActive ? (
        <DocumentUpload
          key={currentDocType} // Add key to force remount when document type changes
          documentType={currentDocType}
          onUpload={(docType, file, method) => handleDocumentUpload(docType, file, method)}
          onExtract={handleDataExtraction}
        />
      ) : (
        renderManualEntryForm(currentDocType)
      )}

      {/* Manual correction form for extracted data */}
      {isCurrentDocExtracted && !isManualEntryActive && (
        <div className="mt-4 bg-white p-4 rounded-lg border shadow-sm">
          <h3 className="text-lg font-medium mb-2">Verify or Correct Information</h3>
          
          {currentDocError && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
              <p className="text-red-700 text-sm">{currentDocError}</p>
              <p className="text-sm text-red-600 mt-1">
                Please correct the information or enter details manually.
              </p>
            </div>
          )}
          
          <div className="space-y-3">
            {Object.entries(extractedData[currentDocType] || {}).map(([key, value]) => {
              // Skip internal fields
              if (key === 'extractionError' || key === 'rawText') return null;
              
              // Check if this field is required
              const isRequired = manualEntryFields[currentDocType]?.find(f => f.key === key)?.required;
              
              return (
                <div key={key} className="flex flex-col">
                  <label className="text-sm text-gray-600 mb-1">
                    {formatKey(key)}
                    {isRequired && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  <input 
                    type="text" 
                    value={value || ''}
                    onChange={(e) => handleDataCorrection(currentDocType, key, e.target.value)}
                    className={`border rounded-md p-2 text-sm ${!value && isRequired ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
                  />
                  {!value && isRequired && (
                    <p className="text-xs text-red-500 mt-1">This field is required</p>
                  )}
                </div>
              );
            })}
          </div>
          
          <div className="mt-4 bg-yellow-50 p-3 rounded-md border border-yellow-200">
            <p className="text-sm text-yellow-700">
              <span className="font-medium">Missing information?</span> If any field is missing or incorrect, 
              you can edit it above or <button 
                onClick={() => toggleManualEntry(currentDocType)} 
                className="text-blue-600 underline hover:text-blue-800"
              >
                enter all details manually
              </button>.
            </p>
          </div>
        </div>
      )}

      {/* Navigation buttons */}
      <div className="flex justify-between mt-6">
        <button
          onClick={goToPreviousDocument}
          disabled={currentDocIndex === 0}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 disabled:bg-gray-300"
        >
          Previous
        </button>
        <button
          onClick={goToNextDocument}
          disabled={isRequiredDoc && !canProceed}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-blue-300"
        >
          {currentDocIndex === documentTypes.length - 1 ? "Complete" : "Next"}
        </button>
      </div>
      
      {/* Skip button for non-required documents */}
      {!isRequiredDoc && (
        <div className="text-center mt-3">
          <button
            onClick={goToNextDocument}
            className="text-blue-600 text-sm hover:underline"
          >
            Skip this document
          </button>
          <p className="text-xs text-gray-500 mt-1">
            This document is optional for your application.
          </p>
        </div>
      )}
    </div>
  );
};

// Helper function to format keys
function formatKey(key) {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .replace(/([a-z])([A-Z])/g, '$1 $2');
}

export default DocumentManager;