import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Webcam from "react-webcam";

const DocumentUpload = ({ documentType, onUpload, onExtract }) => {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [extractionProgress, setExtractionProgress] = useState(0);
  const [error, setError] = useState(null);
  const [detailedError, setDetailedError] = useState(null);
  
  // New state for video verification
  const [verificationMethod, setVerificationMethod] = useState("upload"); // "upload" or "video"
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const webcamRef = useRef(null);
  
  // Reset state when document type changes
  useEffect(() => {
    resetState();
  }, [documentType]);
  
  // Function to reset the component state
  const resetState = () => {
    setFile(null);
    setPreviewUrl(null);
    setIsUploading(false);
    setIsExtracting(false);
    setExtractedData(null);
    setExtractionProgress(0);
    setError(null);
    setDetailedError(null);
    setCapturedImage(null);
    setIsCapturing(false);
  };

  const handleFileChange = (e) => {
    setError(null);
    setDetailedError(null);
    setExtractedData(null); // Clear previous extracted data when selecting a new file
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Check file size (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError("File is too large. Maximum size is 10MB.");
        return;
      }
      
      // Check file type
      const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
      if (!validTypes.includes(selectedFile.type)) {
        setError("Invalid file type. Please upload a JPEG, PNG, or PDF file.");
        return;
      }
      
      setFile(selectedFile);
      const fileReader = new FileReader();
      fileReader.onload = () => {
        setPreviewUrl(fileReader.result);
      };
      fileReader.readAsDataURL(selectedFile);
    }
  };

  const startVideoCapture = () => {
    setIsCapturing(true);
    setCapturedImage(null);
    setError(null);
    setDetailedError(null);
    setExtractedData(null); // Clear previous extracted data when starting capture
  };

  const captureDocument = () => {
    if (!webcamRef.current) return;
    
    try {
      const imageSrc = webcamRef.current.getScreenshot();
      if (!imageSrc) {
        setError("Failed to capture image. Please try again.");
        return;
      }
      
      setCapturedImage(imageSrc);
      setIsCapturing(false);
      
      // Convert base64 image to a file object for processing
      fetch(imageSrc)
        .then(res => res.blob())
        .then(blob => {
          const imageFile = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
          setFile(imageFile);
          setPreviewUrl(imageSrc);
          
          // Automatically process the captured image
          processCapture(imageFile);
        })
        .catch(err => {
          console.error("Error creating file from capture:", err);
          setError("Failed to process captured image.");
        });
    } catch (err) {
      console.error("Error during capture:", err);
      setError("Failed to capture image. Please ensure camera access is allowed.");
    }
  };
  
  const processCapture = async (imageFile) => {
    try {
      setIsUploading(true);
      setError(null);
      
      // Create form data for API
      const formData = new FormData();
      formData.append('file', imageFile);
      formData.append('documentType', documentType);
      formData.append('source', 'camera_capture');
      
      // Notify parent component about upload
      onUpload(documentType, imageFile);
      
      // Start extraction process
      await extractDocumentData(formData);
      
    } catch (error) {
      console.error("Error processing captured document:", error);
      setError("Failed to process document from camera. Please try again or use file upload.");
    } finally {
      setIsUploading(false);
    }
  };

  const uploadDocument = async () => {
    if (!file) return;
    
    try {
      setIsUploading(true);
      setError(null);
      setDetailedError(null);
      
      // Create form data to send to API
      const formData = new FormData();
      formData.append('file', file);
      formData.append('documentType', documentType);
      
      // Notify parent component about upload
      onUpload(documentType, file);
      
      // Start extraction process
      await extractDocumentData(formData);
      
    } catch (error) {
      console.error("Error uploading document:", error);
      setError("Failed to upload document. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const extractDocumentData = async (formData) => {
    setIsExtracting(true);
    setExtractionProgress(10);
    
    try {
      // Simulate progress (since we can't get real-time progress from Python)
      const progressInterval = setInterval(() => {
        setExtractionProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 500);
      
      // Send to our API endpoint
      const response = await fetch('/api/extract-document', {
        method: 'POST',
        body: formData,
      });
      
      clearInterval(progressInterval);
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || result.message || 'Failed to extract document data');
      }
      
      setExtractionProgress(100);
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      // Format data for display based on document type
      const processedData = formatDataForDisplay(result.data, documentType);
      
      setExtractedData(processedData);
      onExtract(documentType, processedData);
      
    } catch (error) {
      console.error("Error extracting document data:", error);
      setError("Failed to extract document data. Please try a clearer image or enter details manually.");
      
      // Store detailed error for debugging
      if (error.response) {
        try {
          const errorDetails = await error.response.text();
          setDetailedError(errorDetails);
          console.error("Detailed error:", errorDetails);
        } catch (e) {
          console.error("Could not get detailed error:", e);
        }
      }
      
      // Provide minimal extracted data
      const fallbackData = {
        extractionError: "Could not fully process document. Please verify or enter information manually.",
        documentType: documentType
      };
      setExtractedData(fallbackData);
      onExtract(documentType, fallbackData);
    } finally {
      setIsExtracting(false);
      setExtractionProgress(100);
    }
  };
  
  // Format data based on document type (unchanged)
  const formatDataForDisplay = (data, docType) => {
    const formattedData = { ...data };
    
    // Remove empty values
    Object.keys(formattedData).forEach(key => {
      if (!formattedData[key]) {
        delete formattedData[key];
      }
    });
    
    // Remove technical fields users don't need to see
    delete formattedData.document_type;
    delete formattedData.id_type;
    
    // Rename fields for better display
    if (docType === 'identity') {
      if (formattedData.id_number) {
        formattedData.idNumber = formattedData.id_number;
        delete formattedData.id_number;
      }
      if (formattedData.father_name) {
        formattedData.fatherName = formattedData.father_name;
        delete formattedData.father_name;
      }
    }
    else if (docType === 'pan') {
      if (formattedData.id_number) {
        formattedData.panNumber = formattedData.id_number;
        delete formattedData.id_number;
      }
      if (formattedData.father_name) {
        formattedData.fatherName = formattedData.father_name;
        delete formattedData.father_name;
      }
    } else if (docType === 'income') {
      if (formattedData.monthly_income) {
        formattedData.monthlyIncome = formattedData.monthly_income;
        delete formattedData.monthly_income;
      }
      if (formattedData.employer_name) {
        formattedData.employerName = formattedData.employer_name;
        delete formattedData.employer_name;
      }
      if (formattedData.employee_name) {
        formattedData.employeeName = formattedData.employee_name;
        delete formattedData.employee_name;
      }
      if (formattedData.employee_id) {
        formattedData.employeeId = formattedData.employee_id;
        delete formattedData.employee_id;
      }
      if (formattedData.pay_period) {
        formattedData.payPeriod = formattedData.pay_period;
        delete formattedData.pay_period;
      }
    } else if (docType === 'address') {
      // No specific renames needed for address fields
    } else if (docType === 'bank') {
      if (formattedData.account_number) {
        formattedData.accountNumber = formattedData.account_number;
        delete formattedData.account_number;
      }
      if (formattedData.account_holder) {
        formattedData.accountHolder = formattedData.account_holder;
        delete formattedData.account_holder;
      }
      if (formattedData.ifsc_code) {
        formattedData.ifscCode = formattedData.ifsc_code;
        delete formattedData.ifsc_code;
      }
      if (formattedData.account_balance) {
        formattedData.accountBalance = formattedData.account_balance;
        delete formattedData.account_balance;
      }
      if (formattedData.statement_period) {
        formattedData.statementPeriod = formattedData.statement_period;
        delete formattedData.statement_period;
      }
      if (formattedData.bank_name) {
        formattedData.bankName = formattedData.bank_name;
        delete formattedData.bank_name;
      }
    }
    
    return formattedData;
  };

  // Get title based on document type (unchanged)
  const getDocumentTitle = () => {
    switch (documentType) {
      case 'identity':
        return 'Identity Proof (Aadhaar Card)';
      case 'income':
        return 'Income Proof (Salary Slip/Form 16)';
      case 'pan':
        return 'PAN Card';
      case 'address':
        return 'Address Proof (Utility Bill/Rental Agreement)';
      case 'bank':
        return 'Bank Statement';
      case 'collateral':
        return 'Collateral Document';
      default:
        return 'Document Upload';
    }
  };

  // Render extracted data as key-value pairs (unchanged)
  const renderExtractedData = () => {
    if (!extractedData) return null;
    
    // If there was an extraction error, show special message
    if (extractedData.extractionError) {
      return (
        <div className="bg-yellow-50 p-4 rounded-md mt-4">
          <p className="text-amber-700">{extractedData.extractionError}</p>
        </div>
      );
    }
    
    return (
      <div className="bg-green-50 p-4 rounded-md mt-4">
        <h3 className="text-lg font-medium text-green-800 mb-2">Extracted Information</h3>
        <div className="grid grid-cols-1 gap-2">
          {Object.entries(extractedData).map(([key, value]) => (
            <div key={key} className="flex border-b border-green-100 pb-1">
              <span className="font-medium text-green-700 w-1/3 capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}:
              </span>
              <span className="text-gray-800 w-2/3">{value}</span>
            </div>
          ))}
        </div>
        <p className="text-sm text-green-600 mt-3">
          Please verify this information and make corrections if needed.
        </p>
      </div>
    );
  };

  return (
    <div className="border rounded-lg p-4 mb-6 bg-white shadow-sm">
      <h2 className="text-xl font-semibold mb-4">{getDocumentTitle()}</h2>
      
      {/* Method Selection */}
      <div className="mb-4 border-b pb-4">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Choose Verification Method</h3>
        <div className="flex space-x-4">
          <button
            className={`px-4 py-2 rounded-md ${verificationMethod === 'upload' ? 'bg-indigo-100 text-indigo-700 border border-indigo-300' : 'bg-gray-100 text-gray-700 border border-gray-300'}`}
            onClick={() => {
              setVerificationMethod('upload');
              setIsCapturing(false);
            }}
          >
            File Upload
          </button>
          <button
            className={`px-4 py-2 rounded-md ${verificationMethod === 'video' ? 'bg-indigo-100 text-indigo-700 border border-indigo-300' : 'bg-gray-100 text-gray-700 border border-gray-300'}`}
            onClick={() => {
              setVerificationMethod('video');
            }}
          >
            Verify by Video
          </button>
        </div>
      </div>
      
      {/* File Upload Method */}
      {verificationMethod === 'upload' && !isCapturing && (
        <>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Document
            </label>
            <div className="flex items-center justify-center w-full">
              <label 
                className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg className="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                  </svg>
                  <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                  <p className="text-xs text-gray-500">PNG, JPG or PDF (Max 10MB)</p>
                </div>
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/png, image/jpeg, application/pdf" 
                  onChange={handleFileChange}
                  disabled={isUploading || isExtracting}
                />
              </label>
            </div>
          </div>
        
          {/* Preview area */}
          {previewUrl && verificationMethod === 'upload' && (
            <div className="mt-4 mb-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Document Preview</h3>
              <div className="relative h-48 border rounded-md overflow-hidden">
                <Image 
                  src={previewUrl} 
                  alt="Document preview" 
                  fill 
                  style={{ objectFit: 'contain' }} 
                />
              </div>
            </div>
          )}
        </>
      )}
      
      {/* Video Verification Method */}
      {verificationMethod === 'video' && (
        <div className="mb-4">
          <div className="bg-gray-50 p-4 rounded-lg mb-4 border border-gray-200">
            <p className="text-gray-700 mb-2 font-medium">Verify by Video</p>
            <p className="text-sm text-gray-600 mb-4">
              Position your {documentType === 'identity' ? 'ID card' : 'document'} clearly in front of the camera, 
              ensuring good lighting and that all text is visible. When ready, click "Capture Document".
            </p>
          </div>
          
          {!isCapturing && !capturedImage && (
            <button
              onClick={startVideoCapture}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors w-full"
            >
              Start Camera
            </button>
          )}
          
          {isCapturing && (
            <div className="relative mb-4">
              <div className="relative h-80 border-2 border-indigo-500 rounded-md overflow-hidden">
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  width="100%"
                  height="100%"
                  className="object-contain"
                  videoConstraints={{
                    facingMode: "environment" // Use back camera on mobile devices
                  }}
                />
              </div>
              <div className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center pointer-events-none">
                <div className="border-2 border-dashed border-yellow-500 w-4/5 h-3/5 opacity-50"></div>
              </div>
              <p className="text-center text-sm text-gray-600 mt-2">
                Position your document inside the yellow outline
              </p>
              <div className="flex justify-center mt-4">
                <button
                  onClick={captureDocument}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                >
                  Capture Document
                </button>
                <button
                  onClick={() => setIsCapturing(false)}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors ml-4"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
          
          {capturedImage && (
            <div className="mt-4 mb-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Captured Document</h3>
              <div className="relative h-48 border rounded-md overflow-hidden">
                <Image 
                  src={capturedImage} 
                  alt="Captured document" 
                  fill 
                  style={{ objectFit: 'contain' }} 
                />
              </div>
              {!isExtracting && !extractedData && (
                <div className="flex mt-2">
                  <button
                    onClick={startVideoCapture}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors mr-2"
                  >
                    Retake
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <div className="bg-red-50 p-3 rounded-md mt-3">
          <p className="text-red-600 text-sm">{error}</p>
          {detailedError && (
            <details className="mt-2">
              <summary className="text-xs text-red-500 cursor-pointer">Show technical details</summary>
              <pre className="mt-1 text-xs bg-red-100 p-2 rounded overflow-x-auto">
                {typeof detailedError === 'string' ? detailedError : JSON.stringify(detailedError, null, 2)}
              </pre>
            </details>
          )}
        </div>
      )}
      
      {/* Progress indicator */}
      {isExtracting && (
        <div className="mt-4">
          <p className="text-sm text-gray-600 mb-1">
            {extractionProgress < 100 ? "Extracting document data..." : "Extraction complete!"}
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-blue-600 h-2.5 rounded-full" 
              style={{ width: `${extractionProgress}%` }}
            ></div>
          </div>
        </div>
      )}
      
      {/* Extracted data display */}
      {extractedData && renderExtractedData()}
      
      {/* Upload button */}
      {verificationMethod === 'upload' && !isCapturing && (
        <div className="mt-4">
          <button
            onClick={uploadDocument}
            disabled={!file || isUploading || isExtracting}
            className={`px-4 py-2 rounded-md text-white ${
              !file || isUploading || isExtracting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isUploading || isExtracting ? 'Processing...' : 'Process Document'}
          </button>
        </div>
      )}
    </div>
  );
};

export default DocumentUpload;