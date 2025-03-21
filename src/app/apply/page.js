"use client";
import { useState, useEffect, useRef } from "react";
import Head from "next/head";
import Webcam from "react-webcam";
import DocumentManager from "../../components/DocumentManager";
import ChatBot from "../../components/ChatBot"; // Import the ChatBot component

export default function Apply() {
  const [step, setStep] = useState(1);
  const [loanType, setLoanType] = useState("");
  const [loanPurpose, setLoanPurpose] = useState("");
  const [loanAmount, setLoanAmount] = useState("");
  const [uploadedDocuments, setUploadedDocuments] = useState({});
  const [extractedData, setExtractedData] = useState({});
  const [applicationStatus, setApplicationStatus] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationComplete, setVerificationComplete] = useState(false);

  // Face monitoring state
  const webcamRef = useRef(null);
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");
  const [countdown, setCountdown] = useState(null);
  const countdownTimerRef = useRef(null);

  /// Start monitoring after verification
  useEffect(() => {
    if (verificationComplete && (step > 4 || step < 4)) {
      startMonitoring();
    }

    return () => {
      if (countdownTimerRef.current) clearTimeout(countdownTimerRef.current);
    };
  }, [verificationComplete, step]);

  const intervalRef = useRef(null); // Store interval reference

  const startMonitoring = () => {
    console.log("Starting webcam monitoring");
  
    if (intervalRef.current) clearInterval(intervalRef.current); // Clear old intervals
  
    intervalRef.current = setInterval(() => {
      if (webcamRef.current && webcamRef.current.video && webcamRef.current.video.readyState === 4) {
        checkUserPresence();
      }
    }, 3000); // Runs every 3 seconds
     // Reduce API calls to every 2 seconds (less load)
  
    return () => clearInterval(intervalRef.current);
  };
  
  const checkUserPresence = async () => {
    if (!webcamRef.current || !webcamRef.current.getScreenshot) {
      console.warn("Webcam not ready, skipping face detection...");
      return;
    }
  
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;
  
    const base64Data = imageSrc.split(",")[1];
  
    try {
      const response = await fetch("/api/face-detection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64Data }),
      });
  
      if (!response.ok) throw new Error("API responded with an error");
  
      const result = await response.json();
  
      if (result.status === "warning") {
        setWarningMessage(result.message);
        setShowWarning(true);
        startCountdown();
      } else {
        setShowWarning(false);
        clearCountdown();
      }
    } catch (error) {
      console.error("Face detection API failed:", error);
      setWarningMessage("Face detection is temporarily unavailable. Please try again later.");
      setShowWarning(true);
    }
  };
  
  

  const startCountdown = () => {
    if (countdownTimerRef.current) return; // Prevent multiple countdowns
  
    setCountdown(10);
    countdownTimerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownTimerRef.current);
          countdownTimerRef.current = null; // Reset reference
          window.location.href = "/";
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };
  
  const clearCountdown = () => {
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    setCountdown(null);
  };

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const handleDocumentsComplete = (documents, data) => {
    setUploadedDocuments(documents);
    setExtractedData(data);
    handleNext();
  };

  const submitApplication = () => {
    setIsVerifying(true);

    // Simulated API call with realistic approval logic
    setTimeout(() => {
      setIsVerifying(false);
      setVerificationComplete(true);

      // For testing only - remove this in production
      const monthlyIncome = extractedData.income?.monthlyIncome
        ? parseFloat(extractedData.income.monthlyIncome.replace(/[^0-9.]/g, ''))
        : 30000; // Default value for testing
      const requestedAmount = parseFloat(loanAmount) || 0;
      const eligibilityRatio = requestedAmount / monthlyIncome;

      // Approval criteria: 
      // - Minimum income ₹25,000
      // - Loan amount up to 10x monthly income
      // - At least 3 documents verified
      const status = monthlyIncome >= 25000 &&
        eligibilityRatio <= 10 &&
        Object.keys(uploadedDocuments).length >= 3
        ? "approved"
        : "rejected";

      setApplicationStatus(status);
    }, 3000);
  };

  const verifyIdentity = () => {
    setIsVerifying(true);

    // Simulate verification process
    setTimeout(() => {
      setIsVerifying(false);
      setVerificationComplete(true);

      // Auto-advance after verification
      setTimeout(() => {
        handleNext();
      }, 1000);
    }, 3000);
  };

  // Video URLs for each step


  const videoUrls = [
    "/videos/s1.mp4", // Video for step 1
    "/videos/s2a.mp4", // Video for step 2a
    "/videos/s2b.mp4", // Video for step 2b
    "/videos/s3.mp4", // Video for step 3
    "/videos/s4.mp4", // Video for step 4
    // Video for step 5
    applicationStatus === "approved"
      ? "/videos/s5.mp4"
      : applicationStatus === "rejected"
        ? "/videos/s6.mp4"
        : "/videos/s7.mp4", // Video for step 6
  ];



  // Step titles for progress indicator
  const stepTitles = [
    "Identity Verification",
    "Loan Information",
    "Loan Details",
    "Documents",
    "Review",
    "Decision"
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Apply for a Loan - CapitalCue</title>
      </Head>

      {/* Progress Bar */}
      <div className="bg-white shadow-sm px-6 py-3">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <img src="/logo.jpeg" alt="CapitalCue" width="40" height="40" />
              <span className="text-2xl font-bold text-blue-600">Capital</span>
              <span className="text-2xl font-bold text-green-500">Cue</span>

            </div>
            <div className="hidden md:flex items-center space-x-1">
              {stepTitles.map((title, index) => (
                <div key={index} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step > index ? 'bg-blue-600 text-white' :
                      step === index + 1 ? 'bg-blue-100 border-2 border-blue-600 text-blue-600' :
                        'bg-gray-200 text-gray-500'
                    }`}>
                    {index + 1}
                  </div>
                  {index < stepTitles.length - 1 && (
                    <div className={`w-12 h-1 ${step > index ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                  )}
                </div>
              ))}
            </div>
            <div className="md:hidden">
              <span className="text-blue-700 font-medium">Step {step} of {stepTitles.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Warning Modal */}
      {showWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-start mb-4">
              <div className="bg-red-100 p-2 rounded-full mr-3">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Security Alert</h3>
                <p className="text-gray-700 mt-1">{warningMessage}</p>
                {countdown !== null && (
                  <p className="text-red-600 font-medium mt-2">
                    Session will end in {countdown} seconds
                  </p>
                )}
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => {
                  clearCountdown();
                  setShowWarning(false);
                  consecutiveNoMovementFrames.current = 0;
                  consecutiveDifferentPersonFrames.current = 0;
                  lastMovementTime.current = Date.now();
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
              >
                Resume Session
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row h-screen">
        {/* Video Section (Left Side on larger screens, Top on mobile) */}
        <div className="lg:w-1/2 bg-gray-900 lg:h-screen sticky top-0 overflow-hidden">
          <div className="relative w-full h-64 lg:h-full">
            {/* Pre-recorded Video */}
            <video key={step} autoPlay loop className="absolute w-full h-full lg:max-h-[100vh] object-cover">
              <source src={videoUrls[step - 1]} type="video/mp4" />
              Your browser does not support the video tag.
            </video>

            {/* Webcam Feed */}
            <div className="absolute bottom-16 right-4 w-1/4 h-1/4 max-w-[200px] max-h-[150px] bg-black rounded-lg shadow-lg overflow-hidden border-2 border-blue-400">
              <Webcam
                ref={webcamRef}
                audio={false}
                mirrored={true}
                screenshotFormat="image/jpeg"
                width="100%"
                height="100%"
                className="object-cover"
              />
            </div>
          </div>
        </div>

        {/* Form Section (Right Side on larger screens, Bottom on mobile) */}
        <div className="lg:w-1/2 w-full overflow-y-auto bg-white">

          <div className="p-6 lg:p-12 max-w-2xl mx-auto">
            <div className="mb-8">
              <h2 className="text-xl lg:text-3xl font-bold text-gray-800">{stepTitles[step - 1]}</h2>
              <div className="h-1 w-20 bg-blue-500 mt-2"></div>
            </div>

            {step === 1 && (
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <p className="text-gray-700 mb-6">
                  Please adjust your camera so that your face is clearly visible.
                  Make sure you're in a well-lit area and position your face in
                  the center of the frame.
                </p>
                <div className="bg-blue-50 p-4 rounded-lg mb-6 border-l-4 border-blue-500">
                  <p className="text-blue-800">
                    Look straight into the camera and follow the instructions for accurate verification.
                  </p>
                </div>

                {!isVerifying && !verificationComplete ? (
                  <button
                    onClick={verifyIdentity}
                    className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
                  >
                    Verify My Identity
                  </button>
                ) : isVerifying ? (
                  <div className="flex flex-col items-center py-6">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-gray-700 font-medium">Verifying your identity...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="bg-green-50 text-green-800 p-4 rounded-lg flex items-center mb-6 w-full border border-green-200">
                      <svg className="w-6 h-6 mr-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span className="text-green-800 font-medium">Identity verified successfully!</span>
                    </div>
                    <button
                      onClick={handleNext}
                      className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
                    >
                      Continue to Next Step
                    </button>
                  </div>
                )}
              </div>
            )}

            {step === 2 && (
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h3 className="text-xl text-blue-600 font-bold mb-4">
                  Hello! I'm Rohan, your Virtual Branch Manager.
                </h3>
                <p className="text-gray-700 mb-6">
                  I'll guide you through the loan application process. This will
                  take just a few minutes. Let's get started!
                </p>

                <label className="block text-gray-800 font-medium mb-2">
                  What type of loan are you interested in?
                </label>
                <select
                  className="text-gray-800 w-full p-3 border border-gray-300 rounded-lg mb-6 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-colors"
                  onChange={(e) => setLoanType(e.target.value)}
                  value={loanType}
                >
                  <option value="">Select Loan Type</option>
                  <option value="personal">Personal Loan</option>
                  <option value="home">Home Loan</option>
                  <option value="business">Business Loan</option>
                  <option value="education">Education Loan</option>
                  <option value="vehicle">Vehicle Loan</option>
                </select>

                <div className="flex justify-between mt-6">
                  <button
                    onClick={handleBack}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={!loanType}
                    className={`px-6 py-2 rounded-lg text-white font-medium ${!loanType ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 transition-colors'
                      }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h3 className="text-xl text-blue-600 font-bold mb-4">
                  Tell us more about your loan requirements
                </h3>

                <div className="mb-6">
                  <label className="block text-gray-800 font-medium mb-2">
                    What is the purpose of this loan?
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Home renovation, Education fees, Medical expenses"
                    className="w-full p-3 text-gray-800 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-colors"
                    value={loanPurpose}
                    onChange={(e) => setLoanPurpose(e.target.value)}
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-gray-800 font-medium mb-2">
                    How much would you like to borrow?
                  </label>
                  <div className="text-gray-800 relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-600 font-medium">₹</span>
                    <input
                      type="number"
                      placeholder="Enter amount"
                      className="w-full p-3 text-gray-800 pl-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-colors"
                      value={loanAmount}
                      onChange={(e) => setLoanAmount(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex justify-between mt-6">
                  <button
                    onClick={handleBack}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={!loanPurpose || !loanAmount}
                    className={`px-6 py-2 rounded-lg text-white font-medium ${!loanPurpose || !loanAmount ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 transition-colors'
                      }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <DocumentManager onComplete={handleDocumentsComplete} />
              </div>
            )}

            {step === 5 && (
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h3 className="text-xl text-blue-600 font-bold mb-4">
                  Review Your Application
                </h3>

                {!isVerifying && !verificationComplete ? (
                  <div>
                    <div className="bg-gray-50 p-6 rounded-lg mb-6 border border-gray-200">
                      <h4 className="text-lg font-medium text-gray-800 mb-4">Application Summary</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between border-b border-gray-200 pb-2">
                          <span className="text-gray-600">Loan Type:</span>
                          <span className="font-medium text-gray-800">{loanType.charAt(0).toUpperCase() + loanType.slice(1)} Loan</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-200 pb-2">
                          <span className="text-gray-600">Purpose:</span>
                          <span className="font-medium text-gray-800">{loanPurpose}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-200 pb-2">
                          <span className="text-gray-600">Amount:</span>
                          <span className="font-medium text-gray-800">₹{Number(loanAmount).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Documents Submitted:</span>
                          <span className="font-medium text-gray-800">{Object.keys(uploadedDocuments).length}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={submitApplication}
                      className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
                    >
                      Submit Application
                    </button>

                    <button
                      onClick={handleBack}
                      className="w-full mt-4 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                    >
                      Go Back to Edit
                    </button>
                  </div>
                ) : isVerifying ? (
                  <div className="flex flex-col items-center py-12">
                    <div className="animate-spin rounded-full h-14 w-14 border-t-2 border-b-2 border-blue-600 mb-6"></div>
                    <p className="text-gray-700 text-lg font-medium">Processing your application...</p>
                    <p className="text-gray-500 mt-2">This will take just a moment</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center py-6">
                    <div className="bg-green-50 text-green-800 p-4 rounded-lg flex items-center mb-6 w-full border border-green-200">
                      <svg className="w-6 h-6 mr-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span className="text-green-800 font-medium">Application processed successfully!</span>
                    </div>
                    <button
                      onClick={handleNext}
                      className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
                    >
                      View Loan Decision
                    </button>
                  </div>
                )}
              </div>
            )}

            {step === 6 && (
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                {applicationStatus === "approved" ? (
                  <div>
                    <div className="text-center mb-6">
                      <div className="inline-flex items-center justify-center bg-green-100 rounded-full p-4 mb-4">
                        <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                      </div>
                      <h3 className="text-2xl font-bold text-green-600 mb-2">
                        Congratulations!
                      </h3>
                      <p className="text-xl text-gray-700">
                        Your loan application has been approved.
                      </p>
                    </div>

                    <div className="bg-green-50 p-6 rounded-lg mb-6 border border-green-200">
                      <h4 className="text-lg font-medium text-gray-800 mb-3">Approval Details</h4>
                      <div className="space-y-2">
                        <p className="text-gray-700">
                          <strong>Approved Amount:</strong> ₹{Number(loanAmount).toLocaleString()}
                        </p>
                        <p className="text-gray-700">
                          <strong>Interest Rate:</strong> 12.5% p.a.
                        </p>
                        <p className="text-gray-700">
                          <strong>Reason for Approval:</strong> Met all eligibility criteria including income requirements and document verification.
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                      <button className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm">
                        Download Approval Letter
                      </button>
                      <button className="flex-1 border border-blue-600 text-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors font-medium">
                        View Repayment Schedule
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="text-center mb-6">
                      <div className="inline-flex items-center justify-center bg-red-100 rounded-full p-4 mb-4">
                        <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-800 mb-2">
                        Application Not Approved
                      </h3>
                      <p className="text-gray-600">
                        We're unable to approve your loan application at this time.
                      </p>
                    </div>

                    <div className="bg-red-50 p-6 rounded-lg mb-6 border border-red-200">
                      <h4 className="text-lg font-medium text-gray-800 mb-3">Rejection Reasons</h4>
                      <ul className="list-disc pl-6 space-y-2">
                        <li className="text-gray-700">
                          Income-to-loan ratio ({extractedData.income?.monthlyIncome ? (Number(loanAmount) / parseFloat(extractedData.income.monthlyIncome.replace(/[^0-9.]/g, ''))).toFixed(1) : 'N/A'}x) exceeds maximum allowed limit (10x)
                        </li>
                        <li className="text-gray-700">
                          {Object.keys(uploadedDocuments).length < 3 ? 'Insufficient documents submitted' : 'Document verification issues'}
                        </li>
                        <li className="text-gray-700">
                          Credit history not meeting our current criteria
                        </li>
                      </ul>
                    </div>

                    <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                      <button className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm">
                        Speak to Loan Officer
                      </button>
                      <button className="flex-1 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                        Try Different Amount
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <ChatBot />
    </div>
  );
}