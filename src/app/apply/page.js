"use client";
import { useState, useEffect, useRef } from "react";
import Head from "next/head";
import Webcam from "react-webcam";
import DocumentManager from "../../components/DocumentManager";
import ChatBot from "../../components/ChatBot";
import LoanQuestionnaire from "../../components/LoanQuestionnaire";


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
  const [loanStatus, setLoanStatus] = useState(null);
  
  // Face monitoring state
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");
  const [countdown, setCountdown] = useState(null);
  const lastMovementTime = useRef(Date.now());
  const previousFrame = useRef(null);
  const monitoringIntervalRef = useRef(null);
  const countdownTimerRef = useRef(null);
  const consecutiveNoMovementFrames = useRef(0);
  const consecutiveDifferentPersonFrames = useRef(0);
  const [loanAnswers, setLoanAnswers] = useState({});

  /// Start monitoring after verification
  useEffect(() => {
    if (verificationComplete && (step > 4 || step < 4)) {
      startMonitoring();
    }

    return () => {
      if (monitoringIntervalRef.current) clearInterval(monitoringIntervalRef.current);
      if (countdownTimerRef.current) clearTimeout(countdownTimerRef.current);
    };
  }, [verificationComplete, step]);

  const startMonitoring = () => {
    // Create a canvas element for frame analysis
    if (!canvasRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = 320;
      canvas.height = 240;
      canvasRef.current = canvas;
    }

    console.log("Starting webcam monitoring");

    monitoringIntervalRef.current = setInterval(() => {
      if (webcamRef.current && webcamRef.current.video && webcamRef.current.video.readyState === 4) {
        checkUserPresence();
      }
    }, 1000);
  };

  const checkUserPresence = () => {
    const video = webcamRef.current.video;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    // Draw current video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Get image data from canvas
    const currentFrame = context.getImageData(0, 0, canvas.width, canvas.height);
    const currentImageData = currentFrame.data;

    if (!previousFrame.current) {
      // First frame, store it as reference
      previousFrame.current = currentFrame;
      return;
    }

    const previousImageData = previousFrame.current.data;
    let significantDiffPixels = 0;

    // Adjusted thresholds
    let diffThreshold = 50; // Increased from 30 to 50 to reduce sensitivity to lighting changes
    let majorChangeThreshold = canvas.width * canvas.height * 0.25; // Increased from 15% to 25% of pixels
    let movementThreshold = canvas.width * canvas.height * 0.01; // 1% of pixels showing movement
    let requiredFramesForChange = 5; // Increased from 3 to 5 consecutive frames for confirmation

    // Compare pixels to detect movement
    for (let i = 0; i < currentImageData.length; i += 4) {
      const rDiff = Math.abs(currentImageData[i] - previousImageData[i]);
      const gDiff = Math.abs(currentImageData[i + 1] - previousImageData[i + 1]);
      const bDiff = Math.abs(currentImageData[i + 2] - previousImageData[i + 2]);

      if (rDiff > diffThreshold || gDiff > diffThreshold || bDiff > diffThreshold) {
        significantDiffPixels++;
      }
    }

    const currentTime = Date.now();

    // Check for major changes that might indicate a different person
    if (significantDiffPixels > majorChangeThreshold) {
      consecutiveDifferentPersonFrames.current++;

      if (consecutiveDifferentPersonFrames.current >= requiredFramesForChange && !showWarning) {
        setWarningMessage("Warning: Different person detected. This is not allowed during the application process.");
        setShowWarning(true);
        startCountdown();
      }
    } else {
      consecutiveDifferentPersonFrames.current = 0;
    }

    // Check if there's movement
    if (significantDiffPixels > movementThreshold) {
      lastMovementTime.current = currentTime;
      consecutiveNoMovementFrames.current = 0;

      if (showWarning && warningMessage.includes("No movement detected")) {
        setShowWarning(false);
        clearCountdown();
      }
    } else {
      consecutiveNoMovementFrames.current++;

      if (consecutiveNoMovementFrames.current >= 4 && !showWarning) {
        const timeWithoutMovement = currentTime - lastMovementTime.current;

        if (timeWithoutMovement > 4000) {
          setWarningMessage("Warning: No movement detected. Are you still there? Session may end if you don't return.");
          setShowWarning(true);
          startCountdown();
        }
      }
    }

    // Update previous frame reference
    previousFrame.current = currentFrame;
  };

  const startCountdown = () => {
    setCountdown(10); // 10 seconds until session ends

    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
    }

    countdownTimerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownTimerRef.current);
          window.location.href = "/session-ended";
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

    setTimeout(() => {
      setIsVerifying(false);
      setVerificationComplete(true);

      const monthlyIncome = extractedData.income?.monthlyIncome
        ? parseFloat(extractedData.income.monthlyIncome.replace(/[^0-9.]/g, ''))
        : 30000;
      const requestedAmount = parseFloat(loanAnswers.loanAmount) || 0;
      const eligibilityRatio = requestedAmount / monthlyIncome;

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



  const stepTitles = [
    "Identity Verification",
    "Loan Application",
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
                <h3 className="text-xl text-blue-600 font-bold mb-4">Select Loan Type</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {['personal', 'home', 'business', 'education', 'vehicle'].map((type) => (
                    <button
                      key={type}
                      onClick={() => {
                        setLoanType(type);
                        handleNext();
                      }}
                      className="p-4 border rounded-lg hover:bg-blue-50 transition-colors text-left"
                    >
                      <h4 className="text-lg font-medium capitalize">{type} Loan</h4>
                      <p className="text-sm text-gray-600 mt-2">
                        {{
                          personal: "For personal needs and expenses",
                          home: "Home purchase or renovation",
                          business: "Business expansion and growth",
                          education: "Educational expenses",
                          vehicle: "Vehicle purchase"
                        }[type]}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 3 && (
              <LoanQuestionnaire
                loanType={loanType} // Make sure to pass loanType prop
                onComplete={(answers) => {
                  setLoanAnswers(answers);
                  handleNext();
                }}
              />
            )}


            {step === 4 && (
              <DocumentManager onComplete={(docs, data) => {
                setUploadedDocuments(docs);
                setExtractedData(data);
                handleNext();
              }} />
            )}

            {step === 5 && (
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h3 className="text-xl text-blue-600 font-bold mb-4">Review Your Application</h3>

                <div className="bg-gray-50 p-6 rounded-lg mb-6 border border-gray-200">
                  <h4 className="text-lg font-medium text-gray-800 mb-4">Application Summary</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between border-b border-gray-200 pb-2">
                      <span className="text-gray-600">Loan Type:</span>
                      <span className="font-medium text-gray-800 capitalize">{loanAnswers.loanType} Loan</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-200 pb-2">
                      <span className="text-gray-600">Purpose:</span>
                      <span className="font-medium text-gray-800">{loanAnswers.purpose || 'Not specified'}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-200 pb-2">
                      <span className="text-gray-600">Amount:</span>
                      <span className="font-medium text-gray-800">
                        ₹{Number(loanAnswers.loanAmount).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-gray-200 pb-2">
                      <span className="text-gray-600">Tenure:</span>
                      <span className="font-medium text-gray-800">{loanAnswers.tenure || 'Not specified'}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-200 pb-2">
                      <span className="text-gray-600">Monthly Income:</span>
                      <span className="font-medium text-gray-800">
                        ₹{(extractedData.income?.monthlyIncome || '0').replace(/[^0-9.]/g, '')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Documents Submitted:</span>
                      <span className="font-medium text-gray-800">
                        {Object.keys(uploadedDocuments).length} files
                      </span>
                    </div>
                  </div>
                </div>

                {!isVerifying && !verificationComplete ? (
                  <div className="space-y-4">
                    <button
                      onClick={submitApplication}
                      className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
                    >
                      Submit Application
                    </button>
                    <button
                      onClick={handleBack}
                      className="w-full px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                    >
                      Go Back to Documents
                    </button>
                  </div>
                ) : isVerifying ? (
                  <div className="flex flex-col items-center py-12">
                    <div className="animate-spin rounded-full h-14 w-14 border-t-2 border-b-2 border-blue-600 mb-6"></div>
                    <p className="text-gray-700 text-lg font-medium">Processing your application...</p>
                    <p className="text-gray-500 mt-2">This will take just a moment</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="bg-green-50 text-green-800 p-4 rounded-lg flex items-center mb-6 w-full border border-green-200">
                      <svg className="w-6 h-6 mr-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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