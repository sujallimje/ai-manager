"use client";
import { useState, useEffect } from "react";
import Head from "next/head";
import Webcam from "react-webcam";
import DocumentManager from "../../components/DocumentManager";

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

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const handleDocumentsComplete = (documents, data) => {
    setUploadedDocuments(documents);
    setExtractedData(data);
    handleNext(); 
  };

  const submitApplication = () => {
    // Show processing state
    setIsVerifying(true);
    
    // Simulate API call for loan approval
    setTimeout(() => {
      setIsVerifying(false);
      setVerificationComplete(true);
      
      // Make decision based on extracted data
      // This is a simplified example - in a real app, you would have more complex logic
      const totalIncome = extractedData.income?.monthlyIncome ? 
        parseInt(extractedData.income.monthlyIncome.replace(/[^\d]/g, '')) : 0;
      
      const loanAmountValue = parseInt(loanAmount || '0');
      const eligibilityRatio = totalIncome > 0 ? (loanAmountValue / totalIncome) : 999;
      
      // Approval logic: if loan amount is less than 10x monthly income
      const status = eligibilityRatio < 10 ? "approved" : "rejected";
      setApplicationStatus(status);
      
      // Move to the final step
      setTimeout(() => {
        setStep(6);
      }, 1000);
    }, 3000);
  };

  // Video URLs for each step
  const videoUrls = [
    "/videos/manager2.mp4", // Video for step 1
    "/videos/step2.mp4", // Video for step 2
    "/videos/step3.mp4", // Video for step 3
    "/videos/step4.mp4", // Video for step 4
    "/videos/step5.mp4", // Video for step 5
    applicationStatus === "approved"
      ? "/videos/step6-approved.mp4"
      : "/videos/step6-rejected.mp4", // Video for step 6
  ];

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
        <title>Apply for a Loan - LoanVidya</title>
      </Head>
      
      {/* Progress Bar */}
      <div className="bg-white shadow-sm px-6 py-3">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-indigo-700">LoanVidya</h1>
            <div className="hidden md:flex items-center space-x-1">
              {stepTitles.map((title, index) => (
                <div key={index} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step > index ? 'bg-indigo-600 text-white' : step === index + 1 ? 'bg-indigo-100 border-2 border-indigo-600 text-indigo-600' : 'bg-gray-200 text-gray-500'}`}>
                    {index + 1}
                  </div>
                  {index < stepTitles.length - 1 && (
                    <div className={`w-12 h-1 ${step > index ? 'bg-indigo-600' : 'bg-gray-200'}`}></div>
                  )}
                </div>
              ))}
            </div>
            <div className="md:hidden">
              <span className="text-indigo-700 font-medium">Step {step} of {stepTitles.length}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col lg:flex-row">
        {/* Video Section (Left Side on larger screens, Top on mobile) */}
        <div className="lg:w-1/2 bg-gray-900 lg:min-h-screen">
          <div className="relative w-full h-64 lg:h-full">
            {/* Pre-recorded Video */}
            <video key={step} autoPlay controls className="w-full h-full object-cover">
              <source src={videoUrls[step - 1]} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            
            {/* Webcam Feed */}
            <div className="absolute bottom-4 right-4 w-1/4 h-1/4 max-w-[200px] max-h-[150px] bg-black rounded-lg shadow-lg overflow-hidden border-2 border-indigo-400">
              <Webcam
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
        <div className="lg:w-1/2 bg-white lg:min-h-screen">
          <div className="p-6 lg:p-12 max-w-2xl mx-auto">
            <div className="mb-8">
              <h2 className="text-xl lg:text-3xl font-bold text-gray-800">{stepTitles[step-1]}</h2>
              <div className="h-1 w-20 bg-indigo-500 mt-2"></div>
            </div>
            
            {step === 1 && (
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <p className="text-gray-700 mb-6">
                  Please adjust your camera so that your face is clearly visible.
                  Make sure you're in a well-lit area and position your face in
                  the center of the frame.
                </p>
                <div className="bg-indigo-50 p-4 rounded-lg mb-6 border-l-4 border-indigo-500">
                  <p className="text-indigo-800">
                    Look straight into the camera and follow the instructions for accurate verification.
                  </p>
                </div>
                
                {!isVerifying && !verificationComplete ? (
                  <button
                    onClick={verifyIdentity}
                    className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-sm"
                  >
                    Verify My Identity
                  </button>
                ) : isVerifying ? (
                  <div className="flex flex-col items-center py-6">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600 mb-4"></div>
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
                      className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-sm"
                    >
                      Continue to Next Step
                    </button>
                  </div>
                )}
              </div>
            )}

            {step === 2 && (
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h3 className="text-xl text-indigo-600 font-bold mb-4">
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
                  className=" text-gray-800 w-full p-3 border border-gray-300 rounded-lg mb-6 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition-colors"
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
                    className={`px-6 py-2 rounded-lg text-white font-medium ${
                      !loanType ? 'bg-indigo-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 transition-colors'
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h3 className="text-xl text-indigo-600 font-bold mb-4">
                  Tell us more about your loan requirements
                </h3>
                
                <div className="mb-6">
                  <label className="block text-gray-800 font-medium mb-2">
                    What is the purpose of this loan?
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Home renovation, Education fees, Medical expenses"
                    className="w-full p-3 text-gray-800 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition-colors"
                    value={loanPurpose}
                    onChange={(e) => setLoanPurpose(e.target.value)}
                  />
                </div>
                
                <div className="mb-6">
                  <label className="block text-gray-800 font-medium mb-2">
                    How much would you like to borrow?
                  </label>
                  <div className=" text-gray-800 relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-600 font-medium">₹</span>
                    <input
                      type="number"
                      placeholder="Enter amount"
                      className="w-full p-3 text-gray-800 pl-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition-colors"
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
                    className={`px-6 py-2 rounded-lg text-white font-medium ${
                      !loanPurpose || !loanAmount ? 'bg-indigo-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 transition-colors'
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
                <h3 className="text-xl text-indigo-600 font-bold mb-4">
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
                      className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-sm"
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
                    <div className="animate-spin rounded-full h-14 w-14 border-t-2 border-b-2 border-indigo-600 mb-6"></div>
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
                      <p className="text-gray-800 mb-4">
                        Based on the information you provided, we are pleased to offer you a loan of <span className="font-bold">₹{Number(loanAmount).toLocaleString()}</span>.
                      </p>
                      
                      <div className="bg-white p-4 rounded-md border border-green-100">
                        <h4 className="text-lg font-medium text-gray-800 mb-3">Next Steps</h4>
                        <ol className="space-y-2 ml-5 list-decimal">
                          <li className="text-gray-700">You will receive a confirmation email shortly.</li>
                          <li className="text-gray-700">Our representative will contact you within 24 hours.</li>
                          <li className="text-gray-700">Complete the final verification process.</li>
                          <li className="text-gray-700">The loan amount will be disbursed to your bank account.</li>
                        </ol>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                      <button className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-sm">
                        Download Approval Letter
                      </button>
                      <button className="flex-1 border border-indigo-600 text-indigo-600 px-6 py-3 rounded-lg hover:bg-indigo-50 transition-colors font-medium">
                        View Loan Details
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
                        We're sorry we couldn't approve your application at this time.
                      </p>
                    </div>
                    
                    <div className="bg-gray-50 p-6 rounded-lg mb-6 border border-gray-200">
                      <p className="text-gray-700 mb-4">
                        Based on our review, we are unable to approve your loan application. This could be due to one or more of the following reasons:
                      </p>
                      
                      <div className="bg-white p-4 rounded-md border border-gray-100 mb-4">
                        <h4 className="text-lg font-medium text-gray-800 mb-3">Possible Reasons</h4>
                        <ul className="space-y-2 ml-5 list-disc">
                          <li className="text-gray-700">Insufficient income relative to the requested loan amount</li>
                          <li className="text-gray-700">Credit score below our minimum requirements</li>
                          <li className="text-gray-700">Incomplete or inconsistent documentation</li>
                          <li className="text-gray-700">High existing debt burden</li>
                        </ul>
                      </div>
                      
                      <p className="text-gray-700">
                        You may reapply after 3 months or consider applying for a smaller loan amount.
                      </p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                      <button className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-sm">
                        Speak to an Advisor
                      </button>
                      <button className="flex-1 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                        Explore Other Options
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}