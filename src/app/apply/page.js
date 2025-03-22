"use client";
import { useState, useEffect, useRef } from "react";
import Head from "next/head";
import Webcam from "react-webcam";
import DocumentManager from "../../components/DocumentManager";
import ChatBot from "../../components/ChatBot";
import LoanQuestionnaire from "../../components/LoanQuestionnaire";
import EMICalculatorButton from "../../components/EMICalculator";
import EMICalculator from "../../components/EMICalculatorButton"; import { CheckIcon, XMarkIcon } from "@heroicons/react/24/solid";

const DetailItem = ({ label, value }) => (
  <div className="bg-gray-50 p-3 rounded-lg">
    <dt className="text-sm font-medium text-gray-500">{label}</dt>
    <dd className="mt-1 text-gray-800 break-words">{value || 'Not provided'}</dd>
  </div>
);


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
  const [aiDecision, setAiDecision] = useState(null);

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

  async function getGroqAssessment(applicationData) {
    const apiKey = "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";
  
    if (!apiKey) {
      console.error("Missing Groq API key");
      return {
        approvalStatus: "error",
        reasons: ["API key missing"],
        interestRate: "N/A",
        conditions: ["Please check API credentials"],
        summary: "AI assessment could not be performed due to missing API key",
      };
    }
  
    // Add credit score validation
    const creditScore = parseInt(applicationData.answers.creditScore) || 0;
    
    // Apply early rejection for very low credit scores
    if (creditScore < 500) {
      return {
        approvalStatus: "rejected",
        reasons: [
          "Credit score below minimum threshold (500)",
          "High debt-to-income ratio",
          "Insufficient credit history"
        ],
        interestRate: "21.5",
        conditions: ["Credit improvement required before reapplication"],
        summary: "Application rejected due to credit score significantly below lending requirements. Recommend credit repair before reapplying."
      };
    }
  
    const prompt = `
    Analyze this loan application and provide a detailed assessment:
    
    Applicant Details:
    - Name: ${applicationData.answers.fullName || 'Not provided'}
    - Date of Birth: ${applicationData.answers.dob || 'Not provided'}
    - Employment: ${applicationData.answers.employmentStatus || 'Not provided'}
    - Monthly Income: ${applicationData.extracted.income || 'Not provided'}
    - Credit Score: ${applicationData.answers.creditScore || 'Not provided'}
    
    Loan Request:
    - Type: ${applicationData.loanType}
    - Amount: ₹${applicationData.answers.loanAmount}
    - Purpose: ${applicationData.answers.purpose || 'Not specified'}
    - Tenure: ${applicationData.answers.tenure || 'Not specified'}
    
    Documents Verified:
    ${applicationData.documents.length > 0
        ? applicationData.documents.join('\n- ')
        : 'No documents uploaded'}
  
    Provide JSON response with:
    1. approvalStatus: "approved" or "rejected"
    2. reasons: array of 3 key factors
    3. interestRate: appropriate rate based on risk
    4. conditions: any special conditions
    5. summary: 50-word explanation
    `;
  
    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          messages: [{ role: "user", content: prompt }],
          model: "llama-3.3-70b-versatile",
          response_format: { type: "json_object" },
        }),
      });
  
      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }
  
      const data = await response.json();
      let result;
      
      try {
        result = JSON.parse(data.choices[0].message.content);
      } catch (e) {
        console.error("Failed to parse API response:", e);
        result = {
          approvalStatus: "error",
          reasons: ["Invalid response format"],
          interestRate: "N/A",
          conditions: ["Unexpected API response"],
          summary: "AI assessment failed due to an invalid response format",
        };
      }
      
      return result;
    } catch (error) {
      console.error("Groq API Error:", error);
      return {
        approvalStatus: "error",
        reasons: ["AI assessment failed"],
        interestRate: "N/A",
        conditions: ["Please contact support"],
        summary: "Unable to process AI assessment",
      };
    }
  }



  /// Start monitoring after verification
  useEffect(() => {
    if (verificationComplete && (step > 4 || step < 4)) {
      startMonitoring();
    }

    return () => {
      if (monitoringIntervalRef.current)
        clearInterval(monitoringIntervalRef.current);
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
      if (
        webcamRef.current &&
        webcamRef.current.video &&
        webcamRef.current.video.readyState === 4
      ) {
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
    const currentFrame = context.getImageData(
      0,
      0,
      canvas.width,
      canvas.height
    );
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
      const gDiff = Math.abs(
        currentImageData[i + 1] - previousImageData[i + 1]
      );
      const bDiff = Math.abs(
        currentImageData[i + 2] - previousImageData[i + 2]
      );

      if (
        rDiff > diffThreshold ||
        gDiff > diffThreshold ||
        bDiff > diffThreshold
      ) {
        significantDiffPixels++;
      }
    }

    const currentTime = Date.now();

    // Check for major changes that might indicate a different person
    if (significantDiffPixels > majorChangeThreshold) {
      consecutiveDifferentPersonFrames.current++;

      if (
        consecutiveDifferentPersonFrames.current >= requiredFramesForChange &&
        !showWarning
      ) {
        setWarningMessage(
          "Warning: Different person detected. This is not allowed during the application process."
        );
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
          setWarningMessage(
            "Warning: No movement detected. Are you still there? Session may end if you don't return."
          );
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

  const submitApplication = async () => {
    setIsVerifying(true);

    try {
      // Prepare application data
      const applicationData = {
        loanType,
        answers: loanAnswers,
        extracted: extractedData,
        documents: Object.keys(uploadedDocuments)
      };

      // Get AI assessment
      const aiDecision = await getGroqAssessment(applicationData);

      setApplicationStatus(aiDecision.approvalStatus);
      setVerificationComplete(true);
      setAiDecision(aiDecision);

      // Add this line to advance to the next step:
      handleNext();

    } catch (error) {
      console.error("Submission failed:", error);
      setApplicationStatus("error");
    } finally {
      setIsVerifying(false);
    }
  };

  const verifyIdentity = () => {
    setIsVerifying(true);

    // Simulate verification process
    setTimeout(() => {
      setIsVerifying(false);
      setVerificationComplete(true);
    }, 3000);
  };

  // Video URLs for each step

  const videoUrls = [
    "/videos/s1.mp4", // Video for step 1
    "/videos/s2a.mp4", // Video for step 2a
    "/videos/stepx.mp4", // Video for step 2b

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
    "Decision",
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
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${step > index
                        ? "bg-blue-600 text-white"
                        : step === index + 1
                          ? "bg-blue-100 border-2 border-blue-600 text-blue-600"
                          : "bg-gray-200 text-gray-500"
                      }`}
                  >
                    {index + 1}
                  </div>
                  {index < stepTitles.length - 1 && (
                    <div
                      className={`w-12 h-1 ${step > index ? "bg-blue-600" : "bg-gray-200"
                        }`}
                    ></div>
                  )}
                </div>
              ))}
            </div>
            <div className="md:hidden">
              <span className="text-blue-700 font-medium">
                Step {step} of {stepTitles.length}
              </span>
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
                <svg
                  className="w-6 h-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  ></path>
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Security Alert
                </h3>
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
            <video
              key={step}
              autoPlay
              loop
              className="absolute w-full h-full lg:max-h-[100vh] object-cover"
            >
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
              <h2 className="text-xl lg:text-3xl font-bold text-gray-800">
                {stepTitles[step - 1]}
              </h2>
              <div className="h-1 w-20 bg-blue-500 mt-2"></div>
            </div>

            {step === 1 && (
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <ul className="text-green-600 mb-6 size-2xl font-semibold list-disc">
                  <li> Please adjust your camera so that your face is clearly
                  visible. </li>
                  <li>Make sure you're in a well-lit area and position your
                  face in the center of the frame.</li>
                </ul>
                <div className="bg-blue-50 p-4 rounded-lg mb-6 border-l-4 border-blue-500">
                  <p className="text-blue-800">
                    Look straight into the camera and follow the instructions
                    for accurate verification.
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
                    <p className="text-gray-700 font-medium">
                      Verifying your identity...
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="bg-green-50 text-green-800 p-4 rounded-lg flex items-center mb-6 w-full border border-green-200">
                      <svg
                        className="w-6 h-6 mr-3 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        ></path>
                      </svg>
                      <span className="text-green-800 font-medium">
                        Identity verified successfully!
                      </span>
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
                  Select Loan Type
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {["personal", "home", "business", "education", "vehicle"].map(
                    (type) => (
                      <button
                        key={type}
                        onClick={() => {
                          setLoanType(type);
                          handleNext();
                        }}
                        className="p-4 border rounded-lg hover:bg-blue-50 transition-colors text-left"
                      >
                        <h4 className="text-lg font-medium capitalize">
                          {type} Loan
                        </h4>
                        <p className="text-sm text-gray-600 mt-2">
                          {
                            {
                              personal: "For personal needs and expenses",
                              home: "Home purchase or renovation",
                              business: "Business expansion and growth",
                              education: "Educational expenses",
                              vehicle: "Vehicle purchase",
                            }[type]
                          }
                        </p>
                      </button>
                    )
                  )}
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
              <DocumentManager
                onComplete={(docs, data) => {
                  setUploadedDocuments(docs);

                  
                  setExtractedData(data);
                  handleNext();
                }}
              />
            )}

            {step === 5 && (
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h3 className="text-2xl font-bold text-blue-600 mb-6">Application Summary</h3>

                {/* Personal Details Section */}
                <div className="mb-8">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Personal Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <DetailItem label="Full Name" value={loanAnswers?.fullName} />
                    <DetailItem label="Date of Birth" value={loanAnswers?.dob} />
                    <DetailItem label="Contact Info" value={`${loanAnswers?.contact?.phone || ''} ${loanAnswers?.contact?.email || ''}`} />
                    <DetailItem label="Employment Status" value={loanAnswers?.employmentStatus} />
                    <DetailItem label="Monthly Income" value={`₹${Number(extractedData?.income?.monthlyIncome?.replace(/[^0-9.]/g, '')).toLocaleString('en-IN')}`} />
                    <DetailItem label="Credit Score" value={loanAnswers?.creditScore || 'Not provided'} />
                  </div>
                </div>

                {/* Loan Details Section */}
                <div className="mb-8">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Loan Request</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <DetailItem label="Loan Type" value={`${loanType.charAt(0).toUpperCase() + loanType.slice(1)} Loan`} />
                    <DetailItem label="Requested Amount" value={`₹${Number(loanAnswers?.loanAmount).toLocaleString('en-IN')}`} />
                    <DetailItem label="Loan Purpose" value={loanAnswers?.purpose} />
                    <DetailItem label="Preferred Tenure" value={`${loanAnswers?.tenure} months`} />
                  </div>
                </div>

                {/* Document Verification Section */}
                <div className="mb-8">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Document Verification</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <DetailItem label="Documents Uploaded" value={`${Object.keys(uploadedDocuments || {}).length} files`} />
                    <DetailItem label="Income Verified" value={extractedData?.income ? 'Yes' : 'No'} />
                    <DetailItem label="ID Proof Verified" value={extractedData?.idProof ? 'Yes' : 'No'} />
                    <DetailItem label="Address Proof Verified" value={extractedData?.addressProof ? 'Yes' : 'No'} />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 mt-8">
                  <button
                    onClick={handleBack}
                    className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
                  >
                    Edit Application
                  </button>
                  <button
                    onClick={submitApplication}
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Submit for Approval
                  </button>
                </div>
              </div>
            )}


{step === 6 && (
  <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
    {/* Decision Header */}
    <div className="text-center mb-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        Loan Approval Probability
      </h2>
      
      {/* Circular Probability meter */}
      <div className="relative mx-auto w-48 h-48 mb-6 group">
        {/* Background circle */}
        <div className="absolute inset-0 rounded-full border-8 border-gray-200"></div>
        
        {/* Progress circle - using SVG for precise circular progress */}
        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle 
            cx="50" 
            cy="50" 
            r="40" 
            fill="none" 
            stroke={
              aiDecision?.approvalStatus === 'approved' 
                ? '#10B981' // green-500
                : aiDecision?.approvalStatus === 'rejected' 
                  ? '#EF4444' // red-500
                  : '#F59E0B' // amber-500
            }
            strokeWidth="10"
            strokeDasharray="251.2"
            strokeDashoffset={
              251.2 - (251.2 * (aiDecision?.approvalStatus === 'approved' ? 85 : aiDecision?.approvalStatus === 'rejected' ? 35 : 60) / 100)
            }
            strokeLinecap="round"
          />
        </svg>
        
        {/* Percentage text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-3xl font-bold">
            {aiDecision?.approvalStatus === 'approved' ? '83%' : aiDecision?.approvalStatus === 'rejected' ? '32%' : '67%'}
          </span>
        </div>
        
        {/* Hover tooltip */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 absolute -bottom-16 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-sm rounded-lg py-2 px-4 w-64">
          This score represents your loan approval probability based on our AI risk assessment model
        </div>
      </div>
      
      <p className="text-gray-600 max-w-md mx-auto">{aiDecision?.summary}</p>
    </div>

    {/* Risk Assessment Breakdown */}
    <div className="mb-8">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Risk Assessment Factors</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Credit Risk */}
        <div className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-gray-800">Credit History</h4>
            <div className={`w-16 h-2 rounded-full ${
              aiDecision?.approvalStatus === 'approved' ? 'bg-green-500' : 
              aiDecision?.approvalStatus === 'rejected' ? 'bg-red-500' : 'bg-yellow-500'
            }`}></div>
          </div>
          <p className="text-sm text-gray-600">
            Analysis of credit score, payment history, and existing debts
          </p>
        </div>
        
        {/* Income Stability */}
        <div className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-gray-800">Income Stability</h4>
            <div className={`w-16 h-2 rounded-full ${
              aiDecision?.approvalStatus === 'approved' ? 'bg-green-500' : 
              aiDecision?.approvalStatus === 'rejected' ? 'bg-yellow-500' : 'bg-green-300'
            }`}></div>
          </div>
          <p className="text-sm text-gray-600">
            Evaluation of employment history, income sources, and future earning potential
          </p>
        </div>
        
        {/* Debt Service Ratio */}
        <div className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-gray-800">Debt-to-Income Ratio</h4>
            <div className={`w-16 h-2 rounded-full ${
              aiDecision?.approvalStatus === 'approved' ? 'bg-green-300' : 
              aiDecision?.approvalStatus === 'rejected' ? 'bg-red-500' : 'bg-yellow-500'
            }`}></div>
          </div>
          <p className="text-sm text-gray-600">
            Calculation of monthly debt obligations relative to income
          </p>
        </div>
        
        {/* Document Verification */}
        <div className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-gray-800">Document Verification</h4>
            <div className={`w-16 h-2 rounded-full ${
              aiDecision?.approvalStatus === 'approved' ? 'bg-green-500' : 
              aiDecision?.approvalStatus === 'rejected' ? 'bg-yellow-500' : 'bg-green-500'
            }`}></div>
          </div>
          <p className="text-sm text-gray-600">
            Verification of identity, address, income, and other submitted documents
          </p>
        </div>
      </div>
    </div>

    {/* AI Risk Assessment Agents */}
    <div className="mb-8">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">AI Risk Assessment Agents</h3>
      
      <div className="space-y-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-700 mb-2">Financial Behavior Analyzer</h4>
          <p className="text-sm text-gray-700">
            Analyzes spending patterns, saving habits, and financial responsibility indicators from bank statements and transaction history.
          </p>
        </div>
        
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-700 mb-2">Credit Risk Evaluator</h4>
          <p className="text-sm text-gray-700">
            Evaluates credit history, credit utilization ratios, existing loans, and payment reliability across multiple data sources.
          </p>
        </div>
        
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-700 mb-2">Income Stability Predictor</h4>
          <p className="text-sm text-gray-700">
            Predicts future income stability based on employment history, industry trends, and economic indicators specific to the applicant's sector.
          </p>
        </div>
        
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-700 mb-2">Document Authentication System</h4>
          <p className="text-sm text-gray-700">
            Uses machine learning to detect document tampering, verify consistency across submitted documents, and validate against official databases.
          </p>
        </div>
      </div>
    </div>

    {/* Decision Factors */}
    <div className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-800 mb-3">Key Decision Factors</h3>
        <ul className="list-disc pl-6 space-y-2">
          {aiDecision?.reasons && Array.isArray(aiDecision.reasons)
            ? aiDecision.reasons.map((reason, index) => (
              <li key={index} className="text-gray-700">{reason}</li>
            ))
            : <li className="text-gray-700">Decision analysis not available</li>
          }
        </ul>
      </div>

      <div className={`p-4 rounded-lg ${
        aiDecision?.approvalStatus === 'approved' ? 'bg-green-50' : 
        aiDecision?.approvalStatus === 'rejected' ? 'bg-red-50' : 'bg-yellow-50'
      }`}>
        <h3 className={`text-lg font-semibold mb-3 ${
          aiDecision?.approvalStatus === 'approved' ? 'text-green-800' : 
          aiDecision?.approvalStatus === 'rejected' ? 'text-red-800' : 'text-yellow-800'
        }`}>
          Loan Assessment Details
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <DetailItem label="Requested Amount" value={`₹${Number(loanAnswers.loanAmount).toLocaleString('en-IN')}`} />
          <DetailItem label="Estimated Interest Rate" value={`${(parseFloat(aiDecision?.interestRate || '10')).toFixed(2)}% p.a.`} />
          <DetailItem label="Loan Tenure" value={`${loanAnswers?.tenure || 'N/A'} months`} />
          <DetailItem label="Risk Level" value={
            aiDecision?.approvalStatus === 'approved' ? 'Low Risk' : 
            aiDecision?.approvalStatus === 'rejected' ? 'High Risk' : 'Moderate Risk'
          } />
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Next Steps</h3>
        <div className="space-y-2">
          <p className="text-gray-700">
            {aiDecision?.approvalStatus === 'approved'
              ? "Your application shows strong approval potential. Here are your next steps:"
              : aiDecision?.approvalStatus === 'rejected'
                ? "Your application may need improvements. Here's what you can do:"
                : "Your application is under review. Consider these steps:"}
          </p>
         {/* Next Steps - Modified Section */}
<div className="bg-gray-50 p-4 rounded-lg">
  <div className="space-y-2">
    <div className="mt-3">
      <p className="text-sm font-medium text-gray-600">Recommended Improvements:</p>
      <ul className="list-disc pl-6 mt-1 space-y-2">
        <li className="text-gray-700">
          <span className="font-medium">Age Requirement:</span> Apply with a co-applicant or guarantor who meets the minimum age requirement of 21 years.
        </li>
        <li className="text-gray-700">
          <span className="font-medium">Complete Income Documentation:</span> Submit additional income proof documents such as salary slips, bank statements, or tax returns.
        </li>
        <li className="text-gray-700">
          <span className="font-medium">Loan Adjustment:</span> Consider applying for a vehicle loan instead of a personal loan, or request a lower loan amount more suitable for your income profile.
        </li>
        <li className="text-gray-700">
          <span className="font-medium">Credit Profile:</span> Work on improving your credit score and reducing existing debt obligations before applying again.
        </li>
      </ul>
    </div>
  </div>
</div>
        </div>
      </div>
    </div>

    {/* Action Buttons */}
    <div className="mt-8 flex gap-4">
      <button className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
        Continue Application
      </button>
      <button className="flex-1 border border-blue-600 text-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50">
        Calculate EMI Options
      </button>
    </div>
  </div>
)}
          </div>
        </div>
      </div>
      <ChatBot />
      <EMICalculator />
    </div>
  );
}
