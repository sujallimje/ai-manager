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

  // Validate the current document's extracted data
  const validateCurrentDoc = (docType, data) => {
    if (!requiredDocTypes.includes(docType)) return null;
    
    const validator = validationRules[docType];
    if (!validator) return null;
    
    return validator(data);
  };

  const handleDocumentUpload = (docType, file) => {
    setUploadedDocuments(prev => ({
      ...prev,
      [docType]: file
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
      
      onComplete(uploadedDocuments, formattedData);
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

  const currentDocType = documentTypes[currentDocIndex];
  const isCurrentDocUploaded = Boolean(uploadedDocuments[currentDocType]);
  const isCurrentDocExtracted = Boolean(extractedData[currentDocType]);
  const currentDocError = validationErrors[currentDocType];
  
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

      {/* Current document upload component */}
      <DocumentUpload
        documentType={currentDocType}
        onUpload={handleDocumentUpload}
        onExtract={handleDataExtraction}
      />

      {/* Manual correction form for extracted data */}
      {isCurrentDocExtracted && (
        <div className="mt-4 bg-white p-4 rounded-lg border shadow-sm">
          <h3 className="text-lg font-medium mb-2">Verify or Correct Information</h3>
          
          {currentDocError && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
              <p className="text-red-700 text-sm">{currentDocError}</p>
            </div>
          )}
          
          <div className="space-y-3">
            {Object.entries(extractedData[currentDocType] || {}).map(([key, value]) => {
              // Skip internal fields
              if (key === 'extractionError' || key === 'rawText') return null;
              
              return (
                <div key={key} className="flex flex-col">
                  <label className="text-sm text-gray-600 mb-1">{formatKey(key)}</label>
                  <input 
                    type="text" 
                    value={value || ''}
                    onChange={(e) => handleDataCorrection(currentDocType, key, e.target.value)}
                    className="border rounded-md p-2 text-sm"
                  />
                </div>
              );
            })}
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